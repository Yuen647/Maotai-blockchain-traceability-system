from flask import Blueprint, request, jsonify, current_app
from datetime import datetime
import hashlib
from . import db, blockchain
from .models import Product, Transaction, User
import json
import jwt
from functools import wraps
import os
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash

main = Blueprint('main', __name__)

# 不再在本文件中初始化blockchain，直接用app/__init__.py中的实例

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        try:
            token = token.split(' ')[1]  # Remove 'Bearer ' prefix
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = User.query.get(data['user_id'])
            if not current_user:
                return jsonify({'message': 'Invalid token!'}), 401
        except:
            return jsonify({'message': 'Invalid token!'}), 401
        return f(current_user, *args, **kwargs)
    return decorated

@main.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'message': 'Username already exists!'}), 400
    
    hashed_password = hashlib.sha256(data['password'].encode()).hexdigest()
    new_user = User(
        username=data['username'],
        password_hash=hashed_password,
        role=data['role'],
        organization=data.get('organization')
    )
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'User registered successfully!'}), 201

@main.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data['username']).first()
    if not user or user.password_hash != hashlib.sha256(data['password'].encode()).hexdigest():
        return jsonify({'message': 'Invalid credentials!'}), 401
    
    token = jwt.encode(
        {'user_id': user.id, 'role': user.role},
        current_app.config['SECRET_KEY'],
        algorithm="HS256"
    )
    return jsonify({'token': token})

@main.route('/api/products', methods=['GET'])
def get_products():
    products = Product.query.all()
    return jsonify([{
        'id': product.id,
        'name': product.name,
        'batch_number': product.batch_number,
        'production_date': product.production_date.isoformat(),
        'manufacturer': product.manufacturer,
        'created_at': product.created_at.isoformat()
    } for product in products])

@main.route('/api/products', methods=['POST'])
@token_required
def create_product(current_user):
    if current_user.role not in ['admin', 'manufacturer']:
        return jsonify({'message': 'Unauthorized!'}), 403

    data = request.get_json()
    product_id = hashlib.sha256(f"{data['batch_number']}{datetime.now().timestamp()}".encode()).hexdigest()
    
    new_product = Product(
        id=product_id,
        name=data['name'],
        batch_number=data['batch_number'],
        production_date=datetime.fromisoformat(data['production_date']),
        manufacturer=data['manufacturer'],
        alcohol_content=data['alcohol_content'],
        flavor_type=data['flavor_type'],
        vintage=data.get('vintage'),
        certification=data.get('certification'),
        anti_fake_code=data.get('anti_fake_code'),
        qr_code=data.get('qr_code'),
        image_url=data.get('image_url')
    )
    
    db.session.add(new_product)
    
    # 创建区块链交易
    transaction = {
        'type': 'product_creation',
        'product_id': product_id,
        'name': data['name'],
        'batch_number': data['batch_number'],
        'production_date': data['production_date'],
        'manufacturer': data['manufacturer'],
        'operator': current_user.username,
        'timestamp': datetime.now().isoformat()
    }
    
    try:
        block_index = blockchain.add_transaction(transaction)
        db.session.commit()
        return jsonify({
            'message': 'Product created successfully!',
            'product_id': product_id,
            'block_index': block_index
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 400

@main.route('/api/products/<product_id>', methods=['GET'])
def get_product(product_id):
    product = Product.query.get_or_404(product_id)
    history = blockchain.get_product_history(product_id)
    
    return jsonify({
        'product': {
            'id': product.id,
            'name': product.name,
            'batch_number': product.batch_number,
            'production_date': product.production_date.isoformat(),
            'manufacturer': product.manufacturer,
            'alcohol_content': product.alcohol_content,
            'flavor_type': product.flavor_type,
            'vintage': product.vintage,
            'certification': product.certification,
            'anti_fake_code': product.anti_fake_code,
            'qr_code': product.qr_code,
            'image_url': product.image_url
        },
        'history': history
    })

@main.route('/api/products/<product_id>/transfer', methods=['POST'])
@token_required
def transfer_product(current_user, product_id):
    data = request.get_json()
    product = Product.query.get_or_404(product_id)
    
    transaction = {
        'type': 'product_transfer',
        'product_id': product_id,
        'from_location': data['from_location'],
        'to_location': data['to_location'],
        'operator': current_user.username,
        'operator_type': current_user.role,
        'status': 'in_transit',
        'remarks': data.get('remarks'),
        'timestamp': datetime.now().isoformat()
    }
    
    try:
        block_index = blockchain.add_transaction(transaction)
        new_transaction = Transaction(
            product_id=product_id,
            transaction_type='transfer',
            from_location=data['from_location'],
            to_location=data['to_location'],
            operator=current_user.username,
            operator_type=current_user.role,
            status='in_transit',
            remarks=data.get('remarks')
        )
        db.session.add(new_transaction)
        db.session.commit()
        
        return jsonify({
            'message': 'Transfer recorded successfully!',
            'block_index': block_index
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 400

@main.route('/api/blockchain/status', methods=['GET'])
def get_blockchain_status():
    return jsonify({
        'chain_length': len(blockchain.chain),
        'pending_transactions': len(blockchain.pending_transactions),
        'is_valid': blockchain.is_chain_valid()
    })

@main.route('/api/blockchain/mine', methods=['POST'])
@token_required
def mine_block(current_user):
    if current_user.role != 'admin':
        return jsonify({'message': 'Unauthorized!'}), 403
        
    try:
        block = blockchain.mine_pending_transactions(current_user.username)
        return jsonify({
            'message': 'New block mined successfully!',
            'block': block.to_dict()
        }), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 400

@main.route('/api/products/<product_id>/trace', methods=['GET'])
def trace_product(product_id):
    product = Product.query.get_or_404(product_id)
    transactions = Transaction.query.filter_by(product_id=product_id).order_by(Transaction.timestamp).all()
    
    history = []
    for tx in transactions:
        history.append({
            'type': tx.transaction_type,
            'from': tx.from_location,
            'to': tx.to_location,
            'timestamp': tx.timestamp.isoformat(),
            'block_hash': tx.block_hash,
            'transaction_hash': tx.transaction_hash
        })
    
    return jsonify({
        'product': {
            'id': product.id,
            'name': product.name,
            'batch_number': product.batch_number,
            'production_date': product.production_date.isoformat(),
            'manufacturer': product.manufacturer
        },
        'history': history
    })

@main.route('/api/blockchain/blocks', methods=['GET'])
def get_blocks():
    return jsonify(blockchain.get_chain())

@main.route('/api/blockchain/latest', methods=['GET'])
def get_latest_block():
    return jsonify(blockchain.get_latest_block().to_dict())

# 新增：获取当前登录用户信息
@main.route('/api/userinfo', methods=['GET'])
@token_required
def get_userinfo(current_user):
    return jsonify({
        'user_id': current_user.id,
        'username': current_user.username,
        'role': current_user.role,
        'organization': current_user.organization
    })

# 新增：获取用户列表（仅管理员可用）
@main.route('/api/users', methods=['GET'])
@token_required
def get_users(current_user):
    if current_user.role != 'admin':
        return jsonify({'message': 'Unauthorized!'}), 403
    users = User.query.all()
    return jsonify([{'user_id': u.id, 'username': u.username, 'role': u.role, 'organization': u.organization} for u in users])

# 新增：产品搜索（支持分页、按批次号、名称、生产日期等筛选）
@main.route('/api/products/search', methods=['GET'])
def search_products():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    batch_number = request.args.get('batch_number', '')
    name = request.args.get('name', '')
    production_date = request.args.get('production_date', '')
    query = Product.query
    if batch_number:
        query = query.filter(Product.batch_number.like('%' + batch_number + '%'))
    if name:
        query = query.filter(Product.name.like('%' + name + '%'))
    if production_date:
        query = query.filter(Product.production_date == production_date)
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    products = pagination.items
    return jsonify({
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page,
        'products': [{'id': p.id, 'name': p.name, 'batch_number': p.batch_number, 'production_date': p.production_date.isoformat(), 'manufacturer': p.manufacturer, 'created_at': p.created_at.isoformat()} for p in products]
    })

# 新增：产品溯源历史分页查询（支持分页）
@main.route('/api/products/<product_id>/trace_paginated', methods=['GET'])
def trace_product_paginated(product_id):
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    product = Product.query.get_or_404(product_id)
    query = Transaction.query.filter_by(product_id=product_id).order_by(Transaction.timestamp)
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    transactions = pagination.items
    history = [{'type': tx.transaction_type, 'from': tx.from_location, 'to': tx.to_location, 'timestamp': tx.timestamp.isoformat(), 'block_hash': tx.block_hash, 'transaction_hash': tx.transaction_hash} for tx in transactions]
    return jsonify({
        'product': {'id': product.id, 'name': product.name, 'batch_number': product.batch_number, 'production_date': product.production_date.isoformat(), 'manufacturer': product.manufacturer},
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page,
        'history': history
    })

# 新增：图片上传接口（将图片存储到本地）
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads')
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@main.route('/api/upload', methods=['POST'])
@token_required
def upload_file(current_user):
    if 'file' not in request.files:
        return jsonify({'message': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'message': 'No selected file'}), 400
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        # 生成唯一文件名（例如：时间戳 + 原文件名）
        unique_filename = str(int(datetime.now().timestamp())) + '_' + filename
        file_path = os.path.join(UPLOAD_FOLDER, unique_filename)
        file.save(file_path)
        # 返回本地访问URL（假设前端通过 /uploads/<filename> 访问）
        return jsonify({'message': 'File uploaded successfully', 'url': '/uploads/' + unique_filename}), 200
    return jsonify({'message': 'File type not allowed'}), 400

@main.route('/api/users/<int:user_id>', methods=['PUT'])
@token_required
def update_user(current_user, user_id):
    if current_user.role != 'admin':
        return jsonify({'message': 'Unauthorized!'}), 403
    
    user = User.query.get_or_404(user_id)
    data = request.get_json()
    
    # 不允许修改用户名
    if 'username' in data:
        return jsonify({'message': 'Username cannot be modified!'}), 400
    
    # 更新其他字段
    if 'role' in data:
        user.role = data['role']
    if 'organization' in data:
        user.organization = data['organization']
    if 'password' in data:
        user.password_hash = generate_password_hash(data['password'])
    if 'is_active' in data:
        user.is_active = data['is_active']
    
    try:
        db.session.commit()
        return jsonify({
            'message': 'User updated successfully!',
            'user': {
                'id': user.id,
                'username': user.username,
                'role': user.role,
                'organization': user.organization,
                'is_active': user.is_active
            }
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 400

@main.route('/api/users/<int:user_id>', methods=['DELETE'])
@token_required
def delete_user(current_user, user_id):
    if current_user.role != 'admin':
        return jsonify({'message': 'Unauthorized!'}), 403
    
    if current_user.id == user_id:
        return jsonify({'message': 'Cannot delete your own account!'}), 400
    
    user = User.query.get_or_404(user_id)
    
    try:
        db.session.delete(user)
        db.session.commit()
        return jsonify({'message': 'User deleted successfully!'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 400 
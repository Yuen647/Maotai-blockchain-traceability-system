from datetime import datetime
from . import db

class Product(db.Model):
    id = db.Column(db.String(64), primary_key=True)
    name = db.Column(db.String(128), nullable=False)
    batch_number = db.Column(db.String(64), nullable=False)
    production_date = db.Column(db.DateTime, nullable=False)
    manufacturer = db.Column(db.String(128), nullable=False)
    alcohol_content = db.Column(db.Float, nullable=False)  # 酒精度
    flavor_type = db.Column(db.String(32), nullable=False)  # 香型
    vintage = db.Column(db.Integer)  # 年份
    certification = db.Column(db.String(256))  # 认证信息
    anti_fake_code = db.Column(db.String(64), unique=True)  # 防伪码
    qr_code = db.Column(db.String(256))  # 二维码
    image_url = db.Column(db.String(256))  # 产品图片
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    transactions = db.relationship('Transaction', backref='product', lazy=True)

class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.String(64), db.ForeignKey('product.id'), nullable=False)
    transaction_type = db.Column(db.String(32), nullable=False)  # 生产、运输、销售等
    from_location = db.Column(db.String(128))
    to_location = db.Column(db.String(128))
    operator = db.Column(db.String(128), nullable=False)  # 操作人
    operator_type = db.Column(db.String(32), nullable=False)  # 操作人类型（生产商、物流商、销售商等）
    status = db.Column(db.String(32), nullable=False)  # 交易状态
    remarks = db.Column(db.Text)  # 备注信息
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    block_hash = db.Column(db.String(64))  # 存储区块哈希
    transaction_hash = db.Column(db.String(64))  # 交易哈希

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(32), nullable=False)  # 用户角色（管理员、生产商、物流商、销售商等）
    organization = db.Column(db.String(128))  # 所属组织
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    is_active = db.Column(db.Boolean, default=True) 
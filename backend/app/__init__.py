from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from blockchain.blockchain import Blockchain
import os

db = SQLAlchemy()
blockchain = Blockchain(difficulty=4)

def create_app():
    app = Flask(__name__)
    CORS(app)
    
    # 配置数据库
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///maotai.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = os.urandom(24)  # 添加密钥用于JWT
    
    # 初始化扩展
    db.init_app(app)
    
    # 注册蓝图
    from .routes import main
    app.register_blueprint(main)
    
    # 创建数据库表
    with app.app_context():
        # db.drop_all()  # 注释掉这行，避免重启时删除数据
        db.create_all()
    
    # 新增：注册静态文件路由，用于访问上传的图片
    from flask import send_from_directory
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads')
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)
    @app.route('/uploads/<filename>')
    def uploaded_file(filename):
        return send_from_directory(UPLOAD_FOLDER, filename)
    
    return app 
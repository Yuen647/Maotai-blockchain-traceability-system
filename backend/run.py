from app import create_app
import logging

# 配置日志
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

try:
    app = create_app()
    logger.info("Application created successfully")
except Exception as e:
    logger.error(f"Error creating application: {str(e)}")
    raise

if __name__ == '__main__':
    logger.info("Starting Flask application...")
    app.run(debug=True, port=15000, host='0.0.0.0') 
# 区块链演示项目 / Blockchain Demo Project

## 项目介绍 / Project Introduction

这是一个区块链演示项目，包含前端和后端两个部分。前端使用 React + TypeScript + Vite 构建，后端使用 Python Flask 框架实现，包含区块链相关功能。

This is a blockchain demonstration project consisting of frontend and backend components. The frontend is built with React + TypeScript + Vite, and the backend is implemented using the Python Flask framework with blockchain functionality.

## 系统要求 / System Requirements

- Node.js 16+
- Python 3.8+
- npm 或 yarn

## 启动步骤 / Startup Steps

### 后端设置 / Backend Setup

1. 进入后端目录 / Enter the backend directory:
   ```
   cd backend
   ```

2. 创建并激活 Python 虚拟环境 / Create and activate a Python virtual environment:
   ```
   # 创建虚拟环境 / Create virtual environment
   python -m venv venv
   
   # 激活虚拟环境 / Activate virtual environment
   # Windows
   venv\Scripts\activate
   # macOS/Linux
   source venv/bin/activate
   ```

3. 安装依赖 / Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. 运行后端服务 / Run the backend server:
   ```
   python run.py
   ```
   
   后端服务将在 http://localhost:15000 启动

### 前端设置 / Frontend Setup

1. 进入前端目录 / Enter the frontend directory:
   ```
   cd frontend
   ```

2. 安装依赖 / Install dependencies:
   ```
   npm install
   # 或者使用 yarn / or use yarn
   # yarn
   ```

3. 启动开发服务器 / Start the development server:
   ```
   npm run dev
   # 或者使用 yarn / or use yarn
   # yarn dev
   ```
   
   前端应用将在 http://localhost:5173 启动

## 访问应用 / Accessing the Application

完成上述步骤后，可以通过浏览器访问 http://localhost:5173 来使用应用。

After completing the above steps, you can access the application through your browser at http://localhost:5173.

## 构建生产版本 / Building for Production

### 前端构建 / Frontend Build
```
cd frontend
npm run build
# 或者使用 yarn / or use yarn
# yarn build
```

构建后的文件将位于 `frontend/dist` 目录中。
The built files will be located in the `frontend/dist` directory. 
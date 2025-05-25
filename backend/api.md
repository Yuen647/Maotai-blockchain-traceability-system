# 茅台酒溯源系统 API 文档

## 基础信息

- **Base URL**: `http://localhost:15000`
- **认证方式**: JWT Token (Bearer Authentication)
- **内容类型**: `application/json` (除文件上传外)

---

## 目录
1. [用户认证](#1-用户认证)
2. [产品管理](#2-产品管理)
3. [产品溯源](#3-产品溯源)
4. [区块链操作](#4-区块链操作)
5. [文件上传](#5-文件上传)
6. [用户管理](#6-用户管理)

---

## 1. 用户认证

### 1.1 用户注册

- **URL**: `/api/register`
- **方法**: `POST`
- **权限**: 无需认证
- **请求体**:
  ```json
  {
    "username": "用户名",
    "password": "密码",
    "role": "角色名称",   // 可选值: "admin", "manufacturer", "logistics", "retailer"
    "organization": "所属组织"  // 可选
  }
  ```
- **成功响应** (201):
  ```json
  {
    "message": "User registered successfully!"
  }
  ```
- **错误响应** (400):
  ```json
  {
    "message": "Username already exists!"
  }
  ```

### 1.2 用户登录

- **URL**: `/api/login`
- **方法**: `POST`
- **权限**: 无需认证
- **请求体**:
  ```json
  {
    "username": "用户名",
    "password": "密码"
  }
  ```
- **成功响应** (200):
  ```json
  {
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
  }
  ```
- **错误响应** (401):
  ```json
  {
    "message": "Invalid credentials!"
  }
  ```

## 2. 产品管理

### 2.1 获取所有产品

- **URL**: `/api/products`
- **方法**: `GET`
- **权限**: 无需认证
- **成功响应** (200):
  ```json
  [
    {
      "id": "产品ID",
      "name": "产品名称",
      "batch_number": "批次号",
      "production_date": "2024-01-01T00:00:00",
      "manufacturer": "制造商",
      "created_at": "2024-01-01T00:00:00"
    },
    // 更多产品...
  ]
  ```

### 2.2 产品搜索与分页

- **URL**: `/api/products/search`
- **方法**: `GET`
- **权限**: 无需认证
- **查询参数**:
  - `page`: 页码，默认1
  - `per_page`: 每页记录数，默认10
  - `name`: 产品名称（模糊搜索）
  - `batch_number`: 批次号（模糊搜索）
  - `production_date`: 生产日期
- **成功响应** (200):
  ```json
  {
    "total": 100,
    "pages": 10,
    "current_page": 1,
    "products": [
      {
        "id": "产品ID",
        "name": "产品名称",
        "batch_number": "批次号",
        "production_date": "2024-01-01T00:00:00",
        "manufacturer": "制造商",
        "created_at": "2024-01-01T00:00:00"
      },
      // 更多产品...
    ]
  }
  ```

### 2.3 创建产品

- **URL**: `/api/products`
- **方法**: `POST`
- **权限**: 需要管理员或生产商权限
- **请求头**:
  - `Authorization: Bearer YOUR_TOKEN`
- **请求体**:
  ```json
  {
    "name": "贵州茅台酒",
    "batch_number": "MT2024001",
    "production_date": "2024-01-01T00:00:00",
    "manufacturer": "贵州茅台酒股份有限公司",
    "alcohol_content": 53.0,
    "flavor_type": "酱香型",
    "vintage": 2024,
    "certification": "国酒认证",
    "anti_fake_code": "MT2024001ABC123",
    "qr_code": "二维码URL",
    "image_url": "图片URL"
  }
  ```
- **成功响应** (201):
  ```json
  {
    "message": "Product created successfully!",
    "product_id": "产品ID",
    "block_index": 1
  }
  ```
- **错误响应** (403):
  ```json
  {
    "message": "Unauthorized!"
  }
  ```

### 2.4 获取单个产品详情

- **URL**: `/api/products/<product_id>`
- **方法**: `GET`
- **权限**: 无需认证
- **成功响应** (200):
  ```json
  {
    "product": {
      "id": "产品ID",
      "name": "产品名称",
      "batch_number": "批次号",
      "production_date": "2024-01-01T00:00:00",
      "manufacturer": "制造商",
      "alcohol_content": 53.0,
      "flavor_type": "酱香型",
      "vintage": 2024,
      "certification": "国酒认证",
      "anti_fake_code": "MT2024001ABC123",
      "qr_code": "二维码URL",
      "image_url": "图片URL"
    },
    "history": [
      // 区块链上的历史记录
    ]
  }
  ```
- **错误响应** (404):
  ```json
  {
    "message": "Not Found"
  }
  ```

## 3. 产品溯源

### 3.1 产品转移（物流记录）

- **URL**: `/api/products/<product_id>/transfer`
- **方法**: `POST`
- **权限**: 需要认证
- **请求头**:
  - `Authorization: Bearer YOUR_TOKEN`
- **请求体**:
  ```json
  {
    "from_location": "起始位置",
    "to_location": "目的位置",
    "remarks": "备注信息"
  }
  ```
- **成功响应** (200):
  ```json
  {
    "message": "Transfer recorded successfully!",
    "block_index": 1
  }
  ```

### 3.2 获取产品溯源历史

- **URL**: `/api/products/<product_id>/trace`
- **方法**: `GET`
- **权限**: 无需认证
- **成功响应** (200):
  ```json
  {
    "product": {
      "id": "产品ID",
      "name": "产品名称",
      "batch_number": "批次号",
      "production_date": "2024-01-01T00:00:00",
      "manufacturer": "制造商"
    },
    "history": [
      {
        "type": "transfer",
        "from": "起始位置",
        "to": "目的位置",
        "timestamp": "2024-01-01T12:00:00",
        "block_hash": "区块哈希",
        "transaction_hash": "交易哈希"
      },
      // 更多历史记录...
    ]
  }
  ```

### 3.3 获取产品溯源历史（分页）

- **URL**: `/api/products/<product_id>/trace_paginated`
- **方法**: `GET`
- **权限**: 无需认证
- **查询参数**:
  - `page`: 页码，默认1
  - `per_page`: 每页记录数，默认10
- **成功响应** (200):
  ```json
  {
    "product": {
      "id": "产品ID",
      "name": "产品名称",
      "batch_number": "批次号",
      "production_date": "2024-01-01T00:00:00",
      "manufacturer": "制造商"
    },
    "total": 10,
    "pages": 2,
    "current_page": 1,
    "history": [
      {
        "type": "transfer",
        "from": "起始位置",
        "to": "目的位置",
        "timestamp": "2024-01-01T12:00:00",
        "block_hash": "区块哈希",
        "transaction_hash": "交易哈希"
      },
      // 更多历史记录...
    ]
  }
  ```

## 4. 区块链操作

### 4.1 获取区块链状态

- **URL**: `/api/blockchain/status`
- **方法**: `GET`
- **权限**: 无需认证
- **成功响应** (200):
  ```json
  {
    "chain_length": 10,
    "pending_transactions": 2,
    "is_valid": true
  }
  ```

### 4.2 挖矿（生成新区块）

- **URL**: `/api/blockchain/mine`
- **方法**: `POST`
- **权限**: 需要管理员权限
- **请求头**:
  - `Authorization: Bearer YOUR_TOKEN`
- **成功响应** (200):
  ```json
  {
    "message": "New block mined successfully!",
    "block": {
      "index": 2,
      "timestamp": 1616161616.0,
      "transactions": [],
      "previous_hash": "前一个区块的哈希",
      "hash": "当前区块的哈希",
      "nonce": 12345
    }
  }
  ```
- **错误响应** (403):
  ```json
  {
    "message": "Unauthorized!"
  }
  ```

### 4.3 获取所有区块

- **URL**: `/api/blockchain/blocks`
- **方法**: `GET`
- **权限**: 无需认证
- **成功响应** (200):
  ```json
  [
    {
      "index": 0,
      "timestamp": 1616161616.0,
      "transactions": [],
      "previous_hash": "0",
      "hash": "区块哈希",
      "nonce": 0
    },
    // 更多区块...
  ]
  ```

### 4.4 获取最新区块

- **URL**: `/api/blockchain/latest`
- **方法**: `GET`
- **权限**: 无需认证
- **成功响应** (200):
  ```json
  {
    "index": 10,
    "timestamp": 1616161616.0,
    "transactions": [],
    "previous_hash": "前一个区块的哈希",
    "hash": "当前区块的哈希",
    "nonce": 12345
  }
  ```

## 5. 文件上传

### 5.1 上传图片

- **URL**: `/api/upload`
- **方法**: `POST`
- **权限**: 需要认证
- **请求头**:
  - `Authorization: Bearer YOUR_TOKEN`
- **请求体**: `multipart/form-data`
  - `file`: 文件数据（允许格式：png、jpg、jpeg、gif）
- **成功响应** (200):
  ```json
  {
    "message": "File uploaded successfully",
    "url": "/uploads/1685000000_filename.jpg"
  }
  ```
- **错误响应** (400):
  ```json
  {
    "message": "File type not allowed"
  }
  ```

### 5.2 访问上传的图片

- **URL**: `/uploads/<filename>`
- **方法**: `GET`
- **权限**: 无需认证
- **成功响应**: 图片文件内容
- **错误响应** (404): 找不到文件

## 6. 用户管理

### 6.1 获取当前登录用户信息

- **URL**: `/api/userinfo`
- **方法**: `GET`
- **权限**: 需要认证
- **请求头**:
  - `Authorization: Bearer YOUR_TOKEN`
- **成功响应** (200):
  ```json
  {
    "user_id": 1,
    "username": "用户名",
    "role": "角色",
    "organization": "所属组织"
  }
  ```
- **错误响应** (401):
  ```json
  {
    "message": "Invalid token!"
  }
  ```

### 6.2 获取所有用户列表

- **URL**: `/api/users`
- **方法**: `GET`
- **权限**: 需要管理员权限
- **请求头**:
  - `Authorization: Bearer YOUR_TOKEN`
- **成功响应** (200):
  ```json
  [
    {
      "user_id": 1,
      "username": "用户名",
      "role": "角色",
      "organization": "所属组织"
    },
    // 更多用户...
  ]
  ```
- **错误响应** (403):
  ```json
  {
    "message": "Unauthorized!"
  }
  ```

---

## 认证说明

所有需要认证的接口都需要在请求头中包含以下字段：
```
Authorization: Bearer YOUR_TOKEN
```

其中 `YOUR_TOKEN` 是从登录接口获取的 JWT Token。

## 错误处理

所有接口在出错时会返回对应的 HTTP 状态码和错误信息：

- **400**: 请求参数错误
- **401**: 未认证或认证失败
- **403**: 权限不足
- **404**: 资源不存在
- **500**: 服务器内部错误

---

## 使用示例

### 前端登录和获取产品列表示例

```javascript
// 登录
async function login(username, password) {
  const response = await fetch('http://localhost:15000/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  });
  
  const data = await response.json();
  if (response.ok) {
    localStorage.setItem('token', data.token);
    return data.token;
  } else {
    throw new Error(data.message);
  }
}

// 获取产品列表
async function getProducts() {
  const response = await fetch('http://localhost:15000/api/products');
  return await response.json();
}

// 上传图片
async function uploadImage(file) {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('http://localhost:15000/api/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: formData
  });
  
  return await response.json();
}
```

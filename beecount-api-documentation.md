# BeeCount API文档

## 1. API概述
### 1.1 基本信息
- **API版本**：v1
- **API基础URL**：`https://api.beecount.com/api/v1`
- **认证方式**：JWT Token
- **请求格式**：JSON
- **响应格式**：JSON
- **错误处理**：统一错误格式

### 1.2 认证流程
1. **获取Token**：通过`/auth/login`获取JWT Token
2. **使用Token**：在请求头中添加`Authorization: Bearer <token>`
3. **刷新Token**：Token过期前通过`/auth/refresh`刷新

### 1.3 响应格式
```json
{
  "success": true,
  "message": "操作成功",
  "data": {...}
}
```

```json
{
  "success": false,
  "message": "错误信息",
  "error": {
    "code": 400,
    "details": "详细错误信息"
  }
}
```

## 2. 认证API
### 2.1 用户注册
- **URL**：`/auth/register`
- **方法**：`POST`
- **请求体**：
```json
{
  "name": "用户名",
  "email": "user@example.com",
  "password": "密码"
}
```
- **响应**：
```json
{
  "success": true,
  "message": "注册成功",
  "data": {
    "id": 1,
    "name": "用户名",
    "email": "user@example.com",
    "token": "JWT Token"
  }
}
```

### 2.2 用户登录
- **URL**：`/auth/login`
- **方法**：`POST`
- **请求体**：
```json
{
  "email": "user@example.com",
  "password": "密码"
}
```
- **响应**：
```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "id": 1,
    "name": "用户名",
    "email": "user@example.com",
    "token": "JWT Token"
  }
}
```

### 2.3 获取当前用户信息
- **URL**：`/auth/me`
- **方法**：`GET`
- **认证**：需要JWT Token
- **响应**：
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "用户名",
    "email": "user@example.com",
    "theme": "light"
  }
}
```

### 2.4 刷新Token
- **URL**：`/auth/refresh`
- **方法**：`POST`
- **认证**：需要JWT Token
- **响应**：
```json
{
  "success": true,
  "data": {
    "token": "新的JWT Token"
  }
}
```

## 3. 账本API
### 3.1 获取所有账本
- **URL**：`/ledgers`
- **方法**：`GET`
- **认证**：需要JWT Token
- **响应**：
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "个人账本",
      "description": "个人财务管理",
      "currency": "CNY",
      "created_at": "2026-04-21T08:05:50Z"
    }
  ]
}
```

### 3.2 创建账本
- **URL**：`/ledgers`
- **方法**：`POST`
- **认证**：需要JWT Token
- **请求体**：
```json
{
  "name": "家庭账本",
  "description": "家庭财务管理",
  "currency": "CNY"
}
```
- **响应**：
```json
{
  "success": true,
  "message": "账本创建成功",
  "data": {
    "id": 2,
    "name": "家庭账本",
    "description": "家庭财务管理",
    "currency": "CNY"
  }
}
```

### 3.3 更新账本
- **URL**：`/ledgers/:id`
- **方法**：`PUT`
- **认证**：需要JWT Token
- **请求体**：
```json
{
  "name": "个人账本(更新)",
  "description": "个人财务管理更新",
  "currency": "CNY"
}
```
- **响应**：
```json
{
  "success": true,
  "message": "账本更新成功",
  "data": {
    "id": 1,
    "name": "个人账本(更新)",
    "description": "个人财务管理更新",
    "currency": "CNY"
  }
}
```

### 3.4 删除账本
- **URL**：`/ledgers/:id`
- **方法**：`DELETE`
- **认证**：需要JWT Token
- **响应**：
```json
{
  "success": true,
  "message": "账本删除成功"
}
```

## 4. 交易API
### 4.1 获取交易列表
- **URL**：`/transactions`
- **方法**：`GET`
- **认证**：需要JWT Token
- **参数**：
  - `ledger_id`：账本ID
  - `start_date`：开始日期
  - `end_date`：结束日期
  - `type`：交易类型（income/expense/transfer）
  - `category_id`：分类ID
  - `account_id`：账户ID
  - `page`：页码
  - `limit`：每页数量
- **响应**：
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "ledger_id": 1,
        "type": "expense",
        "amount": 99.99,
        "category_id": 1,
        "account_id": 1,
        "happened_at": "2026-04-21T08:30:00Z",
        "note": "测试交易"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10
  }
}
```

### 4.2 创建交易
- **URL**：`/transactions`
- **方法**：`POST`
- **认证**：需要JWT Token
- **请求体**：
```json
{
  "ledger_id": 1,
  "type": "expense",
  "amount": 99.99,
  "category_id": 1,
  "account_id": 1,
  "happened_at": "2026-04-21T08:30:00Z",
  "note": "测试交易"
}
```
- **响应**：
```json
{
  "success": true,
  "message": "交易创建成功",
  "data": {
    "id": 2,
    "ledger_id": 1,
    "type": "expense",
    "amount": 99.99,
    "category_id": 1,
    "account_id": 1,
    "happened_at": "2026-04-21T08:30:00Z",
    "note": "测试交易"
  }
}
```

### 4.3 更新交易
- **URL**：`/transactions/:id`
- **方法**：`PUT`
- **认证**：需要JWT Token
- **请求体**：
```json
{
  "amount": 199.99,
  "note": "更新后的交易"
}
```
- **响应**：
```json
{
  "success": true,
  "message": "交易更新成功",
  "data": {
    "id": 1,
    "ledger_id": 1,
    "type": "expense",
    "amount": 199.99,
    "category_id": 1,
    "account_id": 1,
    "happened_at": "2026-04-21T08:30:00Z",
    "note": "更新后的交易"
  }
}
```

### 4.4 删除交易
- **URL**：`/transactions/:id`
- **方法**：`DELETE`
- **认证**：需要JWT Token
- **响应**：
```json
{
  "success": true,
  "message": "交易删除成功"
}
```

## 5. 账户API
### 5.1 获取账户列表
- **URL**：`/accounts`
- **方法**：`GET`
- **认证**：需要JWT Token
- **参数**：
  - `ledger_id`：账本ID
- **响应**：
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "ledger_id": 1,
      "name": "现金账户",
      "type": "cash",
      "currency": "CNY",
      "initial_balance": 1000
    }
  ]
}
```

### 5.2 创建账户
- **URL**：`/accounts`
- **方法**：`POST`
- **认证**：需要JWT Token
- **请求体**：
```json
{
  "ledger_id": 1,
  "name": "银行卡",
  "type": "bank",
  "currency": "CNY",
  "initial_balance": 5000
}
```
- **响应**：
```json
{
  "success": true,
  "message": "账户创建成功",
  "data": {
    "id": 2,
    "ledger_id": 1,
    "name": "银行卡",
    "type": "bank",
    "currency": "CNY",
    "initial_balance": 5000
  }
}
```

### 5.3 更新账户
- **URL**：`/accounts/:id`
- **方法**：`PUT`
- **认证**：需要JWT Token
- **请求体**：
```json
{
  "name": "银行卡(更新)",
  "initial_balance": 6000
}
```
- **响应**：
```json
{
  "success": true,
  "message": "账户更新成功",
  "data": {
    "id": 2,
    "ledger_id": 1,
    "name": "银行卡(更新)",
    "type": "bank",
    "currency": "CNY",
    "initial_balance": 6000
  }
}
```

### 5.4 删除账户
- **URL**：`/accounts/:id`
- **方法**：`DELETE`
- **认证**：需要JWT Token
- **响应**：
```json
{
  "success": true,
  "message": "账户删除成功"
}
```

## 6. 分类API
### 6.1 获取分类列表
- **URL**：`/categories`
- **方法**：`GET`
- **认证**：需要JWT Token
- **参数**：
  - `ledger_id`：账本ID
  - `kind`：分类类型（income/expense）
- **响应**：
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "ledger_id": 1,
      "name": "餐饮",
      "kind": "expense",
      "icon": "restaurant"
    }
  ]
}
```

### 6.2 创建分类
- **URL**：`/categories`
- **方法**：`POST`
- **认证**：需要JWT Token
- **请求体**：
```json
{
  "ledger_id": 1,
  "name": "交通",
  "kind": "expense",
  "icon": "directions_car"
}
```
- **响应**：
```json
{
  "success": true,
  "message": "分类创建成功",
  "data": {
    "id": 2,
    "ledger_id": 1,
    "name": "交通",
    "kind": "expense",
    "icon": "directions_car"
  }
}
```

### 6.3 更新分类
- **URL**：`/categories/:id`
- **方法**：`PUT`
- **认证**：需要JWT Token
- **请求体**：
```json
{
  "name": "交通(更新)",
  "icon": "directions_bus"
}
```
- **响应**：
```json
{
  "success": true,
  "message": "分类更新成功",
  "data": {
    "id": 2,
    "ledger_id": 1,
    "name": "交通(更新)",
    "kind": "expense",
    "icon": "directions_bus"
  }
}
```

### 6.4 删除分类
- **URL**：`/categories/:id`
- **方法**：`DELETE`
- **认证**：需要JWT Token
- **响应**：
```json
{
  "success": true,
  "message": "分类删除成功"
}
```

## 7. 标签API
### 7.1 获取标签列表
- **URL**：`/tags`
- **方法**：`GET`
- **认证**：需要JWT Token
- **参数**：
  - `ledger_id`：账本ID
- **响应**：
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "ledger_id": 1,
      "name": "必要",
      "color": "#4CAF50"
    }
  ]
}
```

### 7.2 创建标签
- **URL**：`/tags`
- **方法**：`POST`
- **认证**：需要JWT Token
- **请求体**：
```json
{
  "ledger_id": 1,
  "name": "可选",
  "color": "#2196F3"
}
```
- **响应**：
```json
{
  "success": true,
  "message": "标签创建成功",
  "data": {
    "id": 2,
    "ledger_id": 1,
    "name": "可选",
    "color": "#2196F3"
  }
}
```

## 8. 预算API
### 8.1 获取预算列表
- **URL**：`/budgets`
- **方法**：`GET`
- **认证**：需要JWT Token
- **参数**：
  - `ledger_id`：账本ID
- **响应**：
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "ledger_id": 1,
      "type": "total",
      "amount": 3000,
      "period": "monthly",
      "start_day": 1
    }
  ]
}
```

### 8.2 创建预算
- **URL**：`/budgets`
- **方法**：`POST`
- **认证**：需要JWT Token
- **请求体**：
```json
{
  "ledger_id": 1,
  "type": "category",
  "category_id": 1,
  "amount": 1000,
  "period": "monthly",
  "start_day": 1
}
```
- **响应**：
```json
{
  "success": true,
  "message": "预算创建成功",
  "data": {
    "id": 2,
    "ledger_id": 1,
    "type": "category",
    "category_id": 1,
    "amount": 1000,
    "period": "monthly",
    "start_day": 1
  }
}
```

## 9. AI API
### 9.1 智能分类
- **URL**：`/smart/classify`
- **方法**：`POST`
- **认证**：需要JWT Token
- **请求体**：
```json
{
  "note": "午餐",
  "amount": 50,
  "type": "expense",
  "ledger_id": 1
}
```
- **响应**：
```json
{
  "success": true,
  "data": {
    "category_id": 1,
    "category_name": "餐饮",
    "confidence": 0.95
  }
}
```

### 9.2 学习分类
- **URL**：`/smart/learn`
- **方法**：`POST`
- **认证**：需要JWT Token
- **请求体**：
```json
{
  "transaction_id": 1,
  "category_id": 1,
  "note": "午餐"
}
```
- **响应**：
```json
{
  "success": true,
  "message": "学习成功"
}
```

### 9.3 获取分类模式
- **URL**：`/smart/patterns`
- **方法**：`GET`
- **认证**：需要JWT Token
- **参数**：
  - `ledger_id`：账本ID
- **响应**：
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "ledger_id": 1,
      "keyword": "午餐",
      "category_id": 1,
      "confidence": 0.95
    }
  ]
}
```

## 10. 统计API
### 10.1 收支趋势
- **URL**：`/statistics/trend`
- **方法**：`GET`
- **认证**：需要JWT Token
- **参数**：
  - `ledger_id`：账本ID
  - `start_date`：开始日期
  - `end_date`：结束日期
  - `interval`：时间间隔（day/week/month/year）
- **响应**：
```json
{
  "success": true,
  "data": {
    "labels": ["2026-04-01", "2026-04-02"],
    "income": [1000, 500],
    "expense": [800, 300]
  }
}
```

### 10.2 分类分析
- **URL**：`/statistics/category`
- **方法**：`GET`
- **认证**：需要JWT Token
- **参数**：
  - `ledger_id`：账本ID
  - `start_date`：开始日期
  - `end_date`：结束日期
  - `type`：交易类型（income/expense）
- **响应**：
```json
{
  "success": true,
  "data": [
    {
      "category_id": 1,
      "category_name": "餐饮",
      "amount": 1000,
      "percentage": 50
    }
  ]
}
```

## 11. 周期交易API
### 11.1 获取周期交易列表
- **URL**：`/recurring`
- **方法**：`GET`
- **认证**：需要JWT Token
- **参数**：
  - `ledger_id`：账本ID
- **响应**：
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "ledger_id": 1,
      "type": "expense",
      "amount": 500,
      "category_id": 1,
      "account_id": 1,
      "frequency": "monthly",
      "start_date": "2026-04-01",
      "enabled": true
    }
  ]
}
```

### 11.2 创建周期交易
- **URL**：`/recurring`
- **方法**：`POST`
- **认证**：需要JWT Token
- **请求体**：
```json
{
  "ledger_id": 1,
  "type": "expense",
  "amount": 500,
  "category_id": 1,
  "account_id": 1,
  "frequency": "monthly",
  "start_date": "2026-04-01",
  "end_date": "2026-12-31",
  "note": "月租"
}
```
- **响应**：
```json
{
  "success": true,
  "message": "周期交易创建成功",
  "data": {
    "id": 2,
    "ledger_id": 1,
    "type": "expense",
    "amount": 500,
    "category_id": 1,
    "account_id": 1,
    "frequency": "monthly",
    "start_date": "2026-04-01",
    "end_date": "2026-12-31",
    "note": "月租"
  }
}
```

## 12. 提醒API
### 12.1 获取提醒列表
- **URL**：`/reminders`
- **方法**：`GET`
- **认证**：需要JWT Token
- **参数**：
  - `ledger_id`：账本ID
  - `is_notified`：是否已通知
- **响应**：
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "ledger_id": 1,
      "type": "transaction",
      "target_id": 1,
      "message": "交易到期提醒",
      "remind_at": "2026-04-21T18:00:00Z",
      "is_notified": false
    }
  ]
}
```

### 12.2 创建提醒
- **URL**：`/reminders`
- **方法**：`POST`
- **认证**：需要JWT Token
- **请求体**：
```json
{
  "ledger_id": 1,
  "type": "transaction",
  "target_id": 1,
  "message": "交易到期提醒",
  "remind_at": "2026-04-21T18:00:00Z"
}
```
- **响应**：
```json
{
  "success": true,
  "message": "提醒创建成功",
  "data": {
    "id": 2,
    "ledger_id": 1,
    "type": "transaction",
    "target_id": 1,
    "message": "交易到期提醒",
    "remind_at": "2026-04-21T18:00:00Z",
    "is_notified": false
  }
}
```

## 13. 数据导入导出API
### 13.1 导出数据
- **URL**：`/data/export`
- **方法**：`GET`
- **认证**：需要JWT Token
- **参数**：
  - `ledger_id`：账本ID
  - `format`：导出格式（csv/excel/json）
- **响应**：文件下载

### 13.2 导入数据
- **URL**：`/data/import`
- **方法**：`POST`
- **认证**：需要JWT Token
- **参数**：
  - `ledger_id`：账本ID
  - `file`：文件（multipart/form-data）
- **响应**：
```json
{
  "success": true,
  "message": "数据导入成功",
  "data": {
    "imported": 10,
    "failed": 0
  }
}
```

## 14. 错误代码
| 代码 | 描述 |
|------|------|
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |
| 501 | 功能未实现 |
| 503 | 服务不可用 |

## 15. 速率限制
- **API调用限制**：每IP每分钟60次请求
- **认证API限制**：每IP每分钟10次请求
- **文件上传限制**：单个文件最大10MB
- **批量操作限制**：每次最多100条记录
# BeeCount Backend

基于 Go 和 Gin 框架的记账应用后端服务。

## 技术栈

- **Go** - 编程语言
- **Gin** - Web 框架
- **GORM** - ORM
- **SQLite** - 数据库

## 功能特性

- 账本管理
- 账户管理
- 分类管理
- 交易记录
- 预算管理
- 标签管理

## 安装和运行

1. 安装依赖

```bash
go mod tidy
```

2. 启动服务

```bash
go run main.go
```

服务默认在 `http://localhost:8080`

## API 文档

### 账本 (Ledgers)

- `GET /api/v1/ledgers` - 获取所有账本
- `POST /api/v1/ledgers` - 创建账本
- `GET /api/v1/ledgers/:id` - 获取单个账本
- `PUT /api/v1/ledgers/:id` - 更新账本
- `DELETE /api/v1/ledgers/:id` - 删除账本

### 账户 (Accounts)

- `GET /api/v1/accounts` - 获取所有账户
- `POST /api/v1/accounts` - 创建账户
- `GET /api/v1/accounts/:id` - 获取单个账户
- `PUT /api/v1/accounts/:id` - 更新账户
- `DELETE /api/v1/accounts/:id` - 删除账户

## 开发

项目结构

```
beecount-backend/
├── api/
│   ├── handlers.go
│   └── routes.go
├── config/
│   └── config.go
├── models/
│   └── models.go
├── utils/
│   └── db.go
├── go.mod
├── go.sum
└── main.go
```

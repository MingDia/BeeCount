# BeeCount - 传统前后端架构版

这是将原 Flutter 项目转换为传统前后端分离架构的实现。

## 项目结构

```
/workspace
├── beecount-backend/     # Go 后端服务
├── beecount-frontend/    # React 前端应用
└── [原 Flutter 项目文件]
```

## 技术栈

### 后端
- **Go** - 编程语言
- **Gin** - Web 框架
- **GORM** - ORM
- **SQLite** - 数据库

### 前端
- **React** - UI 框架
- **React Router** - 路由管理
- **Material UI** - UI 组件库
- **Axios** - HTTP 客户端
- **date-fns** - 日期处理

## 功能特性

- ✅ 账本管理
- ✅ 账户管理
- ✅ 分类管理（基础实现）
- ✅ 交易记录（基础实现）
- ⏳ 预算管理（待实现）
- ⏳ 标签管理（待实现）

## 快速开始

### 后端启动

1. 进入后端目录
```bash
cd beecount-backend
```

2. 安装依赖
```bash
go mod tidy
```

3. 启动服务
```bash
go run main.go
```

后端服务默认在 `http://localhost:8080`

### 前端启动

1. 进入前端目录
```bash
cd beecount-frontend
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm run dev
```

前端应用默认在 `http://localhost:5173`

## 项目架构说明

### 后端架构

```
beecount-backend/
├── api/
│   ├── handlers.go      # API 处理函数
│   └── routes.go        # 路由配置
├── config/
│   └── config.go        # 配置管理
├── models/
│   └── models.go        # 数据模型定义
├── utils/
│   └── db.go            # 数据库工具
├── main.go              # 入口文件
└── go.mod
```

### 前端架构

```
beecount-frontend/
├── src/
│   ├── components/      # 组件目录
│   │   └── Layout.jsx   # 布局组件
│   ├── contexts/        # 上下文（状态管理）
│   │   └── AppContext.jsx
│   ├── pages/           # 页面目录
│   │   ├── Home.jsx
│   │   └── Accounts.jsx
│   ├── services/        # API 服务
│   │   └── api.js
│   └── App.jsx
```

## 与原 Flutter 项目的对比

| 特性 | 原 Flutter 项目 | 传统前后端架构 |
|------|----------------|---------------|
| 开发语言 | Dart | Go + JavaScript/TypeScript |
| 数据库 | 本地 SQLite | SQLite（后端） |
| 部署方式 | 打包为移动应用 | 分离部署，API 驱动 |
| 跨平台 | 移动应用优先 | Web 优先 |
| 扩展性 | 单应用架构 | 服务化，更易扩展 |

## 下一步计划

1. 完善剩余功能页面（分类、交易、预算、标签）
2. 实现数据迁移脚本，从原 Flutter 项目迁移数据
3. 添加单元测试和集成测试
4. 优化 UI/UX 设计
5. 部署到生产环境

## 贡献

欢迎提交问题和拉取请求！

## 许可证

与原项目保持一致

# 博物馆管理系统

基于React + Node.js + MySQL的博物馆藏品管理系统

## 功能特点

- 🏛️ 文物/藏品信息管理
- 🖼️ 展览管理
- 👥 多角色用户管理（管理员、策展人、研究员）
- 📊 数据统计与仪表板
- 🔐 安全的用户认证系统
- 📱 响应式设计

## 系统架构

- 前端：React 18 + Ant Design 5
- 后端：Node.js + Express
- 数据库：MySQL
- 认证：JWT + bcrypt

## 快速开始

### 1. 数据库设置

1. 安装MySQL并启动服务
2. 使用Navicat或其他工具执行 `database/schema.sql`
3. 修改 `backend/.env` 中的数据库连接信息

### 2. 后端启动

```bash
cd backend
npm install
npm run dev

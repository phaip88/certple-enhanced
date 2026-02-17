# Certple Enhanced

[![License: GPL-3.0](https://img.shields.io/badge/License-GPL_3.0-blue.svg)](https://www.gnu.org/licenses/gpl-3.0.txt)
[![Build and Deploy](https://github.com/phaip88/certple-enhanced/actions/workflows/build-and-deploy.yml/badge.svg)](https://github.com/phaip88/certple-enhanced/actions/workflows/build-and-deploy.yml)

Certple Enhanced 是 Certple 的增强版本，提供简单快速申请有效 TLS/SSL 证书的客户端，并新增了用户认证和自动续期功能。

## ✨ 新增功能

### 🔐 用户认证系统
- **登录/登出功能**：保护证书管理页面
- **凭证管理**：安全的用户名和密码设置
- **会话管理**：7天有效期，自动续期
- **路由保护**：/manage 和 /settings 需要登录访问
- **密码加密**：使用 PBKDF2 + 100,000 次迭代

### 🔄 自动续期系统
- **完全自动续期**：利用 Let's Encrypt 30天授权缓存，实现零人工干预续期
- **智能检测**：自动检测即将到期的证书（默认30天阈值）
- **授权复用**：在30天授权缓存期内，无需重新验证域名
- **续期调度**：24小时定时检查，自动触发续期
- **Telegram 通知**：证书临期和续期失败时发送通知
- **历史记录**：记录所有续期操作，最多保留10条
- **灵活配置**：
  - 全局自动续期开关
  - 单证书级别的续期控制
  - 可配置续期阈值（1-60天）
  - Telegram Bot 通知配置
- **优雅降级**：授权过期时自动切换到手动验证模式

#### 自动续期工作原理

Let's Encrypt 会缓存域名授权30天。如果在此期间续期：
1. ✅ 无需重新添加 DNS TXT 记录
2. ✅ 无需重新部署 HTTP 验证文件
3. ✅ 自动复用已有授权
4. ✅ 直接完成续期

**最佳实践**：设置续期阈值为30天（默认值），确保在授权缓存期内自动续期。

## 🚀 快速开始

### 在线使用

访问部署版本：[https://phaip88.github.io/certple-enhanced](https://phaip88.github.io/certple-enhanced)

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/phaip88/certple-enhanced.git
cd certple-enhanced

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
```

### 构建部署

```bash
# 构建静态文件
npm run build

# 构建文件将生成在 out/ 目录
# 可以使用任何静态文件服务器部署
```

## 📋 原有功能

- 支持 **单域名证书**、**多域名证书** 和 **通配符证书**
- 来自 [Let's Encrypt](https://letsencrypt.org/) 的免费证书
- 支持 **DNS-01** 和 **HTTP-01** 验证方式
- **证书管理**：查看、下载、删除证书
- **数据导入/导出**：备份和恢复证书数据
- **完全本地化**：所有数据存储在 localStorage

## 🔧 技术栈

- **框架**：Next.js 16.1.3 + React 19.2.3
- **UI**：Bootstrap 5.3.8
- **密码学**：Web Crypto API
- **部署**：GitHub Actions + GitHub Pages
- **协议**：ACME (RFC 8555)

## 📖 使用指南

### 首次使用

1. 访问 [设置页面](/settings)
2. 切换到"认证设置"选项卡
3. 创建用户名和密码
4. 登录后即可访问证书管理功能

### 申请证书

1. 在首页输入域名
2. 选择证书类型（单域名/通配符）
3. 按照提示完成域名验证
4. 下载证书和私钥

### 配置自动续期

1. 访问 [设置页面](/settings)
2. 切换到"自动续期设置"选项卡
3. 启用全局自动续期
4. 设置续期阈值（推荐30天）
5. （可选）配置 Telegram 通知

### 配置 Telegram 通知

1. 访问 [设置页面](/settings)
2. 切换到"Telegram 通知"选项卡
3. 创建 Telegram Bot（通过 @BotFather）
4. 获取 Bot Token 和 Chat ID
5. 测试连接确保配置正确

### 证书自动续期

启用自动续期后：
1. 系统每24小时检查一次证书
2. 发现临期证书（距离到期 ≤ 阈值天数）
3. 自动触发续期流程
4. 如果授权仍在缓存期（30天内）：
   - ✅ 自动完成续期，无需人工干预
   - ✅ 更新证书存储
5. 如果授权已过期（>30天）：
   - ⚠️ 发送 Telegram 通知
   - 📝 需要手动完成域名验证

**重要提示**：
- 浏览器必须保持打开才能运行自动续期
- 建议使用专用浏览器标签页保持应用运行
- 或者定期访问应用触发续期检查

## 🔒 安全性

- **密码加密**：PBKDF2 算法，100,000 次迭代
- **会话管理**：安全的会话令牌，7天有效期
- **本地存储**：所有数据存储在浏览器 localStorage
- **无服务器**：纯前端应用，无需后端服务器
- **授权缓存**：利用 Let's Encrypt 的30天授权缓存机制

## ⚠️ 限制说明

### 自动续期限制
- **浏览器依赖**：需要浏览器保持打开才能运行调度器
- **授权缓存**：仅在30天授权缓存期内可完全自动续期
- **网络要求**：需要稳定的网络连接访问 ACME 服务器
- **静态部署**：保持纯前端特性，无后端服务

### 推荐使用场景
- ✅ 个人网站证书管理
- ✅ 小型项目证书续期
- ✅ 开发/测试环境证书
- ⚠️ 生产环境建议使用专业证书管理工具（如 Certbot）

## 🤝 贡献

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📜 许可证

GPL-3.0 © phaip88

基于 [Certple](https://github.com/zeoseven/certple) by ZeoSeven

## 🙏 致谢

- 原项目：[Certple](https://github.com/zeoseven/certple) by ZeoSeven
- ACME 实现：[xiangyuecn](https://github.com/xiangyuecn)
- 证书颁发：[Let's Encrypt](https://letsencrypt.org/)

## 📞 支持

如有问题或建议，请：
- 提交 [Issue](https://github.com/phaip88/certple-enhanced/issues)
- 查看 [文档](/docs)
- 访问原项目 [Certple 文档](https://certple.zeoseven.com/docs/)


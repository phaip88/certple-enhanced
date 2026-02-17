# Certple

[![License: GPL-3.0](https://img.shields.io/badge/License-GPL_3.0-blue.svg)](https://www.gnu.org/licenses/gpl-3.0.txt)

Certple 的目的是提供一个简单快速申请有效 TLS/SSL 证书的客户端，快速为您的站点提供 TLS/SSL 加密层(HTTPS)，而不是 ACME 自动化。

支持 单域名证书、多域名证书 和 通配符证书，一切来自 <a href="https://letsencrypt.org/">Let's Encrypt</a> !

## 🚀 立即开始

无需注册任何账户，只需要提供一些 DNS 记录来验证您对域名的所有权，剩下的一切交给 Certple 。

<a href="https://certple.zeoseven.com/home/#开始">前往 certple.zeoseven.com 开始申请！</a>

## ✨ 私有化

- Node.js 20.9 +

### 私有化部署

你可以前往 <a href="https://github.com/zeoseven/certple/releases">Releases</a> 直接下载 Certple_Private-Build 即可获得已经构建好的私有化版本，它是完全静态的，你可以开设一个本地服务器来运行它：

```
npm i serve -g
```

```
serve
```

### 私有化构建

```
npm i
```

```
npm run build
```
在这之后，构建文件将出现在 `out/` 文件夹。

如果你并不喜欢部署的过程，那么可以在构建之后直接启动生产服务器：
```
npm run start
```
这将更快的在 localhost:3000 可用。

> 你可以使用 `npm run dev` 启动开发服务器来修改 Certple ，只要那符合 GPLv3 LICENSE。

## ❓ 文档

使用文档可以在 <a href="https://certple.zeoseven.com/docs/">certple.zeoseven.com/docs</a> 上查阅。

## 📜 许可证

GPL-3.0 © ZeoSeven

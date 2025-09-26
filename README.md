# Simple ORD MCP Server

一个简洁优雅的MCP服务器，专注于提供ORD (Open Resource Discovery) 规范的核心功能。

## 🎯 设计理念

这是对原有复杂MCP服务器的重新设计，追求：
- **简洁性**: 专注于核心功能，去除不必要的复杂性
- **实时性**: 直接从GitHub获取最新的ORD规范
- **可读性**: 清晰的代码结构，易于理解和维护

## 🚀 核心功能

### 1. 实时获取ORD规范
- 直接从SAP GitHub仓库获取最新的ORD规范文档
- 无需本地缓存，确保信息始终是最新的
- 支持作为MCP资源访问

### 2. ORD概念解释
支持解释以下ORD核心概念：
- **Product**: 产品定义和商业分组
- **Package**: 资源容器和分组
- **ConsumptionBundle**: 消费捆绑包
- **APIResource**: API资源定义
- **EventResource**: 事件资源定义

每个概念包含：
- 详细描述
- JSON示例结构
- 关键属性说明
- 使用注意事项

## 📦 安装和使用

```bash
# 安装依赖
npm install

# 启动服务器
npm start

# 测试服务器
node test-simple-server.js
```

## 🛠 MCP工具

### `get_ord_specification`
获取最新的ORD规范文档

```json
{
  "name": "get_ord_specification",
  "arguments": {}
}
```

### `explain_ord_concept`
解释ORD概念

```json
{
  "name": "explain_ord_concept",
  "arguments": {
    "concept": "Product"
  }
}
```

支持的概念：
- `Product`
- `Package` 
- `ConsumptionBundle`
- `APIResource`
- `EventResource`

## 📚 MCP资源

### `ord://specification/latest`
提供最新的ORD规范文档作为Markdown格式的资源

## 🏗 项目结构

```
├── src/
│   └── simple-ord-server.js    # 主服务器文件
├── backup/                     # 原有复杂代码备份
├── test-simple-server.js       # 测试脚本
├── package.json
└── README.md
```

## 🎨 设计特点

1. **单文件架构**: 所有逻辑集中在一个文件中，便于理解和维护
2. **最小依赖**: 只依赖必要的MCP SDK和axios
3. **直接API调用**: 不使用复杂的缓存机制，确保数据实时性
4. **错误处理**: 简洁的错误处理和用户友好的错误信息
5. **类型安全**: 严格的输入验证和类型检查

## 🔄 与原版本的对比

| 特性 | 原版本 | 简化版本 |
|------|--------|----------|
| 文件数量 | 10+ | 1 |
| 代码行数 | 1000+ | ~200 |
| 功能复杂度 | 高 | 简洁 |
| 启动时间 | 慢 | 快 |
| 维护难度 | 高 | 低 |
| 数据实时性 | 缓存延迟 | 实时 |

## 🚦 状态

✅ **生产就绪**: 简化版本已完成核心功能实现，可用于生产环境

## 📄 许可证

MIT License

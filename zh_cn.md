# ORD MCP服务器使用指南

这个指南将详细说明如何使用ORD MCP服务器来帮助您在CAP项目中实现ORD注解。

## 🚀 快速开始

### 1. 安装依赖
```bash
# 确保您有Node.js 18+
node --version

# 安装项目依赖
npm install
```

### 2. 运行演示
```bash
# 运行交互式演示，查看所有功能
npm run demo
```

### 3. 启动服务器
```bash
# 启动MCP服务器
npm start
```

## 🛠️ 配置MCP客户端

### VS Code + Claude Desktop配置

在您的MCP客户端配置文件中添加：

```json
{
  "mcpServers": {
    "ord-mcp-server": {
      "command": "node",
      "args": ["/完整路径/ord-mcp-server/src/index.js"],
      "env": {
        "ORD_CACHE_TTL": "3600",
        "ORD_LOG_LEVEL": "info"
      }
    }
  }
}
```

## 📚 六大核心工具

### 1. 搜索ORD文档 (search_ord_docs)

**用途**：在ORD官方文档中进行语义搜索

**使用示例**：
```json
{
  "tool": "search_ord_docs",
  "arguments": {
    "query": "如何定义API资源",
    "maxResults": 5
  }
}
```

**适用场景**：
- 查找ORD概念解释
- 寻找最佳实践
- 获取注解语法帮助

### 2. 解释ORD概念 (explain_ord_concept)

**用途**：获取ORD核心概念的详细解释和示例

**使用示例**：
```json
{
  "tool": "explain_ord_concept",
  "arguments": {
    "concept": "Product",
    "includeExamples": true
  }
}
```

**可用概念**：
- `Product` - 产品定义
- `Capability` - 能力分组
- `APIResource` - API资源定义
- `EventResource` - 事件资源定义
- `ConsumptionBundle` - 消费包配置
- `Vendor` - 供应商信息

### 3. 生成ORD注解 (generate_ord_annotation)

**用途**：为CAP服务自动生成ORD注解

**使用示例**：
```json
{
  "tool": "generate_ord_annotation",
  "arguments": {
    "servicePath": "./srv/bookshop-service.cds",
    "annotationType": "comprehensive"
  }
}
```

**注解类型**：
- `minimal` - 最基本的注解
- `basic` - 标准注解
- `comprehensive` - 完整注解（推荐）

### 4. 验证ORD元数据 (validate_ord_metadata)

**用途**：验证ORD元数据是否符合规范

**使用示例**：
```json
{
  "tool": "validate_ord_metadata",
  "arguments": {
    "metadataPath": "./package.json",
    "strict": true
  }
}
```

### 5. 分析CAP项目 (analyze_cap_project)

**用途**：分析CAP项目结构并提供ORD改进建议

**使用示例**：
```json
{
  "tool": "analyze_cap_project",
  "arguments": {
    "projectPath": "/path/to/your/cap-project",
    "suggestionLevel": "detailed"
  }
}
```

**分析级别**：
- `basic` - 基本建议
- `detailed` - 详细分析（推荐）
- `comprehensive` - 全面分析

### 6. 获取ORD示例 (get_ord_examples)

**用途**：获取特定场景的ORD注解示例

**使用示例**：
```json
{
  "tool": "get_ord_examples",
  "arguments": {
    "useCase": "REST API with events",
    "serviceType": "rest",
    "complexity": "moderate"
  }
}
```

## 🎯 典型使用流程

### 场景1：为新的CAP项目添加ORD注解

1. **了解ORD概念**
   ```json
   { "tool": "explain_ord_concept", "arguments": { "concept": "Product" } }
   ```

2. **分析当前项目结构**
   ```json
   { "tool": "analyze_cap_project", "arguments": { "projectPath": "./", "suggestionLevel": "comprehensive" } }
   ```

3. **生成初始注解**
   ```json
   { "tool": "generate_ord_annotation", "arguments": { "servicePath": "./srv/my-service.cds", "annotationType": "basic" } }
   ```

4. **验证生成的元数据**
   ```json
   { "tool": "validate_ord_metadata", "arguments": { "metadataPath": "./package.json" } }
   ```

### 场景2：改进现有的ORD设置

1. **验证当前设置**
   ```json
   { "tool": "validate_ord_metadata", "arguments": { "metadataPath": "./package.json", "strict": true } }
   ```

2. **获取全面分析**
   ```json
   { "tool": "analyze_cap_project", "arguments": { "projectPath": "./", "suggestionLevel": "comprehensive" } }
   ```

3. **搜索最佳实践**
   ```json
   { "tool": "search_ord_docs", "arguments": { "query": "ORD最佳实践 消费包" } }
   ```

### 场景3：解决ORD问题

1. **搜索具体问题**
   ```json
   { "tool": "search_ord_docs", "arguments": { "query": "ordId验证错误" } }
   ```

2. **获取相关示例**
   ```json
   { "tool": "get_ord_examples", "arguments": { "useCase": "your specific scenario" } }
   ```

3. **验证修复结果**
   ```json
   { "tool": "validate_ord_metadata", "arguments": { "metadataPath": "./package.json", "strict": true } }
   ```

## 📋 示例输出

### 搜索结果示例
```markdown
# 搜索结果："API资源注解"

找到3个结果：

## 1. API资源定义指南
**相关性：** 95%

API资源代表提供数据访问的REST或OData端点...

**来源：** ord-specification.md
```

### 验证报告示例
```markdown
# ORD元数据验证报告

**状态：** ❌ 无效
**错误：** 2个
**警告：** 1个

## ❌ 错误

1. **缺少必需字段** (products[0])
   所有产品都需要ordId字段
   
2. **格式无效** (products[0].ordId)
   ordId必须遵循模式：命名空间:类型:名称:版本
```

## 🔧 开发工作流集成

### VS Code集成
将服务器添加到您的MCP客户端配置中，然后您可以：
- 在编写CDS文件时获取ORD概念解释
- 自动生成ORD注解
- 验证元数据格式
- 获取最佳实践建议

### CI/CD集成
在构建管道中使用验证工具：

```bash
# 将ORD元数据验证作为构建的一部分
node -e "
const { OrdValidator } = require('./ord-mcp-server/src/analyzers/ordValidator.js');
const validator = new OrdValidator();
validator.validateMetadata('./package.json').then(result => {
  if (!result.valid) {
    console.error('ORD验证失败');
    process.exit(1);
  }
});
"
```

## 💡 使用技巧

1. **明确查询**：使用具体的查询而不是泛泛的问题
   - ❌ "ORD注解"
   - ✅ "OData服务的ORD API资源注解"

2. **选择合适的注解类型**：新项目使用`basic`，生产系统使用`comprehensive`

3. **频繁验证**：在做出更改后立即运行验证以尽早发现问题

4. **遵循命名约定**：使用一致的ordId模式，如`company:product:service:v1`

5. **利用示例**：使用`get_ord_examples`查看特定用例的实际模式

## 🚨 常见问题

### Q: 服务器启动时显示"文档获取失败"
A: 这是正常的，服务器会使用内置的示例数据继续工作。网络问题不会影响核心功能。

### Q: 如何为我的特定用例生成注解？
A: 使用`generate_ord_annotation`工具，提供您的CDS服务定义，选择合适的注解类型。

### Q: 验证失败，如何修复？
A: 查看验证报告中的具体错误和建议，使用`search_ord_docs`搜索相关解决方案。

### Q: 如何在团队中共享这个工具？
A: 将MCP服务器配置添加到项目文档中，团队成员可以使用相同的配置。

这个ORD MCP服务器将显著改善您在CAP项目中使用ORD注解的体验，帮助您遵循官方标准和最佳实践！

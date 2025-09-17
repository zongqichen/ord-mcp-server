# ORD MCP Server Usage Guide

This guide shows you how to use the ORD MCP Server to get help with ORD annotations and CAP project development.

## Available Tools

### 1. search_ord_docs
Search through ORD documentation using semantic search.

**Usage:**
```json
{
  "tool": "search_ord_docs",
  "arguments": {
    "query": "how to define API resources",
    "maxResults": 5
  }
}
```

**Example queries:**
- "how to annotate CAP services with ORD"
- "ORD product definition examples"
- "consumption bundle best practices"
- "event resource annotation syntax"

### 2. explain_ord_concept
Get detailed explanations of ORD concepts with examples.

**Usage:**
```json
{
  "tool": "explain_ord_concept",
  "arguments": {
    "concept": "Product",
    "includeExamples": true
  }
}
```

**Available concepts:**
- `Product` - ORD product definitions
- `Capability` - Capability groupings
- `APIResource` - API resource definitions
- `EventResource` - Event resource definitions
- `ConsumptionBundle` - Bundle configurations
- `Vendor` - Vendor information
- `Package` - Package definitions

### 3. generate_ord_annotation
Generate ORD annotations for your CAP services.

**Usage:**
```json
{
  "tool": "generate_ord_annotation",
  "arguments": {
    "servicePath": "./srv/bookshop-service.cds",
    "annotationType": "comprehensive"
  }
}
```

**Or with service definition:**
```json
{
  "tool": "generate_ord_annotation",
  "arguments": {
    "serviceDefinition": "service BookService { entity Books { ID: UUID; title: String; } }",
    "annotationType": "basic"
  }
}
```

**Annotation types:**
- `minimal` - Basic ORD annotations only
- `basic` - Standard annotations with essential metadata
- `comprehensive` - Full annotations with all optional fields

### 4. validate_ord_metadata
Validate ORD metadata against schemas and best practices.

**Usage:**
```json
{
  "tool": "validate_ord_metadata",
  "arguments": {
    "metadataPath": "./package.json",
    "strict": false
  }
}
```

**Or with metadata object:**
```json
{
  "tool": "validate_ord_metadata",
  "arguments": {
    "metadata": {
      "openResourceDiscoveryVersion": "1.9.0",
      "products": [...]
    },
    "strict": true
  }
}
```

### 5. analyze_cap_project
Analyze your CAP project and get ORD improvement suggestions.

**Usage:**
```json
{
  "tool": "analyze_cap_project",
  "arguments": {
    "projectPath": "/path/to/cap-project",
    "suggestionLevel": "detailed"
  }
}
```

**Suggestion levels:**
- `basic` - Essential recommendations only
- `detailed` - Comprehensive analysis with actionable suggestions
- `comprehensive` - Full analysis including architecture recommendations

### 6. get_ord_examples
Get relevant ORD examples for specific use cases.

**Usage:**
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

**Service types:**
- `odata` - OData services
- `rest` - REST APIs
- `graphql` - GraphQL APIs
- `event` - Event-driven services
- `generic` - General services

**Complexity levels:**
- `simple` - Basic examples
- `moderate` - Real-world scenarios
- `complex` - Advanced patterns

## Common Workflows

### 1. Starting with ORD Annotations

When you're new to ORD and want to add annotations to your CAP project:

1. **Learn the concepts:**
   ```json
   { "tool": "explain_ord_concept", "arguments": { "concept": "Product" } }
   ```

2. **Analyze your project:**
   ```json
   { "tool": "analyze_cap_project", "arguments": { "projectPath": "./", "suggestionLevel": "comprehensive" } }
   ```

3. **Generate initial annotations:**
   ```json
   { "tool": "generate_ord_annotation", "arguments": { "servicePath": "./srv/my-service.cds", "annotationType": "basic" } }
   ```

4. **Validate the results:**
   ```json
   { "tool": "validate_ord_metadata", "arguments": { "metadataPath": "./package.json" } }
   ```

### 2. Improving Existing ORD Setup

When you already have ORD annotations but want to improve them:

1. **Validate current setup:**
   ```json
   { "tool": "validate_ord_metadata", "arguments": { "metadataPath": "./package.json", "strict": true } }
   ```

2. **Get comprehensive analysis:**
   ```json
   { "tool": "analyze_cap_project", "arguments": { "projectPath": "./", "suggestionLevel": "comprehensive" } }
   ```

3. **Search for best practices:**
   ```json
   { "tool": "search_ord_docs", "arguments": { "query": "ORD best practices consumption bundles" } }
   ```

### 3. Troubleshooting ORD Issues

When you encounter problems with ORD:

1. **Search for specific issues:**
   ```json
   { "tool": "search_ord_docs", "arguments": { "query": "ordId validation error" } }
   ```

2. **Validate your metadata:**
   ```json
   { "tool": "validate_ord_metadata", "arguments": { "metadataPath": "./package.json", "strict": true } }
   ```

3. **Get examples for your use case:**
   ```json
   { "tool": "get_ord_examples", "arguments": { "useCase": "your specific scenario" } }
   ```

## Example Outputs

### Search Results
```markdown
# Search Results for "API resource annotation"

Found 3 result(s):

## 1. API Resource Definition Guide
**Relevance:** 95%

API resources represent REST or OData endpoints that provide access to data...

**Source:** ord-specification.md

---
```

### Concept Explanation
```markdown
# ORD Product

A Product in ORD represents a business-oriented grouping of capabilities...

## Examples

### Example 1
Basic product definition for a bookshop system...
```

### Validation Report
```markdown
# ORD Metadata Validation Report

**Status:** ❌ Invalid
**Errors:** 2
**Warnings:** 1

## ❌ Errors

1. **Missing Required Field** (products[0])
   ordId field is required for all products
   
2. **Invalid Format** (products[0].ordId)
   ordId must follow pattern: namespace:type:name:version
```

## Tips for Best Results

1. **Be specific in queries:** Instead of "ORD annotation", use "ORD API resource annotation for OData service"

2. **Use appropriate annotation types:** Start with `basic` for new projects, use `comprehensive` for production systems

3. **Validate frequently:** Run validation after making changes to catch issues early

4. **Follow naming conventions:** Use consistent ordId patterns like `company:product:service:v1`

5. **Leverage examples:** Use `get_ord_examples` to see real-world patterns for your specific use case

## Integration with Development Workflow

### VS Code Integration
Add the server to your MCP client configuration:

```json
{
  "mcpServers": {
    "ord-mcp-server": {
      "command": "node",
      "args": ["/path/to/ord-mcp-server/src/index.js"]
    }
  }
}
```

### CI/CD Integration
Use the validation tool in your build pipeline:

```bash
# Validate ORD metadata as part of build
node -e "
const { OrdValidator } = require('./ord-mcp-server/src/analyzers/ordValidator.js');
const validator = new OrdValidator();
validator.validateMetadata('./package.json').then(result => {
  if (!result.valid) {
    console.error('ORD validation failed');
    process.exit(1);
  }
});
"
```

This server helps you maintain high-quality ORD annotations and follow best practices throughout your CAP development process.

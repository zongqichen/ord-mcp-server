# ORD MCP Server Demo

This folder contains an interactive demo that showcases all capabilities of the ORD MCP Server.

## 🎬 Demo Features

The demo demonstrates:

1. **Server Information** - Basic server details and capabilities
2. **ORD Concept Explanations** - Interactive explanations of ORD concepts like Product, APIResource, EventResource
3. **Documentation Search** - Semantic search through ORD documentation
4. **Annotation Generation** - Generate ORD annotations for CAP services
5. **Metadata Validation** - Validate ORD metadata against schemas
6. **CAP Project Analysis** - Analyze CAP projects and get improvement suggestions
7. **Example Retrieval** - Get relevant examples for specific use cases

## 🚀 Running the Demo

### Quick Start
```bash
# From the project root
npm run demo
```

### Manual Execution
```bash
# From the project root
node xmpl/demo.js
```

### Make it executable
```bash
chmod +x xmpl/demo.js
./xmpl/demo.js
```

## 📋 Demo Output

The demo provides colorized output showing:

- ✅ **Success indicators** in green
- ⚠️ **Warnings** in yellow  
- ❌ **Errors** in red
- 📋 **Section headers** in cyan
- 💡 **Information** in blue

Each section demonstrates a specific server capability with real examples and sample data.

## 🎯 What You'll See

### 1. Server Information
```
✅ Server initialized successfully
📦 Version: 1.0.0
🛠️  Available Tools: 6
📚 Resources: ORD documentation, schemas, examples
```

### 2. Concept Explanations
Detailed explanations of core ORD concepts with examples:
- Product definitions and usage
- API Resource configurations
- Event Resource patterns

### 3. Documentation Search
Semantic search demonstrations:
- "How to define API resources in ORD"
- "Event resource annotation examples"
- "Consumption bundle best practices"

### 4. Annotation Generation
Live generation of ORD annotations from CAP service definitions, showing:
- Service analysis
- Generated annotations
- Best practice recommendations

### 5. Metadata Validation
Validation examples with both valid and invalid ORD metadata:
- Schema validation
- Best practices checking
- Error reporting with suggestions

### 6. CAP Project Analysis
Analysis of a temporary CAP project showing:
- Service discovery
- Entity and event detection
- ORD annotation gap analysis
- Improvement suggestions

### 7. Example Retrieval
Contextual examples for different scenarios:
- REST API with CRUD operations
- Event-driven microservices
- OData services with analytics

## 🔧 Technical Details

The demo creates temporary files and directories as needed:
- `./xmpl/temp-cap-project/` - Temporary CAP project for analysis
- Automatic cleanup after demonstration

## 🎨 Customization

You can modify the demo by:

1. **Adding new test cases** - Edit the arrays in each demo section
2. **Changing demo timing** - Adjust `delay()` calls for pacing
3. **Adding new sections** - Create new demo methods and call them in `runFullDemo()`
4. **Customizing output** - Modify the `colorize()` function and color schemes

## 📚 Next Steps

After running the demo:

1. **Configure MCP Client** - Use the configuration in `examples/mcp-client-config.json`
2. **Try real tools** - Use the server tools in your development workflow
3. **Read documentation** - Check `USAGE.md` for detailed tool usage
4. **Analyze your project** - Run the analysis tools on your own CAP projects

The demo shows you exactly what the ORD MCP Server can do to improve your ORD annotation workflow!

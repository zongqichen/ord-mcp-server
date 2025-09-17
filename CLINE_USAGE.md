# Using ORD MCP Server with Cline

This guide shows you how to use the ORD MCP Server with Cline to enhance your CAP development workflow with ORD annotations.

## 🎯 Configuration Complete

Your ORD MCP server is now configured with Cline! The server provides 6 powerful tools for ORD documentation and CAP annotation assistance.

## 🔧 Current Configuration

The MCP server is configured in Cline with:
- **Server Name**: `ord-mcp-server`
- **Command**: `node /home/d072944/work/ord-mcp-server/src/index.js`
- **Cache TTL**: 3600 seconds (1 hour)
- **Log Level**: info
- **Timeout**: 30 seconds

## 🛠️ Available Tools in Cline

Once the server is active, you can use these tools directly in Cline conversations:

### 1. search_ord_docs
Search through ORD documentation using semantic search.

**Example Cline prompts:**
- "Search ORD docs for API resource best practices"
- "Find information about consumption bundle patterns"
- "Look up event resource annotation examples"

### 2. explain_ord_concept
Get detailed explanations of ORD concepts with examples.

**Example Cline prompts:**
- "Explain the ORD Product concept with examples"
- "What is an APIResource in ORD and how do I use it?"
- "Show me how EventResource works in ORD"

### 3. generate_ord_annotation
Generate ORD annotations for your CAP services.

**Example Cline prompts:**
- "Generate ORD annotations for my bookshop service"
- "Create comprehensive ORD annotations for the service in srv/catalog-service.cds"
- "Add basic ORD annotations to my CAP project"

### 4. validate_ord_metadata
Validate ORD metadata against schemas and best practices.

**Example Cline prompts:**
- "Validate my ORD metadata in package.json"
- "Check if my ORD configuration follows best practices"
- "Run strict validation on my ORD metadata"

### 5. analyze_cap_project
Analyze your CAP project and get ORD improvement suggestions.

**Example Cline prompts:**
- "Analyze my CAP project for ORD improvements"
- "Give me detailed suggestions for ORD annotations in my project"
- "What ORD enhancements can I make to this CAP service?"

### 6. get_ord_examples
Get relevant ORD examples for specific use cases.

**Example Cline prompts:**
- "Show me ORD examples for REST APIs with events"
- "Get examples for OData services with analytics"
- "Find ORD patterns for event-driven microservices"

## 🎯 Typical Cline Workflows

### Workflow 1: Adding ORD to New CAP Project

**Cline Conversation:**
```
You: "I have a new CAP project with a bookshop service. Help me add proper ORD annotations."

Cline will:
1. Analyze the project structure
2. Explain ORD concepts relevant to your service
3. Generate appropriate annotations
4. Validate the resulting metadata
5. Apply the changes to your files
```

### Workflow 2: Improving Existing ORD Setup

**Cline Conversation:**
```
You: "My CAP project already has some ORD annotations, but I want to improve them and ensure they follow best practices."

Cline will:
1. Validate current ORD metadata
2. Analyze the project for gaps
3. Search for best practices
4. Generate improved annotations
5. Update your configuration
```

### Workflow 3: Troubleshooting ORD Issues

**Cline Conversation:**
```
You: "I'm getting ORD validation errors. Can you help me fix them?"

Cline will:
1. Validate your ORD metadata
2. Search for solutions to specific errors
3. Explain what's wrong and why
4. Generate corrected annotations
5. Verify the fixes work
```

## 💡 Cline + ORD MCP Server Benefits

### Intelligent Context
- Cline can access ORD documentation automatically
- No need to copy-paste documentation or examples
- Always up-to-date with ORD best practices

### End-to-End Workflow
- Analyze → Generate → Validate → Apply in one conversation
- Cline handles file modifications and validation
- Immediate feedback and iteration

### Expert Assistance
- Get explanations tailored to your specific use case
- Examples relevant to your service types
- Validation with actionable error messages

## 🚀 Getting Started

1. **Start a new Cline conversation**
2. **Mention your CAP project**: "I'm working on a CAP project and want to add ORD annotations"
3. **Let Cline guide you**: Cline will use the MCP tools automatically to help you

### Example Starting Conversations:

**For New Projects:**
```
"I have a CAP service for managing books and orders. Can you help me add proper ORD annotations? The service file is at srv/bookshop-service.cds"
```

**For Existing Projects:**
```
"My CAP project has ORD annotations but I'm getting validation errors. Can you analyze my setup and fix the issues?"
```

**For Learning:**
```
"I'm new to ORD. Can you explain the key concepts and show me examples of how to annotate CAP services?"
```

## 🔍 Verification

To verify the MCP server is working:

1. Start a Cline conversation
2. Ask: "Can you search ORD documentation for Product definitions?"
3. Cline should automatically use the `search_ord_docs` tool
4. You'll see ORD-specific information in the response

## 🚨 Troubleshooting

### If tools aren't available:
1. Check that Cline shows the MCP server as "Connected"
2. Restart VS Code if needed
3. Verify the server path in MCP settings is correct

### If server fails to start:
1. Check that Node.js is installed and accessible
2. Ensure all npm dependencies are installed: `npm install`
3. Check the server logs for specific errors

### If you get outdated information:
- The server caches documentation for performance
- Ask Cline to "refresh the ORD documentation cache"
- Or restart the MCP server

## 🎉 Next Steps

With the ORD MCP server configured in Cline, you can:

1. **Start any CAP project conversation** - Cline will automatically use ORD tools when relevant
2. **Ask for ORD help directly** - Use the example prompts above
3. **Iterate and improve** - Let Cline guide you through ORD best practices
4. **Share with your team** - The configuration works for any Cline user with access to this server

The ORD MCP server transforms Cline into an ORD expert that can help you implement proper annotations efficiently and correctly!

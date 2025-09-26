# ORD MCP Server

A Model Context Protocol (MCP) server providing access to ORD (Open Resource Discovery) specification and concept explanations.

## Usage

### Installation

```bash
npm install
```

### MCP Configuration

Add this to your MCP client configuration:

```json
{
    "mcpServers": {
        "ord-mcp-server": {
            "command": "node",
            "args": ["path/to/ord-mcp-server/src/ord-mcp-server.js"],
            "env": {}
        }
    }
}
```

### Available Tools

#### `get_ord_specification`

Retrieves the latest ORD specification document from GitHub.

```json
{
    "name": "get_ord_specification",
    "arguments": {}
}
```

#### `explain_ord_concept`

Provides detailed explanation of ORD concepts with examples.

```json
{
    "name": "explain_ord_concept",
    "arguments": {
        "concept": "Product"
    }
}
```

Supported concepts: `Product`, `Package`, `ConsumptionBundle`, `APIResource`, `EventResource`

### Available Resources

#### `ord://specification/latest`

Direct access to the latest ORD specification document as a Markdown resource.

## Engineering Profile

This project follows unified assistant + engineering standards defined in `ENGINEERING_PROFILE.md`. All assistants must follow these standards for generation, refactor, review, debugging, and optimization tasks.

## License

MIT License

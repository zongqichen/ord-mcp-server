# ORD MCP Server

A clean and elegant MCP server providing access to ORD (Open Resource Discovery) specification and concept explanations.

## Design Philosophy

This is a complete rewrite of the original complex MCP server, focusing on:
- **Simplicity**: Core functionality without unnecessary complexity
- **Real-time data**: Direct access to latest ORD specification from GitHub
- **Maintainability**: Clean, readable code structure

## Core Features

### 1. Real-time ORD Specification Access
- Fetches latest ORD specification directly from SAP GitHub repository
- No local caching - ensures information is always up-to-date
- Available as both MCP tool and resource

### 2. ORD Concept Explanations
Supports explanation of core ORD concepts:
- **Product**: Commercial offerings and logical capability groupings
- **Package**: Container for grouping related ORD resources
- **ConsumptionBundle**: Groups resources typically consumed together
- **APIResource**: Consumable API definitions
- **EventResource**: Event resource definitions

Each concept includes:
- Detailed description
- JSON example structure
- Key properties explanation
- Usage guidelines

## Installation and Usage

```bash
# Install dependencies
npm install

# Start the server
npm start

# Development mode with debugging
npm run dev
```

## MCP Tools

### `get_ord_specification`
Retrieves the latest ORD specification document from GitHub.

```json
{
  "name": "get_ord_specification",
  "arguments": {}
}
```

### `explain_ord_concept`
Provides detailed explanation of ORD concepts with examples.

```json
{
  "name": "explain_ord_concept",
  "arguments": {
    "concept": "Product"
  }
}
```

Supported concepts:
- `Product`
- `Package` 
- `ConsumptionBundle`
- `APIResource`
- `EventResource`

## MCP Resources

### `ord://specification/latest`
Provides the latest ORD specification document as a Markdown resource.

## Project Structure

```
├── src/
│   └── ord-mcp-server.js    # Main server file (~200 lines)
├── package.json
└── README.md
```

## Architecture Benefits

1. **Single-file architecture**: All logic in one file for easy understanding
2. **Minimal dependencies**: Only MCP SDK and axios required
3. **Direct API calls**: No complex caching, ensures real-time data
4. **Robust error handling**: Clean error messages and graceful degradation
5. **Type safety**: Strict input validation and schema enforcement

## Comparison with Previous Version

| Feature | Previous | Current |
|---------|----------|---------|
| Files | 10+ | 1 |
| Lines of code | 1000+ | ~200 |
| Complexity | High | Minimal |
| Startup time | Slow | Fast |
| Maintenance | Difficult | Easy |
| Data freshness | Cached/Delayed | Real-time |

## Status

✅ **Production Ready**: Core functionality implemented and tested.

## License

MIT License

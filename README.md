# ORD MCP Server

A Model Context Protocol (MCP) server that provides comprehensive ORD (Open Resource Discovery) documentation, explanations, and code generation capabilities for CAP (Cloud Application Programming) developers.

## Overview

This MCP server helps developers understand and implement ORD metadata in their CAP services by providing:

- **Official ORD Documentation**: Indexed and searchable ORD specification and examples
- **Concept Explanations**: Detailed explanations of ORD concepts (Product, Capability, API Resource, etc.)
- **Code Generation**: Automatic generation of ORD annotations for CAP services
- **Project Analysis**: Analysis of existing CAP projects for ORD compliance
- **Validation**: Comprehensive validation of ORD metadata against specifications

## Features

### Core Functionality

1. **Search ORD Documentation** - Full-text search across official ORD documentation
2. **Explain ORD Concepts** - Detailed explanations with examples for each ORD concept
3. **Generate Annotations** - Create ORD annotations for CAP services automatically
4. **Analyze CAP Projects** - Scan projects for existing ORD metadata and suggest improvements
5. **Validate ORD Metadata** - Comprehensive validation with detailed error reporting

### Supported ORD Concepts

- **Products**: Commercial offerings and logical groupings of capabilities
- **Capabilities**: Business functionalities provided by products
- **API Resources**: Consumable APIs (REST, OData, GraphQL, etc.)
- **Event Resources**: Business and technical events for event-driven architectures
- **Consumption Bundles**: Logical groupings of resources with authentication strategies
- **Packages**: Containers for versioning and lifecycle management

## Installation

### Prerequisites

- Node.js 18 or higher
- A compatible MCP client (like Cline or Claude Desktop)

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd ord-mcp-server
```

2. Install dependencies:
```bash
npm install
```

3. Test the server:
```bash
npm test
```

### MCP Client Configuration

Add the following to your MCP client configuration:

#### For Claude Desktop (`claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "ord-server": {
      "command": "node",
      "args": ["path/to/ord-mcp-server/src/index.js"],
      "env": {}
    }
  }
}
```

#### For Cline (VSCode extension):
```json
{
  "mcp": {
    "ord-server": {
      "command": "node",
      "args": ["path/to/ord-mcp-server/src/index.js"]
    }
  }
}
```

## Usage

Once configured with your MCP client, you can use the following tools:

### 1. Search ORD Documentation
```
search_ord_documentation(query, maxResults?)
```
Search through official ORD documentation, specifications, and examples.

**Example:**
```
search_ord_documentation("API Resource entry points", 5)
```

### 2. Explain ORD Concepts
```
explain_ord_concept(concept, includeExamples?)
```
Get detailed explanations of ORD concepts with examples.

**Example:**
```
explain_ord_concept("Capability", true)
```

### 3. Generate ORD Annotations
```
generate_ord_annotation(serviceContent, annotationType?)
```
Generate ORD annotations for CAP service definitions.

**Parameters:**
- `serviceContent`: CDS service definition content
- `annotationType`: "basic", "comprehensive", or "minimal" (default: "basic")

**Example:**
```
generate_ord_annotation(serviceContent, "comprehensive")
```

### 4. Analyze CAP Project
```
analyze_cap_project(projectPath, includeFiles?, suggestionLevel?)
```
Analyze a CAP project for ORD compliance and get suggestions.

**Parameters:**
- `projectPath`: Path to the CAP project
- `includeFiles`: Optional array of specific files to analyze
- `suggestionLevel`: "basic", "detailed", or "comprehensive" (default: "detailed")

### 5. Validate ORD Metadata
```
validate_ord_metadata(metadata, strict?)
```
Validate ORD metadata against specifications.

**Parameters:**
- `metadata`: ORD metadata object or path to metadata file
- `strict`: Enable strict validation mode (default: false)

### 6. Get ORD Examples
```
get_ord_examples(useCase, serviceType?, complexity?)
```
Get relevant ORD examples based on use case.

**Parameters:**
- `useCase`: Type of example needed (e.g., "REST API", "Events", "OData")
- `serviceType`: "rest", "odata", "event", etc. (default: "generic")
- `complexity`: "minimal", "moderate", "comprehensive" (default: "moderate")

## Example Workflows

### Adding ORD to a New CAP Service

1. **Analyze your project**:
```
analyze_cap_project("/path/to/my-cap-project", null, "comprehensive")
```

2. **Generate annotations** for your service:
```
generate_ord_annotation(myServiceContent, "comprehensive")
```

3. **Validate** the generated metadata:
```
validate_ord_metadata(generatedMetadata, true)
```

### Understanding ORD Concepts

1. **Get an overview** of a concept:
```
explain_ord_concept("ConsumptionBundle")
```

2. **Search for specific information**:
```
search_ord_documentation("consumption bundle authentication")
```

3. **Get practical examples**:
```
get_ord_examples("OAuth consumption bundle", "rest", "comprehensive")
```

## Architecture

The server consists of several key components:

- **Documentation Indexer** (`src/indexer/ordDocIndexer.js`): Fetches and indexes official ORD documentation
- **Semantic Search** (`src/search/semanticSearch.js`): Provides intelligent search and concept explanations
- **CAP Analyzer** (`src/analyzers/capAnalyzer.js`): Analyzes CAP projects for ORD compliance
- **Annotation Generator** (`src/generators/annotationGenerator.js`): Generates ORD annotations for services
- **ORD Validator** (`src/analyzers/ordValidator.js`): Validates ORD metadata against specifications

## Data Sources

The server automatically fetches and caches data from:

- [ORD Specification](https://github.com/SAP/open-resource-discovery) - Official ORD specification and schemas
- [CAP ORD Plugin Documentation](https://github.com/cap-js/ord) - CAP-specific ORD integration documentation
- JSON Schemas and examples from the official repositories

Data is cached locally and refreshed daily to ensure up-to-date information.

## Configuration

### Environment Variables

- `ORD_CACHE_TTL`: Cache time-to-live in milliseconds (default: 24 hours)
- `ORD_FETCH_TIMEOUT`: HTTP request timeout in milliseconds (default: 10 seconds)

### Cache Management

The server maintains a local cache in `.ord-cache/` directory:
- `meta.json`: Cache metadata and timestamps
- `specification.md`: ORD specification document
- `schemas.json`: JSON schemas for validation
- `examples.json`: Official examples
- `cap-docs.json`: CAP ORD plugin documentation

## Troubleshooting

### Common Issues

1. **Server fails to start**:
   - Ensure Node.js 18+ is installed
   - Check that all dependencies are installed (`npm install`)
   - Verify the MCP client configuration

2. **Documentation not loading**:
   - Check internet connectivity for initial data fetch
   - Clear cache directory and restart: `rm -rf .ord-cache`

3. **Validation errors**:
   - Ensure your ORD metadata follows the correct schema
   - Use `validate_ord_metadata` tool to get detailed error reports

### Debug Mode

Run with debug logging:
```bash
DEBUG=ord-mcp-server node src/index.js
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Related Resources

- [ORD Specification](https://github.com/SAP/open-resource-discovery)
- [CAP ORD Plugin](https://github.com/cap-js/ord)
- [CAP Documentation](https://cap.cloud.sap/docs/)
- [Model Context Protocol](https://modelcontextprotocol.io/)

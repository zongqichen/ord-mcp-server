#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';

class OrdMcpServer {
  constructor() {
    this.server = new Server(
      {
        name: 'ord-mcp-server',
        version: '2.0.0',
      },
      {
        capabilities: {
          resources: {},
          tools: {},
        },
      }
    );

    // ORD concept definitions
    this.ordConcepts = {
      'Product': {
        description: 'A product represents a commercial offering or logical grouping of capabilities',
        example: {
          ordId: 'sap.example:product:MyProduct:v1',
          title: 'My Product',
          shortDescription: 'A sample product',
          vendor: 'sap:vendor:SAP:'
        }
      },
      'Package': {
        description: 'A container for grouping related ORD resources',
        example: {
          ordId: 'sap.example:package:MyPackage:v1',
          title: 'My Package',
          shortDescription: 'A sample package',
          version: '1.0.0'
        }
      },
      'ConsumptionBundle': {
        description: 'Groups resources that are typically consumed together',
        example: {
          ordId: 'sap.example:consumptionBundle:MyBundle:v1',
          title: 'My Bundle',
          shortDescription: 'A sample consumption bundle'
        }
      },
      'APIResource': {
        description: 'Represents a consumable API offered by a capability',
        example: {
          ordId: 'sap.example:apiResource:MyAPI:v1',
          title: 'My API',
          shortDescription: 'A sample API resource',
          apiProtocol: 'odata-v4'
        }
      },
      'EventResource': {
        description: 'Represents events that can be consumed from a capability',
        example: {
          ordId: 'sap.example:eventResource:MyEvent:v1',
          title: 'My Event',
          shortDescription: 'A sample event resource'
        }
      }
    };

    this.setupHandlers();
  }

  setupHandlers() {
    // Resource handlers
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: [
        {
          uri: 'ord://specification/latest',
          name: 'ORD Specification',
          mimeType: 'text/markdown',
          description: 'Latest ORD specification from GitHub'
        }
      ]
    }));

    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      if (request.params.uri === 'ord://specification/latest') {
        const spec = await this.fetchLatestSpecification();
        return {
          contents: [{
            uri: request.params.uri,
            mimeType: 'text/markdown',
            text: spec
          }]
        };
      }
      throw new McpError(ErrorCode.InvalidRequest, `Unknown resource: ${request.params.uri}`);
    });

    // Tool handlers
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'get_ord_specification',
          description: 'Get the latest ORD specification document',
          inputSchema: {
            type: 'object',
            properties: {},
            additionalProperties: false
          }
        },
        {
          name: 'explain_ord_concept',
          description: 'Explain ORD concepts with examples',
          inputSchema: {
            type: 'object',
            properties: {
              concept: {
                type: 'string',
                description: 'ORD concept to explain (Product, Package, ConsumptionBundle, APIResource, EventResource)',
                enum: ['Product', 'Package', 'ConsumptionBundle', 'APIResource', 'EventResource']
              }
            },
            required: ['concept'],
            additionalProperties: false
          }
        }
      ]
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'get_ord_specification':
            return await this.handleGetSpecification();
          case 'explain_ord_concept':
            return await this.handleExplainConcept(args);
          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `Error: ${error.message}`
          }],
          isError: true
        };
      }
    });
  }

  async fetchLatestSpecification() {
    try {
      const response = await axios.get(
        'https://raw.githubusercontent.com/SAP/open-resource-discovery/main/spec-v1/interfaces/Document.md',
        { timeout: 10000 }
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch specification: ${error.message}`);
    }
  }

  async handleGetSpecification() {
    const spec = await this.fetchLatestSpecification();
    return {
      content: [{
        type: 'text',
        text: `# ORD Specification (Latest)\n\n${spec}`
      }]
    };
  }

  async handleExplainConcept(args) {
    const { concept } = args;
    const conceptInfo = this.ordConcepts[concept];

    if (!conceptInfo) {
      throw new Error(`Unknown concept: ${concept}`);
    }

    const explanation = `# ORD Concept: ${concept}

## Description
${conceptInfo.description}

## Example Structure
\`\`\`json
${JSON.stringify(conceptInfo.example, null, 2)}
\`\`\`

## Key Properties
${this.getKeyProperties(concept)}

## Usage Notes
- The \`ordId\` must follow the ORD ID format: \`namespace:type:localId:version\`
- All ORD resources must be properly referenced in packages
- Consider consumption bundles for grouping related resources
`;

    return {
      content: [{
        type: 'text',
        text: explanation
      }]
    };
  }

  getKeyProperties(concept) {
    const propertyDescriptions = {
      'Product': '- `ordId`: Unique identifier following ORD ID format\n- `title`: Human-readable name\n- `shortDescription`: Brief description for listings\n- `vendor`: Reference to the vendor providing this product',
      'Package': '- `ordId`: Unique package identifier\n- `title`: Package name\n- `shortDescription`: Brief package description\n- `version`: Semantic version of the package',
      'ConsumptionBundle': '- `ordId`: Unique bundle identifier\n- `title`: Bundle name\n- `shortDescription`: Brief bundle description\n- `credentialExchangeStrategies`: Authentication methods',
      'APIResource': '- `ordId`: Unique API identifier\n- `title`: API name\n- `shortDescription`: Brief API description\n- `apiProtocol`: Protocol type (odata-v4, rest, graphql, etc.)\n- `entryPoints`: API endpoints',
      'EventResource': '- `ordId`: Unique event identifier\n- `title`: Event name\n- `shortDescription`: Brief event description\n- `eventResourceType`: Type of event resource'
    };

    return propertyDescriptions[concept] || 'No specific properties defined';
  }

  async run() {
    console.error('Starting ORD MCP Server...');
    
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    
    console.error('ORD MCP Server running on stdio');
  }
}

// Start the server
const server = new OrdMcpServer();
server.run().catch(console.error);

export { OrdMcpServer };

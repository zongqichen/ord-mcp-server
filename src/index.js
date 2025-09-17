#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListResourcesRequestSchema,
  ListResourceTemplatesRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { OrdDocumentationIndexer } from './indexer/ordDocIndexer.js';
import { SemanticSearch } from './search/semanticSearch.js';
import { CapAnalyzer } from './analyzers/capAnalyzer.js';
import { AnnotationGenerator } from './generators/annotationGenerator.js';
import { OrdValidator } from './analyzers/ordValidator.js';
import { DocFormatter } from './utils/docFormatter.js';

class OrdMcpServer {
  constructor() {
    this.server = new Server(
      {
        name: 'ord-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          resources: {},
          tools: {},
        },
      }
    );

    this.indexer = new OrdDocumentationIndexer();
    this.search = new SemanticSearch();
    this.capAnalyzer = new CapAnalyzer();
    this.annotationGenerator = new AnnotationGenerator();
    this.validator = new OrdValidator();
    this.formatter = new DocFormatter();

    this.setupResourceHandlers();
    this.setupToolHandlers();

    // Error handling
    this.server.onerror = (error) => console.error('[ORD MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  setupResourceHandlers() {
    // List available ORD documentation resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: [
        {
          uri: 'ord://documentation/specification',
          name: 'ORD Specification Documentation',
          mimeType: 'text/markdown',
          description: 'Complete ORD specification documentation with examples and best practices',
        },
        {
          uri: 'ord://documentation/concepts',
          name: 'ORD Core Concepts',
          mimeType: 'application/json',
          description: 'Structured overview of ORD concepts, entities, and relationships',
        },
        {
          uri: 'ord://schemas/latest',
          name: 'ORD JSON Schemas',
          mimeType: 'application/json',
          description: 'Latest ORD JSON schemas for validation and reference',
        },
      ],
    }));

    // Dynamic resource templates for specific ORD concepts
    this.server.setRequestHandler(ListResourceTemplatesRequestSchema, async () => ({
      resourceTemplates: [
        {
          uriTemplate: 'ord://concept/{conceptName}',
          name: 'ORD Concept Documentation',
          mimeType: 'text/markdown',
          description: 'Detailed documentation for specific ORD concepts (Product, Capability, API, etc.)',
        },
        {
          uriTemplate: 'ord://examples/{category}',
          name: 'ORD Examples by Category',
          mimeType: 'application/json',
          description: 'Code examples and best practices for specific ORD use cases',
        },
      ],
    }));

    // Handle resource requests
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const uri = request.params.uri;

      try {
        if (uri === 'ord://documentation/specification') {
          const content = await this.indexer.getSpecificationDocs();
          return {
            contents: [{
              uri,
              mimeType: 'text/markdown',
              text: content,
            }],
          };
        }

        if (uri === 'ord://documentation/concepts') {
          const concepts = await this.indexer.getOrdConcepts();
          return {
            contents: [{
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(concepts, null, 2),
            }],
          };
        }

        if (uri === 'ord://schemas/latest') {
          const schemas = await this.indexer.getOrdSchemas();
          return {
            contents: [{
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(schemas, null, 2),
            }],
          };
        }

        // Handle dynamic concept requests
        const conceptMatch = uri.match(/^ord:\/\/concept\/(.+)$/);
        if (conceptMatch) {
          const conceptName = decodeURIComponent(conceptMatch[1]);
          const conceptDoc = await this.search.getConceptDocumentation(conceptName);
          return {
            contents: [{
              uri,
              mimeType: 'text/markdown',
              text: conceptDoc,
            }],
          };
        }

        // Handle dynamic examples requests
        const exampleMatch = uri.match(/^ord:\/\/examples\/(.+)$/);
        if (exampleMatch) {
          const category = decodeURIComponent(exampleMatch[1]);
          const examples = await this.search.getExamplesByCategory(category);
          return {
            contents: [{
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(examples, null, 2),
            }],
          };
        }

        throw new McpError(ErrorCode.InvalidRequest, `Unknown resource URI: ${uri}`);
      } catch (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to retrieve resource: ${error.message}`
        );
      }
    });
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'get_status',
          description: 'Get server health, cache status, and data sources availability',
          inputSchema: { type: 'object', properties: {} }
        },
        {
          name: 'search_ord_docs',
          description: 'Search ORD documentation using semantic search',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Search query for ORD documentation',
              },
              maxResults: {
                type: 'number',
                description: 'Maximum number of results to return (default: 10)',
                minimum: 1,
                maximum: 50,
                default: 10,
              },
            },
            required: ['query'],
          },
        },
        {
          name: 'explain_ord_concept',
          description: 'Get detailed explanation of ORD concepts like Product, Capability, API, etc.',
          inputSchema: {
            type: 'object',
            properties: {
              concept: {
                type: 'string',
                description: 'ORD concept to explain (e.g., Product, Capability, APIResource, EventResource)',
              },
              includeExamples: {
                type: 'boolean',
                description: 'Include code examples in the explanation',
                default: true,
              },
            },
            required: ['concept'],
          },
        },
        {
          name: 'generate_ord_annotation',
          description: 'Generate ORD annotations for CAP services based on service definitions',
          inputSchema: {
            type: 'object',
            properties: {
              servicePath: {
                type: 'string',
                description: 'Path to CAP service file or service definition',
              },
              serviceDefinition: {
                type: 'string',
                description: 'CAP service definition content (if not providing path)',
              },
              annotationType: {
                type: 'string',
                enum: ['basic', 'comprehensive', 'minimal'],
                description: 'Type of annotations to generate',
                default: 'basic',
              },
            },
            oneOf: [
              { required: ['servicePath'] },
              { required: ['serviceDefinition'] }
            ],
          },
        },
        {
          name: 'validate_ord_metadata',
          description: 'Validate ORD metadata against schemas and best practices',
          inputSchema: {
            type: 'object',
            properties: {
              metadataPath: {
                type: 'string',
                description: 'Path to ORD metadata file',
              },
              metadata: {
                type: 'object',
                description: 'ORD metadata object to validate (if not providing path)',
              },
              strict: {
                type: 'boolean',
                description: 'Enable strict validation mode',
                default: false,
              },
            },
            oneOf: [
              { required: ['metadataPath'] },
              { required: ['metadata'] }
            ],
          },
        },
        {
          name: 'analyze_cap_project',
          description: 'Analyze CAP project structure and suggest ORD improvements',
          inputSchema: {
            type: 'object',
            properties: {
              projectPath: {
                type: 'string',
                description: 'Path to CAP project root directory',
              },
              includeFiles: {
                type: 'array',
                items: { type: 'string' },
                description: 'Specific files to analyze (optional)',
              },
              suggestionLevel: {
                type: 'string',
                enum: ['basic', 'detailed', 'comprehensive'],
                description: 'Level of analysis and suggestions',
                default: 'detailed',
              },
            },
            required: ['projectPath'],
          },
        },
        {
          name: 'get_ord_examples',
          description: 'Get relevant ORD annotation examples based on use case',
          inputSchema: {
            type: 'object',
            properties: {
              useCase: {
                type: 'string',
                description: 'Use case or scenario (e.g., "REST API", "Event", "OData service")',
              },
              serviceType: {
                type: 'string',
                enum: ['odata', 'rest', 'graphql', 'event', 'generic'],
                description: 'Type of service',
                default: 'generic',
              },
              complexity: {
                type: 'string',
                enum: ['simple', 'moderate', 'complex'],
                description: 'Complexity level of examples',
                default: 'moderate',
              },
            },
            required: ['useCase'],
          },
        },
      ],
    }));

    // Handle tool execution
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'get_status':
            return await this.handleGetStatus();
          case 'search_ord_docs':
            return await this.handleSearchOrdDocs(args);
          case 'explain_ord_concept':
            return await this.handleExplainOrdConcept(args);
          case 'generate_ord_annotation':
            return await this.handleGenerateOrdAnnotation(args);
          case 'validate_ord_metadata':
            return await this.handleValidateOrdMetadata(args);
          case 'analyze_cap_project':
            return await this.handleAnalyzeCapProject(args);
          case 'get_ord_examples':
            return await this.handleGetOrdExamples(args);
          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `Error executing ${name}: ${error.message}`,
          }],
          isError: true,
        };
      }
    });
  }

  async handleSearchOrdDocs(args) {
    const { query, maxResults = 10 } = args;
    const results = await this.search.searchDocumentation(query, maxResults);
    const formattedResults = this.formatter.formatSearchResults(results);

    return {
      content: [{
        type: 'text',
        text: formattedResults,
      }],
    };
  }

  async handleExplainOrdConcept(args) {
    const { concept, includeExamples = true } = args;
    const explanation = await this.search.explainConcept(concept, includeExamples);

    return {
      content: [{
        type: 'text',
        text: explanation,
      }],
    };
  }

  async handleGenerateOrdAnnotation(args) {
    const { servicePath, serviceDefinition, annotationType = 'basic' } = args;

    let serviceContent;
    if (servicePath) {
      serviceContent = await this.capAnalyzer.readServiceFile(servicePath);
    } else {
      serviceContent = serviceDefinition;
    }

    const annotations = await this.annotationGenerator.generateAnnotations(
      serviceContent,
      annotationType
    );

    return {
      content: [{
        type: 'text',
        text: this.formatter.formatAnnotations(annotations),
      }],
    };
  }

  async handleValidateOrdMetadata(args) {
    const { metadataPath, metadata, strict = false } = args;

    let metadataContent;
    if (metadataPath) {
      metadataContent = await this.validator.readMetadataFile(metadataPath);
    } else {
      metadataContent = metadata;
    }

    const validationResult = await this.validator.validateMetadata(metadataContent, strict);

    return {
      content: [{
        type: 'text',
        text: this.formatter.formatValidationResult(validationResult),
      }],
    };
  }

  async handleAnalyzeCapProject(args) {
    const { projectPath, includeFiles, suggestionLevel = 'detailed' } = args;
    const analysis = await this.capAnalyzer.analyzeProject(
      projectPath,
      includeFiles,
      suggestionLevel
    );

    return {
      content: [{
        type: 'text',
        text: this.formatter.formatProjectAnalysis(analysis),
      }],
    };
  }

  async handleGetOrdExamples(args) {
    const { useCase, serviceType = 'generic', complexity = 'moderate' } = args;
    const examples = await this.search.getExamples(useCase, serviceType, complexity);

    return {
      content: [{
        type: 'text',
        text: this.formatter.formatExamples(examples),
      }],
    };
  }

  async handleGetStatus() {
    const status = {
      indexed: Boolean(this.indexer?.cache && this.indexer.cache.size > 0),
      lastUpdated: this.indexer?.lastUpdated || null,
      hasSpecification: this.indexer?.cache?.has('specification') || false,
      hasSchemas: this.indexer?.cache?.has('schemas') || false,
      hasExamples: this.indexer?.cache?.has('examples') || false,
      hasCapDocs: this.indexer?.cache?.has('capDocs') || false
    };

    return {
      content: [{ type: 'text', text: JSON.stringify(status, null, 2) }]
    };
  }

  async run() {
    // Initialize the indexer and search capabilities
    console.error('Initializing ORD MCP server...');

    try {
      await this.indexer.initialize();
      await this.search.initialize();
      console.error('ORD documentation indexed successfully');
    } catch (error) {
      console.error('Warning: Failed to initialize search capabilities:', error.message);
      console.error('Server will run with limited functionality');
    }

    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('ORD MCP server running on stdio');
  }
}

const server = new OrdMcpServer();
server.run().catch(console.error);

export { OrdMcpServer };

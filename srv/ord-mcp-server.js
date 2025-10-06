#!/usr/bin/env node

const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const {
    CallToolRequestSchema,
    ErrorCode,
    ListResourcesRequestSchema,
    ListToolsRequestSchema,
    McpError,
    ReadResourceRequestSchema,
} = require("@modelcontextprotocol/sdk/types.js");

const { RESOURCES, TOOLS } = require("./mcp-definitions.js");
const { handleGetSpecification, handleExplainConcept } = require("./mcp-handlers.js");
const { fetchSpecification } = require("./specification-fetcher.js");

class OrdMcpServer {
    constructor() {
        this.server = new Server(
            {
                name: "ord-mcp-server",
                version: "0.0.1",
            },
            {
                capabilities: {
                    resources: {},
                    tools: {},
                },
            },
        );

        this._setupHandlers();
    }

    _setupHandlers() {
        // Simple handler delegation - no business logic here
        this.server.setRequestHandler(ListResourcesRequestSchema, () => ({
            resources: RESOURCES,
        }));

        this.server.setRequestHandler(ReadResourceRequestSchema, (request) => this._handleReadResource(request));

        this.server.setRequestHandler(ListToolsRequestSchema, () => ({
            tools: TOOLS,
        }));

        this.server.setRequestHandler(CallToolRequestSchema, (request) => this._handleToolCall(request));
    }

    async _handleReadResource(request) {
        const { uri } = request.params;

        if (uri !== "ord://specification/latest") {
            throw new McpError(ErrorCode.InvalidRequest, `Unknown resource: ${uri}`);
        }

        const spec = await fetchSpecification();
        return {
            contents: [
                {
                    uri,
                    mimeType: "text/markdown",
                    text: spec,
                },
            ],
        };
    }

    async _handleToolCall(request) {
        const { name, arguments: args } = request.params;

        try {
            switch (name) {
                case "get_ord_specification":
                    return await handleGetSpecification();
                case "explain_ord_concept":
                    return await handleExplainConcept(args);
                default:
                    throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
            }
        } catch (error) {
            // Domain errors already have context; wrap infrastructure errors
            const message = error instanceof McpError ? error.message : `Tool execution failed: ${error.message}`;

            return {
                content: [
                    {
                        type: "text",
                        text: `Error: ${message}`,
                    },
                ],
                isError: true,
            };
        }
    }

    async run() {
        console.error("Starting ORD MCP Server...");

        const transport = new StdioServerTransport();
        await this.server.connect(transport);

        console.error("ORD MCP Server running on stdio");
    }
}

// Main execution - fail fast on startup errors
async function main() {
    try {
        const server = new OrdMcpServer();
        await server.run();
    } catch (error) {
        console.error("Failed to start server:", error.message);
        process.exit(1);
    }
}

// Only execute if this is the main module
if (require.main === module) {
    main();
}

module.exports = { OrdMcpServer };

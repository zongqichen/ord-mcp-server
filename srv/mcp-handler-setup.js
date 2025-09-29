// Common MCP handler setup and definitions
import {
    CallToolRequestSchema,
    ErrorCode,
    ListResourcesRequestSchema,
    ListToolsRequestSchema,
    McpError,
    ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { ORD_CONCEPTS } from "./ord-concepts.js";
import { handleGetSpecification, handleExplainConcept } from "./mcp-handlers.js";
import { fetchSpecification } from "./specification-fetcher.js";

// MCP Resource and Tool definitions
export const RESOURCES = Object.freeze([
    {
        uri: "ord://specification/latest",
        name: "ORD Specification",
        mimeType: "text/markdown",
        description: "Latest ORD specification from GitHub",
    },
]);

export const TOOLS = Object.freeze([
    {
        name: "get_ord_specification",
        description: "Get and use the latest ORD specification document",
        inputSchema: {
            type: "object",
            properties: {},
            additionalProperties: false,
        },
    },
    {
        name: "explain_ord_concept",
        description: "Explain ORD concepts with examples",
        inputSchema: {
            type: "object",
            properties: {
                concept: {
                    type: "string",
                    description: "ORD concept to explain",
                    enum: Object.keys(ORD_CONCEPTS),
                },
            },
            required: ["concept"],
            additionalProperties: false,
        },
    },
]);

/**
 * Setup common MCP request handlers for any MCP server instance.
 * Follows DRY principle by centralizing handler logic.
 * 
 * @param {Server} server - MCP Server instance
 */
export function setupMCPHandlers(server) {
    // List available resources
    server.setRequestHandler(ListResourcesRequestSchema, () => ({
        resources: RESOURCES,
    }));

    // Read resource content
    server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
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
    });

    // List available tools
    server.setRequestHandler(ListToolsRequestSchema, () => ({
        tools: TOOLS,
    }));

    // Handle tool calls with proper error handling
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
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
            const message = error instanceof McpError 
                ? error.message 
                : `Tool execution failed: ${error.message}`;

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
    });
}

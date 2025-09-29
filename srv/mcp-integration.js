import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";

import { RESOURCES, TOOLS, setupMCPHandlers } from "./mcp-handler-setup.js";

// MCP Server instance
let mcpServer = null;

/**
 * Initialize MCP server integrated with CAP Express app.
 * Sets up SSE transport and HTTP endpoints for BTP deployment.
 * 
 * @param {Express} app - CAP Express application instance
 * @returns {Server} MCP Server instance
 */
export function initMCPServer(app) {
    console.log("Initializing MCP server integration with CAP...");
    
    // Create MCP Server with capabilities
    mcpServer = new Server(
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

    // Setup common MCP handlers
    setupMCPHandlers(mcpServer);
    
    // Add HTTP endpoints for BTP
    addHTTPEndpoints(app);

    // Create and connect SSE transport
    connectSSETransport(app);

    return mcpServer;
}

/**
 * Add HTTP endpoints for health checks and MCP information.
 * @param {Express} app - Express application instance
 */
function addHTTPEndpoints(app) {
    // Health check endpoint for BTP
    app.get('/health', (req, res) => {
        res.json({
            status: 'healthy',
            service: 'ord-mcp-server',
            version: '0.0.1',
            transport: 'MCP over SSE',
            timestamp: new Date().toISOString()
        });
    });

    // MCP info endpoint
    app.get('/mcp/info', (req, res) => {
        res.json({
            name: 'ORD MCP Server',
            version: '0.0.1',
            description: 'MCP server providing ORD specification access',
            transport: 'SSE',
            endpoint: '/mcp/message',
            capabilities: {
                tools: TOOLS.map(t => t.name),
                resources: RESOURCES.map(r => r.uri)
            }
        });
    });
}

/**
 * Connect MCP server to SSE transport with error handling.
 * @param {Express} app - Express application instance
 */
function connectSSETransport(app) {
    const sseTransport = new SSEServerTransport('/mcp/message', app);
    
    mcpServer.connect(sseTransport)
        .then(() => {
            console.log("MCP Server connected to CAP Express app via SSE transport");
            console.log("MCP endpoint available at: /mcp/message");
            console.log("Health check available at: /health");
            console.log("MCP info available at: /mcp/info");
        })
        .catch(error => {
            console.error("Failed to connect MCP server:", error.message);
            throw error;
        });
}

/**
 * Get the current MCP server instance.
 * @returns {Server|null} MCP Server instance or null if not initialized
 */
export function getMCPServer() {
    return mcpServer;
}

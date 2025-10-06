const cds = require('@sap/cds');
const { RESOURCES, TOOLS } = require('./mcp-definitions.js');
const { handleGetSpecification, handleExplainConcept } = require('./mcp-handlers.js');
const { fetchSpecification } = require('./specification-fetcher.js');

module.exports = cds.service.impl(async function() {
  
  // Add MCP JSON-RPC endpoint to CAP server
  const app = cds.app;
  if (app) {
    // Enable JSON body parsing for MCP endpoint
    app.use('/mcp', require('express').json());
    
    // MCP protocol endpoint
    app.post('/mcp', async (req, res) => {
      try {
        const { jsonrpc, id, method, params } = req.body;
        
        // Validate JSON-RPC 2.0 format
        if (jsonrpc !== '2.0' || !method) {
          return res.status(400).json({
            jsonrpc: '2.0',
            id: id || null,
            error: {
              code: -32600,
              message: 'Invalid Request'
            }
          });
        }
        
        let result;
        
        switch (method) {
          case 'initialize':
            result = {
              protocolVersion: '2024-11-05',
              capabilities: {
                tools: {},
                resources: {}
              },
              serverInfo: {
                name: 'ORD MCP Server',
                version: '1.0.0'
              }
            };
            break;
            
          case 'tools/list':
            result = {
              tools: TOOLS
            };
            break;
            
          case 'tools/call':
            const { name, arguments: args } = params || {};
            
            switch (name) {
              case 'get_ord_specification':
                result = await handleGetSpecification();
                break;
                
              case 'explain_ord_concept':
                result = await handleExplainConcept(args);
                break;
                
              default:
                throw new Error(`Unknown tool: ${name}`);
            }
            break;
            
          case 'resources/list':
            result = {
              resources: RESOURCES
            };
            break;
            
          case 'resources/read':
            const { uri } = params || {};
            
            if (uri === 'ord://specification/latest') {
              const spec = await fetchSpecification();
              result = {
                contents: [
                  {
                    uri: uri,
                    mimeType: 'text/markdown',
                    text: spec
                  }
                ]
              };
            } else {
              throw new Error(`Unknown resource: ${uri}`);
            }
            break;
            
          case 'notifications/initialized':
            // Client notification - no response needed
            return res.status(200).end();
            
          default:
            throw new Error(`Unknown method: ${method}`);
        }
        
        // Send successful response
        res.json({
          jsonrpc: '2.0',
          id: id,
          result: result
        });
        
      } catch (error) {
        console.error('MCP Error:', error);
        
        res.status(200).json({
          jsonrpc: '2.0',
          id: req.body?.id || null,
          error: {
            code: -32603,
            message: 'Internal error',
            data: error.message
          }
        });
      }
    });
    
    // Health check endpoint for MCP
    app.get('/mcp/health', (req, res) => {
      res.json({
        status: 'healthy',
        protocol: 'MCP over HTTP',
        resources: RESOURCES.length,
        tools: TOOLS.length,
        server: 'CAP-integrated'
      });
    });
    
    console.log('✅ MCP protocol endpoint available at /mcp');
  }
  
  // Action: Get ORD Specification
  this.on('getOrdSpecification', async (req) => {
    try {
      const result = await handleGetSpecification();
      return {
        content: result.content || [{
          type: 'text',
          text: 'No specification content available'
        }]
      };
    } catch (error) {
      req.error(500, `Failed to get ORD specification: ${error.message}`);
    }
  });

  // Action: Explain ORD Concept
  this.on('explainOrdConcept', async (req) => {
    try {
      const { concept } = req.data;
      if (!concept) {
        req.error(400, 'Concept parameter is required');
        return;
      }
      
      const result = await handleExplainConcept({ concept });
      return {
        content: result.content || [{
          type: 'text',
          text: `No explanation available for concept: ${concept}`
        }]
      };
    } catch (error) {
      req.error(500, `Failed to explain concept: ${error.message}`);
    }
  });

  // Function: Get Resources
  this.on('getResources', async (req) => {
    try {
      return RESOURCES.map(resource => ({
        uri: resource.uri,
        name: resource.name,
        mimeType: resource.mimeType,
        description: resource.description
      }));
    } catch (error) {
      req.error(500, `Failed to get resources: ${error.message}`);
    }
  });

  // Function: Get Tools
  this.on('getTools', async (req) => {
    try {
      return TOOLS.map(tool => ({
        name: tool.name,
        description: tool.description,
        inputSchema: JSON.stringify(tool.inputSchema)
      }));
    } catch (error) {
      req.error(500, `Failed to get tools: ${error.message}`);
    }
  });

  // Function: Read Resource
  this.on('readResource', async (req) => {
    try {
      const { uri } = req.data;
      
      if (!uri) {
        req.error(400, 'URI parameter is required');
        return;
      }

      if (uri !== "ord://specification/latest") {
        req.error(404, `Unknown resource: ${uri}`);
        return;
      }

      const spec = await fetchSpecification();
      return {
        contents: [{
          uri: uri,
          mimeType: "text/markdown",
          text: spec
        }]
      };
    } catch (error) {
      req.error(500, `Failed to read resource: ${error.message}`);
    }
  });

});

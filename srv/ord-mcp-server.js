const cds = require('@sap/cds')

class ORDMCPServer extends cds.ApplicationService {
  async init() {
    console.log('Initializing ORD MCP Server...')

    // Register event handlers for CDS functions
    this.on('getSpecification', async (req) => {
      try {
        console.log('getSpecification called')
        // Basic hardcoded response for now
        return "# ORD Specification\n\nThis is a placeholder ORD specification response."
      } catch (error) {
        console.error('Error in getSpecification:', error)
        req.error(500, `Failed to get specification: ${error.message}`)
      }
    })

    this.on('explainConcept', async (req) => {
      try {
        console.log('explainConcept called with:', req.data)
        const { concept } = req.data
        
        if (!concept) {
          req.error(400, 'Concept parameter is required')
          return
        }
        
        // Basic hardcoded explanations
        const explanations = {
          'Product': 'A Product represents a software product that provides APIs and Events.',
          'Package': 'A Package groups related API Resources and Event Resources.',
          'ConsumptionBundle': 'A Consumption Bundle defines how APIs and Events can be consumed together.',
          'APIResource': 'An API Resource describes a REST API or similar interface.',
          'EventResource': 'An Event Resource describes asynchronous events that can be published.'
        }
        
        const explanation = explanations[concept] || `Unknown concept: ${concept}. Available concepts: ${Object.keys(explanations).join(', ')}`
        console.log('Returning explanation:', explanation)
        return explanation
      } catch (error) {
        console.error('Error in explainConcept:', error)
        const statusCode = error.message.includes('Unknown concept') ? 400 : 500
        req.error(statusCode, `Failed to explain concept: ${error.message}`)
      }
    })

    console.log('ORD MCP Server initialized successfully')
    return super.init()
  }
}

// Global event listener for when CDS server is ready
cds.on('served', () => {
  console.log('CDS server is served, adding custom HTTP endpoints...')
  
  // Access the Express app
  const app = cds.app
  
  if (app && typeof app.get === 'function') {
    // Health check endpoint
    app.get('/mcp/health', (req, res) => {
      console.log('Custom health check requested')
      res.json({
        status: 'healthy',
        service: 'ord-mcp-server',
        version: '0.0.1',
        timestamp: new Date().toISOString()
      })
    })

    // MCP info endpoint
    app.get('/mcp/info', (req, res) => {
      console.log('MCP info requested')
      res.json({
        name: 'ORD MCP Server',
        version: '0.0.1',
        description: 'CAP-based ORD specification service',
        capabilities: {
          functions: ['getSpecification', 'explainConcept']
        },
        endpoints: {
          odata: '/odata/v4/ordmcpserver',
          functions: {
            getSpecification: '/odata/v4/ordmcpserver/getSpecification()',
            explainConcept: '/odata/v4/ordmcpserver/explainConcept(concept=\'Product\')'
          }
        }
      })
    })
    
    console.log('Custom HTTP endpoints registered:')
    console.log('- GET /mcp/health (custom)')
    console.log('- GET /mcp/info')
  } else {
    console.warn('Could not access Express app for custom endpoints')
  }
})

module.exports = ORDMCPServer

export class SemanticSearch {
  constructor() {
    this.indexer = null;
    this.conceptTemplates = new Map();
    this.examplePatterns = new Map();
    this.initialized = false;
  }

  async initialize() {
    // Import indexer dynamically to avoid circular dependencies
    const { OrdDocumentationIndexer } = await import('../indexer/ordDocIndexer.js');
    this.indexer = new OrdDocumentationIndexer();
    
    if (!this.indexer.cache || this.indexer.cache.size === 0) {
      await this.indexer.initialize();
    }

    this.setupConceptTemplates();
    this.setupExamplePatterns();
    this.initialized = true;
  }

  setupConceptTemplates() {
    const concepts = {
      'Product': {
        explanation: `# ORD Product

A **Product** in ORD represents a commercial offering, software solution, or logical grouping of capabilities that provides business value. Products are the top-level organizational unit in the ORD hierarchy.

## Key Characteristics:
- **Commercial Focus**: Products represent market offerings or business solutions
- **Capability Container**: Products contain one or more capabilities
- **Hierarchical**: Products can have parent-child relationships
- **Vendor Association**: Each product is associated with a specific vendor

## Required Properties:
- \`ordId\`: Unique identifier following ORD ID format
- \`title\`: Human-readable name of the product
- \`shortDescription\`: Brief description (max 255 characters)
- \`vendor\`: Reference to the vendor providing the product

## Common Use Cases:
- Representing a complete software suite (e.g., "SAP S/4HANA")
- Grouping related business capabilities
- Organizing APIs and events by business domain`,

        examples: [
          {
            title: 'Basic Product Definition',
            code: `{
  "ordId": "sap.s4:product:core:v1",
  "title": "SAP S/4HANA Core",
  "shortDescription": "Core business processes and applications for SAP S/4HANA",
  "description": "SAP S/4HANA Core provides essential business processes including finance, procurement, sales, and inventory management.",
  "vendor": "sap:vendor:SAP:v1",
  "labels": {
    "domain": ["ERP", "Business Suite"]
  }
}`
          }
        ]
      },

      'Capability': {
        explanation: `# ORD Capability

A **Capability** represents a specific business functionality or technical feature provided by a product. Capabilities are the functional building blocks that contain the actual consumable resources (APIs, Events).

## Key Characteristics:
- **Business Function**: Represents what the system can do
- **Resource Container**: Contains APIs, Events, and other consumable resources
- **Type Classification**: Can be business capability or technical capability
- **Product Association**: Must belong to a product

## Required Properties:
- \`ordId\`: Unique identifier following ORD ID format
- \`title\`: Human-readable name of the capability
- \`shortDescription\`: Brief description (max 255 characters)
- \`type\`: Either "sap.mdo:capability-type:business-capability:v1" or custom type

## Common Use Cases:
- Representing business processes (e.g., "Order Management")
- Technical capabilities (e.g., "Authentication")
- Domain-specific functionality (e.g., "Financial Reporting")`,

        examples: [
          {
            title: 'Business Capability Example',
            code: `{
  "ordId": "sap.s4:capability:order-management:v1",
  "title": "Order Management",
  "shortDescription": "Comprehensive order processing and management capabilities",
  "description": "Handle order creation, modification, fulfillment, and tracking across the entire order lifecycle.",
  "type": "sap.mdo:capability-type:business-capability:v1",
  "labels": {
    "domain": ["Sales", "Order Processing"]
  }
}`
          }
        ]
      },

      'APIResource': {
        explanation: `# ORD API Resource

An **API Resource** represents a consumable API that provides programmatic access to business functionality. API Resources are the primary way external systems interact with capabilities.

## Key Characteristics:
- **Protocol Support**: REST, OData, GraphQL, SOAP, etc.
- **Entry Points**: Defines how to access the API
- **Documentation**: Links to API specifications and documentation
- **Consumption**: Can be grouped into consumption bundles

## Required Properties:
- \`ordId\`: Unique identifier following ORD ID format
- \`title\`: Human-readable name of the API
- \`shortDescription\`: Brief description (max 255 characters)
- \`entryPoints\`: Array of entry point definitions
- \`apiProtocol\`: Protocol used (e.g., "odata-v4", "rest")

## Common Use Cases:
- REST APIs for business operations
- OData services for data access
- GraphQL endpoints for flexible queries
- Integration APIs for system connectivity`,

        examples: [
          {
            title: 'OData API Resource',
            code: `{
  "ordId": "sap.s4:api:sales-order:v1",
  "title": "Sales Order API",
  "shortDescription": "OData API for sales order management operations",
  "description": "Provides CRUD operations for sales orders, including creation, modification, and status updates.",
  "entryPoints": [
    {
      "type": "rest",
      "url": "/sap/opu/odata4/sap/api_sales_order_srv/srvd/sap/api_sales_order/0001/"
    }
  ],
  "apiProtocol": "odata-v4",
  "resourceDefinitions": [
    {
      "type": "edmx",
      "mediaType": "application/xml",
      "url": "/sap/opu/odata4/sap/api_sales_order_srv/srvd/sap/api_sales_order/0001/$metadata"
    }
  ]
}`
          }
        ]
      },

      'EventResource': {
        explanation: `# ORD Event Resource

An **Event Resource** represents events that can be consumed from a capability, enabling event-driven architectures and real-time integrations.

## Key Characteristics:
- **Event-Driven**: Supports asynchronous communication patterns
- **Business Events**: Represent meaningful business state changes
- **Protocol Support**: Various messaging protocols and formats
- **Schema Definition**: Structured event payload definitions

## Required Properties:
- \`ordId\`: Unique identifier following ORD ID format
- \`title\`: Human-readable name of the event
- \`shortDescription\`: Brief description (max 255 characters)
- \`eventResourceType\`: Type of event resource

## Common Use Cases:
- Business event notifications (e.g., "Order Created")
- Integration events for system synchronization
- Real-time data streaming
- Workflow triggers`,

        examples: [
          {
            title: 'Business Event Resource',
            code: `{
  "ordId": "sap.s4:event:sales-order-created:v1",
  "title": "Sales Order Created Event",
  "shortDescription": "Event triggered when a new sales order is created",
  "description": "Notifies subscribers when a sales order is successfully created in the system.",
  "eventResourceType": "BusinessEvent",
  "resourceDefinitions": [
    {
      "type": "asyncapi",
      "mediaType": "application/json",
      "url": "/events/schemas/sales-order-created-v1.json"
    }
  ]
}`
          }
        ]
      },

      'ConsumptionBundle': {
        explanation: `# ORD Consumption Bundle

A **Consumption Bundle** groups related resources (APIs, Events) that are typically consumed together, along with the credentials and authentication strategies needed to access them.

## Key Characteristics:
- **Resource Grouping**: Logical grouping of related consumable resources
- **Authentication**: Defines credential exchange strategies
- **Access Control**: Manages authorization and access patterns
- **Usage Patterns**: Represents common consumption scenarios

## Required Properties:
- \`ordId\`: Unique identifier following ORD ID format
- \`title\`: Human-readable name of the bundle
- \`shortDescription\`: Brief description (max 255 characters)
- \`credentialExchangeStrategies\`: Array of supported authentication methods

## Common Use Cases:
- Grouping APIs for a specific business process
- Bundling related events and APIs
- Defining access patterns for integration scenarios
- Managing authentication across multiple resources`,

        examples: [
          {
            title: 'API Consumption Bundle',
            code: `{
  "ordId": "sap.s4:consumption-bundle:order-management:v1",
  "title": "Order Management Bundle",
  "shortDescription": "Complete set of APIs and events for order management processes",
  "description": "Includes all APIs and events needed for end-to-end order management workflows.",
  "credentialExchangeStrategies": [
    {
      "type": "oauth2",
      "callbackUrl": "https://example.com/oauth/callback"
    }
  ],
  "apiResources": [
    {
      "ordId": "sap.s4:api:sales-order:v1"
    }
  ],
  "eventResources": [
    {
      "ordId": "sap.s4:event:sales-order-created:v1"
    }
  ]
}`
          }
        ]
      },

      'Package': {
        explanation: `# ORD Package

A **Package** is a container for grouping and versioning related ORD resources. Packages provide a way to organize and manage the lifecycle of capabilities, APIs, and events together.

## Key Characteristics:
- **Resource Container**: Groups related ORD resources
- **Versioning**: Provides version management for grouped resources
- **Lifecycle Management**: Manages the evolution of resource groups
- **Documentation**: Links to package-level documentation

## Required Properties:
- \`ordId\`: Unique identifier following ORD ID format
- \`title\`: Human-readable name of the package
- \`shortDescription\`: Brief description (max 255 characters)
- \`version\`: Semantic version of the package

## Common Use Cases:
- Versioning related APIs together
- Grouping capabilities by release cycle
- Managing backwards compatibility
- Organizing resources by domain or feature set`,

        examples: [
          {
            title: 'API Package Definition',
            code: `{
  "ordId": "sap.s4:package:sales-apis:v1",
  "title": "Sales Management APIs",
  "shortDescription": "Complete package of sales-related APIs and capabilities",
  "description": "Comprehensive package containing all APIs, events, and capabilities for sales management processes.",
  "version": "1.2.0",
  "packageLinks": [
    {
      "type": "documentation",
      "url": "https://help.sap.com/sales-apis"
    }
  ]
}`
          }
        ]
      }
    };

    Object.entries(concepts).forEach(([name, data]) => {
      this.conceptTemplates.set(name.toLowerCase(), data);
    });
  }

  setupExamplePatterns() {
    const patterns = {
      'rest api': {
        keywords: ['rest', 'api', 'http', 'endpoint'],
        examples: [
          {
            title: 'REST API with CAP ORD Annotations',
            code: `// srv/sales-service.cds
using { Currency, managed, cuid } from '@sap/cds/common';

@ORD.Extensions.product: 'MyProduct'
@ORD.Extensions.capability: 'SalesManagement'
service SalesService @(path: '/sales') {
    
    @ORD.Extensions.apiResource: {
        ordId: 'com.company:api:sales-orders:v1',
        title: 'Sales Orders API',
        shortDescription: 'Manage sales orders and related operations',
        apiProtocol: 'rest'
    }
    entity Orders : cuid, managed {
        orderNumber: String(20) @mandatory;
        customer: String(100) @mandatory;
        totalAmount: Decimal(15,2);
        currency: Currency;
        status: String(20) @default('OPEN';
    }
    
    // REST endpoints are automatically exposed
    // GET  /sales/Orders
    // POST /sales/Orders
    // GET  /sales/Orders({id})
    // PUT  /sales/Orders({id})
    // DELETE /sales/Orders({id})
}`
          }
        ]
      },

      'odata service': {
        keywords: ['odata', 'service', 'v4', 'edmx'],
        examples: [
          {
            title: 'OData Service with ORD Metadata',
            code: `// srv/catalog-service.cds
using { Currency, managed, cuid } from '@sap/cds/common';

@ORD.Extensions.product: 'CatalogProduct'
@ORD.Extensions.capability: 'ProductCatalog'
service CatalogService @(path: '/catalog') {
    
    @ORD.Extensions.apiResource: {
        ordId: 'com.company:api:product-catalog:v1',
        title: 'Product Catalog OData API',
        shortDescription: 'OData v4 service for product catalog management',
        apiProtocol: 'odata-v4',
        resourceDefinitions: [{
            type: 'edmx',
            mediaType: 'application/xml',
            url: '$metadata'
        }]
    }
    entity Products : cuid, managed {
        name: String(100) @mandatory;
        description: String(500);
        category: Association to Categories;
        price: Decimal(15,2);
        currency: Currency;
        availability: Integer @default(0);
    }
    
    entity Categories : cuid {
        name: String(50) @mandatory;
        description: String(200);
    }
    
    // Automatically exposes OData operations:
    // $metadata for service document
    // Full CRUD operations with OData query capabilities
    // $filter, $expand, $select, $orderby, $top, $skip
}`
          }
        ]
      },

      'event': {
        keywords: ['event', 'messaging', 'async', 'notification'],
        examples: [
          {
            title: 'Event Resource with ORD Annotations',
            code: `// srv/order-service.cds
using { Currency, managed, cuid } from '@sap/cds/common';

@ORD.Extensions.product: 'OrderManagement'
@ORD.Extensions.capability: 'OrderProcessing'
service OrderService {
    
    entity Orders : cuid, managed {
        orderNumber: String(20) @mandatory;
        customer: String(100) @mandatory;
        status: String(20) @default('CREATED');
        totalAmount: Decimal(15,2);
        currency: Currency;
    }
    
    @ORD.Extensions.eventResource: {
        ordId: 'com.company:event:order-created:v1',
        title: 'Order Created Event',
        shortDescription: 'Event emitted when a new order is created',
        eventResourceType: 'BusinessEvent'
    }
    event OrderCreated {
        orderId: UUID;
        orderNumber: String(20);
        customer: String(100);
        totalAmount: Decimal(15,2);
        currency: Currency;
        createdAt: Timestamp;
    }
    
    @ORD.Extensions.eventResource: {
        ordId: 'com.company:event:order-status-changed:v1',
        title: 'Order Status Changed Event',
        shortDescription: 'Event emitted when order status changes',
        eventResourceType: 'BusinessEvent'
    }
    event OrderStatusChanged {
        orderId: UUID;
        orderNumber: String(20);
        oldStatus: String(20);
        newStatus: String(20);
        changedAt: Timestamp;
    }
}`
          }
        ]
      },

      'consumption bundle': {
        keywords: ['bundle', 'consumption', 'authentication', 'oauth'],
        examples: [
          {
            title: 'Consumption Bundle with OAuth Authentication',
            code: `// package.json ORD metadata
{
  "open-resource-discovery": {
    "products": [{
      "ordId": "com.company:product:integration-suite:v1",
      "title": "Integration Suite"
    }],
    "consumptionBundles": [{
      "ordId": "com.company:consumption-bundle:order-apis:v1",
      "title": "Order Management API Bundle",
      "shortDescription": "Complete API bundle for order management with OAuth2",
      "credentialExchangeStrategies": [{
        "type": "oauth2",
        "callbackUrl": "https://api.company.com/oauth/callback"
      }],
      "apiResources": [
        { "ordId": "com.company:api:orders:v1" },
        { "ordId": "com.company:api:customers:v1" }
      ]
    }]
  }
}`
          }
        ]
      }
    };

    Object.entries(patterns).forEach(([name, data]) => {
      this.examplePatterns.set(name.toLowerCase(), data);
    });
  }

  async searchDocumentation(query, maxResults = 10) {
    if (!this.initialized) {
      await this.initialize();
    }

    // Use the indexer's search capabilities
    const results = this.indexer.searchContent(query, maxResults);
    
    // Enhance results with semantic understanding
    return results.map(result => ({
      ...result,
      semanticContext: this.extractSemanticContext(result, query),
      suggestions: this.generateSuggestions(result, query)
    }));
  }

  async explainConcept(concept, includeExamples = true) {
    if (!this.initialized) {
      await this.initialize();
    }

    const conceptLower = concept.toLowerCase();
    const template = this.conceptTemplates.get(conceptLower) || 
                    this.conceptTemplates.get(conceptLower.replace(/resource$/, ''));

    if (template) {
      let explanation = template.explanation;
      
      if (includeExamples && template.examples) {
        explanation += '\n\n## Examples\n\n';
        template.examples.forEach(example => {
          explanation += `### ${example.title}\n\n\`\`\`json\n${example.code}\n\`\`\`\n\n`;
        });
      }

      // Add related documentation from indexer
      const relatedDocs = this.indexer.searchContent(concept, 3);
      if (relatedDocs.length > 0) {
        explanation += '\n\n## Related Documentation\n\n';
        relatedDocs.forEach(doc => {
          explanation += `**${doc.title}** (${doc.type})\n${doc.content}\n\n`;
        });
      }

      return explanation;
    }

    // Fallback: search for concept in documentation
    const searchResults = await this.searchDocumentation(concept, 5);
    if (searchResults.length > 0) {
      let explanation = `# ${concept}\n\n`;
      explanation += 'Based on available documentation:\n\n';
      
      searchResults.forEach(result => {
        explanation += `## ${result.title}\n${result.content}\n\n`;
      });
      
      return explanation;
    }

    return `No detailed explanation found for concept "${concept}". Try searching for related terms or check the ORD specification.`;
  }

  async getExamples(useCase, serviceType = 'generic', complexity = 'moderate') {
    if (!this.initialized) {
      await this.initialize();
    }

    const examples = [];
    const useCaseLower = useCase.toLowerCase();
    
    // Find matching patterns
    for (const [patternName, patternData] of this.examplePatterns) {
      const keywordMatch = patternData.keywords.some(keyword => 
        useCaseLower.includes(keyword) || keyword.includes(useCaseLower)
      );
      
      if (keywordMatch || patternName.includes(useCaseLower) || useCaseLower.includes(patternName)) {
        examples.push(...patternData.examples);
      }
    }

    // If no specific patterns match, search documentation
    if (examples.length === 0) {
      const searchResults = await this.searchDocumentation(useCase, 5);
      searchResults.forEach(result => {
        if (result.type === 'example') {
          examples.push({
            title: result.title,
            code: result.content,
            source: 'documentation'
          });
        }
      });
    }

    return {
      useCase,
      serviceType,
      complexity,
      examples,
      totalFound: examples.length,
      suggestions: this.generateUseCaseSuggestions(useCase, serviceType)
    };
  }

  async getConceptDocumentation(conceptName) {
    return await this.explainConcept(conceptName, true);
  }

  async getExamplesByCategory(category) {
    const examples = await this.getExamples(category);
    return examples;
  }

  extractSemanticContext(result, query) {
    const context = {
      relevantConcepts: [],
      relatedPatterns: [],
      suggestedActions: []
    };

    // Extract ORD concepts mentioned in the result
    const ordConcepts = ['product', 'capability', 'api', 'event', 'package', 'bundle'];
    ordConcepts.forEach(concept => {
      if (result.content.toLowerCase().includes(concept)) {
        context.relevantConcepts.push(concept);
      }
    });

    // Identify patterns
    if (result.content.toLowerCase().includes('annotation')) {
      context.relatedPatterns.push('CAP ORD Annotations');
      context.suggestedActions.push('Generate ORD annotations for your service');
    }

    if (result.content.toLowerCase().includes('schema')) {
      context.relatedPatterns.push('JSON Schema Validation');
      context.suggestedActions.push('Validate your ORD metadata against schemas');
    }

    return context;
  }

  generateSuggestions(result, query) {
    const suggestions = [];

    if (result.type === 'specification') {
      suggestions.push('Use "explain_ord_concept" tool for detailed explanations');
      suggestions.push('Use "get_ord_examples" tool for code examples');
    }

    if (result.type === 'example') {
      suggestions.push('Use "generate_ord_annotation" tool to create similar annotations');
      suggestions.push('Use "validate_ord_metadata" tool to verify your implementation');
    }

    if (result.content.toLowerCase().includes('service')) {
      suggestions.push('Analyze your CAP project with "analyze_cap_project" tool');
    }

    return suggestions;
  }

  generateUseCaseSuggestions(useCase, serviceType) {
    const suggestions = [];

    if (serviceType === 'odata') {
      suggestions.push('Consider using OData v4 protocol for better REST compliance');
      suggestions.push('Add $metadata endpoint for service discovery');
    }

    if (serviceType === 'rest') {
      suggestions.push('Follow RESTful design principles');
      suggestions.push('Consider adding OpenAPI specification');
    }

    if (serviceType === 'event') {
      suggestions.push('Define clear event schemas with AsyncAPI');
      suggestions.push('Consider event versioning strategy');
    }

    if (useCase.toLowerCase().includes('order')) {
      suggestions.push('Group related order APIs in a consumption bundle');
      suggestions.push('Consider order lifecycle events');
    }

    return suggestions;
  }
}

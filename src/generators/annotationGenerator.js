export class AnnotationGenerator {
  constructor() {
    this.ordIdGenerator = new OrdIdGenerator();
    this.annotationTemplates = new Map();
    this.setupAnnotationTemplates();
  }

  setupAnnotationTemplates() {
    this.annotationTemplates.set('basic', {
      product: '@ORD.Extensions.product: \'{productId}\'',
      capability: '@ORD.Extensions.capability: \'{capabilityId}\'',
      apiResource: `@ORD.Extensions.apiResource: {
    ordId: '{ordId}',
    title: '{title}',
    shortDescription: '{shortDescription}',
    apiProtocol: '{protocol}'
}`,
      eventResource: `@ORD.Extensions.eventResource: {
    ordId: '{ordId}',
    title: '{title}',
    shortDescription: '{shortDescription}',
    eventResourceType: 'BusinessEvent'
}`
    });

    this.annotationTemplates.set('comprehensive', {
      product: '@ORD.Extensions.product: \'{productId}\'',
      capability: '@ORD.Extensions.capability: \'{capabilityId}\'',
      apiResource: `@ORD.Extensions.apiResource: {
    ordId: '{ordId}',
    title: '{title}',
    shortDescription: '{shortDescription}',
    description: '{description}',
    apiProtocol: '{protocol}',
    resourceDefinitions: [{
        type: '{definitionType}',
        mediaType: '{mediaType}',
        url: '{definitionUrl}'
    }],
    entryPoints: [{
        type: 'rest',
        url: '{entryPointUrl}'
    }],
    labels: {
        domain: ['{domain}']
    }
}`,
      eventResource: `@ORD.Extensions.eventResource: {
    ordId: '{ordId}',
    title: '{title}',
    shortDescription: '{shortDescription}',
    description: '{description}',
    eventResourceType: 'BusinessEvent',
    resourceDefinitions: [{
        type: 'asyncapi',
        mediaType: 'application/json',
        url: '/events/schemas/{eventName}-schema.json'
    }],
    labels: {
        domain: ['{domain}']
    }
}`,
      consumptionBundle: `@ORD.Extensions.consumptionBundle: {
    ordId: '{ordId}',
    title: '{title}',
    shortDescription: '{shortDescription}',
    credentialExchangeStrategies: [{
        type: 'oauth2',
        callbackUrl: '{callbackUrl}'
    }]
}`
    });

    this.annotationTemplates.set('minimal', {
      product: '@ORD.Extensions.product: \'{productId}\'',
      capability: '@ORD.Extensions.capability: \'{capabilityId}\'',
      apiResource: `@ORD.Extensions.apiResource: {
    ordId: '{ordId}',
    title: '{title}',
    shortDescription: '{shortDescription}'
}`,
      eventResource: `@ORD.Extensions.eventResource: {
    ordId: '{ordId}',
    title: '{title}',
    shortDescription: '{shortDescription}'
}`
    });
  }

  async generateAnnotations(serviceContent, annotationType = 'basic') {
    const analysis = this.analyzeServiceContent(serviceContent);
    const templates = this.annotationTemplates.get(annotationType) || this.annotationTemplates.get('basic');
    
    const result = {
      annotationType,
      timestamp: new Date().toISOString(),
      services: [],
      packageJson: null,
      recommendations: []
    };

    // Generate annotations for each service
    for (const service of analysis.services) {
      const serviceAnnotations = await this.generateServiceAnnotations(service, templates, analysis.context);
      result.services.push(serviceAnnotations);
    }

    // Generate package.json ORD metadata if comprehensive
    if (annotationType === 'comprehensive') {
      result.packageJson = this.generatePackageJsonMetadata(analysis);
    }

    // Generate recommendations
    result.recommendations = this.generateRecommendations(analysis, annotationType);

    return result;
  }

  analyzeServiceContent(content) {
    const analysis = {
      services: [],
      entities: [],
      events: [],
      context: {
        namespace: this.extractNamespace(content),
        imports: this.extractImports(content),
        hasCommonTypes: content.includes('@sap/cds/common')
      }
    };

    // Extract services
    const serviceMatches = content.matchAll(/service\s+(\w+)(?:\s+@\([^)]*\))?\s*\{([^}]+)\}/gs);
    for (const match of serviceMatches) {
      const serviceName = match[1];
      const serviceBody = match[2];
      
      const service = {
        name: serviceName,
        path: this.extractServicePath(content, serviceName),
        entities: this.extractEntitiesFromService(serviceBody),
        events: this.extractEventsFromService(serviceBody),
        actions: this.extractActionsFromService(serviceBody),
        functions: this.extractFunctionsFromService(serviceBody),
        annotations: this.extractExistingAnnotations(content, serviceName)
      };

      analysis.services.push(service);
    }

    return analysis;
  }

  async generateServiceAnnotations(service, templates, context) {
    const annotations = {
      serviceName: service.name,
      annotations: [],
      cdsCode: '',
      explanations: []
    };

    // Generate product and capability annotations
    const productId = this.ordIdGenerator.generateProductId(context.namespace || 'company', service.name);
    const capabilityId = this.ordIdGenerator.generateCapabilityId(context.namespace || 'company', service.name);

    annotations.annotations.push({
      type: 'product',
      code: templates.product.replace('{productId}', productId)
    });

    annotations.annotations.push({
      type: 'capability', 
      code: templates.capability.replace('{capabilityId}', capabilityId)
    });

    // Generate API Resource annotations for entities
    if (service.entities.length > 0) {
      const apiAnnotation = await this.generateApiResourceAnnotation(service, templates.apiResource, context);
      annotations.annotations.push(apiAnnotation);
    }

    // Generate Event Resource annotations for events
    for (const event of service.events) {
      const eventAnnotation = await this.generateEventResourceAnnotation(event, service, templates.eventResource, context);
      annotations.annotations.push(eventAnnotation);
    }

    // Generate complete CDS code with annotations
    annotations.cdsCode = this.generateAnnotatedServiceCode(service, annotations.annotations);

    // Add explanations
    annotations.explanations = this.generateAnnotationExplanations(service, annotations.annotations);

    return annotations;
  }

  async generateApiResourceAnnotation(service, template, context) {
    const ordId = this.ordIdGenerator.generateApiResourceId(context.namespace || 'company', service.name);
    const protocol = this.determineApiProtocol(service);
    
    let code = template
      .replace('{ordId}', ordId)
      .replace('{title}', `${service.name} API`)
      .replace('{shortDescription}', `${protocol.toUpperCase()} API for ${service.name.toLowerCase()} operations`)
      .replace('{protocol}', protocol);

    // Add comprehensive details if template supports it
    if (template.includes('{description}')) {
      code = code
        .replace('{description}', `Comprehensive ${protocol.toUpperCase()} API providing full CRUD operations for ${service.name.toLowerCase()} entities including ${service.entities.map(e => e.name).join(', ')}.`)
        .replace('{definitionType}', protocol === 'odata-v4' ? 'edmx' : 'openapi-v3')
        .replace('{mediaType}', protocol === 'odata-v4' ? 'application/xml' : 'application/json')
        .replace('{definitionUrl}', protocol === 'odata-v4' ? '$metadata' : '/openapi.json')
        .replace('{entryPointUrl}', service.path || `/${service.name.toLowerCase()}`)
        .replace('{domain}', this.inferDomain(service.name));
    }

    return {
      type: 'apiResource',
      code,
      context: 'service'
    };
  }

  async generateEventResourceAnnotation(event, service, template, context) {
    const ordId = this.ordIdGenerator.generateEventResourceId(context.namespace || 'company', event.name);
    
    let code = template
      .replace('{ordId}', ordId)
      .replace('{title}', `${event.name} Event`)
      .replace('{shortDescription}', `Event emitted when ${event.name.toLowerCase()} occurs`);

    // Add comprehensive details if template supports it
    if (template.includes('{description}')) {
      code = code
        .replace('{description}', `Business event representing ${event.name.toLowerCase()} state changes with payload containing ${event.properties.map(p => p.name).join(', ')}.`)
        .replace('{eventName}', event.name.toLowerCase())
        .replace('{domain}', this.inferDomain(service.name));
    }

    return {
      type: 'eventResource',
      code,
      context: 'event',
      eventName: event.name
    };
  }

  generatePackageJsonMetadata(analysis) {
    const namespace = analysis.context.namespace || 'com.company';
    
    const metadata = {
      'open-resource-discovery': {
        openResourceDiscoveryVersion: '1.9.0',
        description: 'ORD metadata for CAP services',
        products: [
          {
            ordId: `${namespace}:product:main:v1`,
            title: 'Main Product',
            shortDescription: 'Primary product containing all capabilities and resources',
            vendor: `${namespace}:vendor:main:v1`
          }
        ],
        vendors: [
          {
            ordId: `${namespace}:vendor:main:v1`,
            title: 'Main Vendor',
            partners: [`${namespace}:partner:main:v1`]
          }
        ],
        capabilities: [],
        apiResources: [],
        eventResources: [],
        consumptionBundles: []
      }
    };

    // Add capabilities and resources for each service
    analysis.services.forEach(service => {
      const capabilityId = this.ordIdGenerator.generateCapabilityId(namespace, service.name);
      
      metadata['open-resource-discovery'].capabilities.push({
        ordId: capabilityId,
        title: `${service.name} Capability`,
        shortDescription: `Business capability for ${service.name.toLowerCase()} operations`,
        type: 'sap.mdo:capability-type:business-capability:v1'
      });

      if (service.entities.length > 0) {
        const apiId = this.ordIdGenerator.generateApiResourceId(namespace, service.name);
        metadata['open-resource-discovery'].apiResources.push({
          ordId: apiId,
          title: `${service.name} API`,
          shortDescription: `${this.determineApiProtocol(service).toUpperCase()} API for ${service.name.toLowerCase()}`,
          apiProtocol: this.determineApiProtocol(service),
          partOfConsumptionBundles: [`${namespace}:consumption-bundle:main:v1`]
        });
      }

      service.events.forEach(event => {
        const eventId = this.ordIdGenerator.generateEventResourceId(namespace, event.name);
        metadata['open-resource-discovery'].eventResources.push({
          ordId: eventId,
          title: `${event.name} Event`,
          shortDescription: `Event for ${event.name.toLowerCase()} notifications`,
          eventResourceType: 'BusinessEvent',
          partOfConsumptionBundles: [`${namespace}:consumption-bundle:main:v1`]
        });
      });
    });

    // Add consumption bundle
    if (metadata['open-resource-discovery'].apiResources.length > 0 || 
        metadata['open-resource-discovery'].eventResources.length > 0) {
      metadata['open-resource-discovery'].consumptionBundles.push({
        ordId: `${namespace}:consumption-bundle:main:v1`,
        title: 'Main API Bundle',
        shortDescription: 'Complete bundle of APIs and events',
        credentialExchangeStrategies: [
          {
            type: 'oauth2',
            callbackUrl: 'https://example.com/oauth/callback'
          }
        ]
      });
    }

    return metadata;
  }

  generateAnnotatedServiceCode(service, annotations) {
    let code = '';
    
    // Add service-level annotations
    const serviceAnnotations = annotations.filter(a => a.context === 'service' || a.type === 'product' || a.type === 'capability');
    serviceAnnotations.forEach(annotation => {
      code += `${annotation.code}\n`;
    });

    // Add service declaration
    const servicePath = service.path ? `@(path: '${service.path}')` : '';
    code += `service ${service.name} ${servicePath} {\n`;

    // Add entities
    service.entities.forEach(entity => {
      code += `    entity ${entity.name} {\n`;
      entity.properties.forEach(prop => {
        code += `        ${prop.name}: ${prop.type};\n`;
      });
      code += `    }\n\n`;
    });

    // Add events with annotations
    service.events.forEach(event => {
      const eventAnnotation = annotations.find(a => a.eventName === event.name);
      if (eventAnnotation) {
        code += `    ${eventAnnotation.code}\n`;
      }
      code += `    event ${event.name} {\n`;
      event.properties.forEach(prop => {
        code += `        ${prop.name}: ${prop.type};\n`;
      });
      code += `    }\n\n`;
    });

    code += '}';
    return code;
  }

  generateAnnotationExplanations(service, annotations) {
    const explanations = [];

    explanations.push({
      annotation: 'product',
      explanation: 'Associates the service with a business product. Products represent commercial offerings or logical groupings of capabilities.'
    });

    explanations.push({
      annotation: 'capability',
      explanation: 'Defines the business capability provided by this service. Capabilities represent specific business functionalities.'
    });

    if (service.entities.length > 0) {
      explanations.push({
        annotation: 'apiResource',
        explanation: `Defines the API resource for data access. This service exposes ${service.entities.length} entities through ${this.determineApiProtocol(service).toUpperCase()} protocol.`
      });
    }

    if (service.events.length > 0) {
      explanations.push({
        annotation: 'eventResource',
        explanation: `Defines event resources for asynchronous communication. This service publishes ${service.events.length} business events.`
      });
    }

    return explanations;
  }

  generateRecommendations(analysis, annotationType) {
    const recommendations = [];

    // Check for missing elements
    if (analysis.services.length === 0) {
      recommendations.push({
        type: 'warning',
        message: 'No services found in the provided content',
        suggestion: 'Ensure the service definition is complete and properly formatted'
      });
    }

    // Recommend consumption bundles for multiple services
    if (analysis.services.length > 1) {
      recommendations.push({
        type: 'improvement',
        message: 'Multiple services detected',
        suggestion: 'Consider grouping related services into consumption bundles for better organization'
      });
    }

    // Check annotation completeness
    analysis.services.forEach(service => {
      if (service.entities.length === 0 && service.events.length === 0) {
        recommendations.push({
          type: 'warning',
          message: `Service ${service.name} has no entities or events`,
          suggestion: 'Empty services should either be removed or populated with business logic'
        });
      }
    });

    return recommendations;
  }

  // Helper methods
  extractNamespace(content) {
    const namespaceMatch = content.match(/namespace\s+([^\s;]+)/);
    return namespaceMatch ? namespaceMatch[1] : null;
  }

  extractImports(content) {
    const imports = [];
    const importMatches = content.matchAll(/using\s+\{[^}]+\}\s+from\s+['"]([^'"]+)['"]/g);
    for (const match of importMatches) {
      imports.push(match[1]);
    }
    return imports;
  }

  extractServicePath(content, serviceName) {
    const serviceSection = this.extractServiceSection(content, serviceName);
    const pathMatch = serviceSection.match(/@path\s*:\s*['"]([^'"]+)['"]/);
    return pathMatch ? pathMatch[1] : null;
  }

  extractServiceSection(content, serviceName) {
    const serviceRegex = new RegExp(`service\\s+${serviceName}\\s*(@\\([^)]*\\))?\\s*\\{([^}]+)\\}`, 's');
    const match = content.match(serviceRegex);
    return match ? match[0] : '';
  }

  extractEntitiesFromService(serviceBody) {
    const entities = [];
    const entityMatches = serviceBody.matchAll(/entity\s+(\w+)(?:\s*:\s*([^{;]+))?\s*\{([^}]+)\}/gs);
    
    for (const match of entityMatches) {
      entities.push({
        name: match[1],
        extends: match[2]?.trim(),
        properties: this.extractEntityProperties(match[3])
      });
    }
    
    return entities;
  }

  extractEventsFromService(serviceBody) {
    const events = [];
    const eventMatches = serviceBody.matchAll(/event\s+(\w+)\s*\{([^}]+)\}/gs);
    
    for (const match of eventMatches) {
      events.push({
        name: match[1],
        properties: this.extractEntityProperties(match[2])
      });
    }
    
    return events;
  }

  extractActionsFromService(serviceBody) {
    const actions = [];
    const actionMatches = serviceBody.matchAll(/action\s+(\w+)\s*(?:\([^)]*\))?\s*(?:\:\s*([^;]+))?/g);
    
    for (const match of actionMatches) {
      actions.push({
        name: match[1],
        returnType: match[2]?.trim()
      });
    }
    
    return actions;
  }

  extractFunctionsFromService(serviceBody) {
    const functions = [];
    const functionMatches = serviceBody.matchAll(/function\s+(\w+)\s*(?:\([^)]*\))?\s*(?:\:\s*([^;]+))?/g);
    
    for (const match of functionMatches) {
      functions.push({
        name: match[1],
        returnType: match[2]?.trim()
      });
    }
    
    return functions;
  }

  extractEntityProperties(propertiesContent) {
    const properties = [];
    const lines = propertiesContent.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('/*')) {
        const propMatch = trimmed.match(/(\w+)\s*:\s*([^;@]+)/);
        if (propMatch) {
          properties.push({
            name: propMatch[1],
            type: propMatch[2].trim().replace(/;$/, '')
          });
        }
      }
    }
    
    return properties;
  }

  extractExistingAnnotations(content, serviceName) {
    const annotations = [];
    // This would extract any existing ORD annotations
    // Implementation simplified for now
    return annotations;
  }

  determineApiProtocol(service) {
    // Simple heuristic to determine protocol
    if (service.entities.length > 0) {
      return 'odata-v4'; // Default for entity-based services
    }
    return 'rest'; // Default for other services
  }

  inferDomain(serviceName) {
    const name = serviceName.toLowerCase();
    
    // Simple domain inference based on service name
    if (name.includes('order') || name.includes('sales')) return 'Sales';
    if (name.includes('product') || name.includes('catalog')) return 'Product Management';
    if (name.includes('customer') || name.includes('account')) return 'Customer Management';
    if (name.includes('inventory') || name.includes('stock')) return 'Inventory';
    if (name.includes('finance') || name.includes('accounting')) return 'Finance';
    if (name.includes('hr') || name.includes('employee')) return 'Human Resources';
    
    return 'Business Process';
  }
}

// ORD ID Generator helper class
class OrdIdGenerator {
  generateProductId(namespace, serviceName) {
    return `${namespace}:product:${serviceName.toLowerCase()}:v1`;
  }

  generateCapabilityId(namespace, serviceName) {
    return `${namespace}:capability:${serviceName.toLowerCase()}:v1`;
  }

  generateApiResourceId(namespace, serviceName) {
    return `${namespace}:api:${serviceName.toLowerCase()}:v1`;
  }

  generateEventResourceId(namespace, eventName) {
    return `${namespace}:event:${eventName.toLowerCase()}:v1`;
  }

  generateConsumptionBundleId(namespace, bundleName) {
    return `${namespace}:consumption-bundle:${bundleName.toLowerCase()}:v1`;
  }
}

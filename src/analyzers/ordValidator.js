import fs from 'fs/promises';
import path from 'path';

export class OrdValidator {
  constructor() {
    this.validationRules = new Map();
    this.schemaCache = new Map();
    this.setupValidationRules();
  }

  setupValidationRules() {
    // Basic validation rules for ORD metadata
    this.validationRules.set('ordId', {
      required: true,
      pattern: /^[a-zA-Z0-9._-]+:[a-zA-Z0-9._-]+:[a-zA-Z0-9._-]+:v\d+$/,
      description: 'ORD ID must follow format: namespace:type:name:version'
    });

    this.validationRules.set('title', {
      required: true,
      maxLength: 255,
      minLength: 1,
      description: 'Title is required and must be between 1-255 characters'
    });

    this.validationRules.set('shortDescription', {
      required: true,
      maxLength: 255,
      minLength: 1,
      description: 'Short description is required and must be between 1-255 characters'
    });

    this.validationRules.set('vendor', {
      required: true,
      pattern: /^[a-zA-Z0-9._:-]+$/,
      description: 'Vendor must be a valid ORD ID reference'
    });

    this.validationRules.set('apiProtocol', {
      required: true,
      enum: ['odata-v2', 'odata-v4', 'rest', 'graphql', 'soap', 'rpc'],
      description: 'API protocol must be one of the supported values'
    });

    this.validationRules.set('eventResourceType', {
      required: true,
      enum: ['BusinessEvent', 'TechnicalEvent'],
      description: 'Event resource type must be BusinessEvent or TechnicalEvent'
    });
  }

  async readMetadataFile(metadataPath) {
    try {
      const content = await fs.readFile(metadataPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Failed to read metadata file ${metadataPath}: ${error.message}`);
    }
  }

  async validateMetadata(metadata, strict = false) {
    const result = {
      valid: true,
      errors: [],
      warnings: [],
      suggestions: [],
      timestamp: new Date().toISOString(),
      validationLevel: strict ? 'strict' : 'standard'
    };

    try {
      // Validate overall structure
      this.validateStructure(metadata, result);

      // Validate products
      if (metadata.products) {
        metadata.products.forEach((product, index) => {
          this.validateProduct(product, index, result, strict);
        });
      }

      // Validate capabilities
      if (metadata.capabilities) {
        metadata.capabilities.forEach((capability, index) => {
          this.validateCapability(capability, index, result, strict);
        });
      }

      // Validate API resources
      if (metadata.apiResources) {
        metadata.apiResources.forEach((api, index) => {
          this.validateApiResource(api, index, result, strict);
        });
      }

      // Validate event resources
      if (metadata.eventResources) {
        metadata.eventResources.forEach((event, index) => {
          this.validateEventResource(event, index, result, strict);
        });
      }

      // Validate consumption bundles
      if (metadata.consumptionBundles) {
        metadata.consumptionBundles.forEach((bundle, index) => {
          this.validateConsumptionBundle(bundle, index, result, strict);
        });
      }

      // Validate vendors
      if (metadata.vendors) {
        metadata.vendors.forEach((vendor, index) => {
          this.validateVendor(vendor, index, result, strict);
        });
      }

      // Cross-reference validation
      this.validateCrossReferences(metadata, result);

      // Set overall validity
      result.valid = result.errors.length === 0;

    } catch (error) {
      result.valid = false;
      result.errors.push({
        type: 'validation_error',
        message: `Validation failed: ${error.message}`,
        severity: 'error'
      });
    }

    return result;
  }

  validateStructure(metadata, result) {
    if (typeof metadata !== 'object' || metadata === null) {
      result.errors.push({
        type: 'structure',
        message: 'Metadata must be a valid JSON object',
        severity: 'error'
      });
      return;
    }

    // Check for required top-level properties
    const requiredProps = ['openResourceDiscoveryVersion'];
    requiredProps.forEach(prop => {
      if (!metadata[prop]) {
        result.errors.push({
          type: 'structure',
          property: prop,
          message: `Missing required property: ${prop}`,
          severity: 'error'
        });
      }
    });

    // Validate ORD version
    if (metadata.openResourceDiscoveryVersion) {
      const versionPattern = /^\d+\.\d+\.\d+$/;
      if (!versionPattern.test(metadata.openResourceDiscoveryVersion)) {
        result.errors.push({
          type: 'structure',
          property: 'openResourceDiscoveryVersion',
          message: 'Invalid version format. Expected semantic version (e.g., 1.9.0)',
          severity: 'error'
        });
      }
    }

    // Check for at least one resource type
    const resourceTypes = ['products', 'capabilities', 'apiResources', 'eventResources'];
    const hasResources = resourceTypes.some(type => metadata[type] && metadata[type].length > 0);
    
    if (!hasResources) {
      result.warnings.push({
        type: 'structure',
        message: 'No resources defined. Consider adding products, capabilities, APIs, or events',
        severity: 'warning'
      });
    }
  }

  validateProduct(product, index, result, strict) {
    const context = `products[${index}]`;
    
    // Required fields
    this.validateRequiredField(product, 'ordId', context, result);
    this.validateRequiredField(product, 'title', context, result);
    this.validateRequiredField(product, 'shortDescription', context, result);
    this.validateRequiredField(product, 'vendor', context, result);

    // Field validation
    this.validateField(product, 'ordId', context, result);
    this.validateField(product, 'title', context, result);
    this.validateField(product, 'shortDescription', context, result);

    // Optional but recommended fields
    if (!product.description && strict) {
      result.suggestions.push({
        type: 'enhancement',
        context,
        message: 'Consider adding a detailed description for better documentation',
        severity: 'info'
      });
    }

    // Validate labels if present
    if (product.labels) {
      this.validateLabels(product.labels, context, result);
    }
  }

  validateCapability(capability, index, result, strict) {
    const context = `capabilities[${index}]`;
    
    // Required fields
    this.validateRequiredField(capability, 'ordId', context, result);
    this.validateRequiredField(capability, 'title', context, result);
    this.validateRequiredField(capability, 'shortDescription', context, result);
    this.validateRequiredField(capability, 'type', context, result);

    // Field validation
    this.validateField(capability, 'ordId', context, result);
    this.validateField(capability, 'title', context, result);
    this.validateField(capability, 'shortDescription', context, result);

    // Validate capability type
    if (capability.type) {
      const validTypes = [
        'sap.mdo:capability-type:business-capability:v1',
        'sap.mdo:capability-type:technical-capability:v1'
      ];
      
      if (!validTypes.includes(capability.type) && !capability.customType) {
        result.warnings.push({
          type: 'field_validation',
          context,
          property: 'type',
          message: 'Non-standard capability type. Consider using standard types or define customType',
          severity: 'warning'
        });
      }
    }
  }

  validateApiResource(api, index, result, strict) {
    const context = `apiResources[${index}]`;
    
    // Required fields
    this.validateRequiredField(api, 'ordId', context, result);
    this.validateRequiredField(api, 'title', context, result);
    this.validateRequiredField(api, 'shortDescription', context, result);
    this.validateRequiredField(api, 'apiProtocol', context, result);

    // Field validation
    this.validateField(api, 'ordId', context, result);
    this.validateField(api, 'title', context, result);
    this.validateField(api, 'shortDescription', context, result);
    this.validateField(api, 'apiProtocol', context, result);

    // Validate entry points
    if (!api.entryPoints || api.entryPoints.length === 0) {
      result.errors.push({
        type: 'field_validation',
        context,
        property: 'entryPoints',
        message: 'API resource must have at least one entry point',
        severity: 'error'
      });
    } else {
      api.entryPoints.forEach((entryPoint, epIndex) => {
        this.validateEntryPoint(entryPoint, `${context}.entryPoints[${epIndex}]`, result);
      });
    }

    // Validate resource definitions
    if (api.resourceDefinitions) {
      api.resourceDefinitions.forEach((def, defIndex) => {
        this.validateResourceDefinition(def, `${context}.resourceDefinitions[${defIndex}]`, result);
      });
    } else if (strict) {
      result.suggestions.push({
        type: 'enhancement',
        context,
        message: 'Consider adding resource definitions (OpenAPI, EDMX, etc.) for better API documentation',
        severity: 'info'
      });
    }
  }

  validateEventResource(event, index, result, strict) {
    const context = `eventResources[${index}]`;
    
    // Required fields
    this.validateRequiredField(event, 'ordId', context, result);
    this.validateRequiredField(event, 'title', context, result);
    this.validateRequiredField(event, 'shortDescription', context, result);
    this.validateRequiredField(event, 'eventResourceType', context, result);

    // Field validation
    this.validateField(event, 'ordId', context, result);
    this.validateField(event, 'title', context, result);
    this.validateField(event, 'shortDescription', context, result);
    this.validateField(event, 'eventResourceType', context, result);

    // Validate resource definitions for events
    if (event.resourceDefinitions) {
      event.resourceDefinitions.forEach((def, defIndex) => {
        this.validateResourceDefinition(def, `${context}.resourceDefinitions[${defIndex}]`, result, 'event');
      });
    } else if (strict) {
      result.suggestions.push({
        type: 'enhancement',
        context,
        message: 'Consider adding AsyncAPI specification for better event documentation',
        severity: 'info'
      });
    }
  }

  validateConsumptionBundle(bundle, index, result, strict) {
    const context = `consumptionBundles[${index}]`;
    
    // Required fields
    this.validateRequiredField(bundle, 'ordId', context, result);
    this.validateRequiredField(bundle, 'title', context, result);
    this.validateRequiredField(bundle, 'shortDescription', context, result);
    this.validateRequiredField(bundle, 'credentialExchangeStrategies', context, result);

    // Field validation
    this.validateField(bundle, 'ordId', context, result);
    this.validateField(bundle, 'title', context, result);
    this.validateField(bundle, 'shortDescription', context, result);

    // Validate credential exchange strategies
    if (bundle.credentialExchangeStrategies) {
      if (!Array.isArray(bundle.credentialExchangeStrategies) || bundle.credentialExchangeStrategies.length === 0) {
        result.errors.push({
          type: 'field_validation',
          context,
          property: 'credentialExchangeStrategies',
          message: 'Must have at least one credential exchange strategy',
          severity: 'error'
        });
      } else {
        bundle.credentialExchangeStrategies.forEach((strategy, stratIndex) => {
          this.validateCredentialStrategy(strategy, `${context}.credentialExchangeStrategies[${stratIndex}]`, result);
        });
      }
    }

    // Check for resource references
    const hasResources = (bundle.apiResources && bundle.apiResources.length > 0) ||
                        (bundle.eventResources && bundle.eventResources.length > 0);
    
    if (!hasResources) {
      result.warnings.push({
        type: 'field_validation',
        context,
        message: 'Consumption bundle should reference at least one API or event resource',
        severity: 'warning'
      });
    }
  }

  validateVendor(vendor, index, result, strict) {
    const context = `vendors[${index}]`;
    
    // Required fields
    this.validateRequiredField(vendor, 'ordId', context, result);
    this.validateRequiredField(vendor, 'title', context, result);

    // Field validation
    this.validateField(vendor, 'ordId', context, result);
    this.validateField(vendor, 'title', context, result);
  }

  validateRequiredField(obj, field, context, result) {
    if (!obj[field]) {
      result.errors.push({
        type: 'field_validation',
        context,
        property: field,
        message: `Missing required field: ${field}`,
        severity: 'error'
      });
      return false;
    }
    return true;
  }

  validateField(obj, field, context, result) {
    const value = obj[field];
    const rule = this.validationRules.get(field);
    
    if (!rule || !value) return;

    // Pattern validation
    if (rule.pattern && !rule.pattern.test(value)) {
      result.errors.push({
        type: 'field_validation',
        context,
        property: field,
        message: `Invalid format for ${field}: ${rule.description}`,
        value: value,
        severity: 'error'
      });
    }

    // Length validation
    if (rule.maxLength && value.length > rule.maxLength) {
      result.errors.push({
        type: 'field_validation',
        context,
        property: field,
        message: `${field} exceeds maximum length of ${rule.maxLength} characters`,
        value: value,
        severity: 'error'
      });
    }

    if (rule.minLength && value.length < rule.minLength) {
      result.errors.push({
        type: 'field_validation',
        context,
        property: field,
        message: `${field} is below minimum length of ${rule.minLength} characters`,
        value: value,
        severity: 'error'
      });
    }

    // Enum validation
    if (rule.enum && !rule.enum.includes(value)) {
      result.errors.push({
        type: 'field_validation',
        context,
        property: field,
        message: `Invalid value for ${field}. Expected one of: ${rule.enum.join(', ')}`,
        value: value,
        severity: 'error'
      });
    }
  }

  validateEntryPoint(entryPoint, context, result) {
    if (!entryPoint.type) {
      result.errors.push({
        type: 'field_validation',
        context,
        property: 'type',
        message: 'Entry point must have a type',
        severity: 'error'
      });
    }

    if (!entryPoint.url) {
      result.errors.push({
        type: 'field_validation',
        context,
        property: 'url',
        message: 'Entry point must have a URL',
        severity: 'error'
      });
    }
  }

  validateResourceDefinition(definition, context, result, resourceType = 'api') {
    if (!definition.type) {
      result.errors.push({
        type: 'field_validation',
        context,
        property: 'type',
        message: 'Resource definition must have a type',
        severity: 'error'
      });
    }

    if (!definition.mediaType) {
      result.errors.push({
        type: 'field_validation',
        context,
        property: 'mediaType',
        message: 'Resource definition must have a media type',
        severity: 'error'
      });
    }

    if (!definition.url && !definition.content) {
      result.errors.push({
        type: 'field_validation',
        context,
        property: 'url',
        message: 'Resource definition must have either URL or inline content',
        severity: 'error'
      });
    }

    // Validate specific types for different resource types
    if (resourceType === 'api' && definition.type) {
      const validApiTypes = ['openapi-v3', 'edmx', 'csdl-json', 'wsdl-v1', 'rfcmetadata-v1'];
      if (!validApiTypes.includes(definition.type)) {
        result.warnings.push({
          type: 'field_validation',
          context,
          property: 'type',
          message: `Non-standard API resource definition type: ${definition.type}`,
          severity: 'warning'
        });
      }
    }

    if (resourceType === 'event' && definition.type) {
      const validEventTypes = ['asyncapi-v2', 'asyncapi-v3'];
      if (!validEventTypes.includes(definition.type)) {
        result.warnings.push({
          type: 'field_validation',
          context,
          property: 'type',
          message: `Non-standard event resource definition type: ${definition.type}`,
          severity: 'warning'
        });
      }
    }
  }

  validateCredentialStrategy(strategy, context, result) {
    if (!strategy.type) {
      result.errors.push({
        type: 'field_validation',
        context,
        property: 'type',
        message: 'Credential exchange strategy must have a type',
        severity: 'error'
      });
    }

    const validTypes = ['oauth2', 'basic', 'custom'];
    if (strategy.type && !validTypes.includes(strategy.type)) {
      result.warnings.push({
        type: 'field_validation',
        context,
        property: 'type',
        message: `Non-standard credential exchange strategy: ${strategy.type}`,
        severity: 'warning'
      });
    }

    if (strategy.type === 'oauth2' && !strategy.callbackUrl) {
      result.errors.push({
        type: 'field_validation',
        context,
        property: 'callbackUrl',
        message: 'OAuth2 strategy requires a callback URL',
        severity: 'error'
      });
    }
  }

  validateLabels(labels, context, result) {
    if (typeof labels !== 'object' || labels === null) {
      result.errors.push({
        type: 'field_validation',
        context,
        property: 'labels',
        message: 'Labels must be an object',
        severity: 'error'
      });
      return;
    }

    Object.entries(labels).forEach(([key, value]) => {
      if (!Array.isArray(value)) {
        result.errors.push({
          type: 'field_validation',
          context,
          property: `labels.${key}`,
          message: 'Label values must be arrays',
          severity: 'error'
        });
      }
    });
  }

  validateCrossReferences(metadata, result) {
    // Collect all ORD IDs
    const allOrdIds = new Set();
    const vendorIds = new Set();
    const productIds = new Set();
    const capabilityIds = new Set();
    const apiIds = new Set();
    const eventIds = new Set();
    const bundleIds = new Set();

    // Collect vendor IDs
    if (metadata.vendors) {
      metadata.vendors.forEach(vendor => {
        if (vendor.ordId) {
          vendorIds.add(vendor.ordId);
          allOrdIds.add(vendor.ordId);
        }
      });
    }

    // Collect product IDs and validate vendor references
    if (metadata.products) {
      metadata.products.forEach(product => {
        if (product.ordId) {
          productIds.add(product.ordId);
          allOrdIds.add(product.ordId);
        }
        
        if (product.vendor && !vendorIds.has(product.vendor)) {
          result.warnings.push({
            type: 'cross_reference',
            message: `Product ${product.ordId || 'unknown'} references unknown vendor: ${product.vendor}`,
            severity: 'warning'
          });
        }
      });
    }

    // Collect capability IDs
    if (metadata.capabilities) {
      metadata.capabilities.forEach(capability => {
        if (capability.ordId) {
          capabilityIds.add(capability.ordId);
          allOrdIds.add(capability.ordId);
        }
      });
    }

    // Collect API resource IDs
    if (metadata.apiResources) {
      metadata.apiResources.forEach(api => {
        if (api.ordId) {
          apiIds.add(api.ordId);
          allOrdIds.add(api.ordId);
        }
      });
    }

    // Collect event resource IDs
    if (metadata.eventResources) {
      metadata.eventResources.forEach(event => {
        if (event.ordId) {
          eventIds.add(event.ordId);
          allOrdIds.add(event.ordId);
        }
      });
    }

    // Validate consumption bundles and their references
    if (metadata.consumptionBundles) {
      metadata.consumptionBundles.forEach(bundle => {
        if (bundle.ordId) {
          bundleIds.add(bundle.ordId);
          allOrdIds.add(bundle.ordId);
        }

        // Validate API resource references
        if (bundle.apiResources) {
          bundle.apiResources.forEach(apiRef => {
            const refId = typeof apiRef === 'string' ? apiRef : apiRef.ordId;
            if (refId && !apiIds.has(refId)) {
              result.errors.push({
                type: 'cross_reference',
                message: `Consumption bundle ${bundle.ordId || 'unknown'} references unknown API resource: ${refId}`,
                severity: 'error'
              });
            }
          });
        }

        // Validate event resource references
        if (bundle.eventResources) {
          bundle.eventResources.forEach(eventRef => {
            const refId = typeof eventRef === 'string' ? eventRef : eventRef.ordId;
            if (refId && !eventIds.has(refId)) {
              result.errors.push({
                type: 'cross_reference',
                message: `Consumption bundle ${bundle.ordId || 'unknown'} references unknown event resource: ${refId}`,
                severity: 'error'
              });
            }
          });
        }
      });
    }

    // Check for duplicate ORD IDs
    const seenIds = new Set();
    allOrdIds.forEach(id => {
      if (seenIds.has(id)) {
        result.errors.push({
          type: 'cross_reference',
          message: `Duplicate ORD ID found: ${id}`,
          severity: 'error'
        });
      } else {
        seenIds.add(id);
      }
    });
  }

  async validateCapProject(projectPath, suggestionLevel = 'detailed') {
    const result = {
      valid: true,
      errors: [],
      warnings: [],
      suggestions: [],
      timestamp: new Date().toISOString(),
      projectPath,
      validationLevel: suggestionLevel
    };

    try {
      // Check for package.json
      const packageJsonPath = path.join(projectPath, 'package.json');
      let packageJson = null;
      
      try {
        const content = await fs.readFile(packageJsonPath, 'utf-8');
        packageJson = JSON.parse(content);
      } catch (error) {
        result.errors.push({
          type: 'project_structure',
          message: 'No valid package.json found',
          severity: 'error'
        });
        return result;
      }

      // Validate CAP project structure
      if (!this.isCapProject(packageJson)) {
        result.warnings.push({
          type: 'project_structure',
          message: 'This does not appear to be a CAP project',
          severity: 'warning'
        });
      }

      // Validate ORD metadata if present
      if (packageJson['open-resource-discovery']) {
        const ordValidation = await this.validateMetadata(packageJson['open-resource-discovery'], suggestionLevel === 'comprehensive');
        
        // Merge results
        result.errors.push(...ordValidation.errors);
        result.warnings.push(...ordValidation.warnings);
        result.suggestions.push(...ordValidation.suggestions);
      } else {
        result.suggestions.push({
          type: 'enhancement',
          message: 'No ORD metadata found in package.json',
          suggestion: 'Add open-resource-discovery section to make services discoverable',
          severity: 'info'
        });
      }

      result.valid = result.errors.length === 0;

    } catch (error) {
      result.valid = false;
      result.errors.push({
        type: 'validation_error',
        message: `CAP project validation failed: ${error.message}`,
        severity: 'error'
      });
    }

    return result;
  }

  isCapProject(packageJson) {
    const dependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies
    };
    
    return !!(dependencies['@sap/cds'] || 
             dependencies['@sap/cds-dk'] || 
             dependencies['@cap-js/ord']);
  }

  generateValidationReport(validationResult) {
    let report = `# ORD Metadata Validation Report

**Timestamp:** ${validationResult.timestamp}
**Status:** ${validationResult.valid ? '✅ Valid' : '❌ Invalid'}
**Validation Level:** ${validationResult.validationLevel}

## Summary
- **Errors:** ${validationResult.errors.length}
- **Warnings:** ${validationResult.warnings.length}
- **Suggestions:** ${validationResult.suggestions.length}

`;

    if (validationResult.errors.length > 0) {
      report += `## ❌ Errors\n\n`;
      validationResult.errors.forEach((error, index) => {
        report += `${index + 1}. **${error.type}** ${error.context ? `(${error.context})` : ''}\n`;
        report += `   ${error.message}\n`;
        if (error.value) report += `   Value: \`${error.value}\`\n`;
        report += `\n`;
      });
    }

    if (validationResult.warnings.length > 0) {
      report += `## ⚠️ Warnings\n\n`;
      validationResult.warnings.forEach((warning, index) => {
        report += `${index + 1}. **${warning.type}** ${warning.context ? `(${warning.context})` : ''}\n`;
        report += `   ${warning.message}\n`;
        report += `\n`;
      });
    }

    if (validationResult.suggestions.length > 0) {
      report += `## 💡 Suggestions\n\n`;
      validationResult.suggestions.forEach((suggestion, index) => {
        report += `${index + 1}. **${suggestion.type}** ${suggestion.context ? `(${suggestion.context})` : ''}\n`;
        report += `   ${suggestion.message}\n`;
        if (suggestion.suggestion) report += `   💡 ${suggestion.suggestion}\n`;
        report += `\n`;
      });
    }

    return report;
  }
}

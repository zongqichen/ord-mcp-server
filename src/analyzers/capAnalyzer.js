import fs from 'fs/promises';
import path from 'path';

export class CapAnalyzer {
  constructor() {
    this.capFileExtensions = ['.cds', '.json', '.js', '.ts'];
    this.servicePatterns = [
      /service\s+(\w+)/g,
      /@path\s*:\s*['"]([^'"]+)['"]/g,
      /entity\s+(\w+)/g,
      /event\s+(\w+)/g
    ];
  }

  async readServiceFile(servicePath) {
    try {
      const content = await fs.readFile(servicePath, 'utf-8');
      return content;
    } catch (error) {
      throw new Error(`Failed to read service file ${servicePath}: ${error.message}`);
    }
  }

  async analyzeProject(projectPath, includeFiles = null, suggestionLevel = 'detailed') {
    try {
      const analysis = {
        projectPath,
        timestamp: new Date().toISOString(),
        summary: {
          totalFiles: 0,
          serviceFiles: 0,
          modelFiles: 0,
          configFiles: 0,
          ordAnnotatedServices: 0
        },
        services: [],
        models: [],
        ordMetadata: null,
        suggestions: [],
        warnings: [],
        errors: []
      };

      // Check if it's a valid CAP project
      const packageJsonPath = path.join(projectPath, 'package.json');
      let packageJson = null;
      
      try {
        const packageContent = await fs.readFile(packageJsonPath, 'utf-8');
        packageJson = JSON.parse(packageContent);
        
        if (!this.isCapProject(packageJson)) {
          analysis.warnings.push('This does not appear to be a CAP project (no @sap/cds dependency found)');
        }

        // Check for ORD metadata in package.json
        if (packageJson['open-resource-discovery']) {
          analysis.ordMetadata = packageJson['open-resource-discovery'];
        }
      } catch (error) {
        analysis.errors.push(`Could not read package.json: ${error.message}`);
      }

      // Analyze project structure
      await this.analyzeProjectStructure(projectPath, analysis, includeFiles);

      // Generate suggestions based on analysis
      this.generateSuggestions(analysis, suggestionLevel);

      return analysis;
    } catch (error) {
      throw new Error(`Failed to analyze CAP project: ${error.message}`);
    }
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

  async analyzeProjectStructure(projectPath, analysis, includeFiles) {
    const filesToAnalyze = includeFiles || await this.findCapFiles(projectPath);
    
    for (const filePath of filesToAnalyze) {
      try {
        const fullPath = path.isAbsolute(filePath) ? filePath : path.join(projectPath, filePath);
        const content = await fs.readFile(fullPath, 'utf-8');
        const relativePath = path.relative(projectPath, fullPath);
        
        analysis.summary.totalFiles++;

        if (filePath.endsWith('.cds')) {
          await this.analyzeCdsFile(relativePath, content, analysis);
        } else if (filePath.endsWith('.json')) {
          await this.analyzeJsonFile(relativePath, content, analysis);
        }
      } catch (error) {
        analysis.warnings.push(`Could not analyze file ${filePath}: ${error.message}`);
      }
    }
  }

  async findCapFiles(projectPath) {
    const files = [];
    
    const directories = ['srv', 'db', 'app', '.'];
    
    for (const dir of directories) {
      const dirPath = path.join(projectPath, dir);
      try {
        await this.findFilesRecursively(dirPath, files, this.capFileExtensions);
      } catch (error) {
        // Directory might not exist, continue
      }
    }
    
    return files;
  }

  async findFilesRecursively(dirPath, files, extensions) {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          await this.findFilesRecursively(fullPath, files, extensions);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name);
          if (extensions.includes(ext)) {
            files.push(fullPath);
          }
        }
      }
    } catch (error) {
      // Ignore directories we can't read
    }
  }

  async analyzeCdsFile(filePath, content, analysis) {
    const fileAnalysis = {
      path: filePath,
      type: 'cds',
      services: [],
      entities: [],
      events: [],
      ordAnnotations: [],
      issues: []
    };

    // Extract services
    const serviceMatches = content.matchAll(/service\s+(\w+)(?:\s+@\([^)]*\))?\s*\{([^}]+)\}/gs);
    for (const match of serviceMatches) {
      const serviceName = match[1];
      const serviceBody = match[2];
      
      const service = {
        name: serviceName,
        path: this.extractServicePath(content, serviceName),
        entities: this.extractEntities(serviceBody),
        events: this.extractEvents(serviceBody),
        ordAnnotations: this.extractOrdAnnotations(content, serviceName),
        hasOrdAnnotations: false
      };

      service.hasOrdAnnotations = service.ordAnnotations.length > 0;
      if (service.hasOrdAnnotations) {
        analysis.summary.ordAnnotatedServices++;
      }

      fileAnalysis.services.push(service);
    }

    // Extract standalone entities and events
    fileAnalysis.entities = this.extractEntities(content);
    fileAnalysis.events = this.extractEvents(content);

    // Extract ORD annotations
    fileAnalysis.ordAnnotations = this.extractOrdAnnotations(content);

    if (fileAnalysis.services.length > 0) {
      analysis.summary.serviceFiles++;
    } else if (fileAnalysis.entities.length > 0) {
      analysis.summary.modelFiles++;
    }

    analysis.services.push(...fileAnalysis.services);
    analysis.models.push(fileAnalysis);
  }

  async analyzeJsonFile(filePath, content, analysis) {
    analysis.summary.configFiles++;
    
    if (filePath.includes('package.json')) {
      try {
        const pkg = JSON.parse(content);
        if (pkg['open-resource-discovery']) {
          analysis.ordMetadata = pkg['open-resource-discovery'];
        }
      } catch (error) {
        analysis.warnings.push(`Invalid JSON in ${filePath}: ${error.message}`);
      }
    }
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

  extractEntities(content) {
    const entities = [];
    const entityMatches = content.matchAll(/entity\s+(\w+)(?:\s*:\s*([^{;]+))?\s*\{([^}]+)\}/gs);
    
    for (const match of entityMatches) {
      entities.push({
        name: match[1],
        extends: match[2]?.trim(),
        properties: this.extractEntityProperties(match[3])
      });
    }
    
    return entities;
  }

  extractEvents(content) {
    const events = [];
    const eventMatches = content.matchAll(/event\s+(\w+)\s*\{([^}]+)\}/gs);
    
    for (const match of eventMatches) {
      events.push({
        name: match[1],
        properties: this.extractEntityProperties(match[2])
      });
    }
    
    return events;
  }

  extractEntityProperties(propertiesContent) {
    const properties = [];
    const lines = propertiesContent.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('//')) {
        const propMatch = trimmed.match(/(\w+)\s*:\s*([^;@]+)/);
        if (propMatch) {
          properties.push({
            name: propMatch[1],
            type: propMatch[2].trim()
          });
        }
      }
    }
    
    return properties;
  }

  extractOrdAnnotations(content, serviceName = null) {
    const annotations = [];
    
    // Look for ORD.Extensions annotations
    const ordPatterns = [
      /@ORD\.Extensions\.product\s*:\s*['"]([^'"]+)['"]/g,
      /@ORD\.Extensions\.capability\s*:\s*['"]([^'"]+)['"]/g,
      /@ORD\.Extensions\.apiResource\s*:\s*\{([^}]+)\}/g,
      /@ORD\.Extensions\.eventResource\s*:\s*\{([^}]+)\}/g,
      /@ORD\.Extensions\.consumptionBundle\s*:\s*\{([^}]+)\}/g
    ];

    const annotationTypes = ['product', 'capability', 'apiResource', 'eventResource', 'consumptionBundle'];

    ordPatterns.forEach((pattern, index) => {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        annotations.push({
          type: annotationTypes[index],
          value: match[1] || match[0],
          context: serviceName || 'global'
        });
      }
    });

    return annotations;
  }

  generateSuggestions(analysis, suggestionLevel) {
    const suggestions = [];

    // Basic suggestions
    if (analysis.services.length === 0) {
      suggestions.push({
        type: 'warning',
        category: 'project-structure',
        message: 'No CAP services found. Consider creating service definitions in the srv/ directory.',
        priority: 'high'
      });
    }

    if (analysis.summary.ordAnnotatedServices === 0) {
      suggestions.push({
        type: 'improvement',
        category: 'ord-annotations',
        message: 'No ORD annotations found. Add ORD metadata to make your services discoverable.',
        priority: 'high',
        action: 'Add @ORD.Extensions annotations to your services'
      });
    }

    if (!analysis.ordMetadata) {
      suggestions.push({
        type: 'improvement',
        category: 'ord-metadata',
        message: 'No ORD metadata found in package.json. Consider adding open-resource-discovery section.',
        priority: 'medium',
        action: 'Add "open-resource-discovery" section to package.json'
      });
    }

    // Detailed suggestions
    if (suggestionLevel === 'detailed' || suggestionLevel === 'comprehensive') {
      analysis.services.forEach(service => {
        if (!service.hasOrdAnnotations) {
          suggestions.push({
            type: 'improvement',
            category: 'ord-annotations',
            message: `Service "${service.name}" lacks ORD annotations`,
            priority: 'medium',
            action: `Add @ORD.Extensions annotations to service ${service.name}`,
            context: { serviceName: service.name, servicePath: service.path }
          });
        }

        if (!service.path) {
          suggestions.push({
            type: 'improvement',
            category: 'service-configuration',
            message: `Service "${service.name}" should have an explicit path annotation`,
            priority: 'low',
            action: `Add @path annotation to service ${service.name}`
          });
        }

        if (service.entities.length === 0 && service.events.length === 0) {
          suggestions.push({
            type: 'warning',
            category: 'service-content',
            message: `Service "${service.name}" is empty (no entities or events)`,
            priority: 'medium'
          });
        }

        // Check for common ORD patterns
        if (service.entities.length > 0 && !service.ordAnnotations.some(a => a.type === 'apiResource')) {
          suggestions.push({
            type: 'improvement',
            category: 'ord-patterns',
            message: `Service "${service.name}" with entities should have @ORD.Extensions.apiResource annotation`,
            priority: 'medium',
            action: 'Add apiResource annotation for data access patterns'
          });
        }

        if (service.events.length > 0 && !service.ordAnnotations.some(a => a.type === 'eventResource')) {
          suggestions.push({
            type: 'improvement',
            category: 'ord-patterns',
            message: `Service "${service.name}" with events should have @ORD.Extensions.eventResource annotations`,
            priority: 'medium',
            action: 'Add eventResource annotations for each event'
          });
        }
      });
    }

    // Comprehensive suggestions
    if (suggestionLevel === 'comprehensive') {
      this.addComprehensiveSuggestions(analysis, suggestions);
    }

    analysis.suggestions = suggestions;
  }

  addComprehensiveSuggestions(analysis, suggestions) {
    // Architecture suggestions
    if (analysis.services.length > 3) {
      suggestions.push({
        type: 'architecture',
        category: 'ord-organization',
        message: 'Consider grouping related services into consumption bundles',
        priority: 'low',
        action: 'Create consumption bundles for related APIs'
      });
    }

    // Best practices
    suggestions.push({
      type: 'best-practice',
      category: 'ord-ids',
      message: 'Use consistent ORD ID naming conventions across your project',
      priority: 'low',
      action: 'Review and standardize ordId patterns (e.g., company:type:name:version)'
    });

    suggestions.push({
      type: 'best-practice',
      category: 'documentation',
      message: 'Add comprehensive descriptions to your ORD resources',
      priority: 'low',
      action: 'Enhance shortDescription and description fields in ORD annotations'
    });

    // Integration suggestions
    if (analysis.ordMetadata) {
      suggestions.push({
        type: 'integration',
        category: 'ord-tooling',
        message: 'Consider using @cap-js/ord plugin for automated ORD metadata generation',
        priority: 'low',
        action: 'Install and configure @cap-js/ord package'
      });
    }
  }
}

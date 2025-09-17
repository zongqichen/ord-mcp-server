/**
 * Utility functions for formatting documentation and responses
 */
export class DocFormatter {
  /**
   * Format text content for better readability
   */
  static formatText(text) {
    if (!text || typeof text !== 'string') return '';
    
    return text
      .trim()
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Remove excessive line breaks
      .replace(/\t/g, '  ') // Convert tabs to spaces
      .replace(/\r\n/g, '\n'); // Normalize line endings
  }

  /**
   * Format code snippets with proper indentation
   */
  static formatCode(code, language = '') {
    if (!code) return '';
    
    const formattedCode = this.formatText(code);
    return language ? `\`\`\`${language}\n${formattedCode}\n\`\`\`` : `\`\`\`\n${formattedCode}\n\`\`\``;
  }

  /**
   * Format ORD concept explanations
   */
  static formatConceptExplanation(concept, explanation, examples = []) {
    let formatted = `# ORD ${concept}\n\n${explanation}\n\n`;
    
    if (examples.length > 0) {
      formatted += '## Examples\n\n';
      examples.forEach((example, index) => {
        formatted += `### Example ${index + 1}\n\n`;
        if (example.description) {
          formatted += `${example.description}\n\n`;
        }
        if (example.code) {
          formatted += this.formatCode(example.code, example.language || 'json');
          formatted += '\n\n';
        }
      });
    }
    
    return formatted;
  }

  /**
   * Format search results
   */
  static formatSearchResults(results, query) {
    if (!results || results.length === 0) {
      return `No results found for query: "${query}"`;
    }

    let formatted = `# Search Results for "${query}"\n\n`;
    formatted += `Found ${results.length} result(s):\n\n`;

    results.forEach((result, index) => {
      formatted += `## ${index + 1}. ${result.title || 'Untitled'}\n\n`;
      
      if (result.score) {
        formatted += `**Relevance:** ${Math.round(result.score * 100)}%\n\n`;
      }
      
      if (result.description || result.content) {
        const content = result.description || result.content;
        const truncated = this.truncateText(content, 300);
        formatted += `${truncated}\n\n`;
      }
      
      if (result.source) {
        formatted += `**Source:** ${result.source}\n\n`;
      }
      
      formatted += '---\n\n';
    });

    return formatted;
  }

  /**
   * Format validation results
   */
  static formatValidationResults(validation) {
    let formatted = `# ORD Metadata Validation Report\n\n`;
    
    const status = validation.valid ? '✅ Valid' : '❌ Invalid';
    formatted += `**Status:** ${status}\n`;
    formatted += `**Timestamp:** ${validation.timestamp}\n`;
    formatted += `**Validation Level:** ${validation.validationLevel}\n\n`;

    // Summary
    formatted += `## Summary\n\n`;
    formatted += `- **Errors:** ${validation.errors?.length || 0}\n`;
    formatted += `- **Warnings:** ${validation.warnings?.length || 0}\n`;
    formatted += `- **Suggestions:** ${validation.suggestions?.length || 0}\n\n`;

    // Errors
    if (validation.errors && validation.errors.length > 0) {
      formatted += `## ❌ Errors\n\n`;
      validation.errors.forEach((error, index) => {
        formatted += `${index + 1}. **${error.type}**`;
        if (error.context) formatted += ` (${error.context})`;
        formatted += `\n   ${error.message}\n`;
        if (error.value) formatted += `   Value: \`${error.value}\`\n`;
        formatted += '\n';
      });
    }

    // Warnings
    if (validation.warnings && validation.warnings.length > 0) {
      formatted += `## ⚠️ Warnings\n\n`;
      validation.warnings.forEach((warning, index) => {
        formatted += `${index + 1}. **${warning.type}**`;
        if (warning.context) formatted += ` (${warning.context})`;
        formatted += `\n   ${warning.message}\n\n`;
      });
    }

    // Suggestions
    if (validation.suggestions && validation.suggestions.length > 0) {
      formatted += `## 💡 Suggestions\n\n`;
      validation.suggestions.forEach((suggestion, index) => {
        formatted += `${index + 1}. **${suggestion.type}**`;
        if (suggestion.context) formatted += ` (${suggestion.context})`;
        formatted += `\n   ${suggestion.message}\n`;
        if (suggestion.suggestion) formatted += `   💡 ${suggestion.suggestion}\n`;
        formatted += '\n';
      });
    }

    return formatted;
  }

  /**
   * Format annotation generation results
   */
  static formatAnnotationResults(results) {
    let formatted = `# Generated ORD Annotations\n\n`;
    
    formatted += `**Type:** ${results.annotationType}\n`;
    formatted += `**Generated:** ${results.timestamp}\n`;
    formatted += `**Services:** ${results.services?.length || 0}\n\n`;

    if (results.services && results.services.length > 0) {
      results.services.forEach((service, index) => {
        formatted += `## Service: ${service.serviceName}\n\n`;
        
        if (service.annotations && service.annotations.length > 0) {
          formatted += '### Annotations\n\n';
          service.annotations.forEach(annotation => {
            formatted += `#### ${annotation.type.charAt(0).toUpperCase() + annotation.type.slice(1)}\n\n`;
            formatted += this.formatCode(annotation.code, 'javascript');
            formatted += '\n\n';
          });
        }

        if (service.cdsCode) {
          formatted += '### Complete Annotated Service\n\n';
          formatted += this.formatCode(service.cdsCode, 'javascript');
          formatted += '\n\n';
        }

        if (service.explanations && service.explanations.length > 0) {
          formatted += '### Explanations\n\n';
          service.explanations.forEach(explanation => {
            formatted += `- **${explanation.annotation}:** ${explanation.explanation}\n`;
          });
          formatted += '\n';
        }
      });
    }

    if (results.packageJson) {
      formatted += '## Package.json Metadata\n\n';
      formatted += this.formatCode(JSON.stringify(results.packageJson, null, 2), 'json');
      formatted += '\n\n';
    }

    if (results.recommendations && results.recommendations.length > 0) {
      formatted += '## Recommendations\n\n';
      results.recommendations.forEach((rec, index) => {
        const icon = rec.type === 'error' ? '❌' : rec.type === 'warning' ? '⚠️' : '💡';
        formatted += `${index + 1}. ${icon} **${rec.type}:** ${rec.message}\n`;
        if (rec.suggestion) formatted += `   ${rec.suggestion}\n`;
        formatted += '\n';
      });
    }

    return formatted;
  }

  /**
   * Format CAP project analysis results
   */
  static formatAnalysisResults(analysis) {
    let formatted = `# CAP Project Analysis\n\n`;
    
    formatted += `**Project Path:** ${analysis.projectPath}\n`;
    formatted += `**Analysis Date:** ${analysis.timestamp}\n`;
    formatted += `**Files Analyzed:** ${analysis.filesAnalyzed?.length || 0}\n\n`;

    if (analysis.summary) {
      formatted += `## Summary\n\n`;
      formatted += `- **Services:** ${analysis.summary.totalServices || 0}\n`;
      formatted += `- **Entities:** ${analysis.summary.totalEntities || 0}\n`;
      formatted += `- **Events:** ${analysis.summary.totalEvents || 0}\n`;
      formatted += `- **ORD Annotations:** ${analysis.summary.ordAnnotations || 0}\n\n`;
    }

    if (analysis.services && analysis.services.length > 0) {
      formatted += `## Services Found\n\n`;
      analysis.services.forEach((service, index) => {
        formatted += `### ${index + 1}. ${service.name}\n\n`;
        if (service.path) formatted += `**Path:** ${service.path}\n`;
        formatted += `**Entities:** ${service.entities?.length || 0}\n`;
        formatted += `**Events:** ${service.events?.length || 0}\n`;
        formatted += `**Actions:** ${service.actions?.length || 0}\n`;
        formatted += `**Functions:** ${service.functions?.length || 0}\n\n`;
      });
    }

    if (analysis.recommendations && analysis.recommendations.length > 0) {
      formatted += `## Recommendations\n\n`;
      analysis.recommendations.forEach((rec, index) => {
        const icon = rec.type === 'error' ? '❌' : rec.type === 'warning' ? '⚠️' : '💡';
        formatted += `${index + 1}. ${icon} **${rec.message}**\n`;
        if (rec.suggestion) formatted += `   ${rec.suggestion}\n`;
        formatted += '\n';
      });
    }

    return formatted;
  }

  /**
   * Format examples
   */
  static formatExamples(examples, useCase) {
    let formatted = `# ORD Examples: ${useCase}\n\n`;
    
    if (!examples || examples.length === 0) {
      return formatted + 'No examples found for this use case.';
    }

    formatted += `Found ${examples.length} example(s):\n\n`;

    examples.forEach((example, index) => {
      formatted += `## Example ${index + 1}: ${example.title || 'Untitled'}\n\n`;
      
      if (example.description) {
        formatted += `${example.description}\n\n`;
      }

      if (example.metadata) {
        formatted += '### Metadata\n\n';
        formatted += this.formatCode(JSON.stringify(example.metadata, null, 2), 'json');
        formatted += '\n\n';
      }

      if (example.annotations) {
        formatted += '### CDS Annotations\n\n';
        formatted += this.formatCode(example.annotations, 'javascript');
        formatted += '\n\n';
      }

      if (example.explanation) {
        formatted += '### Explanation\n\n';
        formatted += `${example.explanation}\n\n`;
      }

      formatted += '---\n\n';
    });

    return formatted;
  }

  /**
   * Truncate text to specified length
   */
  static truncateText(text, maxLength = 200) {
    if (!text || text.length <= maxLength) return text;
    
    const truncated = text.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    
    if (lastSpace > maxLength * 0.8) {
      return truncated.substring(0, lastSpace) + '...';
    }
    
    return truncated + '...';
  }

  /**
   * Escape special characters for safe display
   */
  static escapeText(text) {
    if (!text) return '';
    
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Convert object to formatted JSON string
   */
  static toJson(obj, pretty = true) {
    try {
      return JSON.stringify(obj, null, pretty ? 2 : 0);
    } catch (error) {
      return `Error serializing object: ${error.message}`;
    }
  }

  /**
   * Format error messages consistently
   */
  static formatError(error) {
    return `❌ **Error:** ${error.message}\n\n${error.stack ? `**Stack trace:**\n\`\`\`\n${error.stack}\n\`\`\`` : ''}`;
  }
}

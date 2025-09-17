import axios from 'axios';
import * as cheerio from 'cheerio';
import TurndownService from 'turndown';
import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';

export class OrdDocumentationIndexer {
  constructor() {
    this.turndownService = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced'
    });

    this.cache = new Map();
    this.cacheDir = path.join(process.cwd(), '.ord-cache');
    // Resolve assets directory relative to this file for offline fallback
    this.assetsDir = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../assets');
    this.lastUpdated = null;

    // ORD documentation sources
    this.sources = {
      specification: 'https://raw.githubusercontent.com/SAP/open-resource-discovery/main/spec-v1/interfaces/Document.md',
      schemas: 'https://api.github.com/repos/SAP/open-resource-discovery/contents/spec-v1/schema',
      capOrdPlugin: 'https://api.github.com/repos/cap-js/ord/contents/docs',
      examples: 'https://api.github.com/repos/SAP/open-resource-discovery/contents/examples'
    };

    this.ordConcepts = {
      'Product': {
        description: 'A product represents a commercial offering or a logical grouping of capabilities',
        properties: ['ordId', 'title', 'shortDescription', 'description', 'vendor', 'parent'],
        required: ['ordId', 'title', 'shortDescription', 'vendor']
      },
      'Capability': {
        description: 'A capability represents a business functionality provided by a product',
        properties: ['ordId', 'title', 'shortDescription', 'description', 'type', 'customType'],
        required: ['ordId', 'title', 'shortDescription', 'type']
      },
      'APIResource': {
        description: 'An API resource represents a consumable API offered by a capability',
        properties: ['ordId', 'title', 'shortDescription', 'description', 'entryPoints', 'apiProtocol'],
        required: ['ordId', 'title', 'shortDescription', 'entryPoints', 'apiProtocol']
      },
      'EventResource': {
        description: 'An event resource represents events that can be consumed from a capability',
        properties: ['ordId', 'title', 'shortDescription', 'description', 'eventResourceType'],
        required: ['ordId', 'title', 'shortDescription', 'eventResourceType']
      },
      'ConsumptionBundle': {
        description: 'A consumption bundle groups resources that are typically consumed together',
        properties: ['ordId', 'title', 'shortDescription', 'description', 'credentialExchangeStrategies'],
        required: ['ordId', 'title', 'shortDescription', 'credentialExchangeStrategies']
      },
      'Package': {
        description: 'A package is a container for grouping related ORD resources',
        properties: ['ordId', 'title', 'shortDescription', 'description', 'version', 'packageLinks'],
        required: ['ordId', 'title', 'shortDescription', 'version']
      }
    };
  }

  async initialize() {
    await this.ensureCacheDir();
    await this.loadCachedData();

    // Check if we need to refresh the cache (daily refresh)
    const shouldRefresh = !this.lastUpdated ||
      (Date.now() - this.lastUpdated) > 24 * 60 * 60 * 1000;

    if (shouldRefresh) {
      console.error('Refreshing ORD documentation cache...');
      await this.refreshDocumentation();
    }
  }

  async ensureCacheDir() {
    try {
      await fs.access(this.cacheDir);
    } catch {
      await fs.mkdir(this.cacheDir, { recursive: true });
    }
  }

  async loadCachedData() {
    try {
      const metaPath = path.join(this.cacheDir, 'meta.json');
      const metaContent = await fs.readFile(metaPath, 'utf-8');
      const meta = JSON.parse(metaContent);
      this.lastUpdated = meta.lastUpdated;

      // Load cached documentation
      const specPath = path.join(this.cacheDir, 'specification.md');
      const schemasPath = path.join(this.cacheDir, 'schemas.json');
      const examplesPath = path.join(this.cacheDir, 'examples.json');

      if (await this.fileExists(specPath)) {
        this.cache.set('specification', await fs.readFile(specPath, 'utf-8'));
      }
      if (await this.fileExists(schemasPath)) {
        this.cache.set('schemas', JSON.parse(await fs.readFile(schemasPath, 'utf-8')));
      }
      if (await this.fileExists(examplesPath)) {
        this.cache.set('examples', JSON.parse(await fs.readFile(examplesPath, 'utf-8')));
      }
    } catch (error) {
      console.error('No valid cache found, will fetch fresh data');
    }
  }

  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async refreshDocumentation() {
    try {
      // Fetch specification
      await this.fetchSpecification();

      // Fetch schemas
      await this.fetchSchemas();

      // Fetch examples
      await this.fetchExamples();

      // Fetch CAP ORD plugin docs
      await this.fetchCapOrdDocs();

      // Save cache metadata
      await this.saveCacheMetadata();

      console.error('Documentation refresh completed');
    } catch (error) {
      console.error('Error refreshing documentation:', error.message);
      throw error;
    }
  }

  async fetchSpecification() {
    try {
      const response = await axios.get(this.sources.specification, {
        timeout: 10000,
        headers: { 'User-Agent': 'ORD-MCP-Server/1.0.0' }
      });

      const specContent = response.data;
      this.cache.set('specification', specContent);

      // Save to cache
      await fs.writeFile(
        path.join(this.cacheDir, 'specification.md'),
        specContent,
        'utf-8'
      );
    } catch (error) {
      console.error('Failed to fetch specification:', error.message);
      // Use cached version if available; otherwise try offline fallback
      if (!this.cache.has('specification')) {
        try {
          const fallbackPath = path.join(this.assetsDir, 'specification.md');
          const fallback = await fs.readFile(fallbackPath, 'utf-8');
          this.cache.set('specification', fallback);
          // Save fallback to cache for future use
          await fs.writeFile(
            path.join(this.cacheDir, 'specification.md'),
            fallback,
            'utf-8'
          );
          console.error('Loaded offline fallback specification');
        } catch (fallbackErr) {
          throw new Error('No specification data available');
        }
      }
    }
  }

  async fetchSchemas() {
    try {
      const response = await axios.get(this.sources.schemas, {
        timeout: 10000,
        headers: { 'User-Agent': 'ORD-MCP-Server/1.0.0' }
      });

      const schemas = {};

      // Fetch individual schema files
      for (const file of response.data) {
        if (file.type === 'file' && file.name.endsWith('.json')) {
          try {
            const schemaResponse = await axios.get(file.download_url);
            schemas[file.name] = schemaResponse.data;
          } catch (schemaError) {
            console.error(`Failed to fetch schema ${file.name}:`, schemaError.message);
          }
        }
      }

      this.cache.set('schemas', schemas);

      // Save to cache
      await fs.writeFile(
        path.join(this.cacheDir, 'schemas.json'),
        JSON.stringify(schemas, null, 2),
        'utf-8'
      );
    } catch (error) {
      console.error('Failed to fetch schemas:', error.message);
      if (!this.cache.has('schemas')) {
        this.cache.set('schemas', {});
      }
    }
  }

  async fetchExamples() {
    try {
      const response = await axios.get(this.sources.examples, {
        timeout: 10000,
        headers: { 'User-Agent': 'ORD-MCP-Server/1.0.0' }
      });

      const examples = {};

      // Fetch example files
      for (const item of response.data) {
        if (item.type === 'file' && (item.name.endsWith('.json') || item.name.endsWith('.yaml'))) {
          try {
            const exampleResponse = await axios.get(item.download_url);
            const content = item.name.endsWith('.yaml')
              ? yaml.load(exampleResponse.data)
              : exampleResponse.data;
            examples[item.name] = content;
          } catch (exampleError) {
            console.error(`Failed to fetch example ${item.name}:`, exampleError.message);
          }
        }
      }

      this.cache.set('examples', examples);

      // Save to cache
      await fs.writeFile(
        path.join(this.cacheDir, 'examples.json'),
        JSON.stringify(examples, null, 2),
        'utf-8'
      );
    } catch (error) {
      console.error('Failed to fetch examples:', error.message);
      if (!this.cache.has('examples')) {
        this.cache.set('examples', {});
      }
    }
  }

  async fetchCapOrdDocs() {
    try {
      const response = await axios.get(this.sources.capOrdPlugin, {
        timeout: 10000,
        headers: { 'User-Agent': 'ORD-MCP-Server/1.0.0' }
      });

      const capDocs = {};

      // Fetch CAP ORD documentation files
      for (const file of response.data) {
        if (file.type === 'file' && file.name.endsWith('.md')) {
          try {
            const docResponse = await axios.get(file.download_url);
            capDocs[file.name] = docResponse.data;
          } catch (docError) {
            console.error(`Failed to fetch CAP doc ${file.name}:`, docError.message);
          }
        }
      }

      this.cache.set('capDocs', capDocs);

      // Save to cache
      await fs.writeFile(
        path.join(this.cacheDir, 'cap-docs.json'),
        JSON.stringify(capDocs, null, 2),
        'utf-8'
      );
    } catch (error) {
      console.error('Failed to fetch CAP ORD docs:', error.message);
      if (!this.cache.has('capDocs')) {
        this.cache.set('capDocs', {});
      }
    }
  }

  async saveCacheMetadata() {
    const meta = {
      lastUpdated: Date.now(),
      version: '1.0.0'
    };

    await fs.writeFile(
      path.join(this.cacheDir, 'meta.json'),
      JSON.stringify(meta, null, 2),
      'utf-8'
    );

    this.lastUpdated = meta.lastUpdated;
  }

  async getSpecificationDocs() {
    if (!this.cache.has('specification')) {
      await this.fetchSpecification();
    }
    return this.cache.get('specification') || 'Specification not available';
  }

  async getOrdSchemas() {
    if (!this.cache.has('schemas')) {
      await this.fetchSchemas();
    }
    return this.cache.get('schemas') || {};
  }

  async getOrdConcepts() {
    return this.ordConcepts;
  }

  async getExamples() {
    if (!this.cache.has('examples')) {
      await this.fetchExamples();
    }
    return this.cache.get('examples') || {};
  }

  async getCapDocs() {
    if (!this.cache.has('capDocs')) {
      await this.fetchCapOrdDocs();
    }
    return this.cache.get('capDocs') || {};
  }

  // Search through all cached content
  searchContent(query, maxResults = 10) {
    const results = [];
    const queryLower = query.toLowerCase();

    // Search specification
    const spec = this.cache.get('specification');
    if (spec) {
      const lines = spec.split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].toLowerCase().includes(queryLower)) {
          results.push({
            type: 'specification',
            title: this.extractTitle(lines, i),
            content: this.extractContext(lines, i),
            line: i + 1,
            relevance: this.calculateRelevance(lines[i], query)
          });
        }
      }
    }

    // Search examples
    const examples = this.cache.get('examples') || {};
    Object.entries(examples).forEach(([filename, content]) => {
      const contentStr = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
      if (contentStr.toLowerCase().includes(queryLower)) {
        results.push({
          type: 'example',
          title: filename,
          content: this.truncateContent(contentStr, query),
          relevance: this.calculateRelevance(contentStr, query)
        });
      }
    });

    // Search CAP docs
    const capDocs = this.cache.get('capDocs') || {};
    Object.entries(capDocs).forEach(([filename, content]) => {
      if (content.toLowerCase().includes(queryLower)) {
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].toLowerCase().includes(queryLower)) {
            results.push({
              type: 'cap-docs',
              title: `${filename} - ${this.extractTitle(lines, i)}`,
              content: this.extractContext(lines, i),
              line: i + 1,
              relevance: this.calculateRelevance(lines[i], query)
            });
          }
        }
      }
    });

    // Sort by relevance and return top results
    return results
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, maxResults);
  }

  extractTitle(lines, currentIndex) {
    // Look backwards for the nearest heading
    for (let i = currentIndex; i >= 0; i--) {
      if (lines[i].startsWith('#')) {
        return lines[i].replace(/^#+\s*/, '').trim();
      }
    }
    return 'Content';
  }

  extractContext(lines, currentIndex, contextLines = 3) {
    const start = Math.max(0, currentIndex - contextLines);
    const end = Math.min(lines.length, currentIndex + contextLines + 1);
    return lines.slice(start, end).join('\n');
  }

  truncateContent(content, query, maxLength = 500) {
    const queryIndex = content.toLowerCase().indexOf(query.toLowerCase());
    if (queryIndex === -1) return content.substring(0, maxLength);

    const start = Math.max(0, queryIndex - maxLength / 2);
    const end = Math.min(content.length, start + maxLength);

    let result = content.substring(start, end);
    if (start > 0) result = '...' + result;
    if (end < content.length) result = result + '...';

    return result;
  }

  calculateRelevance(text, query) {
    const textLower = text.toLowerCase();
    const queryLower = query.toLowerCase();

    // Base relevance if query is found
    let relevance = 1;

    // Boost for exact matches
    if (textLower.includes(queryLower)) {
      relevance += 2;
    }

    // Boost for word matches
    const queryWords = queryLower.split(/\s+/);
    const textWords = textLower.split(/\s+/);

    queryWords.forEach(queryWord => {
      if (textWords.includes(queryWord)) {
        relevance += 1;
      }
    });

    // Boost for title matches (if text looks like a heading)
    if (text.startsWith('#') || text.length < 100) {
      relevance += 1;
    }

    return relevance;
  }
}

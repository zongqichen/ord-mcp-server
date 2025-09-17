#!/usr/bin/env node

console.log('🧪 Testing ORD MCP Server Components...\n');

async function testModuleImports() {
  let testsPass = 0;
  let testsTotal = 0;

  console.log('1. Testing module imports...');
  testsTotal++;

  try {
    const { OrdMcpServer } = await import('../src/index.js');
    const { OrdDocumentationIndexer } = await import('../src/indexer/ordDocIndexer.js');
    const { SemanticSearch } = await import('../src/search/semanticSearch.js');
    const { CapAnalyzer } = await import('../src/analyzers/capAnalyzer.js');
    const { AnnotationGenerator } = await import('../src/generators/annotationGenerator.js');
    const { OrdValidator } = await import('../src/analyzers/ordValidator.js');
    const { DocFormatter } = await import('../src/utils/docFormatter.js');
    
    console.log('✅ All modules imported successfully');
    testsPass++;
  } catch (error) {
    console.log('❌ Module import failed:', error.message);
  }

  console.log('\n2. Testing server instantiation...');
  testsTotal++;

  try {
    const { OrdMcpServer } = await import('../src/index.js');
    const server = new OrdMcpServer();
    console.log('✅ Server instantiated successfully');
    testsPass++;
  } catch (error) {
    console.log('❌ Server instantiation failed:', error.message);
  }

  console.log('\n3. Testing individual components...');
  testsTotal++;

  try {
    const { AnnotationGenerator } = await import('../src/generators/annotationGenerator.js');
    const generator = new AnnotationGenerator();
    
    const sampleService = `service TestService {
      entity Orders {
        id: UUID;
        orderNumber: String(20);
      }
    }`;
    
    const result = await generator.generateAnnotations(sampleService, 'basic');
    
    if (result && result.services && result.services.length > 0) {
      console.log('✅ Annotation generation works');
      testsPass++;
    } else {
      console.log('❌ Annotation generation returned no results');
    }
  } catch (error) {
    console.log('❌ Annotation generation failed:', error.message);
  }

  console.log('\n4. Testing validation component...');
  testsTotal++;

  try {
    const { OrdValidator } = await import('../src/analyzers/ordValidator.js');
    const validator = new OrdValidator();
    
    const sampleMetadata = {
      "openResourceDiscoveryVersion": "1.9.0",
      "products": [{
        "ordId": "test:product:sample:v1",
        "title": "Test Product",
        "shortDescription": "A test product",
        "vendor": "test:vendor:sample:v1"
      }],
      "vendors": [{
        "ordId": "test:vendor:sample:v1",
        "title": "Test Vendor"
      }]
    };
    
    const result = await validator.validateMetadata(sampleMetadata, false);
    
    if (result && typeof result.valid === 'boolean') {
      console.log('✅ Metadata validation works');
      console.log(`   Valid: ${result.valid}, Errors: ${result.errors?.length || 0}`);
      testsPass++;
    } else {
      console.log('❌ Metadata validation returned unexpected format');
    }
  } catch (error) {
    console.log('❌ Metadata validation failed:', error.message);
  }

  console.log('\n5. Testing CAP analyzer...');
  testsTotal++;

  try {
    const { CapAnalyzer } = await import('../src/analyzers/capAnalyzer.js');
    const analyzer = new CapAnalyzer();
    
    const sampleCapContent = `namespace com.example.bookshop;

service BookshopService {
  entity Books {
    ID: Integer;
    title: String(100);
    author: String(100);
  }
  
  event BookOrdered {
    bookID: Integer;
    quantity: Integer;
  }
}`;
    
    // Create a temporary test directory structure
    const tempDir = '/tmp/test-cap-project';
    try {
      await import('fs/promises').then(fs => fs.mkdir(tempDir, { recursive: true }));
      await import('fs/promises').then(fs => fs.writeFile(`${tempDir}/test.cds`, sampleCapContent));
      
      const result = await analyzer.analyzeProject(tempDir);
      
      if (result && result.services && result.services.length > 0) {
        console.log('✅ CAP analysis works');
        console.log(`   Found ${result.services.length} service(s)`);
        testsPass++;
      } else {
        console.log('❌ CAP analysis returned no services');
      }
      
      // Cleanup
      await import('fs/promises').then(fs => fs.rm(tempDir, { recursive: true, force: true }));
    } catch (cleanupError) {
      // Ignore cleanup errors
    }
  } catch (error) {
    console.log('❌ CAP analysis failed:', error.message);
  }

  console.log('\n6. Testing documentation formatter...');
  testsTotal++;

  try {
    const { DocFormatter } = await import('../src/utils/docFormatter.js');
    
    const sampleResults = [{
      title: 'Test Result',
      content: 'This is a test result for formatting',
      score: 0.85,
      source: 'test'
    }];
    
    const formatted = DocFormatter.formatSearchResults(sampleResults, 'test query');
    
    if (formatted && formatted.includes('Test Result')) {
      console.log('✅ Documentation formatting works');
      testsPass++;
    } else {
      console.log('❌ Documentation formatting failed');
    }
  } catch (error) {
    console.log('❌ Documentation formatting failed:', error.message);
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log(`📊 Test Results: ${testsPass}/${testsTotal} tests passed`);
  
  if (testsPass === testsTotal) {
    console.log('🎉 All component tests passed! The ORD MCP Server is ready to use.');
    process.exit(0);
  } else {
    console.log(`❌ ${testsTotal - testsPass} test(s) failed. Some functionality may be limited.`);
    process.exit(1);
  }
}

testModuleImports().catch(console.error);

using { cuid } from '@sap/cds/common';

namespace ord.mcp;

@impl: './service.js'
service OrdMcpService {
  
  // Action for getting ORD specification
  action getOrdSpecification() returns {
    content: array of {
      type: String;
      text: String;
    };
  };

  // Action for explaining ORD concepts
  action explainOrdConcept(concept: String) returns {
    content: array of {
      type: String;
      text: String;
    };
  };

  // Function for getting available resources
  function getResources() returns array of {
    uri: String;
    name: String;
    mimeType: String;
    description: String;
  };

  // Function for getting available tools
  function getTools() returns array of {
    name: String;
    description: String;
    inputSchema: String; // JSON string representation
  };

  // Function for reading a specific resource
  function readResource(uri: String) returns {
    contents: array of {
      uri: String;
      mimeType: String;
    };
  };
}

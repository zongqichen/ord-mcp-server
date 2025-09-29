service ORDMCPServer {
    function getSpecification()              returns String;
    function explainConcept(concept: String) returns String;
}

// MCP tool handlers - validate at boundary, pure logic inside
const { fetchSpecification } = require("./specification-fetcher.js");
const { validateConceptName, buildConceptExplanation } = require("./ord-concepts.js");

async function handleGetSpecification() {
    const spec = await fetchSpecification();
    return {
        content: [
            {
                type: "text",
                text: `# ORD Specification (Latest)\n\n${spec}`,
            },
        ],
    };
}

async function handleExplainConcept(args) {
    // Validate at ingress
    if (!args || typeof args !== "object") {
        throw new Error("Invalid arguments: expected object");
    }

    const concept = validateConceptName(args.concept);
    const explanation = buildConceptExplanation(concept);

    return {
        content: [
            {
                type: "text",
                text: explanation,
            },
        ],
    };
}

module.exports = {
    handleGetSpecification,
    handleExplainConcept
};

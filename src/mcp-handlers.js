// MCP tool handlers - validate at boundary, pure logic inside
import { fetchSpecification } from "./specification-fetcher.js";
import { validateConceptName, buildConceptExplanation } from "./ord-concepts.js";

export async function handleGetSpecification() {
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

export async function handleExplainConcept(args) {
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

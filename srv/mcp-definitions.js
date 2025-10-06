// Resource and tool definitions - stable contracts
const { ORD_CONCEPTS } = require("./ord-concepts.js");

const RESOURCES = Object.freeze([
    {
        uri: "ord://specification/latest",
        name: "ORD Specification",
        mimeType: "text/markdown",
        description: "Latest ORD specification from GitHub",
    },
]);

const TOOLS = Object.freeze([
    {
        name: "get_ord_specification",
        description: "Get and use the latest ORD specification document",
        inputSchema: {
            type: "object",
            properties: {},
            additionalProperties: false,
        },
    },
    {
        name: "explain_ord_concept",
        description: "Explain ORD concepts with examples",
        inputSchema: {
            type: "object",
            properties: {
                concept: {
                    type: "string",
                    description: "ORD concept to explain",
                    enum: Object.keys(ORD_CONCEPTS),
                },
            },
            required: ["concept"],
            additionalProperties: false,
        },
    },
]);

module.exports = { RESOURCES, TOOLS };

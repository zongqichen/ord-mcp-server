// src/ord-concepts.js
// ORD concept definitions and related functionality

const ORD_CONCEPTS = Object.freeze({
    Product: {
        description: "A product represents a commercial offering or logical grouping of capabilities",
        example: {
            ordId: "sap.example:product:MyProduct:v1",
            title: "My Product",
            shortDescription: "A sample product",
            vendor: "sap:vendor:SAP:",
        },
        keyProperties: [
            "ordId: Unique identifier following ORD ID format",
            "title: Human-readable name",
            "shortDescription: Brief description for listings",
            "vendor: Reference to the vendor providing this product",
        ],
    },
    Package: {
        description: "A container for grouping related ORD resources",
        example: {
            ordId: "sap.example:package:MyPackage:v1",
            title: "My Package",
            shortDescription: "A sample package",
            version: "1.0.0",
        },
        keyProperties: [
            "ordId: Unique package identifier",
            "title: Package name",
            "shortDescription: Brief package description",
            "version: Semantic version of the package",
        ],
    },
    ConsumptionBundle: {
        description: "Groups resources that are typically consumed together",
        example: {
            ordId: "sap.example:consumptionBundle:MyBundle:v1",
            title: "My Bundle",
            shortDescription: "A sample consumption bundle",
        },
        keyProperties: [
            "ordId: Unique bundle identifier",
            "title: Bundle name",
            "shortDescription: Brief bundle description",
            "credentialExchangeStrategies: Authentication methods",
        ],
    },
    APIResource: {
        description: "Represents a consumable API offered by a capability",
        example: {
            ordId: "sap.example:apiResource:MyAPI:v1",
            title: "My API",
            shortDescription: "A sample API resource",
            apiProtocol: "odata-v4",
        },
        keyProperties: [
            "ordId: Unique API identifier",
            "title: API name",
            "shortDescription: Brief API description",
            "apiProtocol: Protocol type (odata-v4, rest, graphql, etc.)",
            "entryPoints: API endpoints",
        ],
    },
    EventResource: {
        description: "Represents events that can be consumed from a capability",
        example: {
            ordId: "sap.example:eventResource:MyEvent:v1",
            title: "My Event",
            shortDescription: "A sample event resource",
        },
        keyProperties: [
            "ordId: Unique event identifier",
            "title: Event name",
            "shortDescription: Brief event description",
            "eventResourceType: Type of event resource",
        ],
    },
});

// Input validation for concept names
function validateConceptName(concept) {
    if (!concept || typeof concept !== "string") {
        throw new Error("Concept name must be a non-empty string");
    }

    if (!ORD_CONCEPTS[concept]) {
        const validConcepts = Object.keys(ORD_CONCEPTS).join(", ");
        throw new Error(`Unknown concept: ${concept}. Valid concepts: ${validConcepts}`);
    }

    return concept;
}

// Format key properties as markdown list items
function formatKeyProperties(properties) {
    return properties.map((prop) => `- ${prop}`).join("\n");
}

// Generate JSON example with consistent formatting
function formatExample(example) {
    return JSON.stringify(example, null, 2);
}

/**
 * Build a markdown explanation for a given ORD concept.
 *
 * @param {string} concept - Valid ORD concept name
 * @returns {string} Formatted markdown explanation
 * @throws {Error} If concept is invalid
 */
function buildConceptExplanation(concept) {
    validateConceptName(concept);

    const { description, example, keyProperties } = ORD_CONCEPTS[concept];
    const keyPropsList = formatKeyProperties(keyProperties);
    const exampleJson = formatExample(example);

    return `# ORD Concept: ${concept}

            ## Description
            ${description}

            ## Example Structure
            \`\`\`json
            ${exampleJson}
            \`\`\`

            ## Key Properties
            ${keyPropsList}

            ## Usage Notes
            - The \`ordId\` must follow the ORD ID format: \`namespace:type:localId:version\`
            - All ORD resources should reside in at least one Package (except referenced external ones)
            - Use Consumption Bundles to describe commonly co-consumed resources`;
}

// Public API
module.exports = { ORD_CONCEPTS, validateConceptName, buildConceptExplanation };

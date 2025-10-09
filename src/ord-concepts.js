// src/ord-concepts.js
// ORD concept definitions and related functionality

const ORD_CONCEPTS = Object.freeze({
    // ===== ORD DOCUMENT ROOT PROPERTIES =====
    DocumentProperties: {
        description: "Root-level properties that define the ORD Document structure and metadata.",
        example: {
            $schema: "https://sap.github.io/open-resource-discovery/spec-v1/interfaces/Document.schema.json",
            openResourceDiscovery: "1.0",
            description: "This document describes the APIs and Events of SAP S/4HANA Cloud",
            perspective: "system-instance",
            describedSystemInstance: {
                baseUrl: "https://my-s4hana.com",
                displayName: "My S/4HANA System",
            },
            policyLevel: "sap:core:v1",
        },
        keyProperties: [
            "$schema: Reference to ORD Document JSON Schema (MANDATORY)",
            "openResourceDiscovery: ORD specification version (MANDATORY)",
            "description: Human-readable description of the document (OPTIONAL)",
            "perspective: Document perspective - system-instance or system-type (OPTIONAL)",
            "describedSystemInstance: Information about specific system instance (OPTIONAL)",
            "describedSystemType: Information about system type (OPTIONAL)",
            "describedSystemVersion: Version of the described system (OPTIONAL)",
            "policyLevel: Default policy level for compliance (OPTIONAL)",
            "customPolicyLevel: Custom policy level specification ID (OPTIONAL)",
            "policyLevels: List of available policy levels in document (OPTIONAL)",
        ],
    },

    // ===== CORE ORD ENTITIES =====
    Product: {
        description:
            "A commercial product or service. High-level entity for structuring software portfolio from sales/marketing perspective.",
        example: {
            ordId: "sap:product:S4HANA_OD:",
            title: "SAP S/4HANA Cloud",
            shortDescription: "The next generation digital core designed to help you run simple in a digital economy.",
            vendor: "sap:vendor:SAP:",
        },
        keyProperties: [
            "ordId: Unique identifier following ORD ID format (MANDATORY)",
            "title: Human-readable title (MANDATORY)",
            "shortDescription: Plain text short description (MANDATORY)",
            "vendor: Reference to the vendor providing this product (MANDATORY)",
            "description: Full description in CommonMark (OPTIONAL)",
            "parent: Parent product ORD ID for hierarchical structure (OPTIONAL)",
            "correlationIds: References to related data in other repositories (OPTIONAL)",
            "tags: List of free text style tags (OPTIONAL)",
            "labels: Generic labels for technical information (OPTIONAL)",
            "documentationLabels: Human-readable documentation snippets (OPTIONAL)",
        ],
    },
    Package: {
        description:
            "Organizes a set of related resources together by publishing and catalog presentation concerns. Contains at least one resource.",
        example: {
            ordId: "sap.s4:package:SalesOrder:v1",
            title: "Sales Order Management",
            shortDescription: "APIs and events for sales order processing",
            description:
                "Complete sales order management capabilities including creation, modification, and lifecycle management.",
            version: "1.2.3",
            vendor: "sap:vendor:SAP:",
        },
        keyProperties: [
            "ordId: Unique package identifier (MANDATORY)",
            "title: Human-readable title (MANDATORY)",
            "shortDescription: Plain text short description (MANDATORY)",
            "description: Full description in CommonMark (MANDATORY)",
            "version: Semantic version following SemVer 2.0.0 (MANDATORY)",
            "vendor: Creator/responsible party vendor reference (MANDATORY)",
            "localId: Locally unique ID within the system (OPTIONAL)",
            "partOfProducts: List of products this package belongs to (OPTIONAL)",
            "countries: List of applicable country codes (ISO-3166 ALPHA-2) (OPTIONAL)",
            "lineOfBusiness: List of line of business tags (OPTIONAL)",
            "industry: List of industry tags (OPTIONAL)",
            "tags: List of free text style tags (OPTIONAL)",
            "labels: Generic labels (OPTIONAL)",
            "documentationLabels: Documentation labels (OPTIONAL)",
            "packageLinks: Links with specific semantic meaning (OPTIONAL)",
            "links: Generic links (OPTIONAL)",
            "licenseType: SPDX License identifier (OPTIONAL)",
            "supportInfo: Support ticket information (OPTIONAL)",
            "runtimeRestriction: System namespace restriction (OPTIONAL)",
            "policyLevels: List of policy levels for compliance (OPTIONAL)",
        ],
    },
    ConsumptionBundle: {
        description:
            "Groups APIs and Events that can be consumed with the same credentials and auth mechanism. Includes access instructions.",
        example: {
            ordId: "sap.s4:consumptionBundle:SalesOrderBundle:v1",
            title: "Sales Order API Bundle",
            shortDescription: "All Sales Order APIs consumable with single credential set",
            version: "1.0.0",
        },
        keyProperties: [
            "ordId: Unique bundle identifier (MANDATORY)",
            "title: Human-readable title (MANDATORY)",
            "localId: Locally unique ID within the system (OPTIONAL)",
            "shortDescription: Plain text short description (OPTIONAL)",
            "description: Full description in CommonMark (OPTIONAL)",
            "version: Semantic version following SemVer 2.0.0 (RECOMMENDED)",
            "lastUpdate: Date-time of last change (RECOMMENDED)",
            "visibility: Who can see the bundle (public/internal/private) (OPTIONAL)",
            "correlationIds: References to related data in other repositories (OPTIONAL)",
            "credentialExchangeStrategies: Supported credential exchange methods (OPTIONAL)",
            "links: Generic links (OPTIONAL)",
            "tags: List of free text style tags (OPTIONAL)",
            "labels: Generic labels (OPTIONAL)",
            "documentationLabels: Documentation labels (OPTIONAL)",
        ],
    },
    APIResource: {
        description:
            "High-level description of an exposed API. Bundles multiple endpoints sharing the same namespace and lifecycle.",
        example: {
            ordId: "sap.s4:apiResource:API_SALES_ORDER_SRV:v1",
            title: "Sales Order Service",
            shortDescription: "Service for managing sales orders",
            description: "Complete sales order management API with CRUD operations",
            partOfPackage: "sap.s4:package:SalesOrder:v1",
            version: "1.0.0",
            visibility: "public",
            releaseStatus: "active",
            apiProtocol: "odata-v4",
        },
        keyProperties: [
            "ordId: Unique API identifier (MANDATORY)",
            "title: Human-readable title (MANDATORY)",
            "shortDescription: Plain text short description (MANDATORY)",
            "description: Full description in CommonMark (MANDATORY)",
            "partOfPackage: Reference to containing package (MANDATORY)",
            "version: Semantic version following SemVer 2.0.0 (MANDATORY)",
            "visibility: Who can see the API (public/internal/private) (MANDATORY)",
            "releaseStatus: Stability status (beta/active/deprecated/sunset) (MANDATORY)",
            "apiProtocol: Protocol type (odata-v2/odata-v4/rest/graphql/soap-inbound/etc.) (MANDATORY)",
            "localId: Locally unique ID within the system (OPTIONAL)",
            "correlationIds: References to related data in other repositories (OPTIONAL)",
            "partOfGroups: Groups this resource is assigned to (OPTIONAL)",
            "partOfConsumptionBundles: Consumption bundles containing this API (OPTIONAL)",
            "defaultConsumptionBundle: Default consumption bundle reference (OPTIONAL)",
            "partOfProducts: Products this API is part of (OPTIONAL)",
            "lastUpdate: Date-time of last change (OPTIONAL)",
            "disabled: Whether API is currently unavailable (OPTIONAL)",
            "minSystemVersion: Minimum system version required (OPTIONAL)",
            "deprecationDate: When API was deprecated (OPTIONAL)",
            "sunsetDate: When API will be decommissioned (OPTIONAL)",
            "successors: Successor API resources (OPTIONAL)",
            "changelogEntries: Version change summaries (OPTIONAL)",
            "entryPoints: List of API endpoints (OPTIONAL)",
            "direction: API consumption direction (inbound/outbound/mixed) (OPTIONAL)",
            "resourceDefinitions: Machine-readable API definitions (OPTIONAL)",
            "implementationStandard: Standard API contract implemented (OPTIONAL)",
            "customImplementationStandard: Custom standard specification ID (OPTIONAL)",
            "customImplementationStandardDescription: Custom standard description (OPTIONAL)",
            "compatibleWith: Interface compatibility references (OPTIONAL)",
            "responsible: Organization responsible for the API (OPTIONAL)",
            "supportedUseCases: Intended use case types (OPTIONAL)",
            "usage: API accessibility scope (external/local) (OPTIONAL)",
            "exposedEntityTypes: Entity types exposed by the API (OPTIONAL)",
            "apiResourceLinks: API-specific semantic links (OPTIONAL)",
            "links: Generic links (OPTIONAL)",
            "extensible: Extensibility information (OPTIONAL)",
            "countries: Applicable country codes (OPTIONAL)",
            "lineOfBusiness: Line of business tags (OPTIONAL)",
            "industry: Industry tags (OPTIONAL)",
            "tags: Free text tags (OPTIONAL)",
            "labels: Generic labels (OPTIONAL)",
            "documentationLabels: Documentation labels (OPTIONAL)",
            "policyLevels: Compliance policy levels (OPTIONAL)",
        ],
    },
    EventResource: {
        description:
            "High-level description of a collection of related Events. Groups events based on same resource/Business Object.",
        example: {
            ordId: "sap.s4:eventResource:SalesOrderEvents:v1",
            title: "Sales Order Events",
            shortDescription: "All events related to sales order lifecycle",
            description: "Events published during sales order creation, modification, and completion",
            partOfPackage: "sap.s4:package:SalesOrder:v1",
            version: "1.0.0",
            visibility: "public",
            releaseStatus: "active",
        },
        keyProperties: [
            "ordId: Unique event resource identifier (MANDATORY)",
            "title: Human-readable title (MANDATORY)",
            "shortDescription: Plain text short description (MANDATORY)",
            "description: Full description in CommonMark (MANDATORY)",
            "partOfPackage: Reference to containing package (MANDATORY)",
            "version: Semantic version following SemVer 2.0.0 (MANDATORY)",
            "visibility: Who can see the events (public/internal/private) (MANDATORY)",
            "releaseStatus: Stability status (beta/active/deprecated/sunset) (MANDATORY)",
            "localId: Locally unique ID within the system (OPTIONAL)",
            "correlationIds: References to related data in other repositories (OPTIONAL)",
            "partOfGroups: Groups this resource is assigned to (OPTIONAL)",
            "partOfConsumptionBundles: Consumption bundles containing these events (OPTIONAL)",
            "defaultConsumptionBundle: Default consumption bundle reference (OPTIONAL)",
            "partOfProducts: Products these events are part of (OPTIONAL)",
            "lastUpdate: Date-time of last change (RECOMMENDED)",
            "disabled: Whether events are currently unavailable (OPTIONAL)",
            "minSystemVersion: Minimum system version required (OPTIONAL)",
            "deprecationDate: When events were deprecated (OPTIONAL)",
            "sunsetDate: When events will be decommissioned (OPTIONAL)",
            "successors: Successor event resources (OPTIONAL)",
            "changelogEntries: Version change summaries (OPTIONAL)",
            "resourceDefinitions: Machine-readable event definitions (OPTIONAL)",
            "implementationStandard: Standard event contract implemented (OPTIONAL)",
            "customImplementationStandard: Custom standard specification ID (OPTIONAL)",
            "customImplementationStandardDescription: Custom standard description (OPTIONAL)",
            "compatibleWith: Interface compatibility references (OPTIONAL)",
            "responsible: Organization responsible for the events (OPTIONAL)",
            "exposedEntityTypes: Entity types exposed by the events (OPTIONAL)",
            "eventResourceLinks: Event-specific semantic links (OPTIONAL)",
            "links: Generic links (OPTIONAL)",
            "extensible: Extensibility information (OPTIONAL)",
            "countries: Applicable country codes (OPTIONAL)",
            "lineOfBusiness: Line of business tags (OPTIONAL)",
            "industry: Industry tags (OPTIONAL)",
            "tags: Free text tags (OPTIONAL)",
            "labels: Generic labels (OPTIONAL)",
            "documentationLabels: Documentation labels (OPTIONAL)",
            "policyLevels: Compliance policy levels (OPTIONAL)",
        ],
    },
    EntityType: {
        description:
            "Describes a business concept/term or underlying conceptual model. Same entity type can be exposed through multiple APIs and events.",
        example: {
            ordId: "sap.odm:entityType:BusinessPartner:v1",
            localId: "BusinessPartner",
            title: "Business Partner",
            shortDescription: "A business partner is a person, organization, or group with business interest",
            partOfPackage: "sap.odm:package:MasterData:v1",
            version: "1.0.0",
            visibility: "public",
            releaseStatus: "active",
            level: "aggregate",
        },
        keyProperties: [
            "ordId: Unique entity type identifier (MANDATORY)",
            "localId: Locally unique ID within the system (MANDATORY)",
            "title: Human-readable title (MANDATORY)",
            "partOfPackage: Reference to containing package (MANDATORY)",
            "version: Semantic version following SemVer 2.0.0 (MANDATORY)",
            "visibility: Who can see the entity type (public/internal/private) (MANDATORY)",
            "releaseStatus: Stability status (beta/active/deprecated/sunset) (MANDATORY)",
            "level: Abstraction level using DDD terminology (aggregate/root-entity/sub-entity) (MANDATORY)",
            "correlationIds: References to related data in other repositories (OPTIONAL)",
            "shortDescription: Plain text short description (OPTIONAL)",
            "description: Full description in CommonMark (OPTIONAL)",
            "partOfGroups: Groups this entity type is assigned to (OPTIONAL)",
            "partOfProducts: Products this entity type is part of (OPTIONAL)",
            "lastUpdate: Date-time of last change (RECOMMENDED)",
            "deprecationDate: When entity type was deprecated (OPTIONAL)",
            "sunsetDate: When entity type will be decommissioned (OPTIONAL)",
            "successors: Successor entity types (OPTIONAL)",
            "changelogEntries: Version change summaries (OPTIONAL)",
            "relatedEntityTypes: Related entity type references (OPTIONAL)",
            "links: Generic links (OPTIONAL)",
            "extensible: Extensibility information (OPTIONAL)",
            "tags: Free text tags (OPTIONAL)",
            "labels: Generic labels (OPTIONAL)",
            "documentationLabels: Documentation labels (OPTIONAL)",
            "policyLevels: Compliance policy levels (OPTIONAL)",
        ],
    },
    Capability: {
        description:
            "Use case specific capabilities, features, or additional information that needs to be understood from outside. Generic concept covering many capability discovery use cases.",
        example: {
            ordId: "sap.s4:capability:fieldExtensibility:v1",
            type: "custom",
            customType: "sap:field-extensibility:v1",
            title: "Field Extensibility",
            shortDescription: "Capability to extend business objects with custom fields",
            partOfPackage: "sap.s4:package:Extensibility:v1",
            version: "1.0.0",
            visibility: "public",
            releaseStatus: "active",
        },
        keyProperties: [
            "ordId: Unique capability identifier (MANDATORY)",
            "type: Type of capability or 'custom' (MANDATORY)",
            "title: Human-readable title (MANDATORY)",
            "partOfPackage: Reference to containing package (MANDATORY)",
            "version: Semantic version following SemVer 2.0.0 (MANDATORY)",
            "visibility: Who can see the capability (public/internal/private) (MANDATORY)",
            "releaseStatus: Stability status (beta/active/deprecated/sunset) (MANDATORY)",
            "localId: Locally unique ID within the system (OPTIONAL)",
            "correlationIds: References to related data in other repositories (OPTIONAL)",
            "customType: Specification ID if type is 'custom' (OPTIONAL)",
            "shortDescription: Plain text short description (OPTIONAL)",
            "description: Full description in CommonMark (OPTIONAL)",
            "partOfGroups: Groups this capability is assigned to (OPTIONAL)",
            "lastUpdate: Date-time of last change (RECOMMENDED)",
            "disabled: Whether capability is currently unavailable (OPTIONAL)",
            "minSystemVersion: Minimum system version required (OPTIONAL)",
            "relatedEntityTypes: Related entity type references (OPTIONAL)",
            "definitions: Machine-readable capability definitions (OPTIONAL)",
            "links: Generic links (OPTIONAL)",
            "tags: Free text tags (OPTIONAL)",
            "labels: Generic labels (OPTIONAL)",
            "documentationLabels: Documentation labels (OPTIONAL)",
        ],
    },
    DataProduct: {
        description:
            "A data set exposed for consumption outside the boundaries of the producing application via APIs, described by high quality metadata.",
        example: {
            ordId: "sap.cic:dataProduct:CustomerOrder:v1",
            title: "Customer Order",
            shortDescription: "Offering access to all online and offline orders submitted by customers",
            description: "Complete customer order dataset with customer view perspective",
            partOfPackage: "sap.cic:package:CustomerData:v1",
            version: "1.0.0",
            visibility: "public",
            releaseStatus: "active",
        },
        keyProperties: [
            "ordId: Unique data product identifier (MANDATORY)",
            "title: Human-readable title (MANDATORY)",
            "shortDescription: Plain text short description (MANDATORY)",
            "description: Full description in CommonMark (MANDATORY)",
            "partOfPackage: Reference to containing package (MANDATORY)",
            "version: Semantic version following SemVer 2.0.0 (MANDATORY)",
            "visibility: Who can see the data product (public/internal/private) (MANDATORY)",
            "releaseStatus: Stability status (beta/active/deprecated/sunset) (MANDATORY)",
            "localId: Locally unique ID within the system (OPTIONAL)",
            "correlationIds: References to related data in other repositories (OPTIONAL)",
            "partOfGroups: Groups this data product is assigned to (OPTIONAL)",
            "partOfProducts: Products this data product is part of (OPTIONAL)",
            "lastUpdate: Date-time of last change (RECOMMENDED)",
            "disabled: Whether data product is currently unavailable (OPTIONAL)",
            "minSystemVersion: Minimum system version required (OPTIONAL)",
            "deprecationDate: When data product was deprecated (OPTIONAL)",
            "sunsetDate: When data product will be decommissioned (OPTIONAL)",
            "successors: Successor data products (OPTIONAL)",
            "changelogEntries: Version change summaries (OPTIONAL)",
            "category: High level data product category (OPTIONAL)",
            "outputPorts: Endpoints where data can be consumed (OPTIONAL)",
            "responsible: Organization responsible for the data product (OPTIONAL)",
            "dataProductLinks: Data product specific semantic links (OPTIONAL)",
            "links: Generic links (OPTIONAL)",
            "type: Type classification (primary/derived/algorithm) (OPTIONAL)",
            "inputPorts: Data sources and dependencies (OPTIONAL)",
            "extensible: Extensibility information (OPTIONAL)",
            "countries: Applicable country codes (OPTIONAL)",
            "lineOfBusiness: Line of business tags (OPTIONAL)",
            "industry: Industry tags (OPTIONAL)",
            "tags: Free text tags (OPTIONAL)",
            "labels: Generic labels (OPTIONAL)",
            "documentationLabels: Documentation labels (OPTIONAL)",
            "policyLevels: Compliance policy levels (OPTIONAL)",
        ],
    },

    // ===== ADDITIONAL ORD ENTITIES =====
    Vendor: {
        description: "Information about a vendor/organization that provides products, packages, or resources.",
        example: {
            ordId: "sap:vendor:SAP:",
            title: "SAP SE",
            shortDescription: "Leading provider of enterprise software solutions",
            homePage: "https://www.sap.com",
            contactInfo: "info@sap.com",
        },
        keyProperties: [
            "ordId: Unique vendor identifier (MANDATORY)",
            "title: Human-readable vendor name (MANDATORY)",
            "shortDescription: Brief description of the vendor (OPTIONAL)",
            "description: Full description in CommonMark (OPTIONAL)",
            "homePage: Vendor's official website URL (OPTIONAL)",
            "contactInfo: Contact information (email, phone, etc.) (OPTIONAL)",
            "documentationLabels: Documentation labels (OPTIONAL)",
            "labels: Generic labels (OPTIONAL)",
            "tags: Free text tags (OPTIONAL)",
        ],
    },

    Group: {
        description: "Logical grouping mechanism for organizing related resources across packages.",
        example: {
            groupId: "sap.s4:group:SalesManagement",
            groupTypeId: "functional-area",
            title: "Sales Management",
            shortDescription: "All resources related to sales order management and processing",
        },
        keyProperties: [
            "groupId: Unique group identifier (MANDATORY)",
            "groupTypeId: Reference to the group type (MANDATORY)",
            "title: Human-readable group name (MANDATORY)",
            "shortDescription: Brief description of the group (OPTIONAL)",
            "description: Full description in CommonMark (OPTIONAL)",
            "documentationLabels: Documentation labels (OPTIONAL)",
            "labels: Generic labels (OPTIONAL)",
            "tags: Free text tags (OPTIONAL)",
        ],
    },

    GroupType: {
        description: "Defines the type and behavior of resource groups.",
        example: {
            groupTypeId: "functional-area",
            title: "Functional Area",
            shortDescription: "Groups resources by business functional area",
            description: "Organizes APIs and Events according to business functionality",
        },
        keyProperties: [
            "groupTypeId: Unique group type identifier (MANDATORY)",
            "title: Human-readable type name (MANDATORY)",
            "shortDescription: Brief description of the group type (OPTIONAL)",
            "description: Full description in CommonMark (OPTIONAL)",
            "documentationLabels: Documentation labels (OPTIONAL)",
            "labels: Generic labels (OPTIONAL)",
            "tags: Free text tags (OPTIONAL)",
        ],
    },

    IntegrationDependency: {
        description: "Describes dependencies on external systems or services for integration scenarios.",
        example: {
            ordId: "sap.s4:integrationDependency:SalesForce:v1",
            title: "Salesforce Integration",
            shortDescription: "Integration dependency for customer data synchronization",
            description: "Required integration with Salesforce CRM for customer master data sync",
            partOfPackage: "sap.s4:package:CustomerIntegration:v1",
            version: "1.0.0",
            visibility: "public",
        },
        keyProperties: [
            "ordId: Unique integration dependency identifier (MANDATORY)",
            "title: Human-readable title (MANDATORY)",
            "shortDescription: Brief description of the dependency (MANDATORY)",
            "description: Full description in CommonMark (MANDATORY)",
            "partOfPackage: Reference to containing package (MANDATORY)",
            "version: Semantic version following SemVer 2.0.0 (MANDATORY)",
            "visibility: Who can see the dependency (public/internal/private) (MANDATORY)",
            "localId: Locally unique ID within the system (OPTIONAL)",
            "correlationIds: References to related data in other repositories (OPTIONAL)",
            "partOfGroups: Groups this dependency is assigned to (OPTIONAL)",
            "partOfProducts: Products this dependency is part of (OPTIONAL)",
            "lastUpdate: Date-time of last change (OPTIONAL)",
            "aspectEventResources: Event resources related to this dependency (OPTIONAL)",
            "aspects: Integration aspects and requirements (OPTIONAL)",
            "mandatory: Whether this dependency is mandatory (OPTIONAL)",
            "links: Generic links (OPTIONAL)",
            "tags: Free text tags (OPTIONAL)",
            "labels: Generic labels (OPTIONAL)",
            "documentationLabels: Documentation labels (OPTIONAL)",
        ],
    },

    Tombstone: {
        description: "Marker for resources that have been removed, providing information about deletion.",
        example: {
            ordId: "sap.s4:apiResource:DEPRECATED_API:v1",
            removalDate: "2024-01-15T10:30:00Z",
            description: "This API has been deprecated and removed. Use APIResourceV2 instead.",
            successors: ["sap.s4:apiResource:API_V2:v1"],
        },
        keyProperties: [
            "ordId: ORD ID of the removed resource (MANDATORY)",
            "removalDate: Date when the resource was removed (MANDATORY)",
            "description: Reason for removal and migration information (OPTIONAL)",
            "successors: List of successor resource ORD IDs (OPTIONAL)",
        ],
    },
});

// Helper function to validate concept names
export function validateConceptName(conceptName) {
    if (!conceptName || typeof conceptName !== "string") {
        throw new Error("Concept name must be a non-empty string");
    }
    
    const normalizedName = conceptName.trim();
    if (!normalizedName) {
        throw new Error("Concept name cannot be empty or whitespace only");
    }
    
    // Check if the concept exists in our ORD_CONCEPTS
    const conceptKeys = Object.keys(ORD_CONCEPTS);
    const matchingKey = conceptKeys.find(key => 
        key.toLowerCase() === normalizedName.toLowerCase()
    );
    
    if (!matchingKey) {
        const availableConcepts = conceptKeys.join(", ");
        throw new Error(`Unknown concept: ${normalizedName}. Available concepts: ${availableConcepts}`);
    }
    
    return matchingKey;
}

// Helper function to build concept explanations
export function buildConceptExplanation(conceptName) {
    const concept = ORD_CONCEPTS[conceptName];
    if (!concept) {
        throw new Error(`Concept ${conceptName} not found`);
    }
    
    let explanation = `# ORD Concept: ${conceptName}\n\n`;
    explanation += `## Description\n${concept.description}\n\n`;
    
    if (concept.keyProperties && concept.keyProperties.length > 0) {
        explanation += `## Key Properties\n`;
        concept.keyProperties.forEach(property => {
            explanation += `- ${property}\n`;
        });
        explanation += `\n`;
    }
    
    if (concept.example) {
        explanation += `## Example\n\`\`\`json\n${JSON.stringify(concept.example, null, 2)}\n\`\`\`\n\n`;
    }
    
    return explanation;
}

// Export the concepts and helper functions
export { ORD_CONCEPTS };

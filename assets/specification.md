# ORD Specification (Offline Fallback)

This is a minimal offline fallback document for the ORD specification used by the MCP server when online sources are unavailable.

## Overview

Open Resource Discovery (ORD) defines a standardized way to describe products, capabilities, and consumable resources such as APIs and events.

## Core Concepts

- Product: A commercial offering or logical grouping of capabilities.
- Capability: A business functionality provided by a product.
- API Resource: A consumable API endpoint (REST, OData, GraphQL, etc.).
- Event Resource: Events that can be subscribed to, enabling event-driven integrations.
- Consumption Bundle: A grouping of resources and associated access strategies.
- Package: A container for grouping and versioning related resources.

## IDs

ORD IDs follow a namespaced pattern like `namespace:type:name:version`.

## Links

For full documentation, please refer to the official repositories when online.

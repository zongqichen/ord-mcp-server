// Isolated I/O operations for fetching ORD specification
import fetch from "node-fetch";

// Configuration constants
const ORD_SPEC_URL = "https://raw.githubusercontent.com/open-resource-discovery/specification/main/docs/spec-v1/index.md";
const REQUEST_TIMEOUT_MS = 10000;

/**
 * Fetch ORD specification from GitHub with timeout and error handling.
 * @returns {Promise<string>} The specification content as markdown
 * @throws {Error} Network or timeout errors with context
 */
export async function fetchSpecification() {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
        const response = await fetch(ORD_SPEC_URL, {
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: Failed to fetch specification`);
        }

        const content = await response.text();

        if (!content || typeof content !== "string") {
            throw new Error("Invalid response: expected string content");
        }

        return content;
    } catch (error) {
        clearTimeout(timeoutId);

        // Handle specific error types with context
        if (error.name === "AbortError") {
            throw new Error(`Request timeout after ${REQUEST_TIMEOUT_MS}ms`);
        }

        // Re-throw formatted errors or add context
        const message = error.message || "Unknown fetch error";
        throw new Error(`Failed to fetch specification: ${message}`);
    }
}

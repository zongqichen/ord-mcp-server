// Isolated I/O operations for fetching ORD specification
import axios from "axios";
import { ORD_SPEC_URL, REQUEST_TIMEOUT_MS } from "./constants.js";

// Isolated I/O operations with explicit error handling
export async function fetchSpecification() {
    try {
        const response = await axios.get(ORD_SPEC_URL, {
            timeout: REQUEST_TIMEOUT_MS,
            // Fail fast on client errors
            validateStatus: (status) => status >= 200 && status < 300,
        });

        if (!response.data || typeof response.data !== "string") {
            throw new Error("Invalid response: expected string content");
        }

        return response.data;
    } catch (error) {
        // Add context for debugging without exposing internals
        if (error.code === "ECONNABORTED") {
            throw new Error(`Request timeout after ${REQUEST_TIMEOUT_MS}ms`);
        }
        if (error.response?.status) {
            throw new Error(`HTTP ${error.response.status}: Failed to fetch specification`);
        }
        throw new Error(`Network error: ${error.message}`);
    }
}

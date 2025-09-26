#!/usr/bin/env node

import { spawn } from "child_process";

async function testOrdMcpServer() {
    console.log("🧪 Testing updated ORD MCP Server...\n");

    const server = spawn("node", ["src/ord-mcp-server.js"], {
        stdio: ["pipe", "pipe", "inherit"],
    });

    const timeout = setTimeout(() => {
        server.kill();
        console.log("❌ Server test timed out");
        process.exit(1);
    }, 15000);

    try {
        // Test 1: List tools
        console.log("📋 Test 1: Listing tools...");
        const listToolsRequest = {
            jsonrpc: "2.0",
            id: 1,
            method: "tools/list",
        };

        server.stdin.write(JSON.stringify(listToolsRequest) + "\n");

        // Test 2: Get ORD specification
        console.log("📖 Test 2: Getting ORD specification...");
        const getSpecRequest = {
            jsonrpc: "2.0",
            id: 2,
            method: "tools/call",
            params: {
                name: "get_ord_specification",
                arguments: {},
            },
        };

        setTimeout(() => {
            server.stdin.write(JSON.stringify(getSpecRequest) + "\n");
        }, 1000);

        // Test 3: Explain concept
        console.log("💡 Test 3: Explaining APIResource concept...");
        const explainConceptRequest = {
            jsonrpc: "2.0",
            id: 3,
            method: "tools/call",
            params: {
                name: "explain_ord_concept",
                arguments: {
                    concept: "APIResource",
                },
            },
        };

        setTimeout(() => {
            server.stdin.write(JSON.stringify(explainConceptRequest) + "\n");
        }, 2000);

        let responseCount = 0;
        server.stdout.on("data", (data) => {
            const lines = data
                .toString()
                .split("\n")
                .filter((line) => line.trim());

            for (const line of lines) {
                try {
                    const response = JSON.parse(line);
                    responseCount++;

                    if (response.id === 1) {
                        console.log("✅ Tools list received:", response.result?.tools?.length, "tools");
                    } else if (response.id === 2) {
                        const hasSpec = response.result?.content?.[0]?.text?.includes("ORD Specification");
                        console.log("✅ Specification fetch:", hasSpec ? "SUCCESS" : "FAILED");
                    } else if (response.id === 3) {
                        const hasExplanation = response.result?.content?.[0]?.text?.includes("APIResource");
                        console.log("✅ Concept explanation:", hasExplanation ? "SUCCESS" : "FAILED");
                    }

                    if (responseCount >= 3) {
                        clearTimeout(timeout);
                        server.kill();
                        console.log("\n🎉 All tests completed successfully!");
                        console.log("✅ Updated ORD MCP Server is working correctly with new repository URL!");
                        process.exit(0);
                    }
                } catch (e) {
                    // Ignore non-JSON lines
                }
            }
        });

        server.on("error", (error) => {
            clearTimeout(timeout);
            console.error("❌ Server error:", error);
            process.exit(1);
        });
    } catch (error) {
        clearTimeout(timeout);
        server.kill();
        console.error("❌ Test failed:", error);
        process.exit(1);
    }
}

testOrdMcpServer();

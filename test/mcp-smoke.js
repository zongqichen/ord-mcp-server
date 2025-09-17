#!/usr/bin/env node

// Minimal MCP client over stdio to smoke test the ORD MCP Server.
// It will spawn the server via node src/index.js, list tools, and call one tool.

import { spawn } from 'node:child_process';

function sendAndWait(connection, msg, predicate, timeoutMs = 10000) {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Timed out waiting for response')), timeoutMs);
        const onData = (data) => {
            try {
                const str = data.toString('utf8');
                // Handle possible Content-Length framed messages (MCP/JSON-RPC over stdio may be raw JSON in this SDK)
                const parts = str.split('\n');
                for (const line of parts) {
                    if (!line.trim()) continue;
                    try {
                        const obj = JSON.parse(line);
                        if (predicate(obj)) {
                            clearTimeout(timeout);
                            connection.stdout.off('data', onData);
                            return resolve(obj);
                        }
                    } catch (e) {
                        // Ignore partial lines or non-JSON logs
                    }
                }
            } catch (e) {
                // ignore
            }
        };
        connection.stdout.on('data', onData);
        connection.stdin.write(JSON.stringify(msg) + '\n');
    });
}

(async () => {
    console.log('🚀 Starting MCP smoke test...');
    const server = spawn('node', ['src/index.js'], {
        cwd: new URL('..', import.meta.url).pathname,
        env: {
            ...process.env,
            ORD_CACHE_TTL: '60',
            ORD_LOG_LEVEL: 'info'
        }
    });

    server.stderr.on('data', (d) => process.stderr.write(`[server] ${d}`));

    // JSON-RPC 2.0 basics
    let id = 0;
    const nextId = () => ++id;

    // 1) Initialize handshake (MCP uses JSON-RPC; the SDK handles some details,
    // but for smoke we can directly call list_tools which the server setRequestHandler supports)

    // Send list_tools request
    const listToolsReq = {
        jsonrpc: '2.0',
        id: nextId(),
        method: 'tools/list'
    };

    const listToolsResp = await sendAndWait(server, listToolsReq, (obj) => obj.id === listToolsReq.id);
    if (!listToolsResp.result || !Array.isArray(listToolsResp.result.tools)) {
        throw new Error('Unexpected list tools response');
    }
    console.log(`✅ tools/list returned ${listToolsResp.result.tools.length} tool(s)`);

    // 2) Call a simple tool: explain_ord_concept
    const callToolReq = {
        jsonrpc: '2.0',
        id: nextId(),
        method: 'tools/call',
        params: {
            name: 'explain_ord_concept',
            arguments: { concept: 'Product', includeExamples: true }
        }
    };

    const callToolResp = await sendAndWait(server, callToolReq, (obj) => obj.id === callToolReq.id, 20000);
    if (!callToolResp.result || !Array.isArray(callToolResp.result.content)) {
        throw new Error('Unexpected call tool response');
    }
    const text = callToolResp.result.content.find(c => c.type === 'text')?.text || '';
    console.log('✅ tools/call explain_ord_concept responded with text length:', text.length);

    // Done
    server.kill('SIGINT');
    console.log('🎉 Smoke test passed');
    process.exit(0);
})().catch(err => {
    console.error('❌ Smoke test failed:', err.message);
    process.exit(1);
});

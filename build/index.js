"use strict";
/**
 * Monad MCP Tutorial
 *
 * This file demonstrates how to create a Model Context Protocol (MCP) server
 * that interacts with the Monad blockchain testnet to check MON balances.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.monadTestnet = void 0;
// Import necessary dependencies
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const zod_1 = require("zod");
const viem_1 = require("viem");
// Define the Monad testnet chain configuration
exports.monadTestnet = (0, viem_1.defineChain)({
    id: 10_143,
    name: "Monad Testnet",
    nativeCurrency: {
        name: "Testnet MON Token",
        symbol: "MON",
        decimals: 18,
    },
    rpcUrls: {
        default: {
            http: ["https://testnet-rpc.monad.xyz"],
        },
    },
    blockExplorers: {
        default: {
            name: "Monad Testnet explorer",
            url: "https://testnet.monadexplorer.com",
        },
    },
    testnet: true,
});
// Create a public client to interact with the Monad testnet
const publicClient = (0, viem_1.createPublicClient)({
    chain: exports.monadTestnet,
    transport: (0, viem_1.http)(),
});
// Initialize the MCP server with a name, version, and capabilities
const server = new mcp_js_1.McpServer({
    name: "monad-testnet",
    version: "0.0.1",
    // Array of supported tool names that clients can call
    capabilities: ["get-mon-balance"]
});
// Define a tool that gets the MON balance for a given address
server.tool(
// Tool ID 
"get-mon-balance", 
// Description of what the tool does
"Get MON balance for an address on Monad testnet", 
// Input schema
{
    address: zod_1.z.string().describe("Monad testnet address to check balance for"),
}, 
// Tool implementation
async ({ address }) => {
    try {
        // Check MON balance for the input address
        const balance = await publicClient.getBalance({
            address: address,
        });
        // Return a human friendly message indicating the balance.
        return {
            content: [
                {
                    type: "text",
                    text: `Balance for ${address}: ${(0, viem_1.formatUnits)(balance, 18)} MON`,
                },
            ],
        };
    }
    catch (error) {
        // If the balance check process fails, return a graceful message back to the MCP client indicating a failure.
        return {
            content: [
                {
                    type: "text",
                    text: `Failed to retrieve balance for address: ${address}. Error: ${error instanceof Error ? error.message : String(error)}`,
                },
            ],
        };
    }
});
/**
 * Main function to start the MCP server
 * Uses stdio for communication with LLM clients
 */
async function main() {
    // Create a transport layer using standard input/output
    const transport = new stdio_js_1.StdioServerTransport();
    // Connect the server to the transport
    await server.connect(transport);
    console.error("Monad testnet MCP Server running on stdio");
}
// Start the server and handle any fatal errors
main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});

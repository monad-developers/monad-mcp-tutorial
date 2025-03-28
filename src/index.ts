/**
 * Monad MCP Tutorial
 * 
 * This file demonstrates how to create a Model Context Protocol (MCP) server
 * that interacts with the Monad blockchain testnet to check MON balances.
 */

// Import necessary dependencies
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { createPublicClient, defineChain, formatUnits, http } from "viem";
import { monadTestnet } from "viem/chains";

// Create a public client to interact with the Monad testnet
const publicClient = createPublicClient({
    chain: monadTestnet,
    transport: http(),
});

// Initialize the MCP server with a name, version, and capabilities
const server = new McpServer({
    name: "monad-mcp-tutorial",
    version: "0.0.1",
});

// Define a tool that gets the MON balance for a given address
server.tool(
    "get-mon-balance",
    "Get MON balance for an address on Monad testnet",
    {
      address: z.string().describe("Monad testnet address to check balance for"),
    },
    async ({ address }) => {
      try {
        const balance = await publicClient.getBalance({
          address: address as `0x${string}`,
        });
  
        return {
          content: [
            {
              type: "text",
              text: `Balance for ${address}: ${formatUnits(balance, 18)} MON`,
            },
          ],
        };
      } catch (error) {
        console.error("Error getting balance:", error);
        return {
          content: [
            {
              type: "text",
              text: `Failed to retrieve balance for address: ${address}. Error: ${
                error instanceof Error ? error.message : String(error)
              }`,
            },
          ],
        };
      }
    }
);

// Define a tool that gets the NFT portfolio for a given address on Monad testnet


// Define a tool that gets trending NFT collections on Monad testnet


/**
 * Main function to start the MCP server
 * Uses stdio for communication with LLM clients
 */
async function main() {
    // Create a transport layer using standard input/output
    const transport = new StdioServerTransport();
    
    // Connect the server to the transport
    await server.connect(transport);
    
    console.error("Monad testnet MCP Server running on stdio");
}

// Start the server and handle any fatal errors
main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});

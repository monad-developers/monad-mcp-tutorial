# Monad MCP Tutorial (Advanced)

This project demonstrates how to create a MCP server that interacts with the Monad testnet. The server provides a tool for get NFT portfolio of a wallet address and get trending NFT collections on Monad Testnet.

## What is MCP?

The Model Context Protocol (MCP) is a standard that allows AI models to interact with external tools and services. 

In this tutorial, we're creating an MCP server that allows MCP Client (Claude Desktop) to query Monad testnet to get NFT portfolio of a wallet address and get trending NFT collections on Monad Testnet.

## Prerequisites

- Node.js (v16 or later)
- `npm` or `yarn`
- Claude Desktop

## Getting Started

1. Clone this repository

```shell
git clone https://github.com/monad-developers/monad-mcp-tutorial.git
```

2. Switch to `advanced-starter` branch

```shell
git checkout advanced-starter
```

3. Install dependencies:

```
npm install
```

## Building the MCP server

Monad Testnet related configuration is already added to `index.ts` in the `src` folder.

### Define the server instance

```ts
// Create a new MCP server instance
const server = new McpServer({
  name: "monad-mcp-tutorial",
  version: "0.0.1",
  // Array of supported tool names that clients can call
  capabilities: ["get-mon-balance", "get-nft-portfolio", "get-trending-nft-collections"]
});
```

### Defining the NFT portfolio tool

Below is the scaffold of the `get-nft-portfolio` tool:

```ts
server.tool(
  // Tool Id
  "get-nft-portfolio",
  "Get NFT portfolio for an address on Monad testnet",
  // Input schema
  {
      address: z.string().describe("Monad testnet address to check NFT portfolio for"),
  },
  async ({ address }) => {
      // Code to get NFT portfolio
  }
);
```

Let's add the NFT portfolio implementation to the tool:

```ts
server.tool(
  "get-nft-portfolio",
  "Get NFT portfolio for an address on Monad testnet",
  {
    address: z.string().describe("Monad testnet address to check NFT portfolio for"),
  },
  async ({ address }) => {
    try {
      // Call the Reservoir API to get user's NFT tokens
    const response = await fetch(`https://api-monad-testnet.reservoir.tools/users/${address}/tokens/v10`);
      
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
      
    const data = await response.json();
      
    // Format the tokens data for display
    const nftCount = data.tokens?.length || 0;
      let nftList = '';
      
      if (nftCount > 0) {
        nftList = data.tokens.map((item: any) => {
          const token = item.token;
          const collection = token.collection || {};
          const ownership = item.ownership || {};
          
          let nftDetails = [
            `- Name: ${token.name || 'Unnamed NFT'}`,
            `  Collection: ${collection.name || 'Unknown collection'}`,
            `  Token ID: ${token.tokenId}`,
            `  Contract: ${token.contract}`,
            `  Type: ${token.kind || 'Unknown type'}`
          ];
        
          // Add rarity info if available
          if (token.rarityScore && token.rarityRank) {
            nftDetails.push(`Rarity: Rank #${token.rarityRank} (Score: ${token.rarityScore.toFixed(2)})`);
          }
          
          // Add collection floor price if available
          if (collection.floorAsk?.price?.amount?.decimal) {
            const currency = collection.floorAsk.price.currency?.symbol || 'MON';
            nftDetails.push(`Collection Floor: ${collection.floorAsk.price.amount.decimal} ${currency}`);
          }
          
          // Add link to image if available
          if (token.image) {
            nftDetails.push(`Image: ${token.image}`);
          }
          
          return nftDetails.join('\n');
        }).join('\n\n');
      }
      
      return {
        content: [
          {
            type: "text",
            text: `NFT Portfolio for ${address}:\n\nTotal NFTs: ${nftCount}\n\n${nftList}`
          },
        ],
      };
    } catch (error) {
      console.error("Error getting NFT portfolio:", error);
      return {
        content: [
          {
            type: "text",
            text: `Failed to retrieve NFT portfolio for address: ${address}. Error: ${
              error instanceof Error ? error.message : String(error)
            }`
          },
        ],
      };
    }
  }
);
```

### Initialize the transport and server from the `main` function

```ts
async function main() {
    // Create a transport layer using standard input/output
    const transport = new StdioServerTransport();
    
    // Connect the server to the transport
     await server.connect(transport);
    
    console.error("Monad testnet MCP Server running on stdio");
}
```

### Build the project

```shell
npm run build
```

The server is now ready to use!

### Adding the MCP server to Cursor

1. Open "Cursor".

2. Open Settings.

Cursor > Settings > Cursor Settings > MCP

3. Click "Add a new global MCP server".

4. Add details about the MCP server and save the file.

```json
{
  "mcpServers": {
    ...
    "monad-mcp-tutorial": {
      "command": "node",
      "args": ["/Users/harpalsinhjadeja/code/monad-mcp-tutorial/build/index.js"],
    }
  }
}
```

5. Restart Cursor.

### Adding the MCP server to Claude Desktop

1. Open "Claude Desktop"

![claude desktop](/static/1.png)

2. Open Settings

Claude > Settings > Developer

![claude settings](/static/claude_settings.gif)

3. Open `claude_desktop_config.json` 

![claude config](/static/config.gif)

4. Add details about the MCP server and save the file.

```json
{
  "mcpServers": {
    ...
    "monad-mcp-tutorial": {
      "command": "node",
      "args": [
        "/<path-to-project>/build/index.js"
      ]
    }
  }
}
```

5. Restart "Claude Desktop"

### Using the MCP server

You should now be able to see the tools in Claude!

![tools](/static/tools.gif)

Here's the final result

![final result](/static/final_result.gif)

### Defining the Trending NFT collection tool (Optional)

Below is the scaffold of the `get-trending-nft-collections` tool:

```ts
server.tool(
  // Tool Id
  "get-trending-nft-collections",
  "Get trending NFT collections on Monad testnet",
  {},
  async ({ }) => {
    // Code to get Trending NFT collections
  }
);
```

Let's add the implementation for Trending NFT collections to the tool:

```ts
server.tool(
  "get-trending-nft-collections",
  "Get trending NFT collections on Monad testnet",
  {},
  async () => {
    try {
      // Call the Reservoir API to get trending collections
      const response = await fetch("https://api-monad-testnet.reservoir.tools/collections/trending-mints/v2");
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      // Format the trending collections data for display
      const collectionsCount = data.mints?.length || 0;
      let collectionsList = '';
      
      if (collectionsCount > 0) {
        collectionsList = data.mints.map((collection: any, index: number) => {
          // Format collection details
          let details = [
            `${index + 1}. ${collection.name || 'Unnamed Collection'}`,
            `Contract: ${collection.id}`,
            `Type: ${collection.contractKind || 'Unknown'}`
          ];
          
          // Add description if available
          if (collection.description) {
            details.push(`Description: ${collection.description}`);
          }
          
          // Add ownership statistics
          if (collection.tokenCount || collection.ownerCount) {
            const tokenCount = collection.tokenCount ? `${collection.tokenCount} tokens` : '';
            const ownerCount = collection.ownerCount ? `${collection.ownerCount} owners` : '';
            const stats = [tokenCount, ownerCount].filter(Boolean).join(', ');
            
            if (stats) {
              details.push(`Stats: ${stats}`);
            }
          }
          
          // Add market stats
          if (collection.onSaleCount) {
            details.push(`Items For Sale: ${collection.onSaleCount}`);
          }
          
          // Add mint information
          if (collection.mintType) {
            const mintPrice = collection.mintPrice?.amount?.decimal !== undefined ? 
              collection.mintPrice.amount.decimal : 'Free';
            const currency = collection.mintPrice?.currency?.symbol || 'MON';
            details.push(`Mint: ${collection.mintType} (${mintPrice} ${currency})`);
            
            if (collection.maxSupply) {
              details.push(`Max Supply: ${collection.maxSupply}`);
            }
          }
          
          // Add mint statistics
          if (collection.mintCount) {
            details.push(`Total Mints: ${collection.mintCount}`);
            
            if (collection.oneHourCount) {
              details.push(`Last Hour: ${collection.oneHourCount} mints`);
            }
            
            if (collection.sixHourCount) {
              details.push(`Last 6 Hours: ${collection.sixHourCount} mints`);
            }
          }
          
          // Add volume change percentages
          if (collection.volumeChange) {
            const change24h = collection.volumeChange["1day"];
            const change7d = collection.volumeChange["7day"];
            
            if (change24h !== undefined) {
              const percentChange = (change24h * 100).toFixed(2);
              details.push(`Volume Change (24h): ${percentChange}%`);
            }
            
            if (change7d !== undefined) {
              const percentChange = (change7d * 100).toFixed(2);
              details.push(`Volume Change (7d): ${percentChange}%`);
            }
          }
          
          // Add collection volume
          if (collection.collectionVolume) {
            const volume24h = collection.collectionVolume["1day"] || 0;
            const volume7d = collection.collectionVolume["7day"] || 0;
            const volume30d = collection.collectionVolume["30day"] || 0;
            const volumeAll = collection.collectionVolume["allTime"] || 0;
            
            details.push(`Volume (24h): ${volume24h.toFixed(2)} MON`);
            details.push(`Volume (7d): ${volume7d.toFixed(2)} MON`);
            details.push(`Volume (30d): ${volume30d.toFixed(2)} MON`);
            details.push(`Volume (All Time): ${volumeAll.toFixed(2)} MON`);
          }
          
          // Add floor price if available
          if (collection.floorAsk?.price?.amount?.decimal) {
            const currency = collection.floorAsk.price.currency?.symbol || 'MON';
            const marketplace = collection.floorAsk.sourceDomain || 'Unknown marketplace';
            details.push(`Floor Price: ${collection.floorAsk.price.amount.decimal} ${currency} (on ${marketplace})`);
          }
          
          // Add mint stages information
          if (collection.mintStages && collection.mintStages.length > 0) {
            const currentStage = collection.mintStages[0];
            details.push(`Current Mint Stage: ${currentStage.stage} (${currentStage.kind})`);
            
            if (currentStage.maxMintsPerWallet) {
              details.push(`Max Mints Per Wallet: ${currentStage.maxMintsPerWallet}`);
            }
          }
          
          // Add mint dates if available
          if (collection.startDate || collection.endDate) {
            const start = collection.startDate ? new Date(collection.startDate).toLocaleDateString() : 'N/A';
            const end = collection.endDate ? new Date(collection.endDate).toLocaleDateString() : 'N/A';
            details.push(`Mint Period: ${start} to ${end}`);
          }
          
          // Add image if available
          if (collection.image) {
            details.push(`Image: ${collection.image}`);
          }
          
          return details.join('\n');
        }).join('\n\n');
      }
      
      return {
        content: [
          {
            type: "text",
            text: `🔥 Trending NFT Collections on Monad Testnet 🔥\n\nTotal Collections: ${collectionsCount}\n\n${collectionsList}`
          },
        ],
      };
    } catch (error) {
      console.error("Error getting trending collections:", error);
      return {
        content: [
          {
            type: "text",
            text: `Failed to retrieve trending NFT collections. Error: ${
              error instanceof Error ? error.message : String(error)
            }`
          },
        ],
      };
    }
  }
);
```

## Further Resources

- [Model Context Protocol Documentation](https://modelcontextprotocol.io/introduction)
- [Monad Documentation](https://docs.monad.xyz/)
- [Viem Documentation](https://viem.sh/)


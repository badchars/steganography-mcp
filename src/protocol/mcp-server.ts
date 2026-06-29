import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import type { ToolContext } from "../types/index.js";
import { allTools } from "./tools.js";

export async function startMcpStdio(ctx: ToolContext): Promise<void> {
  const server = new McpServer({
    name: "steganography-mcp",
    version: "0.1.0",
  });

  for (const tool of allTools) {
    server.tool(tool.name, tool.description, tool.schema, async (args) => {
      return tool.execute(args as Record<string, unknown>, ctx);
    });
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

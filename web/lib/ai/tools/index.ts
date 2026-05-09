"use server"

import { McpServers } from "@/lib/constants"
import {
  ClientConfig,
  Connection,
  MultiServerMCPClient,
} from "@langchain/mcp-adapters"

export type McpServer = Connection & {
  name: string
  description: string
  transport: "http"
  icon: IconSvgObject
}

type IconSvgObject =
  | [
      string,
      {
        [key: string]: string | number
      },
    ][]
  | readonly (readonly [
      string,
      {
        readonly [key: string]: string | number
      },
    ])[]

const serverToConfig = (server: McpServer): [string, Connection] => [
  server.name,
  {
    transport: server.transport,
    url: server.url,
  },
]

const getMcpServerConfig = (
  serverNames: string[]
): Record<string, Connection> => {
  const configEntries = McpServers.filter((server) =>
    serverNames.includes(server.name)
  ).map(serverToConfig)
  if (configEntries.length === 0) {
    console.warn(
      "No valid MCP servers found for the provided names. Please check your configuration."
    )
    return {}
  }

  return Object.fromEntries(configEntries)
}

export const getMcpTools = async (serverNames: string[]) => {
  const config = getMcpServerConfig(serverNames)
  const client = new MultiServerMCPClient(config)
  const tools = await client.getTools()
  return tools
}

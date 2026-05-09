import { InternetIcon } from "@hugeicons/core-free-icons"
import { McpServer } from "./ai/tools"

export const McpServers: McpServer[] = [
  {
    name: "web-search",
    description:
      "A web search tool that provides up-to-date information from the internet. Useful for answering questions about current events, finding specific information, or researching topics that require recent data.",
    transport: "http",
    url: `https://mcp.tavily.com/mcp/?tavilyApiKey=${process.env.TAVILY_API_KEY}`,
    icon: InternetIcon,
  },
]

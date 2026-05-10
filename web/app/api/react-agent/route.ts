import { NextRequest } from "next/server"
import { buildReactAgent, StreamedReactContentPart } from "@/lib/ai/react"
import type { InvokeAgentRequest, Message } from "@/lib/types"
import { toLangChainMessages } from "@/lib/ai/message-transform"
import { IterableReadableStream } from "@langchain/core/utils/stream"
import { getMcpTools } from "@/lib/ai/tools"
import { DynamicStructuredTool } from "@langchain/core/tools"

export const runtime = "nodejs"

const graph = buildReactAgent()
const encoder = new TextEncoder()

function sse(event: string, data: unknown) {
  return encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
}

export async function POST(req: NextRequest) {
  const { messages, model, activeMcps }: InvokeAgentRequest = await req.json()

  let tools: DynamicStructuredTool[] = []
  try {
    tools = await getMcpTools(activeMcps)
  } catch (error) {
    console.error("Error fetching MCP tools:", error)
    throw new Error("Failed to fetch MCP tools")
  }

  const lcMessages = toLangChainMessages(messages)

  const body = new ReadableStream({
    async start(controller) {
      try {
        const agentStream: IterableReadableStream<StreamedReactContentPart> =
          await graph.stream(
            { messages: lcMessages },
            {
              streamMode: "custom",
              configurable: {
                model: model ?? "claude-sonnet-4-6",
                tools,
                temperature: 0.7,
              },
            }
          )

        for await (const event of agentStream) {
          controller.enqueue(sse("event", { event }))
        }

        controller.enqueue(sse("done", {}))
      } catch (err) {
        controller.enqueue(sse("error", { message: String(err) }))
      } finally {
        controller.close()
      }
    },
  })

  return new Response(body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  })
}

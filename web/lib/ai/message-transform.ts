import {
  AIMessage,
  BaseMessage,
  HumanMessage,
  ToolMessage,
} from "@langchain/core/messages"
import { Message, TextContentPart, ToolInvocationPart } from "../types"

type toLangChainMessagesOptions = {
  includeToolMessages?: boolean
}

export function toLangChainMessages(
  messages: Message[],
  options?: toLangChainMessagesOptions
): BaseMessage[] {
  const { includeToolMessages = false } = options || {}
  return messages.flatMap((m): BaseMessage[] => {
    const text = (m.parts.filter((p) => p.type === "text") as TextContentPart[])
      .map((p) => p.content.text)
      .join("")

    if (m.role === "user") return [new HumanMessage(text)]

    if (!includeToolMessages) return [new AIMessage(text)]

    const invocations = m.parts.filter(
      (p): p is ToolInvocationPart => p.type === "tool_invocation"
    )

    const tool_calls = invocations.map((p) => ({
      id: p.content.tool_call_id,
      name: p.content.tool_name,
      args: p.content.args,
    }))

    const toolMessages: ToolMessage[] = []
    for (const p of invocations) {
      if (p.content.state === "result") {
        toolMessages.push(
          new ToolMessage({
            content:
              typeof p.content.result === "string"
                ? p.content.result
                : JSON.stringify(p.content.result),
            tool_call_id: p.content.tool_call_id,
          })
        )
      }
    }

    return [new AIMessage({ content: text, tool_calls }), ...toolMessages]
  })
}

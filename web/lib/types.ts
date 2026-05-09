export type InvokeAgentRequest = {
  messages: Message[]
  model: string
  servers: string[]
}

export type TextContentPart = {
  type: "text"
  content: {
    text: string
  }
}
export function toTextContentPart(text: string): TextContentPart {
  return {
    type: "text",
    content: {
      text,
    },
  }
}

export type ToolInvocationPart = {
  type: "tool_invocation"
  content:
    | {
        state: "calling"
        tool_call_id: string
        tool_name: string
        args: Record<string, unknown>
      }
    | {
        state: "result"
        tool_call_id: string
        tool_name: string
        args: Record<string, unknown>
        result: unknown
      }
}

export function toToolInvocationPart(toolCall: {
  id?: string
  name: string
  args: Record<string, unknown>
}): ToolInvocationPart {
  return {
    type: "tool_invocation",
    content: {
      state: "calling",
      tool_call_id: toolCall.id ?? "unknown_id",
      tool_name: toolCall.name,
      args: toolCall.args,
    },
  }
}

export function toToolResultPart(
  toolCall: { id?: string; name: string; args: Record<string, unknown> },
  result: unknown
): ToolInvocationPart {
  return {
    type: "tool_invocation",
    content: {
      state: "result",
      tool_call_id: toolCall.id ?? "unknown_id",
      tool_name: toolCall.name,
      args: toolCall.args,
      result,
    },
  }
}

export type MessageContentPart = TextContentPart | ToolInvocationPart

export type Message = {
  role: "user" | "assistant"
  parts: MessageContentPart[]
}

export type UIMessage = Message & {
  id: string
  timestamp: Date
}

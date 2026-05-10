import { ConditionalEdgeRouter, END, GraphNode } from "@langchain/langgraph"
import { AgentState, AgentContext } from "./state"
import { buildLlm } from "../llm"
import {
  AIMessage,
  AIMessageChunk,
  ToolMessage,
  SystemMessage,
} from "@langchain/core/messages"
import {
  toTextContentPart,
  toToolInvocationPart,
  toToolResultPart,
} from "@/lib/types"
import { DynamicStructuredTool } from "@langchain/core/tools"

const buildSystemPrompt =
  () => `You are a helpful AI assistant with access to a set of tools.

Date: ${new Date().toLocaleDateString()}

## Behavior

- Think step by step before acting. If a task requires multiple steps, plan them before executing.
- Use tools when they provide value. Don't use a tool if you can answer directly from your knowledge.
- After each tool call, evaluate the result before deciding your next step.
- If a tool returns an error or unexpected result, try to recover or explain clearly why you can't proceed.
- Never fabricate tool results. If you don't have the information, say so.

## Response style

- Be concise and direct. No unnecessary preamble.
- When presenting results from tools, summarize and structure clearly — don't dump raw output unless asked.
- Use markdown only when it genuinely helps readability (lists, code blocks, tables). Not for every response.
- Match the language of the user.

## Limits

- If a request is ambiguous, ask one targeted clarifying question before proceeding.
- If you cannot complete a task with the available tools, say so clearly and explain why.
- Do not speculate about capabilities you don't have.`

/**
 * Agent node for handling LLM interactions
 *
 * This node takes the current conversation messages from the state and the LLM configuration from the context,
 * makes a call to the LLM, and streams the response back to the context writer. The final response is then
 * returned to be appended tohe state messages.
 *
 * @param state
 * @param context
 */
export const agent: GraphNode<AgentState, AgentContext> = async (
  state,
  context
) => {
  const llm = buildLlm(context.configurable?.model!)
  const llmWithTools = llm.bindTools(context.configurable?.tools || [])
  const stream = await llmWithTools.stream([
    {
      role: "system",
      content: buildSystemPrompt(),
    },
    ...state.messages,
  ])
  let fullResponse: AIMessageChunk | undefined = undefined
  for await (const chunk of stream) {
    fullResponse = fullResponse ? fullResponse.concat(chunk) : chunk
    if (chunk.text) {
      context.writer!({ part: toTextContentPart(chunk.text), source: "agent" })
    }
  }
  return {
    messages: [fullResponse ?? new AIMessageChunk({ content: "" })],
  }
}

/**
 * Tool node for handling tool calls
 *
 * This node listens for tool calls in the last message from the state.
 * If it finds any, it executes the corresponding tools from the context and streams the tool results back to the context writer.
 * The tool results are also returned to be appended to the state messages.
 * @param state
 * @param context
 * @returns
 */
export const toolNode: GraphNode<AgentState, AgentContext> = async (
  state,
  context
) => {
  const lastMessage = state.messages[state.messages.length - 1]

  if (
    !lastMessage ||
    (!(lastMessage instanceof AIMessage) &&
      !(lastMessage instanceof AIMessageChunk)) ||
    !lastMessage.tool_calls?.length
  ) {
    return { messages: [] }
  }
  const toolMessages = await Promise.all(
    lastMessage.tool_calls.map(async (toolCall) => {
      context.writer!({
        part: toToolInvocationPart(toolCall),
        source: "toolNode",
      })
      const tool = context.configurable?.tools.find(
        (t: DynamicStructuredTool) => t.name === toolCall.name
      )
      let content: string
      try {
        const rawResult =
          (await tool?.invoke(toolCall.args)) ?? "Tool not found"
        content =
          typeof rawResult === "string" ? rawResult : JSON.stringify(rawResult)
      } catch (err) {
        content = `Tool error: ${err instanceof Error ? err.message : String(err)}`
      }
      const toolMessage = new ToolMessage({
        content,
        tool_call_id: toolCall.id ?? "",
      })
      context.writer!({
        part: toToolResultPart(toolCall, content),
        source: "toolNode",
      })
      return toolMessage
    })
  )
  return { messages: toolMessages }
}

export const shouldContinue: ConditionalEdgeRouter<
  AgentState,
  AgentContext,
  "toolNode" | "__end__"
> = (state) => {
  const lastMessage = state.messages.at(-1)
  // If the LLM makes a tool call, then route to the tool node
  if (lastMessage instanceof AIMessageChunk && lastMessage.tool_calls?.length) {
    return "toolNode"
  }
  // Otherwise, we stop (reply to the user)

  return END
}

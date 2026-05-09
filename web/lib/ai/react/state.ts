import * as z from "zod"
import { StateSchema, MessagesValue } from "@langchain/langgraph"

// Graph state
export const AgentStateSchema = new StateSchema({
  messages: MessagesValue,
})
export const AgentContextSchema = z.object({
  model: z.string(),
  temperature: z.number().optional().default(0.7),
  tools: z.array(z.any()), //DynamicStructuredTool
  systemPrompt: z.string(),
})
export type AgentState = typeof AgentStateSchema
export type AgentContext = z.infer<typeof AgentContextSchema>

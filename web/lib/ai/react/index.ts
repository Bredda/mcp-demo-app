import { StateGraph } from "@langchain/langgraph"
import { toolNode, shouldContinue, agent } from "./nodes"
import { AgentStateSchema, AgentContextSchema } from "./state"
import { TextContentPart, ToolInvocationPart } from "@/lib/types"

export type StreamedReactContentPart =
  | { source: "agent"; part: TextContentPart }
  | { source: "toolNode"; part: ToolInvocationPart }

export const buildReactAgent = () =>
  new StateGraph(AgentStateSchema, AgentContextSchema)
    .addNode("agent", agent)
    .addNode("toolNode", toolNode)
    .addEdge("__start__", "agent")
    .addConditionalEdges("agent", shouldContinue, ["toolNode", "__end__"])
    .addEdge("toolNode", "agent")
    .compile()

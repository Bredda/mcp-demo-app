import { ChatAnthropic } from "@langchain/anthropic"

export const buildLlm = (modelName: string) =>
  new ChatAnthropic({
    model: modelName,
    apiKey: process.env.ANTHROPIC_API_KEY,
  })

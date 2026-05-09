"use client"

import React, { createContext, useContext, useRef, useState } from "react"
import { fetchEventSource } from "@microsoft/fetch-event-source"
import type {
  InvokeAgentRequest,
  MessageContentPart,
  UIMessage,
} from "@/lib/types"
import { toTextContentPart } from "@/lib/types"
import type { StreamedReactContentPart } from "@/lib/ai/react"
import { McpServer } from "@/lib/ai/tools"

export type ReactAgentStatus = "idle" | "streaming" | "error"

type ReactAgentContextValue = {
  messages: UIMessage[]
  status: ReactAgentStatus
  selectedModel: string
  setSelectedModel: (model: string) => void
  invoke: (input: string) => void
  abort: () => void
  clear: () => void
  availableModels: string[]
  selectedServers: string[]
  setSelectedServers: (serverNames: string[]) => void
}

const ReactAgentContext = createContext<ReactAgentContextValue | null>(null)

function newUIMessage(
  role: UIMessage["role"],
  content: MessageContentPart[] = []
): UIMessage {
  return {
    id: crypto.randomUUID(),
    role,
    parts: content,
    timestamp: new Date(),
  }
}

function appendText(
  content: MessageContentPart[],
  text: string
): MessageContentPart[] {
  if (!text) return content
  const last = content.at(-1)
  if (last?.type === "text") {
    return [
      ...content.slice(0, -1),
      toTextContentPart(last.content.text + text),
    ]
  }
  return [...content, toTextContentPart(text)]
}

const mockMessages: UIMessage[] = [
  {
    id: "1",
    role: "user",
    parts: [
      {
        type: "text",
        content: {
          text: "What is in this image?",
        },
      },
    ],
    timestamp: new Date(),
  },
  {
    id: "2",
    role: "assistant",
    parts: [
      {
        type: "tool_invocation",
        content: {
          state: "result",
          tool_call_id: "1234",
          tool_name: "describe_image",
          args: { image_url: "https://example.com/cat.jpg" },
          result: { description: "A cat sitting on a windowsill." },
        },
      },
      {
        type: "text",
        content: {
          text: "This is an image of a cat sitting on a windowsill.",
        },
      },
    ],
    timestamp: new Date(),
  },
  {
    id: "1",
    role: "user",
    parts: [
      {
        type: "text",
        content: {
          text: "What is in this image?",
        },
      },
    ],
    timestamp: new Date(),
  },
  {
    id: "2",
    role: "assistant",
    parts: [
      {
        type: "tool_invocation",
        content: {
          state: "result",
          tool_call_id: "1234",
          tool_name: "describe_image",
          args: { image_url: "https://example.com/cat.jpg" },
          result: { description: "A cat sitting on a windowsill." },
        },
      },
      {
        type: "text",
        content: {
          text: "This is an image of a cat sitting on a windowsill.",
        },
      },
    ],
    timestamp: new Date(),
  },
  {
    id: "1",
    role: "user",
    parts: [
      {
        type: "text",
        content: {
          text: "What is in this image?",
        },
      },
    ],
    timestamp: new Date(),
  },
  {
    id: "2",
    role: "assistant",
    parts: [
      {
        type: "tool_invocation",
        content: {
          state: "result",
          tool_call_id: "1234",
          tool_name: "describe_image",
          args: { image_url: "https://example.com/cat.jpg" },
          result: { description: "A cat sitting on a windowsill." },
        },
      },
      {
        type: "text",
        content: {
          text: "This is an image of a cat sitting on a windowsill.",
        },
      },
    ],
    timestamp: new Date(),
  },
  {
    id: "1",
    role: "user",
    parts: [
      {
        type: "text",
        content: {
          text: "What is in this image?",
        },
      },
    ],
    timestamp: new Date(),
  },
  {
    id: "2",
    role: "assistant",
    parts: [
      {
        type: "tool_invocation",
        content: {
          state: "result",
          tool_call_id: "1234",
          tool_name: "describe_image",
          args: { image_url: "https://example.com/cat.jpg" },
          result: { description: "A cat sitting on a windowsill." },
        },
      },
      {
        type: "text",
        content: {
          text: "This is an image of a cat sitting on a windowsill.",
        },
      },
    ],
    timestamp: new Date(),
  },
  {
    id: "1",
    role: "user",
    parts: [
      {
        type: "text",
        content: {
          text: "What is in this image?",
        },
      },
    ],
    timestamp: new Date(),
  },
  {
    id: "2",
    role: "assistant",
    parts: [
      {
        type: "tool_invocation",
        content: {
          state: "result",
          tool_call_id: "1234",
          tool_name: "describe_image",
          args: { image_url: "https://example.com/cat.jpg" },
          result: { description: "A cat sitting on a windowsill." },
        },
      },
      {
        type: "text",
        content: {
          text: "This is an image of a cat sitting on a windowsill.",
        },
      },
    ],
    timestamp: new Date(),
  },
  {
    id: "1",
    role: "user",
    parts: [
      {
        type: "text",
        content: {
          text: "What is in this image?",
        },
      },
    ],
    timestamp: new Date(),
  },
  {
    id: "2",
    role: "assistant",
    parts: [
      {
        type: "tool_invocation",
        content: {
          state: "result",
          tool_call_id: "1234",
          tool_name: "describe_image",
          args: { image_url: "https://example.com/cat.jpg" },
          result: { description: "A cat sitting on a windowsill." },
        },
      },
      {
        type: "text",
        content: {
          text: "This is an image of a cat sitting on a windowsill.",
        },
      },
    ],
    timestamp: new Date(),
  },
  {
    id: "1",
    role: "user",
    parts: [
      {
        type: "text",
        content: {
          text: "What is in this image?",
        },
      },
    ],
    timestamp: new Date(),
  },
  {
    id: "2",
    role: "assistant",
    parts: [
      {
        type: "tool_invocation",
        content: {
          state: "result",
          tool_call_id: "1234",
          tool_name: "describe_image",
          args: { image_url: "https://example.com/cat.jpg" },
          result: { description: "A cat sitting on a windowsill." },
        },
      },
      {
        type: "text",
        content: {
          text: "This is an image of a cat sitting on a windowsill.",
        },
      },
    ],
    timestamp: new Date(),
  },
]

export function ReactAgentProvider({
  children,
  systemPrompt,
}: {
  children: React.ReactNode
  systemPrompt?: string
}) {
  const availableModels = ["claude-sonnet-4-6", "gpt-4o", "gpt-3.5-turbo"]
  const [messages, setMessages] = useState<UIMessage[]>([])
  const [status, setStatus] = useState<ReactAgentStatus>("idle")
  const [selectedModel, setSelectedModel] = useState(availableModels[0])
  const [selectedServers, setSelectedServers] = useState<string[]>([])
  const abortRef = useRef<AbortController | null>(null)

  const invoke = async (input: string) => {
    if (status === "streaming") return

    const userMessage = newUIMessage("user", [toTextContentPart(input)])
    const assistantMessage = newUIMessage("assistant")
    const assistantId = assistantMessage.id

    setMessages((prev) => [...prev, userMessage, assistantMessage])
    setStatus("streaming")

    abortRef.current = new AbortController()
    const req: InvokeAgentRequest = {
      messages: [...messages, userMessage],
      model: selectedModel,
      servers: selectedServers,
    }
    await fetchEventSource("/api/react-agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
      signal: abortRef.current.signal,
      onmessage(msg) {
        console.log("Received event:", msg)
        if (msg.event === "event") {
          const { event } = JSON.parse(msg.data) as {
            event: StreamedReactContentPart
          }
          setMessages((prev) =>
            prev.map((m) => {
              if (m.id !== assistantId) return m
              switch (event.source) {
                case "agent":
                  return {
                    ...m,
                    parts: appendText(m.parts, event.part.content.text),
                  }
                case "toolNode":
                  if (event.part.content.state === "calling") {
                    return { ...m, parts: [...m.parts, event.part] }
                  } else {
                    return {
                      ...m,
                      parts: m.parts.map((p) =>
                        p.type === "tool_invocation" &&
                        p.content.tool_call_id ===
                          event.part.content.tool_call_id
                          ? event.part
                          : p
                      ),
                    }
                  }
              }
            })
          )
        } else if (msg.event === "done") {
          setStatus("idle")
        } else if (msg.event === "error") {
          setStatus("error")
        }
      },
      onerror(err) {
        if (err instanceof DOMException && err.name === "AbortError") throw err
        setStatus("error")
        throw err
      },
    })
  }

  const abort = () => {
    abortRef.current?.abort()
    setStatus("idle")
  }

  const clear = () => {
    abort()
    setMessages([])
  }

  return (
    <ReactAgentContext.Provider
      value={{
        messages,
        status,
        selectedModel,
        setSelectedModel,
        invoke,
        abort,
        clear,
        availableModels,
        setSelectedServers,
        selectedServers,
      }}
    >
      {children}
    </ReactAgentContext.Provider>
  )
}

export function useReactAgent() {
  const ctx = useContext(ReactAgentContext)
  if (!ctx)
    throw new Error("useReactAgent must be used within ReactAgentProvider")
  return ctx
}

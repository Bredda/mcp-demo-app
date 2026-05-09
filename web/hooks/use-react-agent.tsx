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
import { McpServers } from "@/lib/constants"

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

export function ReactAgentProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const availableModels = ["claude-sonnet-4-6", "gpt-4o", "gpt-3.5-turbo"]
  const [messages, setMessages] = useState<UIMessage[]>([])
  const [status, setStatus] = useState<ReactAgentStatus>("idle")
  const [selectedModel, setSelectedModel] = useState(availableModels[0])
  const [selectedServers, setSelectedServers] = useState<string[]>([
    McpServers[0].name,
  ])
  const abortRef = useRef<AbortController | null>(null)

  const invoke = async (input: string) => {
    if (status === "streaming") return

    const userMessage = newUIMessage("user", [toTextContentPart(input)])
    const assistantMessage = newUIMessage("assistant")
    const assistantId = assistantMessage.id

    const req: InvokeAgentRequest = {
      messages: [...messages, userMessage],
      model: selectedModel,
      activeMcps: selectedServers,
    }

    setMessages((prev) => [...prev, userMessage, assistantMessage])
    setStatus("streaming")
    abortRef.current = new AbortController()
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

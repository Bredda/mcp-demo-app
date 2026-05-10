"use client"

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"
import { fetchEventSource } from "@microsoft/fetch-event-source"
import type {
  InvokeAgentRequest,
  MessageContentPart,
  UIMessage,
} from "@/lib/types"
import { toTextContentPart } from "@/lib/types"
import type { StreamedReactContentPart } from "@/lib/ai/react"
import { McpServers } from "@/lib/constants"
import type { Thread } from "@/lib/db"
import * as threadStore from "@/lib/thread-store"

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
  threads: Thread[]
  currentThreadId: string | null
  loadThread: (id: string) => Promise<void>
  newThread: () => void
  deleteThread: (id: string) => Promise<void>
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

function threadTitle(input: string): string {
  return input.length > 50 ? input.slice(0, 47) + "…" : input
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
  const [threads, setThreads] = useState<Thread[]>([])
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null)

  const abortRef = useRef<AbortController | null>(null)
  const messagesRef = useRef<UIMessage[]>([])
  const currentThreadIdRef = useRef<string | null>(null)

  useEffect(() => {
    messagesRef.current = messages
  }, [messages])
  useEffect(() => {
    currentThreadIdRef.current = currentThreadId
  }, [currentThreadId])

  const loadThread = useCallback(async (id: string) => {
    const msgs = await threadStore.getThreadMessages(id)
    setMessages(msgs)
    setCurrentThreadId(id)
  }, [])

  useEffect(() => {
    threadStore.getAllThreads().then((loaded) => {
      setThreads(loaded)
      if (loaded.length > 0) loadThread(loaded[0].id)
    })
  }, [loadThread])

  const persist = useCallback(async (msgs: UIMessage[], threadId: string) => {
    const updatedAt = await threadStore.persistThreadMessages(threadId, msgs)
    setThreads((prev) =>
      prev
        .map((t) => (t.id === threadId ? { ...t, updatedAt } : t))
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    )
  }, [])

  const newThread = useCallback(() => {
    abortRef.current?.abort()
    setStatus("idle")
    setMessages([])
    setCurrentThreadId(null)
  }, [])

  const deleteThread = useCallback(
    async (id: string) => {
      await threadStore.removeThread(id)
      setThreads((prev) => prev.filter((t) => t.id !== id))
      if (currentThreadIdRef.current === id) newThread()
    },
    [newThread]
  )

  const invoke = async (input: string) => {
    if (status === "streaming") return

    const userMessage = newUIMessage("user", [toTextContentPart(input)])
    const assistantMessage = newUIMessage("assistant")
    const assistantId = assistantMessage.id

    let threadId = currentThreadIdRef.current
    if (!threadId) {
      const now = new Date()
      const thread: Thread = {
        id: crypto.randomUUID(),
        title: threadTitle(input),
        model: selectedModel,
        servers: selectedServers,
        createdAt: now,
        updatedAt: now,
      }
      await threadStore.saveThread(thread)
      setThreads((prev) => [thread, ...prev])
      setCurrentThreadId(thread.id)
      currentThreadIdRef.current = thread.id
      threadId = thread.id
    }

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
        console.debug("Received SSE message:", msg)
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
          persist(messagesRef.current, threadId!)
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
    const tid = currentThreadIdRef.current
    if (tid) persist(messagesRef.current, tid)
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
        clear: newThread,
        availableModels,
        setSelectedServers,
        selectedServers,
        threads,
        currentThreadId,
        loadThread,
        newThread,
        deleteThread,
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

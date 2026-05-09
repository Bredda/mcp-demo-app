"use client"

import { ChatInput } from "@/components/chat-input"
import { ChatMessages } from "@/components/chat-messages"
import { useReactAgent } from "@/hooks/use-react-agent"

export default function HomePage() {
  const { messages, status } = useReactAgent()
  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] w-full max-w-3xl flex-col justify-center px-4 sm:px-6 md:py-4">
      {messages.length === 0 ? (
        <div className="mx-auto w-full max-w-xl">
          <div className="mx-auto mt-4 w-full">
            <ChatInput />
          </div>
        </div>
      ) : (
        <>
          <div className="min-h-0 flex-1 overflow-y-auto pb-2">
            <ChatMessages />
          </div>
          <div className="mx-auto mt-2 mb-4 w-full sm:mb-auto">
            <ChatInput />
          </div>
        </>
      )}
    </div>
  )
}

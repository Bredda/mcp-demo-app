import { ReactAgentStatus, useReactAgent } from "@/hooks/use-react-agent"
import { useScrollToBottom } from "@/hooks/use-scroll-to-bottom"
import { Message } from "@/lib/types"
import { ChatMessage } from "./chat-message"

export const ChatMessages = () => {
  const { status, messages } = useReactAgent()
  const [containerRef, endRef] = useScrollToBottom()
  const isStreaming = status === "streaming"
  return (
    <div className="no-scrollbar h-full overflow-y-auto" ref={containerRef}>
      <div className="mx-auto max-w-lg py-4 sm:max-w-3xl">
        {messages.map((m, i) => (
          <ChatMessage
            key={i}
            isLatestMessage={i === messages.length - 1}
            isLoading={isStreaming}
            message={m}
            status={status}
          />
        ))}
        <div className="h-1" ref={endRef} />
      </div>
    </div>
  )
}

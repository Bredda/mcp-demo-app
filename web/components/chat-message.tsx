import { ReactAgentStatus } from "@/hooks/use-react-agent"
import { Message } from "@/lib/types"
import { cn } from "@/lib/utils"
import { memo } from "react"
import equal from "fast-deep-equal"
import { Markdown } from "./markdown"
import { CopyButton } from "./copy-button"
import { ToolInvocation } from "./tool-invocation"
import { useTypewriter } from "@/hooks/use-typewriter"
import { WebSearchInvocation } from "./tool-invocation/web-search"

type ChatMessageProps = {
  message: Message
  isLatestMessage: boolean
  isLoading: boolean
  status: ReactAgentStatus
}

function AssistantTextPart({
  text,
  isStreaming,
}: {
  text: string
  isStreaming: boolean
}) {
  const animated = useTypewriter(text)
  return (
    <div className="prose prose-sm dark:prose-invert">
      <Markdown>{isStreaming ? animated : text}</Markdown>
    </div>
  )
}

const PurePreviewMessage = ({
  message,
  isLatestMessage,
  status,
}: ChatMessageProps) => {
  const getMessageText = () => {
    if (!message.parts) return ""
    return message.parts
      .filter((part) => part.type === "text")
      .map((part) => (part.type === "text" ? part.content.text : ""))
      .join("\n\n")
  }

  const shouldShowCopyButton =
    message.role === "assistant" && (!isLatestMessage || status !== "streaming")

  return (
    <div
      className={cn(
        "group/message mx-auto w-full px-4",
        message.role === "assistant" ? "mb-8" : "mb-6"
      )}
      data-role={message.role}
    >
      <div
        className={cn(
          "flex w-full gap-4",
          message.role === "user" ? "ml-auto w-fit max-w-2xl" : ""
        )}
      >
        <div className="flex w-full flex-col space-y-3">
          {message.parts?.map((part, i) => {
            switch (part.type) {
              case "text":
                return (
                  <div
                    key={`message-part-${i}`}
                    className="flex w-full flex-row items-start gap-2"
                  >
                    <div
                      className={cn("flex w-full flex-col gap-3", {
                        "rounded-2xl bg-secondary px-4 py-3 text-secondary-foreground":
                          message.role === "user",
                      })}
                    >
                      <AssistantTextPart
                        text={part.content.text}
                        isStreaming={
                          message.role === "assistant" &&
                          isLatestMessage &&
                          status === "streaming"
                        }
                      />
                    </div>
                  </div>
                )
              case "tool_invocation":
                const { tool_name, state, args } = part.content
                const result =
                  "result" in part.content ? part.content.result : null
                return (
                  <WebSearchInvocation
                    key={`message-part-${i}`}
                    toolName={tool_name}
                    state={state}
                    args={args}
                    result={result}
                    isLatestMessage={isLatestMessage}
                    status={status}
                  />
                )
              default:
                return null
            }
          })}
          {shouldShowCopyButton && (
            <div className="mt-2 flex justify-start opacity-0 transition-opacity group-hover/message:opacity-100">
              <CopyButton text={getMessageText()} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export const ChatMessage = memo(PurePreviewMessage, (prevProps, nextProps) => {
  if (prevProps.status !== nextProps.status) return false
  if (prevProps.isLoading !== nextProps.isLoading) return false
  if (prevProps.isLatestMessage !== nextProps.isLatestMessage) return false
  // if (prevProps.message.id !== nextProps.message.id) return false;
  if (!equal(prevProps.message.parts, nextProps.message.parts)) return false
  return true
})

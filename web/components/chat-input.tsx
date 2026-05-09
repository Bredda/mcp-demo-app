import { ArrowUp, SentIcon } from "@hugeicons/core-free-icons"
import {
  InputGroup,
  InputGroupTextarea,
  InputGroupAddon,
  InputGroupText,
  InputGroupButton,
} from "./ui/input-group"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "./ui/spinner"
import { HugeiconsIcon } from "@hugeicons/react"
import React from "react"
import { useReactAgent } from "@/hooks/use-react-agent"
import { McpPicker } from "./mcp-picker"

interface ChatInput {
  isLoading: boolean
  status: string
  stop: () => void
}

export function ChatInput({ isLoading, status, stop }: ChatInput) {
  const [input, setInput] = React.useState("")
  const isStreaming = status === "streaming" || status === "submitted"
  const { availableModels, invoke, selectedModel, setSelectedModel } =
    useReactAgent()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    invoke(input)
    setInput("")
  }

  return (
    <div className="relative w-full">
      <InputGroup>
        <InputGroupTextarea
          value={input}
          autoFocus
          placeholder="Send a message..."
          rows={3}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              !e.shiftKey &&
              !isLoading &&
              input.trim()
            ) {
              handleSubmit(e)
            }
          }}
        />
        <InputGroupAddon align="block-end" className="border-t">
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {availableModels.map((model) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <McpPicker />
          <InputGroupButton
            size="icon-sm"
            className="ml-auto"
            type={isStreaming ? "button" : "submit"}
            onClick={isStreaming ? stop : handleSubmit}
            disabled={
              (!isStreaming && !input.trim()) ||
              (isStreaming && status === "submitted")
            }
          >
            {isStreaming ? (
              <Spinner className="h-4 w-4 text-primary-foreground" />
            ) : (
              <HugeiconsIcon
                icon={SentIcon}
                className="h-4 w-4 text-primary-foreground"
              />
            )}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}

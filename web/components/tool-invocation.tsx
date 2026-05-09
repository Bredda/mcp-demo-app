"use client"

import { useEffect, useState, useMemo, useCallback, memo } from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { cn } from "@/lib/utils"
import { Spinner } from "./ui/spinner"
import { CheckmarkCircle02Icon, CircleIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

// Define interfaces for better type safety
interface HtmlResourceData {
  uri: string
  mimeType: "text/html"
  text?: string
  blob?: string
  [key: string]: any // Allow other fields, like id from example
}

interface ContentItemWithHtmlResource {
  type: "resource"
  resource: HtmlResourceData
}

// Generic content item
interface ContentItem {
  type: string
  [key: string]: any
}

// Expected structure of the parsed result string
interface ParsedResultContainer {
  content: ContentItem[]
}

interface ToolInvocationProps {
  toolName: string
  state: string
  args: any
  result: any
  isLatestMessage: boolean
  status: string
}

export const ToolInvocation = memo(function ToolInvocation({
  toolName,
  state,
  args,
  result,
  isLatestMessage,
  status,
}: ToolInvocationProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [htmlResourceContents, setHtmlResourceContents] = useState<
    HtmlResourceData[]
  >([])

  return (
    <Accordion type="single" collapsible defaultValue="item-1">
      <AccordionItem value="item-1">
        <AccordionTrigger className="cursor-pointer text-muted-foreground hover:text-foreground hover:no-underline">
          {toolName}
        </AccordionTrigger>
        <AccordionContent>
          Yes. It adheres to the WAI-ARIA design pattern.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
})

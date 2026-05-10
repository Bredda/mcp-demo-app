"use client"

import { useEffect, useState, useMemo, useCallback, memo } from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { cn } from "@/lib/utils"
import {
  CheckmarkCircle02Icon,
  CircleIcon,
  RecordIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Spinner } from "../ui/spinner"
import Link from "next/link"

interface ToolInvocationProps {
  toolName: string
  state: string
  args: any
  result: any
  isLatestMessage: boolean
  status: string
}

function SourceCard({
  className,
  url,
  content,
}: {
  className?: string
  url: string
  content: string
}) {
  const domain = new URL(url).hostname.replace(/^www\./, "")
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`

  return (
    <div className={cn("flex flex-col items-start gap-3 p-3", className)}>
      <div className="flex w-full min-w-0 items-center gap-2">
        <img
          src={faviconUrl}
          alt=""
          width={16}
          height={16}
          className="shrink-0"
          onError={(e) => {
            e.currentTarget.style.display = "none"
          }}
        />
        <span className="max-w-[120px] shrink-0 truncate text-xs">
          {domain}
        </span>
        <Link
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="min-w-0 flex-1 underline-offset-4 hover:underline"
        >
          <span className="block truncate text-xs">{content}</span>
        </Link>
      </div>
    </div>
  )
}

export const WebSearchInvocation = memo(function WebSearchInvocation({
  toolName,
  state,
  args,
  result,
  isLatestMessage,
  status,
}: ToolInvocationProps) {
  const parsedResult = useMemo(() => {
    try {
      const parsedResult = JSON.parse(result)
      console.log("PArsed results", parsedResult)
      return parsedResult
    } catch (e) {
      console.error("Failed to parse result as JSON", e)
      return null
    }
  }, [result])

  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger className="cursor-pointer text-muted-foreground hover:text-foreground hover:no-underline">
          {state === "calling" && (
            <div className="flex items-center gap-1">
              <Spinner className="size-4" />
              <span>Searching the web ...</span>
            </div>
          )}
          {state === "result" && (
            <div className="flex items-center gap-1">
              <HugeiconsIcon
                icon={RecordIcon}
                className="size-4 text-green-500"
              />
              <span>Web Search</span>
            </div>
          )}
        </AccordionTrigger>
        <AccordionContent className="h-fit">
          <blockquote className="semibold text-sm text-muted-foreground italic">
            "{args.query ?? JSON.stringify(args)}"
          </blockquote>
          <div>
            {parsedResult?.structuredContent.results?.map(
              (r: any, i: number) => (
                <div key={i}>
                  <SourceCard url={r.url} content={r.title} />
                </div>
              )
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
})

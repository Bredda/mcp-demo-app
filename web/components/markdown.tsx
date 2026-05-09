import { memo } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

const remarkPlugins = [remarkGfm]

const NonMemoizedMarkdown = ({ children }: { children: string }) => {
  return (
    <div className="prose prose-sm break-words dark:prose-invert">
      <ReactMarkdown remarkPlugins={remarkPlugins}>{children}</ReactMarkdown>
    </div>
  )
}

export const Markdown = memo(
  NonMemoizedMarkdown,
  (prevProps, nextProps) => prevProps.children === nextProps.children
)

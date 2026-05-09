import { cn } from "@/lib/utils"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import { Button } from "./ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { CheckmarkCircle02Icon, Copy01Icon } from "@hugeicons/core-free-icons"
import { useCallback } from "react"
import { toast } from "sonner"

interface CopyButtonProps {
  text: string
  className?: string
}

export function CopyButton({ text, className }: CopyButtonProps) {
  const { copied, copy } = useCopyToClipboard()
  const handleCopy = useCallback(() => {
    copy(text)
    toast.success("Copied to clipboard")
  }, [text])
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("gap-1.5", className)}
      onClick={handleCopy}
      title="Copy to clipboard"
    >
      {copied ? (
        <>
          <HugeiconsIcon icon={CheckmarkCircle02Icon} />
        </>
      ) : (
        <>
          <HugeiconsIcon icon={Copy01Icon} />
        </>
      )}
    </Button>
  )
}

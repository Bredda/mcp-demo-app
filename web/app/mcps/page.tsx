import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { McpServers } from "@/lib/constants"
import { HugeiconsIcon } from "@hugeicons/react"

export default function McpsPage() {
  const servers = McpServers

  return (
    <div className="space-y-4 p-8">
      <div className="w-1/2 space-y-2">
        <div>Mcp Servers</div>
        <div className="text-sm text-muted-foreground">
          This is a list of all available MCP servers.
        </div>
        <Separator />
      </div>

      <div className="grid grid-cols-4 gap-4">
        {servers.map((server) => (
          <Card key={server.name} className="p-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HugeiconsIcon icon={server.icon} className="h-6 w-6" />
                <span className="text-lg font-semibold">{server.name}</span>
              </CardTitle>
              <CardDescription>{server.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}

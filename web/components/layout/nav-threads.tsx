"use client"

import {
  MoreHorizontalSquare01Icon,
  Delete02Icon,
} from "@hugeicons/core-free-icons"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
} from "../ui/sidebar"
import { useIsMobile } from "@/hooks/use-mobile"
import { HugeiconsIcon } from "@hugeicons/react"
import { useReactAgent } from "@/hooks/use-react-agent"

export default function NavThreads() {
  const isMobile = useIsMobile()
  const { threads, currentThreadId, loadThread, deleteThread } = useReactAgent()

  if (threads.length === 0) return null

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Threads</SidebarGroupLabel>
      <SidebarMenu>
        {threads.map((thread) => (
          <SidebarMenuItem key={thread.id}>
            <SidebarMenuButton
              isActive={thread.id === currentThreadId}
              onClick={() => loadThread(thread.id)}
            >
              <span className="truncate">{thread.title}</span>
            </SidebarMenuButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction showOnHover>
                  <HugeiconsIcon icon={MoreHorizontalSquare01Icon} />
                  <span className="sr-only">More</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-48 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align={isMobile ? "end" : "start"}
              >
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => deleteThread(thread.id)}
                >
                  <HugeiconsIcon
                    icon={Delete02Icon}
                    className="text-destructive"
                  />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}

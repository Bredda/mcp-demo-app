"use client"

import { AddSquareIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "../ui/sidebar"
import { useReactAgent } from "@/hooks/use-react-agent"

export function NavNewThread() {
  const { newThread } = useReactAgent()
  return (
    <SidebarGroup>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton onClick={newThread}>
            <HugeiconsIcon icon={AddSquareIcon} />
            <span>New Thread</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}

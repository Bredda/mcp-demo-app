"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import {
  AddSquareIcon,
  AiBrain03Icon,
  McpServerIcon,
  ServerStack03Icon,
  Settings02Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import NavThreads from "./nav-threads"
import { NavNewThread } from "./nav-new-thread"
import { NavSettings } from "./nav-settings"
import React from "react"
import Link from "next/link"

export function AppSidebar() {
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className="data-[slot=sidebar-menu-button]:p-1.5!"
              >
                <a href="#">
                  <HugeiconsIcon icon={McpServerIcon} className="size-5!" />
                  <span className="text-base font-semibold">MCP Demo</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <NavNewThread />
          <SidebarSeparator />
          <NavThreads />
          <span className="flex-1"></span>
          <SidebarSeparator />

          <NavSettings />
        </SidebarContent>
        <SidebarFooter />
      </Sidebar>
    </>
  )
}

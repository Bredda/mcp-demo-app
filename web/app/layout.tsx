import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { ReactAgentProvider } from "@/hooks/use-react-agent"
import { TooltipProvider } from "@/components/ui/tooltip"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { AppHeader } from "@/components/layout/app-header"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MCP-App Demo",
  description:
    "MCP App Demo is a web application showcasing the integration of Modular Control Protocol (MCP) with a React-based agent. It demonstrates how to create a dynamic and interactive user interface that allows users to communicate with an AI agent, which can utilize various tools and resources defined by MCP servers. The application features a chat interface where users can send messages and receive responses from the agent, as well as select different models and active MCP servers to customize their experience.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className}`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TooltipProvider>
            <SidebarProvider>
              <ReactAgentProvider>
                <AppSidebar />
                <SidebarInset>
                  <AppHeader />
                  <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    {children}
                  </div>
                </SidebarInset>
              </ReactAgentProvider>
            </SidebarProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

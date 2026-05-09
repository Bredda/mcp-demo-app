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
  title: "MCP-UI Playground",
  description:
    "MCP-UI Playground enables you to experiment with your MCP-UI servers",
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

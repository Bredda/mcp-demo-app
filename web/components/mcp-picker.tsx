"use client"

import { McpServers } from "@/lib/constants"
import { useReactAgent } from "@/hooks/use-react-agent"
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox"
import React from "react"

export function McpPicker() {
  const servers = McpServers
  const anchor = useComboboxAnchor()
  const { setSelectedServers, selectedServers } = useReactAgent()

  return (
    <Combobox
      multiple
      autoHighlight
      items={servers.map((server) => server.name)}
      value={selectedServers}
      onValueChange={setSelectedServers}
    >
      <ComboboxChips ref={anchor} className="w-fit">
        <ComboboxValue>
          {(values) => (
            <React.Fragment>
              {values.length > 0 ? (
                values.map((value: string) => (
                  <ComboboxChip key={value}>{value}</ComboboxChip>
                ))
              ) : (
                <span className="text-muted-foreground">No active MCP</span>
              )}
              <ComboboxChipsInput />
            </React.Fragment>
          )}
        </ComboboxValue>
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>No items found.</ComboboxEmpty>
        <ComboboxList>
          {(item) => (
            <ComboboxItem key={item} value={item}>
              {item}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

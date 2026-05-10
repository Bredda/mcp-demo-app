import { openDB, type DBSchema, type IDBPDatabase } from "idb"
import type { MessageContentPart } from "./types"

export type Thread = {
  id: string
  title: string
  model: string
  servers: string[]
  createdAt: Date
  updatedAt: Date
}

interface AppDB extends DBSchema {
  threads: {
    key: string
    value: Thread
    indexes: { "by-updatedAt": Date }
  }
  messages: {
    key: string
    value: {
      id: string
      threadId: string
      role: "user" | "assistant"
      parts: MessageContentPart[]
      timestamp: Date
    }
    indexes: { "by-threadId": string }
  }
}

let dbInstance: IDBPDatabase<AppDB> | null = null

export async function getDB(): Promise<IDBPDatabase<AppDB>> {
  if (dbInstance) return dbInstance
  dbInstance = await openDB<AppDB>("mcp-demo", 1, {
    upgrade(db) {
      const threadStore = db.createObjectStore("threads", { keyPath: "id" })
      threadStore.createIndex("by-updatedAt", "updatedAt")

      const messageStore = db.createObjectStore("messages", { keyPath: "id" })
      messageStore.createIndex("by-threadId", "threadId")
    },
  })
  return dbInstance
}

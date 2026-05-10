import { getDB, type Thread } from "./db"
import type { UIMessage } from "./types"

export async function getAllThreads(): Promise<Thread[]> {
  const db = await getDB()
  const threads = await db.getAllFromIndex("threads", "by-updatedAt")
  return threads.reverse() // newest first
}

export async function saveThread(thread: Thread): Promise<void> {
  const db = await getDB()
  await db.put("threads", thread)
}

export async function removeThread(id: string): Promise<void> {
  const db = await getDB()
  const tx = db.transaction(["threads", "messages"], "readwrite")
  await tx.objectStore("threads").delete(id)
  const keys = await tx.objectStore("messages").index("by-threadId").getAllKeys(id)
  await Promise.all(keys.map((k) => tx.objectStore("messages").delete(k)))
  await tx.done
}

export async function getThreadMessages(threadId: string): Promise<UIMessage[]> {
  const db = await getDB()
  const records = await db.getAllFromIndex("messages", "by-threadId", threadId)
  return records
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .map((r) => ({ id: r.id, role: r.role, parts: r.parts, timestamp: new Date(r.timestamp) }))
}

export async function persistThreadMessages(
  threadId: string,
  messages: UIMessage[]
): Promise<Date> {
  const db = await getDB()
  const updatedAt = new Date()
  const tx = db.transaction(["threads", "messages"], "readwrite")
  await Promise.all(messages.map((m) => tx.objectStore("messages").put({ ...m, threadId })))
  const thread = await tx.objectStore("threads").get(threadId)
  if (thread) await tx.objectStore("threads").put({ ...thread, updatedAt })
  await tx.done
  return updatedAt
}

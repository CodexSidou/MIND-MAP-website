import { openDB, type IDBPDatabase } from 'idb'
import type { MindMap, Settings } from '../../types'

const DB_NAME = 'mindmap-pro'
const DB_VERSION = 1

interface DBSchema {
  maps: { key: string; value: MindMap }
  settings: { key: string; value: unknown }
}

let dbPromise: Promise<IDBPDatabase<DBSchema>> | null = null

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<DBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('maps')) db.createObjectStore('maps', { keyPath: 'id' })
        if (!db.objectStoreNames.contains('settings')) db.createObjectStore('settings')
      },
    })
  }
  return dbPromise
}

export async function loadMaps(): Promise<MindMap[]> {
  const db = await getDB()
  return db.getAll('maps')
}

export async function saveMap(map: MindMap): Promise<void> {
  const db = await getDB()
  await db.put('maps', map)
}

export async function deleteMap(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('maps', id)
}

export async function loadSettings(): Promise<Partial<Settings> | null> {
  const db = await getDB()
  const v = await db.get('settings', 'app')
  return (v as Partial<Settings>) ?? null
}

export async function saveSettings(s: Settings): Promise<void> {
  const db = await getDB()
  await db.put('settings', s, 'app')
}

export async function loadLanguage(): Promise<string | null> {
  const db = await getDB()
  const v = await db.get('settings', 'language')
  return (v as string) ?? null
}

export async function saveLanguage(lang: string): Promise<void> {
  const db = await getDB()
  await db.put('settings', lang, 'language')
}

export async function clearAll(): Promise<void> {
  const db = await getDB()
  await db.clear('maps')
  await db.clear('settings')
}

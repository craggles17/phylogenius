import { readFile, writeFile, mkdir, readdir } from 'fs/promises'
import { dirname, join } from 'path'

export async function readText(filePath) {
  return readFile(filePath, 'utf-8')
}

export async function writeText(filePath, content) {
  await mkdir(dirname(filePath), { recursive: true })
  await writeFile(filePath, content, 'utf-8')
}

export async function ensureDir(dirPath) {
  await mkdir(dirPath, { recursive: true })
}

export async function listFiles(dirPath, extension) {
  const files = await readdir(dirPath)
  if (!extension) return files
  return files.filter(f => f.endsWith(extension))
}

export async function readJson(filePath) {
  const text = await readText(filePath)
  return JSON.parse(text)
}

export async function writeJson(filePath, data) {
  await writeText(filePath, JSON.stringify(data, null, 2))
}

export function resolveFromRoot(...paths) {
  const root = process.cwd()
  return join(root, ...paths)
}


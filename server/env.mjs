import { existsSync } from "node:fs"

import path from "node:path"

import { fileURLToPath } from "node:url"

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),

  "..",
)

const projectEnvFile = path.join(projectRoot, ".env")

export function loadServerEnvironment(envFile = projectEnvFile) {
  if (!existsSync(envFile)) return

  if (!process.env.GEMINI_API_KEY?.trim()) {
    delete process.env.GEMINI_API_KEY
  }

  if (!process.env.GEMINI_MODEL?.trim()) {
    delete process.env.GEMINI_MODEL
  }

  process.loadEnvFile(envFile)
}

loadServerEnvironment()

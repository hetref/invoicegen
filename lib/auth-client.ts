import { createAuthClient } from "better-auth/client"
import { lastLoginMethodClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  plugins: [
    lastLoginMethodClient()
  ]
})

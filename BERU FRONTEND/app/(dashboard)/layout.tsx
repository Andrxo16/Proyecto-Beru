"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { getSession } from "@/lib/auth"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [hasSession, setHasSession] = useState(false)

  useEffect(() => {
    const syncSession = () => {
      const session = getSession()
      if (!session) {
        setHasSession(false)
        router.replace("/login")
      } else {
        setHasSession(true)
      }
      setLoading(false)
    }

    syncSession()
    window.addEventListener("beru-session-changed", syncSession)
    return () => window.removeEventListener("beru-session-changed", syncSession)
  }, [router])

  if (loading) return null
  if (!hasSession) return null

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-64">
        {children}
      </main>
    </div>
  )
}
"use client"

import { FormEvent, useEffect, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import * as api from "@/lib/api"
import { getSession, saveSession } from "@/lib/auth"

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (getSession()) {
      router.replace("/")
    }
  }, [router])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError("")
    setLoading(true)
    try {
      const session = await api.login(username.trim(), password)
      saveSession(session)
      router.replace("/")
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo iniciar sesion")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-md bg-white">
              <Image
                src="/logo-beru.png"
                alt="Beru Sistem"
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
              />
            </div>
            <CardTitle>Beru Sistem</CardTitle>
          </div>
          <CardDescription>Ingresa con tu usuario y contrasena</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              placeholder="Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Contrasena"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "Ingresando..." : "Iniciar sesion"}
            </Button>
          </form>
          <p className="mt-4 text-xs text-muted-foreground">
            Usuario inicial: admin / admin123
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

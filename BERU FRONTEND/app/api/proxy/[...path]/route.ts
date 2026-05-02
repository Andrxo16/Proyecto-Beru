import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function resolveUpstreamBase(): string | null {
  const raw = process.env.BERU_API_PROXY_TARGET?.trim();
  if (!raw) return null;
  return raw.replace(/\/$/, "");
}

function buildTarget(req: NextRequest, segments: string[], base: string): string {
  const rel = segments.length ? `${segments.join("/")}/` : "";
  const u = new URL(rel, `${base}/`);
  u.search = req.nextUrl.search;
  return u.href;
}

function forwardHeaders(from: Headers): Headers {
  const out = new Headers();
  for (const [k, v] of from.entries()) {
    const key = k.toLowerCase();
    if (
      key === "host" ||
      key === "connection" ||
      key === "keep-alive" ||
      key === "transfer-encoding"
    ) {
      continue;
    }
    out.set(k, v);
  }
  return out;
}

function connectionErrorCode(err: unknown): string | undefined {
  if (!err || typeof err !== "object") return undefined;
  const e = err as { code?: string; cause?: unknown };
  if (typeof e.code === "string") return e.code;
  return connectionErrorCode(e.cause);
}

function errorChainText(err: unknown): string {
  if (!err) return "";
  if (err instanceof Error) {
    const c = err.cause !== undefined ? ` ${errorChainText(err.cause)}` : "";
    return `${err.message}${c}`;
  }
  if (typeof err === "object" && err !== null && "message" in err) {
    return String((err as { message: unknown }).message);
  }
  return String(err);
}

function upstreamErrorMessage(err: unknown, base: string): string {
  const code = connectionErrorCode(err);
  if (code === "ECONNREFUSED" || code === "ENOTFOUND") {
    return `No hay API en ${base}. Inicia el backend (por ejemplo en BERUAPP: python run.py) y vuelve a intentar.`;
  }
  const chain = errorChainText(err);
  if (
    chain.includes("ECONNREFUSED") ||
    chain.includes("ENOTFOUND") ||
    /fetch failed/i.test(chain)
  ) {
    return `No hay API en ${base}. Inicia el backend (por ejemplo en BERUAPP: python run.py) y vuelve a intentar.`;
  }
  const msg = err instanceof Error ? err.message : String(err);
  return `No se pudo contactar la API (${base}): ${msg}`;
}

async function proxy(
  req: NextRequest,
  ctx: { params: Promise<{ path?: string[] }> }
) {
  const base = resolveUpstreamBase();
  if (!base) {
    return NextResponse.json(
      {
        detail:
          "Falta BERU_API_PROXY_TARGET en .env.local (misma URL base que el FastAPI, ej. http://127.0.0.1:8000). Copia .env.local.example.",
      },
      { status: 503 }
    );
  }

  const { path: segments = [] } = await ctx.params;
  const url = buildTarget(req, segments, base);
  const hasBody = !["GET", "HEAD"].includes(req.method);

  let backend: Response;
  try {
    backend = await fetch(url, {
      method: req.method,
      headers: forwardHeaders(req.headers),
      body: hasBody ? await req.arrayBuffer() : undefined,
      cache: "no-store",
    });
  } catch (err) {
    return NextResponse.json(
      { detail: upstreamErrorMessage(err, base) },
      { status: 503 }
    );
  }

  const res = new NextResponse(backend.body, {
    status: backend.status,
    statusText: backend.statusText,
  });
  const ct = backend.headers.get("content-type");
  if (ct) res.headers.set("content-type", ct);
  return res;
}

export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
export const PUT = proxy;
export const DELETE = proxy;

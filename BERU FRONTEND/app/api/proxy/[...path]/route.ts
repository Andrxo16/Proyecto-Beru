import { NextRequest, NextResponse } from "next/server";

const upstreamBase = () =>
  (process.env.BERU_API_PROXY_TARGET || "http://127.0.0.1:8000").replace(
    /\/$/,
    ""
  );

export const runtime = "nodejs";

function buildTarget(req: NextRequest, segments: string[]): string {
  const rel = segments.length ? `${segments.join("/")}/` : "";
  const u = new URL(rel, `${upstreamBase()}/`);
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

async function proxy(
  req: NextRequest,
  ctx: { params: Promise<{ path?: string[] }> }
) {
  const { path: segments = [] } = await ctx.params;
  const url = buildTarget(req, segments);
  const hasBody = !["GET", "HEAD"].includes(req.method);
  const backend = await fetch(url, {
    method: req.method,
    headers: forwardHeaders(req.headers),
    body: hasBody ? await req.arrayBuffer() : undefined,
    cache: "no-store",
  });

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

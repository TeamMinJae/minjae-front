import { NextResponse } from "next/server"

const VIDEO_API_URL = "http://54.206.68.85/videos"
const TIMEOUT_MS = 30 * 60 * 1000 // 30분

export async function POST(req: Request) {
  const payload = await req.json()

  // 외부 API에 전달할 최종 바디 (baseVideo를 그대로 전달)
  const body = {
    roomId: payload.roomId,
    winner: payload.winner,
    others: payload.others,
    baseVideo: payload.baseVideo,
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const res = await fetch(VIDEO_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json(
        { error: `Video API error: ${res.status} ${res.statusText}`, detail: text },
        { status: 500 },
      )
    }

    const data = await res.json()
    // data => { videoUrl: "...", ... }
    return NextResponse.json(data)
  } catch (e: any) {
    clearTimeout(timeout)
    const msg = e.name === "AbortError" ? "Video generation timed out." : e.message
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"

interface VideoPlayerProps {
  videoUrl: string | null | undefined // null 또는 undefined를 허용하도록 타입 변경
  onEnded: () => void
}

export function VideoPlayer({ videoUrl, onEnded }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const videoElement = videoRef.current
    if (videoElement && videoUrl && !videoUrl.includes("placeholder.svg")) {
      // 실제 영상 URL일 경우에만 재생 시도
      // HTML <video> 태그는 기본적으로 프로그레시브 다운로드(Progressive Download)를 지원하여
      // 영상 전체를 다운로드하기 전에 재생을 시작할 수 있습니다.
      // 이는 사용자가 영상을 스트리밍하는 것처럼 느끼게 합니다.
      videoElement.onended = onEnded
      videoElement.play().catch((error) => console.error("Video play failed:", error))
    }
    return () => {
      if (videoElement) {
        videoElement.onended = null
      }
    }
  }, [videoUrl, onEnded])

  if (!videoUrl) {
    // videoUrl이 없으면 아무것도 렌더링하지 않음
    return null
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="aspect-video w-full bg-black flex items-center justify-center">
          {/* 실제 영상 파일이 아닌 경우 placeholder 이미지 표시 */}
          {videoUrl.includes("placeholder.svg") ? (
            <img src={videoUrl || "/placeholder.svg"} alt="영상 추첨 결과" className="w-full h-full object-contain" />
          ) : (
            <video ref={videoRef} src={videoUrl} controls className="w-full h-full object-contain" />
          )}
        </div>
      </CardContent>
    </Card>
  )
}

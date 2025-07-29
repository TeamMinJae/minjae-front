"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Copy, Check, Share2 } from "lucide-react"

interface RoomLinkShareProps {
  roomId: string
}

export function RoomLinkShare({ roomId }: RoomLinkShareProps) {
  const [copied, setCopied] = useState(false)
  const roomUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/room/${roomId}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(roomUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
      // Fallback for older browsers
      const textArea = document.createElement("textarea")
      textArea.value = roomUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "벌칙자 추첨 참여",
          text: "벌칙자 추첨에 참여해주세요!",
          url: roomUrl,
        })
      } catch (error) {
        console.error("Failed to share:", error)
        handleCopy()
      }
    } else {
      handleCopy()
    }
  }

  return (
    <Card className="border-[#2C73D2] border-2">
      <CardHeader>
        <CardTitle className="text-lg text-[#2C73D2] flex items-center gap-2">
          <Share2 className="w-5 h-5" />
          참여 링크 공유
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input value={roomUrl} readOnly className="flex-1 bg-gray-50" />
          <Button onClick={handleCopy} variant="outline" className="px-3 bg-transparent">
            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>

        <Button onClick={handleShare} className="w-full bg-[#2C73D2] hover:bg-[#2C73D2]/90">
          <Share2 className="w-4 h-4 mr-2" />
          링크 공유하기
        </Button>

        <p className="text-sm text-gray-600 text-center">이 링크를 친구들에게 공유해서 추첨에 참여시키세요!</p>
      </CardContent>
    </Card>
  )
}

"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Share2, RotateCcw } from "lucide-react"
import { shareResult } from "@/lib/utils"

interface RevealResultProps {
  loser: string
  roomId: string
  onRetry: () => void
  isHost: boolean // isHost prop 추가
}

export function RevealResult({ loser, roomId, onRetry, isHost }: RevealResultProps) {
  const handleShare = () => {
    shareResult(roomId, loser)
  }

  return (
    <div className="space-y-6 text-center">
      <Card className="border-[#FF616D] border-2">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="text-6xl">🎯</div>
            <h2 className="text-2xl font-bold text-[#FF616D]">벌칙자 발표!</h2>
            <div className="text-3xl font-bold text-[#2C73D2]">{loser}님</div>
            <p className="text-gray-600">축하합니다!🎉</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button onClick={handleShare} className="flex-1 bg-[#2C73D2] hover:bg-[#2C73D2]/90">
          <Share2 className="w-4 h-4 mr-2" />
          공유하기
        </Button>

        {isHost && ( // 방장에게만 다시하기 버튼 표시
          <Button
            onClick={onRetry}
            variant="outline"
            className="flex-1 border-[#FF616D] text-[#FF616D] hover:bg-[#FF616D]/10 bg-transparent"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            다시하기
          </Button>
        )}
      </div>
    </div>
  )
}

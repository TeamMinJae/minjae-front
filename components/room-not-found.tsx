"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, Home } from "lucide-react"
import { useRouter } from "next/navigation"

export function RoomNotFound({ roomId }: { roomId: string }) {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2C73D2]/10 to-[#FF616D]/10 p-4">
      <div className="max-w-md mx-auto pt-8">
        <Card className="border-[#FF616D] border-2">
          <CardContent className="p-6 text-center space-y-4">
            <AlertCircle className="w-16 h-16 text-[#FF616D] mx-auto" />
            <h2 className="text-xl font-bold text-[#FF616D]">방을 찾을 수 없습니다</h2>
            <div className="space-y-2">
              <p className="text-gray-600">방 ID: {roomId}</p>
              <p className="text-sm text-gray-500">존재하지 않는 방이거나 이미 종료된 방입니다.</p>
            </div>
            <Button onClick={() => router.push("/")} className="w-full bg-[#2C73D2] hover:bg-[#2C73D2]/90">
              <Home className="w-4 h-4 mr-2" />
              홈으로 돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ParticipantInput } from "@/components/participant-input"
import { HostNameInput } from "@/components/host-name-input"
import { createRoom } from "@/lib/api"
import { useRoom } from "@/lib/room-context"
import { Loader2, ArrowLeft } from "lucide-react"

type Step = "host-name" | "participants"

export default function HomePage() {
  const [currentStep, setCurrentStep] = useState<Step>("host-name")
  const [hostName, setHostName] = useState("")
  const [participants, setParticipants] = useState<string[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const router = useRouter()
  const { dispatch } = useRoom()

  const handleHostNameSet = (name: string) => {
    setHostName(name)
    setCurrentStep("participants")
  }

  const handleAddParticipant = (name: string) => {
    setParticipants((prev) => [...prev, name])
  }

  const handleRemoveParticipant = (index: number) => {
    setParticipants((prev) => prev.filter((_, i) => i !== index))
  }

  const handleCreateRoom = async () => {
    // 전체 참가자 목록 (방장 + 추가 참가자들)
    const allParticipants = [hostName, ...participants]

    if (allParticipants.length < 2) {
      alert("최소 2명 이상의 참여자가 필요합니다")
      return
    }

    setIsCreating(true)
    try {
      const response = await createRoom(allParticipants)
      if (response.success && response.data) {
        dispatch({
          type: "SET_ROOM",
          payload: {
            roomId: response.data.roomId,
            participants: response.data.participants,
            isHost: true, // 방을 만든 사람은 방장
          },
        })

        // 바로 대기방으로 이동
        router.push(`/room/${response.data.roomId}?host=${encodeURIComponent(hostName)}`)
      } else {
        alert(response.error || "방 생성에 실패했습니다")
      }
    } catch (error) {
      console.error("Error creating room:", error)
      alert("방 생성 중 오류가 발생했습니다")
    } finally {
      setIsCreating(false)
    }
  }

  const handleBackToHostName = () => {
    setCurrentStep("host-name")
    setParticipants([])
  }

  const totalParticipants = hostName ? [hostName, ...participants].length : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2C73D2]/10 to-[#FF616D]/10 p-4">
      <div className="max-w-md mx-auto pt-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#2C73D2] mb-2">벌칙자 추첨</h1>
          <p className="text-gray-600">공정하고 재미있는 벌칙자 추첨 서비스</p>
        </div>

        {/* 단계 표시 */}
        {currentStep !== "room-created" && (
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center space-x-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep === "host-name" ? "bg-[#2C73D2] text-white" : "bg-gray-200 text-gray-600"
                }`}
              >
                1
              </div>
              <div className="w-8 h-1 bg-gray-200"></div>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep === "participants" ? "bg-[#2C73D2] text-white" : "bg-gray-200 text-gray-600"
                }`}
              >
                2
              </div>
            </div>
          </div>
        )}

        {/* 방장 이름 입력 단계 */}
        {currentStep === "host-name" && <HostNameInput onHostNameSet={handleHostNameSet} />}

        {/* 참가자 입력 단계 */}
        {currentStep === "participants" && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={handleBackToHostName} className="p-1">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <CardTitle className="text-lg">참여자 추가</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <ParticipantInput
                hostName={hostName}
                participants={participants}
                onAddParticipant={handleAddParticipant}
                onRemoveParticipant={handleRemoveParticipant}
              />

              <Button
                onClick={handleCreateRoom}
                disabled={totalParticipants < 2 || isCreating}
                className="w-full bg-[#2C73D2] hover:bg-[#2C73D2]/90 h-12 text-lg"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />방 생성 중...
                  </>
                ) : (
                  "추첨 링크 만들기"
                )}
              </Button>

              {totalParticipants < 2 && (
                <p className="text-sm text-gray-500 text-center">
                  최소 2명 이상의 참여자가 필요합니다 (현재: {totalParticipants}명)
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

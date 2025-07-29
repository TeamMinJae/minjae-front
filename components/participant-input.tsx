"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Plus, Crown, Users } from "lucide-react"

interface ParticipantInputProps {
  hostName: string
  participants: string[]
  onAddParticipant: (name: string) => void
  onRemoveParticipant: (index: number) => void
  maxParticipants?: number
}

export function ParticipantInput({
  hostName,
  participants,
  onAddParticipant,
  onRemoveParticipant,
  maxParticipants = 10,
}: ParticipantInputProps) {
  const [inputValue, setInputValue] = useState("")
  const [error, setError] = useState("")

  // 전체 참가자 목록 (방장 + 추가 참가자들)
  const allParticipants = [hostName, ...participants]

  const handleAdd = () => {
    const trimmedName = inputValue.trim()

    if (!trimmedName) {
      setError("이름을 입력해주세요")
      return
    }

    if (allParticipants.includes(trimmedName)) {
      setError("이미 추가된 이름입니다")
      return
    }

    if (allParticipants.length >= maxParticipants) {
      setError(`최대 ${maxParticipants}명까지 추가할 수 있습니다`)
      return
    }

    onAddParticipant(trimmedName)
    setInputValue("")
    setError("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAdd()
    }
  }

  return (
    <div className="space-y-4">
      {/* 방장 정보 표시 */}
      <Card className="bg-[#2C73D2]/5 border-[#2C73D2]/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-[#2C73D2]" />
            <span className="text-sm text-gray-600">방장:</span>
            <span className="font-medium text-[#2C73D2]">{hostName}</span>
          </div>
        </CardContent>
      </Card>

      {/* 추가 참가자 입력 */}
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value)
            setError("")
          }}
          onKeyPress={handleKeyPress}
          placeholder="추가 참가자 이름 입력"
          className="flex-1"
          disabled={allParticipants.length >= maxParticipants}
          maxLength={10}
        />
        <Button
          onClick={handleAdd}
          disabled={allParticipants.length >= maxParticipants}
          className="bg-[#2C73D2] hover:bg-[#2C73D2]/90"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {error && <p className="text-sm text-[#FF616D]">{error}</p>}

      {/* 전체 참가자 목록 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-gray-600 flex items-center gap-2">
            <Users className="w-4 h-4" />
            전체 참가자 목록 ({allParticipants.length}/{maxParticipants})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-2">
            {/* 방장 표시 */}
            <div className="flex items-center justify-between bg-[#2C73D2]/10 p-3 rounded border border-[#2C73D2]/20">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-[#2C73D2]" />
                <span className="font-medium">{hostName}</span>
              </div>
              <span className="text-xs bg-[#2C73D2] text-white px-2 py-1 rounded">방장</span>
            </div>

            {/* 추가 참가자들 */}
            {participants.map((name, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                <span>{name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveParticipant(index)}
                  className="h-6 w-6 p-0 hover:bg-[#FF616D]/10"
                >
                  <X className="w-3 h-3 text-[#FF616D]" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

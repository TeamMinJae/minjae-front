"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Crown } from "lucide-react"

interface HostNameInputProps {
  onHostNameSet: (hostName: string) => void
}

export function HostNameInput({ onHostNameSet }: HostNameInputProps) {
  const [hostName, setHostName] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = () => {
    const trimmedName = hostName.trim()

    if (!trimmedName) {
      setError("방장 이름을 입력해주세요")
      return
    }

    if (trimmedName.length > 10) {
      setError("이름은 10자 이하로 입력해주세요")
      return
    }

    onHostNameSet(trimmedName)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit()
    }
  }

  return (
    <Card className="border-[#2C73D2] border-2">
      <CardHeader>
        <CardTitle className="text-lg text-[#2C73D2] flex items-center gap-2">
          <Crown className="w-5 h-5" />
          방장 정보 입력
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="hostName" className="text-sm font-medium text-gray-700">
            방장의 이름을 입력해주세요
          </label>
          <Input
            id="hostName"
            value={hostName}
            onChange={(e) => {
              setHostName(e.target.value)
              setError("")
            }}
            onKeyPress={handleKeyPress}
            placeholder="예: 김철수"
            className="text-center text-lg"
            maxLength={10}
          />
          {error && <p className="text-sm text-[#FF616D]">{error}</p>}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!hostName.trim()}
          className="w-full bg-[#2C73D2] hover:bg-[#2C73D2]/90 h-12 text-lg"
        >
          다음 단계로
        </Button>

        <p className="text-sm text-gray-600 text-center">방장은 추첨을 시작할 수 있는 권한을 가집니다</p>
      </CardContent>
    </Card>
  )
}

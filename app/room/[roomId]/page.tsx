"use client"

import { useState, useEffect } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ResultCarousel } from "@/components/result-carousel"
import { RevealResult } from "@/components/reveal-result"
import { useRoom } from "@/lib/room-context"
import { startDraw, getRoomStatus, checkIsHost, resetRoomStatus } from "@/lib/api"
import { Loader2, Users, ImageIcon, Video } from "lucide-react"
import { RoomNotFound } from "@/components/room-not-found"
import { RoomLinkShare } from "@/components/room-link-share"
import { VideoPlayer } from "@/components/video-player"

export default function RoomPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const roomId = params.roomId as string
  const { state, dispatch } = useRoom()
  const [isDrawing, setIsDrawing] = useState(false)
  const [roomNotFound, setRoomNotFound] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [drawType, setDrawType] = useState<"image" | "video">("image") // 추첨 방식 상태

  // URL 파라미터에서 사용자 이름 가져오기 (방장인 경우)
  const hostName = searchParams.get("host")

  // 방 정보 초기 로드
  useEffect(() => {
    const fetchRoomInfo = async () => {
      setIsLoading(true)
      try {
        const response = await getRoomStatus(roomId)
        if (response.success && response.data) {
          if (!response.data.participants || response.data.participants.length === 0) {
            setRoomNotFound(true)
            return
          }

          let isHost = false
          if (hostName) {
            isHost = await checkIsHost(roomId, hostName)
          }

          // Set initial room state based on server data
          dispatch({
            type: "SET_ROOM",
            payload: {
              roomId,
              participants: response.data.participants,
              isHost,
            },
          })

          // If draw already started on server, update client state
          if (response.data.isStarted) {
            dispatch({
              type: "START_DRAW",
              payload: {
                loser: response.data.loser || "",
                memeUrls: response.data.memeUrls || null,
                videoUrl: response.data.videoUrl || null,
              },
            })
          }
        } else {
          setRoomNotFound(true)
        }
      } catch (error) {
        console.error("Error fetching room info:", error)
        setRoomNotFound(true)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRoomInfo()
  }, [roomId, hostName, dispatch])

  // 상태 폴링
  useEffect(() => {
    if (roomNotFound || isLoading) return // 방을 찾을 수 없거나 로딩 중이면 폴링 중지

    const pollStatus = async () => {
      try {
        const response = await getRoomStatus(roomId)
        if (response.success && response.data) {
          // Always update the core room status based on the latest server data
          dispatch({
            type: "UPDATE_STATUS",
            payload: {
              isStarted: response.data.isStarted,
              loser: response.data.loser || undefined,
              memeUrls: response.data.memeUrls || null,
              videoUrl: response.data.videoUrl || null,
            },
          })

          // If the server indicates the room is NOT started, but the client is in a started/revealed state,
          // then reset the client's state to go back to the waiting room.
          // This covers the "Retry" scenario for participants.
          if (!response.data.isStarted && (state.isStarted || state.isRevealShown)) {
            dispatch({ type: "RESET_ROOM" })
          }

          // Update participants list if it has changed (e.g., host adds/removes before draw)
          if (JSON.stringify(state.participants) !== JSON.stringify(response.data.participants)) {
            dispatch({
              type: "SET_ROOM", // This action also updates participants and host status
              payload: {
                roomId: state.roomId,
                participants: response.data.participants || [],
                isHost: state.isHost, // Keep current client's host status
              },
            })
          }
        } else {
          // If room status cannot be fetched (e.g., room deleted), set not found and stop polling
          setRoomNotFound(true)
        }
      } catch (error) {
        console.error("Error polling status:", error)
      }
    }

    const interval = setInterval(pollStatus, 2000) // 2초마다 폴링
    return () => clearInterval(interval)
  }, [
    roomId,
    state.isStarted,
    state.isRevealShown,
    state.participants,
    state.isHost,
    dispatch,
    roomNotFound,
    isLoading,
  ])

  const handleStartDraw = async () => {
    setIsDrawing(true)
    // Polling will continue and update state based on server response

    try {
      const response = await startDraw(roomId, drawType)
      if (response.success && response.data) {
        // The polling useEffect will pick up this change from the server
        // and dispatch START_DRAW or UPDATE_STATUS accordingly.
        // For immediate feedback for the host, we can dispatch it here.
        dispatch({
          type: "START_DRAW",
          payload: response.data,
        })
      } else {
        alert(response.error || "추첨 시작에 실패했습니다")
      }
    } catch (error) {
      console.error("Error starting draw:", error)
      alert("추첨 중 오류가 발생했습니다")
    } finally {
      setIsDrawing(false)
    }
  }

  const handleCarouselComplete = () => {
    dispatch({ type: "SHOW_REVEAL" })
  }

  const handleVideoEnded = () => {
    dispatch({ type: "SHOW_REVEAL" })
  }

  const handleRetry = async () => {
    if (!state.isHost) return

    setIsLoading(true)
    try {
      const resetResponse = await resetRoomStatus(roomId)
      if (!resetResponse.success) {
        alert(resetResponse.error || "방 상태 초기화에 실패했습니다.")
        return
      }

      // After resetting on server, fetch status to sync client.
      // The polling useEffect will also pick this up.
      const response = await getRoomStatus(roomId)
      if (response.success && response.data) {
        dispatch({
          type: "SET_ROOM", // This will reset isStarted, isRevealShown to false
          payload: {
            roomId,
            participants: response.data.participants || [],
            isHost: state.isHost,
          },
        })
      } else {
        setRoomNotFound(true)
      }
    } catch (error) {
      console.error("Error resetting room status:", error)
      alert("방 상태 초기화 중 오류가 발생했습니다.")
      setRoomNotFound(true)
    } finally {
      setIsLoading(false)
    }
  }

  // 로딩 중
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#2C73D2]/10 to-[#FF616D]/10 p-4">
        <div className="max-w-md mx-auto pt-8">
          <Card>
            <CardContent className="p-6 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p>방 정보를 불러오는 중...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // 방을 찾을 수 없는 경우
  if (roomNotFound) {
    return <RoomNotFound roomId={roomId} />
  }

  // 결과 화면 (벌칙자 공개)
  if (state.isRevealShown && state.loser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#2C73D2]/10 to-[#FF616D]/10 p-4">
        <div className="max-w-md mx-auto pt-8">
          <RevealResult loser={state.loser} roomId={roomId} onRetry={handleRetry} isHost={state.isHost || false} />
        </div>
      </div>
    )
  }

  // 캐로셀 또는 영상 화면
  if (state.isStarted && (state.memeUrls || state.videoUrl)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#2C73D2]/10 to-[#FF616D]/10 p-4">
        <div className="max-w-md mx-auto pt-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-[#2C73D2]">추첨 결과 발표</h1>
            <p className="text-gray-600 mt-2">과연 벌칙자는 누구일까요? 🤔</p>
          </div>

          {state.videoUrl ? (
            <VideoPlayer videoUrl={state.videoUrl} onEnded={handleVideoEnded} />
          ) : (
            state.memeUrls && <ResultCarousel memeUrls={state.memeUrls} onComplete={handleCarouselComplete} />
          )}
        </div>
      </div>
    )
  }

  // 대기 화면
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2C73D2]/10 to-[#FF616D]/10 p-4">
      <div className="max-w-md mx-auto pt-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[#2C73D2]">대기방</h1>
          <p className="text-gray-600 mt-2">방 ID: {roomId}</p>
        </div>

        {/* 방장인 경우에만 링크 공유 카드 표시 */}
        {state.isHost && (
          <div className="mb-6">
            <RoomLinkShare roomId={roomId} />
          </div>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              참여자 목록
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {state.participants.map((name, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                  <span className="font-medium">{name}</span>
                  {index === 0 && <span className="text-xs bg-[#2C73D2] text-white px-2 py-1 rounded">방장</span>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="space-y-4">
              <div className="text-lg text-gray-600">아직 추첨 전입니다</div>

              {state.isHost ? (
                <>
                  <div className="flex flex-col gap-3">
                    <Button
                      onClick={() => setDrawType("image")}
                      variant={drawType === "image" ? "default" : "outline"}
                      className={`w-full h-12 text-lg ${
                        drawType === "image"
                          ? "bg-[#2C73D2] hover:bg-[#2C73D2]/90"
                          : "border-[#2C73D2] text-[#2C73D2] hover:bg-[#2C73D2]/10"
                      }`}
                    >
                      <ImageIcon className="w-5 h-5 mr-2" />
                      이미지 추첨
                    </Button>
                    <Button
                      onClick={() => setDrawType("video")}
                      variant={drawType === "video" ? "default" : "outline"}
                      className={`w-full h-12 text-lg ${
                        drawType === "video"
                          ? "bg-[#2C73D2] hover:bg-[#2C73D2]/90"
                          : "border-[#2C73D2] text-[#2C73D2] hover:bg-[#2C73D2]/10"
                      }`}
                    >
                      <Video className="w-5 h-5 mr-2" />
                      영상 추첨
                    </Button>
                  </div>

                  <Button
                    onClick={handleStartDraw}
                    disabled={isDrawing}
                    className="w-full bg-[#FF616D] hover:bg-[#FF616D]/90 h-12 text-lg mt-4"
                  >
                    {isDrawing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        추첨 중...
                      </>
                    ) : (
                      "추첨 시작!"
                    )}
                  </Button>
                  <p className="text-sm text-gray-500">방장만 추첨을 시작할 수 있습니다</p>
                </>
              ) : (
                <div className="space-y-2">
                  <div className="text-gray-500">방장이 추첨을 시작하기를 기다리고 있습니다...</div>
                  <div className="animate-pulse text-[#2C73D2]">⏳</div>
                  <div className="text-xs text-gray-400">참가자 수: {state.participants.length}명</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

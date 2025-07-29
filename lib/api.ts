import { supabase } from "./supabase"
import type { CreateRoomResponse, DrawResponse, StatusResponse, ApiResponse } from "@/types/room"

export async function createRoom(nicknames: string[]): Promise<ApiResponse<CreateRoomResponse>> {
  try {
    // 방 ID 생성
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase()

    // 방 생성
    const { data: roomData, error: roomError } = await supabase
      .from("rooms")
      .insert({
        room_id: roomId,
        is_started: false,
      })
      .select()
      .single()

    if (roomError) {
      console.error("Room creation error:", roomError)
      return {
        success: false,
        error: "방 생성에 실패했습니다",
      }
    }

    // 참가자들 추가 (첫 번째 참가자는 방장)
    const usersToInsert = nicknames.map((name, index) => ({
      room_id: roomId,
      name,
      is_host: index === 0, // 첫 번째 참가자가 방장
    }))

    const { data: usersData, error: usersError } = await supabase.from("users").insert(usersToInsert).select()

    if (usersError) {
      console.error("Users creation error:", usersError)
      // 방 생성은 성공했지만 참가자 추가 실패 시 방 삭제
      await supabase.from("rooms").delete().eq("room_id", roomId)
      return {
        success: false,
        error: "참가자 등록에 실패했습니다",
      }
    }

    return {
      success: true,
      data: {
        roomId,
        participants: nicknames,
      },
    }
  } catch (error) {
    console.error("Create room error:", error)
    return {
      success: false,
      error: "방 생성 중 오류가 발생했습니다",
    }
  }
}

export async function startDraw(roomId: string, drawType: "image" | "video"): Promise<ApiResponse<DrawResponse>> {
  try {
    // 방의 참가자들 가져오기
    const { data: users, error: usersError } = await supabase.from("users").select("*").eq("room_id", roomId)

    if (usersError || !users || users.length === 0) {
      return {
        success: false,
        error: "참가자를 찾을 수 없습니다",
      }
    }

    // 랜덤으로 벌칙자 선택
    const randomIndex = Math.floor(Math.random() * users.length)
    const loser = users[randomIndex]

    let memeUrlsToSave: string[] | null = null
    let videoUrlToSave: string | null = null

    if (drawType === "image") {
      // 이미지 추첨 방식
      memeUrlsToSave = [
        "/placeholder.svg?height=400&width=400&text=첫번째+컷",
        "/placeholder.svg?height=400&width=400&text=두번째+컷",
        "/placeholder.svg?height=400&width=400&text=세번째+컷",
        "/placeholder.svg?height=400&width=400&text=마지막+컷",
      ]
    } else if (drawType === "video") {
      // 영상 추첨 방식
      console.log(
        `Calling external video API with participants: ${users.map((u) => u.name).join(", ")} and loser: ${loser.name}`,
      )

      const otherParticipants = users.filter((u) => u.id !== loser.id).map((u) => u.name)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 300000) // 5분 타임아웃

      try {
        const videoApiResponse = await fetch("/api/generate-video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roomId,
            winner: loser.name,
            others: otherParticipants,
            baseVideo: "1",
          }),
        })

        clearTimeout(timeoutId)

        if (!videoApiResponse.ok) {
          const { error } = await videoApiResponse.json()
          throw new Error(error || "Video generation API error")
        }

        const { videoUrl } = (await videoApiResponse.json()) as { videoUrl: string }
        if (!videoUrl) throw new Error("Video URL not received from API.")
        videoUrlToSave = videoUrl
      } catch (apiError: any) {
        clearTimeout(timeoutId)
        if (apiError.name === "AbortError") {
          console.error("Video generation API request timed out:", apiError)
          return {
            success: false,
            error: "영상 생성 요청이 5분 동안 응답이 없어 타임아웃되었습니다. 다시 시도해주세요.",
          }
        }
        console.error("Error calling video generation API:", apiError)
        return {
          success: false,
          error: `영상 생성 API 호출 실패: ${apiError.message}`,
        }
      }
    }

    // 방 상태 업데이트
    const { error: updateError } = await supabase
      .from("rooms")
      .update({
        is_started: true,
        loser_id: loser.id,
        meme_urls: memeUrlsToSave,
        video_url: videoUrlToSave,
      })
      .eq("room_id", roomId)

    if (updateError) {
      console.error("Room update error:", updateError)
      return {
        success: false,
        error: "추첨 시작에 실패했습니다",
      }
    }

    return {
      success: true,
      data: {
        loser: loser.name,
        memeUrls: memeUrlsToSave,
        videoUrl: videoUrlToSave,
      },
    }
  } catch (error) {
    console.error("Start draw error:", error)
    return {
      success: false,
      error: "추첨 중 오류가 발생했습니다",
    }
  }
}

export async function getRoomStatus(
  roomId: string,
): Promise<ApiResponse<StatusResponse & { participants?: string[]; isHost?: boolean }>> {
  try {
    // 방 정보 가져오기
    const { data: room, error: roomError } = await supabase
      .from("rooms")
      .select(`
        *,
        loser:users!loser_id(name)
      `)
      .eq("room_id", roomId)
      .single()

    if (roomError) {
      console.error("Room fetch error:", roomError)
      return {
        success: false,
        error: "방을 찾을 수 없습니다",
      }
    }

    // 참가자들 가져오기
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("*")
      .eq("room_id", roomId)
      .order("created_at", { ascending: true })

    if (usersError) {
      console.error("Users fetch error:", usersError)
      return {
        success: false,
        error: "참가자 정보를 가져올 수 없습니다",
      }
    }

    const participants = users?.map((user) => user.name) || []
    const loserName = room.loser ? (room.loser as any).name : undefined

    return {
      success: true,
      data: {
        isStarted: room.is_started,
        loser: loserName,
        memeUrls: room.meme_urls,
        videoUrl: room.video_url,
        participants,
        isHost: false,
      },
    }
  } catch (error) {
    console.error("Get room status error:", error)
    return {
      success: false,
      error: "방 상태를 가져올 수 없습니다",
    }
  }
}

// 사용자가 방장인지 확인하는 함수
export async function checkIsHost(roomId: string, userName: string): Promise<boolean> {
  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("is_host")
      .eq("room_id", roomId)
      .eq("name", userName)
      .single()

    if (error || !user) {
      return false
    }

    return user.is_host
  } catch (error) {
    console.error("Check host error:", error)
    return false
  }
}

// 방 상태를 초기화하는 함수 (is_started를 false로, 결과 관련 필드를 null로)
export async function resetRoomStatus(roomId: string): Promise<ApiResponse<null>> {
  try {
    const { error } = await supabase
      .from("rooms")
      .update({
        is_started: false,
        loser_id: null,
        meme_urls: null,
        video_url: null,
      })
      .eq("room_id", roomId)

    if (error) {
      console.error("Failed to reset room status:", error)
      return { success: false, error: "방 상태 초기화에 실패했습니다." }
    }

    return { success: true, data: null }
  } catch (error) {
    console.error("Error resetting room status:", error)
    return { success: false, error: "방 상태 초기화 중 오류가 발생했습니다." }
  }
}

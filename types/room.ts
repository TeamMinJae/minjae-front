export type RoomState = {
  roomId: string
  participants: string[]
  isStarted: boolean
  loser?: string
  memeUrls?: string[] | null // null을 허용하도록 변경
  videoUrl?: string | null // null을 허용하도록 변경
  isRevealShown?: boolean
  isHost?: boolean
}

export type ApiResponse<T> = {
  success: boolean
  data?: T
  error?: string
}

export type CreateRoomResponse = {
  roomId: string
  participants: string[]
}

export type DrawResponse = {
  loser: string
  memeUrls?: string[] | null // null을 허용하도록 변경
  videoUrl?: string | null // null을 허용하도록 변경
}

export type StatusResponse = {
  isStarted: boolean
  loser?: string
  memeUrls?: string[] | null // null을 허용하도록 변경
  videoUrl?: string | null // null을 허용하도록 변경
}

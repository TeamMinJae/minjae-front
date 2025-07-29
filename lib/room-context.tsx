"use client"

import type React from "react"

import { createContext, useContext, useReducer } from "react"
import type { RoomState } from "@/types/room"

type RoomAction =
  | { type: "SET_ROOM"; payload: { roomId: string; participants: string[]; isHost?: boolean } }
  | { type: "SET_HOST"; payload: { isHost: boolean } }
  | { type: "START_DRAW"; payload: { loser: string; memeUrls?: string[] | null; videoUrl?: string | null } }
  | {
      type: "UPDATE_STATUS"
      payload: { isStarted: boolean; loser?: string; memeUrls?: string[] | null; videoUrl?: string | null }
    }
  | { type: "SHOW_REVEAL" }
  | { type: "RESET_ROOM" }

const initialState: RoomState = {
  roomId: "",
  participants: [],
  isStarted: false,
  isRevealShown: false,
}

function roomReducer(state: RoomState, action: RoomAction): RoomState {
  switch (action.type) {
    case "SET_ROOM":
      return {
        ...state,
        roomId: action.payload.roomId,
        participants: action.payload.participants,
        isStarted: false, // 명확히 false
        loser: undefined,
        memeUrls: undefined,
        videoUrl: undefined,
        isRevealShown: false,
        isHost: action.payload.isHost ?? false,
      }
    case "SET_HOST":
      return {
        ...state,
        isHost: action.payload.isHost,
      }
    case "START_DRAW":
      return {
        ...state,
        isStarted: true,
        loser: action.payload.loser,
        memeUrls: action.payload.memeUrls,
        videoUrl: action.payload.videoUrl,
        isRevealShown: false,
      }
    case "UPDATE_STATUS":
      return {
        ...state,
        isStarted: action.payload.isStarted,
        loser: action.payload.loser,
        memeUrls: action.payload.memeUrls,
        videoUrl: action.payload.videoUrl,
      }
    case "SHOW_REVEAL":
      return {
        ...state,
        isRevealShown: true,
      }
    case "RESET_ROOM":
      return {
        ...state,
        isStarted: false, // 명확히 false
        loser: undefined,
        memeUrls: undefined,
        videoUrl: undefined,
        isRevealShown: false,
      }
    default:
      return state
  }
}

const RoomContext = createContext<{
  state: RoomState
  dispatch: React.Dispatch<RoomAction>
} | null>(null)

export function RoomProvider({ children }: { ReactNode }) {
  const [state, dispatch] = useReducer(roomReducer, initialState)

  return <RoomContext.Provider value={{ state, dispatch }}>{children}</RoomContext.Provider>
}

export function useRoom() {
  const context = useContext(RoomContext)
  if (!context) {
    throw new Error("useRoom must be used within a RoomProvider")
  }
  return context
}

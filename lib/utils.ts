import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function shareResult(roomId: string, loser: string) {
  const url = `${window.location.origin}/room/${roomId}`
  const text = `벌칙자 추첨 결과: ${loser}님이 선택되었습니다! 🎯`

  if (navigator.share) {
    navigator
      .share({
        title: "벌칙자 추첨 결과",
        text,
        url,
      })
      .catch(console.error)
  } else {
    // Fallback: copy to clipboard
    navigator.clipboard
      .writeText(`${text} ${url}`)
      .then(() => {
        alert("결과가 클립보드에 복사되었습니다!")
      })
      .catch(() => {
        alert("공유 기능을 사용할 수 없습니다.")
      })
  }
}

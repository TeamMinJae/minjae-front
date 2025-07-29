import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { RoomProvider } from "@/lib/room-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "벌칙자 추첨",
  description: "추첨은 공정하게, 결과는 검허하게",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <RoomProvider>{children}</RoomProvider>
      </body>
    </html>
  )
}

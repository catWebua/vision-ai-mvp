import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AI Vision MVP | Moondream2 + Modal",
  description: "Next-gen image analysis powered by Modal AI and Moondream2.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className={`${inter.className} bg-[#020205] text-white antialiased selection:bg-white selection:text-black`}>
        {children}
        <Toaster position="bottom-right" theme="dark" closeButton />
      </body>
    </html>
  )
}

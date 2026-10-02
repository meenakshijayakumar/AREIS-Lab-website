import type { Metadata } from 'next'
import { DM_Sans, Source_Serif_4 } from 'next/font/google'
import './globals.css'

const sans = DM_Sans({ subsets: ['latin'], variable: '--font-sans' })
const serif = Source_Serif_4({ subsets: ['latin'], variable: '--font-serif' })

export const metadata: Metadata = {
  title: 'AREIS Lab | Khalifa University',
  description: 'Autonomous Robotics & Embodied Intelligence Systems Lab at Khalifa University.'
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${serif.variable}`}>{children}</body>
    </html>
  )
}

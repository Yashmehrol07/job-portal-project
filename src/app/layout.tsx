import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PyTalent - Find your dream job',
  description: 'The best place to find IT and other professional jobs.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <main style={{ minHeight: 'calc(100vh - 140px)' }}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}

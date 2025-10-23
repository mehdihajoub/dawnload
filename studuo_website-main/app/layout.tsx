import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Studuo',
  description: 'Modern card-based interface',
  themeColor: '#EAE1D2',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="text-white min-h-screen" style={{ backgroundColor: '#EAE1D2' }}>
        {children}
      </body>
    </html>
  )
}

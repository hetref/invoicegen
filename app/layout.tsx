import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import Navbar from '@/components/Navbar'
import './globals.css'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { Toaster } from '@/components/ui/toaster'

export const metadata: Metadata = {
  title: 'Invoice Generator',
  description: 'Generate Invoices for your business seamlessly and save it on cloud.',
  keywords: ['invoice', 'generator', 'business', 'cloud', 'storage', 'open source'],
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {

  const session = await auth.api.getSession({
    headers: await headers()
  })

  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Navbar session={session} />
        <Toaster />
        {children}
      </body>
    </html>
  )
}

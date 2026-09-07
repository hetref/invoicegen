import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import Navbar from '@/components/Navbar'
import './globals.css'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { Toaster } from '@/components/ui/toaster'
import Script from 'next/script'

export const metadata: Metadata = {
  title: 'InvoiceGen — Intelligent Invoice Workspace & Data Extraction',
  description: 'Create bespoke client invoices, extract structured data from incoming receipts using multi-model AI, and manage your financial records in a secure workspace.',
  keywords: ['invoice generator', 'AI invoice extraction', 'Groq invoice', 'Gemini invoice', 'cloud invoices', 'business billing', 'PDF invoice'],
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
      <head>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-6PTZS32VKR"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-6PTZS32VKR');
          `}
        </Script>
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Navbar session={session} />
        <Toaster />
        {children}
      </body>
    </html>
  )
}

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Sparkles,
  Upload,
  FileText,
  FolderTree,
  Mail,
  Shield,
  ArrowRight,
  CheckCircle2,
  Lock,
  ArrowUpRight,
  HardDrive,
  BrainCircuit,
  Send,
  Download,
  Briefcase,
  Building2,
  Laptop,
  Calculator,
  Search,
  Check,
  Zap,
  SlidersHorizontal,
  ChevronRight,
  Layers,
  Inbox,
  FileSpreadsheet
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-neutral-900 font-sans selection:bg-neutral-900 selection:text-white">
      {/* Ambient Top Glow */}
      <div className="relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-gradient-to-b from-neutral-200/50 via-neutral-100/30 to-transparent blur-3xl pointer-events-none -z-10" />

        {/* Hero Section */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-12 sm:pb-20">
          <div className="text-center max-w-3xl mx-auto space-y-4 sm:space-y-6">
            {/* Eyebrow Pill - Responsive single-line on mobile */}
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full border border-neutral-200/90 bg-white/90 shadow-xs text-[11px] sm:text-xs font-medium text-neutral-700 tracking-tight backdrop-blur-xs max-w-full truncate">
              <span className="flex h-1.5 sm:h-2 w-1.5 sm:w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="truncate">Next-Generation Invoice Workspace</span>
              <span className="text-neutral-300 hidden sm:inline">•</span>
              <span className="text-neutral-500 hidden sm:inline">AI-Powered & Self-Contained</span>
            </div>

            {/* Headline - Responsive typography */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-neutral-950 leading-[1.12] sm:leading-[1.08] px-2 sm:px-0">
              Effortless invoicing.
              <br />
              <span className="text-neutral-400 font-normal">
                Intelligent data extraction.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base md:text-lg text-neutral-600 max-w-2xl mx-auto font-normal leading-relaxed px-2 sm:px-0">
              Create bespoke client invoices in seconds, extract structured data from incoming receipts using multi-model AI, and organize your entire financial pipeline in a private, high-speed workspace.
            </p>

            {/* CTA Buttons */}
            <div className="pt-1 sm:pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-3 px-2 sm:px-0">
              <Link href="/sign-up" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto h-11 sm:h-12 px-6 rounded-full bg-neutral-950 hover:bg-neutral-800 text-white font-medium text-sm transition-all duration-200 shadow-sm hover:shadow group gap-2 justify-center">
                  <span>Start Free Workspace</span>
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/10 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                    <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-white" />
                  </div>
                </Button>
              </Link>
              <Link href="#features" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-11 sm:h-12 px-6 rounded-full border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50 font-medium text-sm transition-all shadow-xs justify-center">
                  Explore Capabilities
                </Button>
              </Link>
            </div>

            {/* Micro Highlights - Neatly aligned on mobile & desktop */}
            <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row items-center justify-center gap-y-1.5 sm:gap-x-6 sm:gap-y-2 text-[11px] sm:text-xs text-neutral-500 font-medium">
              <div className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-neutral-800 shrink-0" />
                <span>40MB free storage included</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-neutral-800 shrink-0" />
                <span>Gemini & Groq AI models</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-neutral-800 shrink-0" />
                <span>Custom SMTP delivery</span>
              </div>
            </div>
          </div>

          {/* Hero App Mockup / Double-Bezel Showcase */}
          <div className="mt-8 sm:mt-16 relative">
            <div className="p-1.5 sm:p-3 rounded-xl sm:rounded-3xl bg-neutral-200/60 border border-neutral-300/80 shadow-xl sm:shadow-2xl backdrop-blur-md">
              <div className="rounded-lg sm:rounded-2xl bg-white border border-neutral-200/90 overflow-hidden shadow-inner">
                {/* Browser Window Header */}
                <div className="px-3 sm:px-4 py-2.5 sm:py-3 bg-neutral-50/90 border-b border-neutral-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-neutral-300" />
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-neutral-300" />
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-neutral-300" />
                    <div className="h-3.5 w-[1px] bg-neutral-200 ml-1 hidden sm:block" />
                    <div className="hidden sm:flex items-center gap-1.5 text-xs text-neutral-500 font-mono ml-1">
                      <Lock className="h-3 w-3 text-neutral-400" />
                      <span>workspace.invoicegen.internal/invoices/INV-2025-084</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      AI Verified
                    </span>
                    <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-neutral-100 text-neutral-600 border border-neutral-200">
                      SMTP Ready
                    </span>
                  </div>
                </div>

                {/* Inner Mockup Viewport */}
                <div className="p-3 sm:p-8 bg-[#FBFBFA]">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
                    {/* Left Sidebar Mockup (hidden on extra small screens to keep mobile mockup compact and focused on invoice) */}
                    <div className="hidden sm:block lg:col-span-4 space-y-4">
                      <div className="p-4 rounded-xl bg-white border border-neutral-200/80 shadow-xs space-y-3">
                        <div className="flex items-center justify-between text-xs text-neutral-500">
                          <span className="font-mono uppercase tracking-wider text-[10px]">Folder Hierarchy</span>
                          <span className="text-neutral-400">4 Items</span>
                        </div>
                        <div className="space-y-1.5 text-xs">
                          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-neutral-100 font-medium text-neutral-900">
                            <FolderTree className="h-3.5 w-3.5 text-neutral-700" />
                            <span>Q1 Enterprise Billing</span>
                          </div>
                          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-neutral-600 hover:bg-neutral-50">
                            <FolderTree className="h-3.5 w-3.5 text-neutral-400" />
                            <span>DevAlly Retainers</span>
                          </div>
                          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-neutral-600 hover:bg-neutral-50">
                            <FolderTree className="h-3.5 w-3.5 text-neutral-400" />
                            <span>Vendor Receipts 2025</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-white border border-neutral-200/80 shadow-xs space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono uppercase tracking-wider text-[10px] text-neutral-500">Storage Usage</span>
                          <span className="font-mono text-neutral-900 font-semibold">14.2 MB / 40 MB</span>
                        </div>
                        <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden">
                          <div className="bg-neutral-900 h-2 rounded-full w-[35%]" />
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-neutral-500">
                          <span>35.5% Quota Used</span>
                          <span className="text-emerald-600 font-medium">Optimal</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Invoice Content Preview */}
                    <div className="lg:col-span-8 p-4 sm:p-6 rounded-xl bg-white border border-neutral-200/80 shadow-xs space-y-4 sm:space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 sm:pb-4 border-b border-neutral-100 gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base sm:text-lg font-semibold text-neutral-900">DevAlly</h3>
                            <Badge variant="outline" className="text-[10px] font-mono border-neutral-300">#INV-2025-084</Badge>
                          </div>
                          <p className="text-[11px] sm:text-xs text-neutral-500 mt-0.5">Issued to Horizon Dynamics Inc. • Due Feb 28, 2025</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" className="h-7 sm:h-8 text-[11px] sm:text-xs gap-1 sm:gap-1.5 border-neutral-200 flex-1 sm:flex-initial justify-center">
                            <Download className="h-3 w-3" />
                            <span>Export PDF</span>
                          </Button>
                          <Button size="sm" className="h-7 sm:h-8 text-[11px] sm:text-xs gap-1 sm:gap-1.5 bg-neutral-900 hover:bg-neutral-800 text-white flex-1 sm:flex-initial justify-center">
                            <Send className="h-3 w-3" />
                            <span>Send Invoice</span>
                          </Button>
                        </div>
                      </div>

                      {/* Mockup Line Items Table - Mobile Optimized */}
                      <div className="overflow-x-auto -mx-1 sm:mx-0">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-neutral-100 text-neutral-400 font-medium uppercase text-[10px] tracking-wider">
                              <th className="pb-2">Description</th>
                              <th className="pb-2 text-center hidden sm:table-cell">Qty</th>
                              <th className="pb-2 text-right hidden sm:table-cell">Rate</th>
                              <th className="pb-2 text-right">Amount</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-100 text-neutral-700">
                            <tr>
                              <td className="py-2.5 font-medium text-neutral-900 pr-2">
                                Brand Identity & System
                                <span className="block sm:hidden text-[10px] text-neutral-400 font-normal">Qty 1 • $2,400.00</span>
                              </td>
                              <td className="py-2.5 text-center font-mono hidden sm:table-cell">1</td>
                              <td className="py-2.5 text-right font-mono hidden sm:table-cell">$2,400.00</td>
                              <td className="py-2.5 text-right font-mono font-medium whitespace-nowrap">$2,400.00</td>
                            </tr>
                            <tr>
                              <td className="py-2.5 font-medium text-neutral-900 pr-2">
                                Next.js Application Dev
                                <span className="block sm:hidden text-[10px] text-neutral-400 font-normal">35 hrs • $110.00/hr</span>
                              </td>
                              <td className="py-2.5 text-center font-mono hidden sm:table-cell">35 hrs</td>
                              <td className="py-2.5 text-right font-mono hidden sm:table-cell">$110.00</td>
                              <td className="py-2.5 text-right font-mono font-medium whitespace-nowrap">$3,850.00</td>
                            </tr>
                            <tr>
                              <td className="py-2.5 font-medium text-neutral-900 pr-2">
                                Cloud Infrastructure & Security
                                <span className="block sm:hidden text-[10px] text-neutral-400 font-normal">Qty 1 • $650.00</span>
                              </td>
                              <td className="py-2.5 text-center font-mono hidden sm:table-cell">1</td>
                              <td className="py-2.5 text-right font-mono hidden sm:table-cell">$650.00</td>
                              <td className="py-2.5 text-right font-mono font-medium whitespace-nowrap">$650.00</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* Mockup Total Summary */}
                      <div className="pt-3 border-t border-neutral-100 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2 sm:gap-0">
                        <div className="text-xs text-neutral-500 space-y-0.5">
                          <p className="font-medium text-neutral-800 text-[11px] sm:text-xs">Payment Information</p>
                          <p className="font-mono text-[10px] sm:text-[11px] text-neutral-400">Silicon Valley Bank • Routing: 121000358</p>
                        </div>
                        <div className="text-left sm:text-right space-y-0.5">
                          <div className="text-[11px] sm:text-xs text-neutral-500">Total Balance Due</div>
                          <div className="text-lg sm:text-2xl font-bold font-mono tracking-tight text-neutral-950">
                            $6,900.00
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Metrics & Value Strip */}
      <section className="border-y border-neutral-200/80 bg-white py-6 sm:py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 text-center divide-x-0 sm:divide-x divide-neutral-100">
            <div className="space-y-0.5 sm:space-y-1">
              <div className="text-xl sm:text-3xl font-semibold tracking-tight text-neutral-950 font-mono">&lt; 1.5s</div>
              <p className="text-[11px] sm:text-xs text-neutral-500 font-medium">AI Extraction Speed</p>
            </div>
            <div className="space-y-0.5 sm:space-y-1">
              <div className="text-xl sm:text-3xl font-semibold tracking-tight text-neutral-950 font-mono">100%</div>
              <p className="text-[11px] sm:text-xs text-neutral-500 font-medium">Client Data Isolation</p>
            </div>
            <div className="space-y-0.5 sm:space-y-1">
              <div className="text-xl sm:text-3xl font-semibold tracking-tight text-neutral-950 font-mono">40 MB</div>
              <p className="text-[11px] sm:text-xs text-neutral-500 font-medium">Free Storage Included</p>
            </div>
            <div className="space-y-0.5 sm:space-y-1">
              <div className="text-xl sm:text-3xl font-semibold tracking-tight text-neutral-950 font-mono">0%</div>
              <p className="text-[11px] sm:text-xs text-neutral-500 font-medium">Third-Party Watermarks</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Capabilities Bento Grid */}
      <section id="features" className="py-14 sm:py-28 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-3 sm:space-y-4 max-w-2xl mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-200 bg-neutral-100 text-[10px] sm:text-[11px] font-medium uppercase tracking-wider text-neutral-700">
            <Layers className="h-3 w-3" />
            <span>Core Capabilities</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-neutral-950">
            Engineered for clarity, speed, and precision.
          </h2>
          <p className="text-neutral-600 text-xs sm:text-base leading-relaxed">
            Everything you need to issue professional client invoices, parse incoming receipts with AI, and manage your financial records with zero clutter.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {/* Card 1: AI Data Extraction (Large span) */}
          <div className="md:col-span-2 p-5 sm:p-8 rounded-2xl bg-white border border-neutral-200/90 shadow-xs flex flex-col justify-between hover:border-neutral-300 transition-all duration-200 group">
            <div className="space-y-3 sm:space-y-4">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-800">
                <BrainCircuit className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base sm:text-xl font-semibold text-neutral-900">Dual-Engine AI Data Extraction</h3>
                  <Badge variant="secondary" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 font-mono">
                    Gemini + Groq
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed max-w-xl">
                  Upload incoming vendor bills, paper receipts, or invoices in PDF, PNG, JPG, or WebP. Our intelligent OCR pipeline extracts vendor names, line items, taxes, and totals into structured records without manual typing.
                </p>
              </div>
            </div>

            <div className="mt-6 sm:mt-8 p-3.5 sm:p-4 rounded-xl bg-neutral-50 border border-neutral-200/70 font-mono text-xs space-y-2">
              <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-neutral-400 border-b border-neutral-200/60 pb-1.5 sm:pb-2">
                <span className="truncate">INPUT: Receipt_Scan_409.pdf</span>
                <span className="text-emerald-600 font-medium shrink-0 ml-2">99.8% Match</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-neutral-700 text-[10px] sm:text-[11px]">
                <div>
                  <span className="text-neutral-400 block text-[9px] sm:text-[10px]">VENDOR</span>
                  <span className="font-semibold text-neutral-900">Stripe Inc</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[9px] sm:text-[10px]">DATE</span>
                  <span>2025-02-14</span>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-neutral-400 block text-[9px] sm:text-[10px]">TOTAL</span>
                  <span className="font-semibold text-neutral-900">$1,480.00</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Professional Invoice Creator */}
          <div className="p-5 sm:p-8 rounded-2xl bg-white border border-neutral-200/90 shadow-xs flex flex-col justify-between hover:border-neutral-300 transition-all duration-200">
            <div className="space-y-3 sm:space-y-4">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-800">
                <FileText className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <h3 className="text-base sm:text-xl font-semibold text-neutral-900">Instant PDF Generation</h3>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                  Generate sharp, publication-grade vector PDFs with customized currencies, line item calculations, tax breakdowns, and payment instructions.
                </p>
              </div>
            </div>

            <div className="mt-6 sm:mt-8 pt-3 sm:pt-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
              <span>Ready for Print & Web</span>
              <Download className="h-4 w-4 text-neutral-400" />
            </div>
          </div>

          {/* Card 3: Nested Drive Hierarchy */}
          <div className="p-5 sm:p-8 rounded-2xl bg-white border border-neutral-200/90 shadow-xs flex flex-col justify-between hover:border-neutral-300 transition-all duration-200">
            <div className="space-y-3 sm:space-y-4">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-800">
                <FolderTree className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <h3 className="text-base sm:text-xl font-semibold text-neutral-900">Hierarchical Drive</h3>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                  Organize your billing records with nested folders. Group documents by client, fiscal year, or project with fast drag-and-drop management.
                </p>
              </div>
            </div>

            <div className="mt-6 sm:mt-8 p-2.5 sm:p-3 rounded-lg bg-neutral-50 border border-neutral-200/70 text-[11px] sm:text-xs space-y-1 font-mono text-neutral-600 truncate">
              <div className="flex items-center gap-1.5 truncate">
                <span>📁 2025</span>
                <span>/</span>
                <span>📁 Retainers</span>
                <span>/</span>
                <span className="text-neutral-900 font-semibold truncate">INV-012.pdf</span>
              </div>
            </div>
          </div>

          {/* Card 4: Direct Client SMTP Delivery */}
          <div className="p-5 sm:p-8 rounded-2xl bg-white border border-neutral-200/90 shadow-xs flex flex-col justify-between hover:border-neutral-300 transition-all duration-200">
            <div className="space-y-3 sm:space-y-4">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-800">
                <Mail className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <h3 className="text-base sm:text-xl font-semibold text-neutral-900">Direct SMTP Delivery</h3>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                  Deliver invoices straight to client inboxes using your own verified business email. Complete control over sender address with zero platform watermarks.
                </p>
              </div>
            </div>

            <div className="mt-6 sm:mt-8 pt-3 sm:pt-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
              <span className="inline-flex items-center gap-1 text-emerald-700 text-[11px] sm:text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Custom SMTP
              </span>
              <Send className="h-4 w-4 text-neutral-400" />
            </div>
          </div>

          {/* Card 5: Encrypted Cloud Storage & Quotas */}
          <div className="p-5 sm:p-8 rounded-2xl bg-white border border-neutral-200/90 shadow-xs flex flex-col justify-between hover:border-neutral-300 transition-all duration-200">
            <div className="space-y-3 sm:space-y-4">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-800">
                <HardDrive className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <h3 className="text-base sm:text-xl font-semibold text-neutral-900">Private Cloud Storage</h3>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                  All your documents are isolated and stored securely with real-time quota meters, fast fuzzy search, and instant multi-format previews.
                </p>
              </div>
            </div>

            <div className="mt-6 sm:mt-8 pt-3 sm:pt-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
              <span>Encrypted at Rest</span>
              <Lock className="h-4 w-4 text-neutral-400" />
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Simple Workflow Section */}
      <section className="border-t border-neutral-200/80 bg-neutral-50/50 py-14 sm:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16 space-y-2.5 sm:space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-200 bg-white text-[10px] sm:text-[11px] font-medium uppercase tracking-wider text-neutral-700">
              <span>Seamless Workflow</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-neutral-950">
              From capture to client delivery in minutes.
            </h2>
            <p className="text-neutral-600 text-xs sm:text-base">
              A frictionless 3-step cycle designed to keep you focused on your work rather than administrative paperwork.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
            {/* Step 1 */}
            <div className="p-5 sm:p-8 rounded-2xl bg-white border border-neutral-200/80 shadow-xs space-y-3 sm:space-y-4">
              <div className="text-2xl sm:text-3xl font-mono font-bold text-neutral-300">01</div>
              <h3 className="text-base sm:text-lg font-semibold text-neutral-900">Capture or Build</h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Upload existing bills or scans for instantaneous AI data extraction, or compose a new branded invoice from scratch with custom line items and tax rates.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-5 sm:p-8 rounded-2xl bg-white border border-neutral-200/80 shadow-xs space-y-3 sm:space-y-4">
              <div className="text-2xl sm:text-3xl font-mono font-bold text-neutral-300">02</div>
              <h3 className="text-base sm:text-lg font-semibold text-neutral-900">Structure & Review</h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Organize documents into structured client folders, inspect AI-parsed totals with live confidence indicators, and preview the high-resolution vector PDF.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-5 sm:p-8 rounded-2xl bg-white border border-neutral-200/80 shadow-xs space-y-3 sm:space-y-4">
              <div className="text-2xl sm:text-3xl font-mono font-bold text-neutral-300">03</div>
              <h3 className="text-base sm:text-lg font-semibold text-neutral-900">Dispatch & Archive</h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Send the finalized invoice directly to your client via your configured custom SMTP inbox, automatically preserving the transaction in your private cloud storage.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Target Audiences / Use Cases */}
      <section id="use-cases" className="py-14 sm:py-28 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-3 sm:space-y-4 max-w-2xl mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-200 bg-neutral-100 text-[10px] sm:text-[11px] font-medium uppercase tracking-wider text-neutral-700">
            <Briefcase className="h-3 w-3" />
            <span>Who It Is For</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-neutral-950">
            Tailored for independent professionals and growing teams.
          </h2>
          <p className="text-neutral-600 text-xs sm:text-base leading-relaxed">
            Whether you bill clients by project, manage recurring agency retainers, or need to digitize receipts for accounting.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-neutral-200/80 shadow-xs space-y-2.5 sm:space-y-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-800 mb-2 sm:mb-4">
              <Laptop className="h-4 w-4" />
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-neutral-900">Freelancers & Creators</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Create sleek, branded invoices in seconds and send them directly to clients with your own verified email.
            </p>
            <ul className="pt-1.5 sm:pt-2 space-y-1.5 text-xs text-neutral-600">
              <li className="flex items-center gap-1.5">
                <Check className="h-3 w-3 text-neutral-800 shrink-0" />
                <span>Custom currency choices</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="h-3 w-3 text-neutral-800 shrink-0" />
                <span>1-Click PDF exports</span>
              </li>
            </ul>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-neutral-200/80 shadow-xs space-y-2.5 sm:space-y-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-800 mb-2 sm:mb-4">
              <Building2 className="h-4 w-4" />
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-neutral-900">Studios & Agencies</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Maintain separate folder trees per client account, track billing history, and manage multi-item project deliverables.
            </p>
            <ul className="pt-1.5 sm:pt-2 space-y-1.5 text-xs text-neutral-600">
              <li className="flex items-center gap-1.5">
                <Check className="h-3 w-3 text-neutral-800 shrink-0" />
                <span>Nested client folders</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="h-3 w-3 text-neutral-800 shrink-0" />
                <span>Custom SMTP delivery</span>
              </li>
            </ul>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-neutral-200/80 shadow-xs space-y-2.5 sm:space-y-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-800 mb-2 sm:mb-4">
              <Briefcase className="h-4 w-4" />
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-neutral-900">Small Businesses</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Digitize stacks of incoming receipts and vendor invoices automatically using multi-model AI parsing.
            </p>
            <ul className="pt-1.5 sm:pt-2 space-y-1.5 text-xs text-neutral-600">
              <li className="flex items-center gap-1.5">
                <Check className="h-3 w-3 text-neutral-800 shrink-0" />
                <span>Automated OCR parsing</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="h-3 w-3 text-neutral-800 shrink-0" />
                <span>Secure cloud storage</span>
              </li>
            </ul>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-neutral-200/80 shadow-xs space-y-2.5 sm:space-y-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-800 mb-2 sm:mb-4">
              <Calculator className="h-4 w-4" />
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-neutral-900">Bookkeepers</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Extract line-item breakdowns, tax numbers, and dates instantly to streamline reconciliations and audits.
            </p>
            <ul className="pt-1.5 sm:pt-2 space-y-1.5 text-xs text-neutral-600">
              <li className="flex items-center gap-1.5">
                <Check className="h-3 w-3 text-neutral-800 shrink-0" />
                <span>Structured data fields</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="h-3 w-3 text-neutral-800 shrink-0" />
                <span>Real-time search & filters</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section id="faq" className="border-t border-neutral-200/80 bg-white py-14 sm:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12 space-y-2.5 sm:space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-200 bg-neutral-100 text-[10px] sm:text-[11px] font-medium uppercase tracking-wider text-neutral-700">
              <span>FAQ</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-neutral-950">
              Frequently Asked Questions
            </h2>
            <p className="text-neutral-600 text-xs sm:text-base">
              Clear answers about storage, AI models, custom SMTP, and data security.
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full divide-y divide-neutral-200">
            <AccordionItem value="item-1" className="py-2">
              <AccordionTrigger className="text-left font-medium text-neutral-900 text-xs sm:text-base hover:no-underline hover:text-neutral-600">
                What file formats can I upload for AI data extraction?
              </AccordionTrigger>
              <AccordionContent className="text-neutral-600 text-xs sm:text-sm leading-relaxed pt-1">
                You can upload PDF files as well as image formats including PNG, JPG, JPEG, and WebP up to 10MB per file. The AI engine parses both native digital PDFs and scanned receipts or photos.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="py-2">
              <AccordionTrigger className="text-left font-medium text-neutral-900 text-xs sm:text-base hover:no-underline hover:text-neutral-600">
                How does AI data extraction work and can I connect my own key?
              </AccordionTrigger>
              <AccordionContent className="text-neutral-600 text-xs sm:text-sm leading-relaxed pt-1">
                New accounts receive a complimentary starter extraction. You can also connect your own Google Gemini or Groq Cloud API key in your Profile settings for unlimited extractions with multi-model choice (such as Gemini 2.5 Flash or Groq Llama 3.3). Your API keys are encrypted and strictly isolated to your account.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="py-2">
              <AccordionTrigger className="text-left font-medium text-neutral-900 text-xs sm:text-base hover:no-underline hover:text-neutral-600">
                How does direct email dispatch with custom SMTP work?
              </AccordionTrigger>
              <AccordionContent className="text-neutral-600 text-xs sm:text-sm leading-relaxed pt-1">
                You can configure your SMTP host, port, security (SSL/TLS), and credentials directly in your Profile. Invoices are emailed directly from your verified domain or email address with the PDF automatically attached, eliminating third-party platform branding.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="py-2">
              <AccordionTrigger className="text-left font-medium text-neutral-900 text-xs sm:text-base hover:no-underline hover:text-neutral-600">
                How much cloud storage do I receive?
              </AccordionTrigger>
              <AccordionContent className="text-neutral-600 text-xs sm:text-sm leading-relaxed pt-1">
                Every user receives 40MB of high-speed cloud storage by default, which accommodates hundreds of vector PDFs and receipts. You can track your real-time quota on the Dashboard and Profile pages.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="py-2">
              <AccordionTrigger className="text-left font-medium text-neutral-900 text-xs sm:text-base hover:no-underline hover:text-neutral-600">
                Is my invoice data and client information private?
              </AccordionTrigger>
              <AccordionContent className="text-neutral-600 text-xs sm:text-sm leading-relaxed pt-1">
                Yes. Your invoices, client records, and files are protected with strict user isolation at the database and storage layers. We do not sell or monetize your document contents.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Final Minimalist CTA Banner */}
      <section className="py-14 sm:py-28 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-14 rounded-2xl sm:rounded-3xl bg-neutral-950 text-white relative overflow-hidden shadow-2xl">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-neutral-800/40 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-4 sm:space-y-6">
            <div className="inline-flex items-center gap-2 px-2.5 sm:px-3 py-1 rounded-full border border-neutral-800 bg-neutral-900 text-[11px] sm:text-xs font-medium text-neutral-300">
              <Sparkles className="h-3 w-3 text-emerald-400" />
              <span>Get started in under 60 seconds</span>
            </div>

            <h2 className="text-2xl sm:text-5xl font-semibold tracking-tight leading-tight">
              Take complete control of your billing pipeline.
            </h2>

            <p className="text-xs sm:text-base text-neutral-400 leading-relaxed">
              Join thousands of professionals who organize, generate, and deliver invoices with intelligence and absolute privacy.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
              <Link href="/sign-up">
                <Button size="lg" className="w-full sm:w-auto h-11 sm:h-12 px-6 rounded-full bg-white text-neutral-950 hover:bg-neutral-100 font-medium text-sm transition-all shadow-sm justify-center">
                  Create Free Account
                </Button>
              </Link>
              <Link href="/sign-in">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-11 sm:h-12 px-6 rounded-full border-neutral-800 bg-transparent text-white hover:bg-neutral-900 font-medium text-sm transition-all justify-center">
                  Sign In to Workspace
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Minimalist Editorial Footer */}
      <footer className="border-t border-neutral-200/80 bg-white text-neutral-600 text-xs py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-12 gap-6 sm:gap-8 pb-10 sm:pb-12">
            {/* Column 1: Brand (5 cols) */}
            <div className="col-span-2 md:col-span-5 space-y-3 sm:space-y-4 pr-0 sm:pr-4">
              <Link href="/" className="inline-flex items-center gap-2 group">
                <div className="w-7 h-7 rounded-lg bg-neutral-950 text-white flex items-center justify-center shadow-xs">
                  <FileSpreadsheet className="h-4 w-4" />
                </div>
                <span className="text-base font-semibold text-neutral-950 tracking-tight">
                  InvoiceGen
                </span>
              </Link>
              <p className="text-xs text-neutral-500 max-w-sm leading-relaxed">
                A minimal, high-speed invoice workspace featuring intelligent multi-model data extraction, structured drive hierarchy, and direct SMTP client dispatch.
              </p>
              <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Production Ready • v2.0</span>
              </div>
            </div>

            {/* Column 2: Navigation (2 cols) */}
            <div className="col-span-1 md:col-span-2 space-y-2.5 sm:space-y-3">
              <p className="font-semibold text-neutral-950 uppercase tracking-wider text-[11px]">Product</p>
              <ul className="space-y-2 sm:space-y-2.5">
                <li><Link href="#features" className="hover:text-neutral-950 transition-colors">Features</Link></li>
                <li><Link href="#use-cases" className="hover:text-neutral-950 transition-colors">Use Cases</Link></li>
                <li><Link href="#faq" className="hover:text-neutral-950 transition-colors">FAQ</Link></li>
              </ul>
            </div>

            {/* Column 3: Workspace (2 cols) */}
            <div className="col-span-1 md:col-span-2 space-y-2.5 sm:space-y-3">
              <p className="font-semibold text-neutral-950 uppercase tracking-wider text-[11px]">Workspace</p>
              <ul className="space-y-2 sm:space-y-2.5">
                <li><Link href="/sign-in" className="hover:text-neutral-950 transition-colors">Sign In</Link></li>
                <li><Link href="/sign-up" className="hover:text-neutral-950 transition-colors">Get Started</Link></li>
                <li><Link href="/dashboard" className="hover:text-neutral-950 transition-colors">Dashboard</Link></li>
                <li><Link href="/profile" className="hover:text-neutral-950 transition-colors">Profile & Settings</Link></li>
              </ul>
            </div>

            {/* Column 4: Resources (3 cols) */}
            <div className="col-span-2 md:col-span-3 space-y-2.5 sm:space-y-3">
              <p className="font-semibold text-neutral-950 uppercase tracking-wider text-[11px]">Open Source</p>
              <ul className="space-y-2 sm:space-y-2.5">
                <li>
                  <Link href="https://github.com/hetref/invoicegen" target="_blank" className="hover:text-neutral-950 transition-colors inline-flex items-center gap-1.5 group">
                    <span>GitHub Repository</span>
                    <ArrowUpRight className="h-3 w-3 text-neutral-400 group-hover:text-neutral-950 transition-colors" />
                  </Link>
                </li>
                <li>
                  <Link href="https://github.com/hetref/invoicegen/blob/main/LICENSE" target="_blank" className="hover:text-neutral-950 transition-colors inline-flex items-center gap-1.5 group">
                    <span>MIT License</span>
                    <ArrowUpRight className="h-3 w-3 text-neutral-400 group-hover:text-neutral-950 transition-colors" />
                  </Link>
                </li>
                <li>
                  <Link href="https://github.com/hetref/invoicegen/issues" target="_blank" className="hover:text-neutral-950 transition-colors inline-flex items-center gap-1.5 group">
                    <span>Community Issues</span>
                    <ArrowUpRight className="h-3 w-3 text-neutral-400 group-hover:text-neutral-950 transition-colors" />
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 sm:pt-8 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-neutral-400 text-[11px] text-center sm:text-left">
            <p>© {new Date().getFullYear()} InvoiceGen. Built for clarity and speed.</p>
            <div className="flex items-center gap-3 sm:gap-4 text-neutral-500">
              <span>Encrypted Storage</span>
              <span className="text-neutral-300">•</span>
              <span>Isolated Data</span>
              <span className="text-neutral-300">•</span>
              <span>Privacy First</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Download, ArrowLeft, Save, Loader2 } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { useToast } from "@/hooks/use-toast"

interface InvoiceItem {
  no: number
  description: string
  price: number
  qty: number
  subtotal: number
}

interface InvoiceData {
  date: string
  invoiceNo: string
  billedTo: {
    name: string
    address: string
    gst: string
  }
  paymentTo: {
    name: string
    address: string
  }
  items: InvoiceItem[]
  paymentDetails: {
    accountNumber: string
    ifsc: string
    accountType: string
    branch: string
    upi: string
  }
  contact: {
    phone: string
    email: string
    website: string
  }
}

export default function InvoicePreviewPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const invoiceRef = useRef<HTMLDivElement>(null)
  const [groupId, setGroupId] = useState<string | null>(null)
  const [invoiceId, setInvoiceId] = useState<string | null>(null)

  useEffect(() => {
    // Set groupId and invoiceId from searchParams or localStorage
    const gId = searchParams.get("groupId") || (typeof window !== "undefined" ? localStorage.getItem("invoiceGroupId") : null)
    const iId = searchParams.get("invoiceId") || (typeof window !== "undefined" ? localStorage.getItem("invoiceId") : null)
    setGroupId(gId)
    setInvoiceId(iId)

    console.log("Loading invoice data from localStorage")
    try {
      const saved = typeof window !== "undefined" ? localStorage.getItem("invoiceData") : null
      console.log("Retrieved data:", saved ? "Data found" : "No data found")

      if (saved) {
        const parsed = JSON.parse(saved)
        console.log("Parsed invoice data successfully")
        setInvoiceData(parsed)
      } else {
        console.log("No invoice data found in localStorage")
      }
    } catch (error) {
      console.error("Error loading invoice data:", error)
    } finally {
      setIsLoading(false)
    }
  }, [searchParams])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading invoice...</p>
      </div>
    )
  }

  if (!invoiceData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No invoice data found. Please create an invoice first.</p>
          <Button onClick={() => router.push("/")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Go to Edit Page
          </Button>
        </div>
      </div>
    )
  }

  const grandTotal = invoiceData.items.reduce((sum, item) => sum + (Number(item.subtotal) || 0), 0)

  const handlePrint = async () => {
    if (!invoiceRef.current) return

    setIsGenerating(true)
    console.log("Starting PDF generation")

    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      const pages = invoiceRef.current.querySelectorAll(".invoice-page")
      console.log("Found pages:", pages.length)

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i] as HTMLElement
        console.log("Processing page", i + 1)

        const elementsToStyle = page.querySelectorAll("*")
        const originalStyles: { element: HTMLElement; style: string }[] = []

        elementsToStyle.forEach((el) => {
          const htmlEl = el as HTMLElement
          originalStyles.push({ element: htmlEl, style: htmlEl.getAttribute("style") || "" })

          const computedStyle = window.getComputedStyle(htmlEl)
          const bgColor = computedStyle.backgroundColor
          const color = computedStyle.color
          const borderColor = computedStyle.borderColor

          console.log("COLORS", bgColor, color, borderColor)

          // Apply standard colors as inline styles
          if (bgColor && bgColor !== "rgba(0, 0, 0, 0)") {
            htmlEl.style.backgroundColor = bgColor.includes("oklch") ? "#ffffff" : bgColor
          }
          if (color) {
            htmlEl.style.color = color.includes("oklch") ? "#000000" : color
          }
          if (borderColor) {
            htmlEl.style.borderColor = borderColor.includes("oklch") ? "#e5e7eb" : borderColor
          }
        })

        // Capture the page as canvas
        const canvas = await html2canvas(page, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
        })

        originalStyles.forEach(({ element, style }) => {
          if (style) {
            element.setAttribute("style", style)
          } else {
            element.removeAttribute("style")
          }
        })

        const imgData = canvas.toDataURL("image/png")
        const imgWidth = 210 // A4 width in mm (full width)
        const imgHeight = 297 // A4 height in mm (full height)

        if (i > 0) {
          pdf.addPage()
        }

        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight)
      }

      console.log("PDF generated successfully")
      pdf.save(`Invoice-${invoiceData?.invoiceNo || "document"}.pdf`)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Failed to generate PDF. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleBack = () => {
    const params = new URLSearchParams()
    if (groupId) params.set("groupId", groupId)
    if (invoiceId) params.set("invoiceId", invoiceId)
    router.push(`/new${params.toString() ? `?${params.toString()}` : ""}`)
  }

  const handleSave = async () => {
    if (!invoiceRef.current || !invoiceData) return

    setIsSaving(true)
    console.log("[Save] Starting invoice save process")

    try {
      // Step 1: Generate PDF
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      const pages = invoiceRef.current.querySelectorAll(".invoice-page")
      console.log("[Save] Found pages:", pages.length)

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i] as HTMLElement
        console.log("[Save] Processing page", i + 1)

        const elementsToStyle = page.querySelectorAll("*")
        const originalStyles: { element: HTMLElement; style: string }[] = []

        elementsToStyle.forEach((el) => {
          const htmlEl = el as HTMLElement
          originalStyles.push({ element: htmlEl, style: htmlEl.getAttribute("style") || "" })

          const computedStyle = window.getComputedStyle(htmlEl)
          const bgColor = computedStyle.backgroundColor
          const color = computedStyle.color
          const borderColor = computedStyle.borderColor

          if (bgColor && bgColor !== "rgba(0, 0, 0, 0)") {
            htmlEl.style.backgroundColor = "#ffffff"
          }
          if (color) {
            htmlEl.style.color = "#000000"
          }
          if (borderColor) {
            htmlEl.style.borderColor = "#e5e7eb"
          }
        })

        const canvas = await html2canvas(page, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
        })

        originalStyles.forEach(({ element, style }) => {
          if (style) {
            element.setAttribute("style", style)
          } else {
            element.removeAttribute("style")
          }
        })

        const imgData = canvas.toDataURL("image/png")
        const imgWidth = 210 // A4 width in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width

        if (i > 0) {
          pdf.addPage()
        }

        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight)
      }

      console.log("[Save] PDF generated successfully")

      // Step 2: Convert PDF to blob
      const pdfBlob = pdf.output("blob")
      const fileSize = pdfBlob.size

      // Step 3: Get presigned URL and invoice data
      const createResponse = await fetch("/api/invoices/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceData,
          groupId: groupId || null,
          invoiceId: invoiceId || null,
        }),
      })

      if (!createResponse.ok) {
        const error = await createResponse.json()
        throw new Error(error.error || "Failed to prepare invoice")
      }

      const { uploadUrl, invoiceData: dbInvoiceData, oldR2Key } = await createResponse.json()

      // Step 4: Upload PDF to R2
      console.log("[Save] Uploading PDF to R2...")
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/pdf",
        },
        body: pdfBlob,
      })

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload PDF to storage")
      }

      console.log("[Save] PDF uploaded successfully")

      // Step 5: Confirm invoice creation
      const confirmResponse = await fetch("/api/invoices/create", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceData: dbInvoiceData,
          fileSize,
          oldR2Key,
        }),
      })

      if (!confirmResponse.ok) {
        const error = await confirmResponse.json()
        throw new Error(error.error || "Failed to save invoice")
      }

      const { invoice } = await confirmResponse.json()
      console.log("[Save] Invoice saved successfully:", invoice.id)

      // Clear localStorage
      localStorage.removeItem("invoiceData")
      localStorage.removeItem("invoiceGroupId")
      localStorage.removeItem("invoiceId")

      toast({
        title: "Success",
        description: invoiceId ? "Invoice updated successfully" : "Invoice created successfully",
      })

      // Navigate to the saved invoice
      router.push(`/invoices/${invoice.id}`)
    } catch (error: any) {
      console.error("[Save] Error saving invoice:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save invoice",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Dynamic pagination based on content
  const calculatePages = () => {
    const pages: InvoiceItem[][] = []
    let currentPage: InvoiceItem[] = []
    let currentPageHeight = 0
    
    // Available heights in pixels (approximate)
    const A4_HEIGHT = 1122 // 297mm in pixels at 96dpi
    const PADDING = 96 // 48px top + 48px bottom
    const HEADER_HEIGHT = 150 // Header section on first page (reduced)
    const FOOTER_HEIGHT = 50 // Footer (reduced)
    const CONTINUATION_HEADER = 65 // Continuation header on subsequent pages (reduced)
    const TOTAL_SECTION = 60 // Total amount section (reduced)
    const PAYMENT_DETAILS = 120 // Payment details section (reduced)
    const TABLE_HEADER = 35 // Table header height (reduced)
    const ROW_BASE_HEIGHT = 35 // Minimum row height (reduced)
    const THANK_YOU = 40 // Thank you section (reduced)
    
    invoiceData.items.forEach((item, index) => {
      // Estimate row height based on description length
      // Approximate: 50 characters per line, 20px per line
      const descriptionLines = Math.ceil(item.description.length / 60)
      const estimatedRowHeight = Math.max(ROW_BASE_HEIGHT, descriptionLines * 24 + 20)
      
      // Calculate available height for current page
      const isFirstPage = pages.length === 0 && currentPage.length === 0
      const pageHeaderHeight = isFirstPage ? HEADER_HEIGHT : CONTINUATION_HEADER
      
      // Check if this is potentially the last item
      const isLastItem = index === invoiceData.items.length - 1
      const lastPageExtras = isLastItem ? (TOTAL_SECTION + PAYMENT_DETAILS + THANK_YOU) : 0
      
      const availableHeight = A4_HEIGHT - PADDING - pageHeaderHeight - FOOTER_HEIGHT - TABLE_HEADER - lastPageExtras
      
      // Check if item fits on current page
      if (currentPageHeight + estimatedRowHeight <= availableHeight && currentPage.length < 15) {
        currentPage.push(item)
        currentPageHeight += estimatedRowHeight
      } else {
        // Start new page
        if (currentPage.length > 0) {
          pages.push(currentPage)
        }
        currentPage = [item]
        currentPageHeight = estimatedRowHeight
      }
    })
    
    // Add remaining items
    if (currentPage.length > 0) {
      pages.push(currentPage)
    }
    
    // Ensure we have at least one page
    return pages.length > 0 ? pages : [[]]
  }
  
  const pages = calculatePages()

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Action Buttons */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-300">
        <div className="max-w-[210mm] mx-auto px-4 py-3 flex justify-between items-center">
          <Button 
            onClick={handleBack} 
            variant="outline" 
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Edit
          </Button>
          <div className="flex gap-2">
            <Button 
              onClick={handlePrint} 
              disabled={isGenerating || isSaving} 
              variant="outline" 
              className="gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Download PDF
                </>
              )}
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isGenerating || isSaving} 
              className="gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Invoice
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Invoice Pages */}
      <div ref={invoiceRef} className="invoice-pdf-container py-8">
        {pages.map((pageItems, pageIndex) => {
          const isLastPage = pageIndex === pages.length - 1
          const isFirstPage = pageIndex === 0

          return (
            <div
              key={pageIndex}
              className="invoice-page bg-white mx-auto mb-6 shadow-md"
              style={{
                width: "210mm",
                height: "297mm",
                backgroundColor: "#ffffff",
                color: "#000000",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={{ padding: "48px", flex: "1", display: "flex", flexDirection: "column" }}>
                {/* Header - Only on first page */}
                {isFirstPage && (
                  <>
                    <div style={{ marginBottom: "20px", paddingBottom: "12px", borderBottom: "2px solid #000000" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                        <h1 style={{ fontSize: "28px", fontWeight: "bold", color: "#000000", margin: "0", lineHeight: "1.2" }}>
                          INVOICE
                        </h1>
                        <div style={{ textAlign: "right" }}>
                          <p style={{ fontSize: "10px", color: "#666666", margin: "0" }}>
                            Invoice Number
                          </p>
                          <p style={{ fontSize: "15px", fontWeight: "bold", color: "#000000", margin: "2px 0 0 0" }}>
                            {invoiceData.invoiceNo}
                          </p>
                        </div>
                      </div>
                      <div style={{ fontSize: "12px", color: "#333333" }}>
                        <p style={{ margin: "0" }}><span style={{ fontWeight: "600" }}>Date:</span> {invoiceData.date}</p>
                      </div>
                    </div>

                    {/* Billed To and Payment To Section */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "28px", marginBottom: "20px" }}>
                      <div>
                        <p style={{ fontSize: "10px", fontWeight: "bold", marginBottom: "6px", textTransform: "uppercase", color: "#666666" }}>
                          Billed To:
                        </p>
                        <div style={{ fontSize: "12px", color: "#000000", lineHeight: "1.4" }}>
                          <p style={{ fontWeight: "bold", margin: "0" }}>{invoiceData.billedTo.name}</p>
                          <p style={{ margin: "3px 0 0 0", whiteSpace: "pre-line" }}>{invoiceData.billedTo.address}</p>
                          {invoiceData.billedTo.gst && (
                            <p style={{ margin: "3px 0 0 0" }}>
                              <span style={{ fontWeight: "600" }}>GST:</span> {invoiceData.billedTo.gst}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <p style={{ fontSize: "10px", fontWeight: "bold", marginBottom: "6px", textTransform: "uppercase", color: "#666666" }}>
                          Payment To:
                        </p>
                        <div style={{ fontSize: "12px", color: "#000000", lineHeight: "1.4" }}>
                          <p style={{ fontWeight: "bold", margin: "0" }}>{invoiceData.paymentTo.name}</p>
                          <p style={{ margin: "3px 0 0 0", whiteSpace: "pre-line" }}>{invoiceData.paymentTo.address}</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Continuation header for subsequent pages */}
                {!isFirstPage && (
                  <div style={{ marginBottom: "20px", paddingBottom: "12px", borderBottom: "2px solid #000000" }}>
                    <h2 style={{ fontSize: "22px", fontWeight: "bold", color: "#000000", margin: "0", lineHeight: "1.2" }}>
                      INVOICE #{invoiceData.invoiceNo} <span style={{ color: "#666666", fontSize: "13px" }}>(Continued)</span>
                    </h2>
                  </div>
                )}

                {/* Items Table */}
                <div style={{ flex: "1", marginBottom: "16px" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderTop: "1px solid #000000", borderBottom: "1px solid #000000" }}>
                        <th style={{ textAlign: "left", padding: "10px 8px", fontSize: "10px", fontWeight: "bold", textTransform: "uppercase", width: "40px", color: "#000000" }}>
                          NO.
                        </th>
                        <th style={{ textAlign: "left", padding: "10px 8px", fontSize: "10px", fontWeight: "bold", textTransform: "uppercase", color: "#000000" }}>
                          DESCRIPTION
                        </th>
                        <th style={{ textAlign: "right", padding: "10px 8px", fontSize: "10px", fontWeight: "bold", textTransform: "uppercase", width: "80px", color: "#000000" }}>
                          PRICE
                        </th>
                        <th style={{ textAlign: "center", padding: "10px 8px", fontSize: "10px", fontWeight: "bold", textTransform: "uppercase", width: "50px", color: "#000000" }}>
                          QTY
                        </th>
                        <th style={{ textAlign: "right", padding: "10px 8px", fontSize: "10px", fontWeight: "bold", textTransform: "uppercase", width: "100px", color: "#000000" }}>
                          AMOUNT
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageItems.map((item, idx) => (
                        <tr 
                          key={item.no} 
                          style={{ 
                            borderBottom: "1px solid #dddddd"
                          }}
                        >
                          <td style={{ padding: "8px", fontSize: "12px", color: "#000000", verticalAlign: "top", lineHeight: "1.4" }}>
                            {String(item.no).padStart(2, "0")}
                          </td>
                          <td style={{ padding: "8px", fontSize: "12px", whiteSpace: "pre-line", color: "#000000", verticalAlign: "top", lineHeight: "1.4" }}>
                            {item.description}
                          </td>
                          <td style={{ padding: "8px", fontSize: "12px", textAlign: "right", color: "#000000", verticalAlign: "top", lineHeight: "1.4" }}>
                            ₹{(Number(item.price) || 0).toFixed(2)}
                          </td>
                          <td style={{ padding: "8px", fontSize: "12px", textAlign: "center", color: "#000000", verticalAlign: "top", lineHeight: "1.4" }}>
                            {item.qty}
                          </td>
                          <td style={{ padding: "8px", fontSize: "12px", textAlign: "right", fontWeight: "600", color: "#000000", verticalAlign: "top", lineHeight: "1.4" }}>
                            ₹{(Number(item.subtotal) || 0).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Grand Total - Only on last page */}
                  {isLastPage && (
                    <div style={{ marginTop: "12px", display: "flex", justifyContent: "flex-end" }}>
                      <div style={{ width: "240px" }}>
                        <div
                          style={{ 
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "8px 12px",
                            borderTop: "2px solid #000000",
                            borderBottom: "2px solid #000000"
                          }}
                        >
                          <span style={{ fontSize: "12px", fontWeight: "bold", textTransform: "uppercase", color: "#000000" }}>
                            TOTAL AMOUNT
                          </span>
                          <span style={{ fontSize: "15px", fontWeight: "bold", color: "#000000" }}>
                            ₹{grandTotal.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Payment Details - Only on last page */}
                {isLastPage && (
                  <div style={{ marginBottom: "12px", paddingTop: "12px" }}>
                    <p style={{ fontSize: "10px", fontWeight: "bold", marginBottom: "6px", textTransform: "uppercase", color: "#666666" }}>
                      Payment Details:
                    </p>
                    <div style={{ fontSize: "12px", color: "#000000", lineHeight: "1.5" }}>
                      {invoiceData.paymentDetails.accountNumber && (
                        <p style={{ margin: "3px 0" }}>
                          <span style={{ fontWeight: "600" }}>Account Number:</span> {invoiceData.paymentDetails.accountNumber}
                        </p>
                      )}
                      {invoiceData.paymentDetails.ifsc && (
                        <p style={{ margin: "3px 0" }}>
                          <span style={{ fontWeight: "600" }}>IFSC Code:</span> {invoiceData.paymentDetails.ifsc}
                        </p>
                      )}
                      {invoiceData.paymentDetails.accountType && (
                        <p style={{ margin: "3px 0" }}>
                          <span style={{ fontWeight: "600" }}>Account Type:</span> {invoiceData.paymentDetails.accountType}
                        </p>
                      )}
                      {invoiceData.paymentDetails.branch && (
                        <p style={{ margin: "3px 0" }}>
                          <span style={{ fontWeight: "600" }}>Branch:</span> {invoiceData.paymentDetails.branch}
                        </p>
                      )}
                      {invoiceData.paymentDetails.upi && (
                        <p style={{ margin: "3px 0" }}>
                          <span style={{ fontWeight: "600" }}>UPI ID:</span> {invoiceData.paymentDetails.upi}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {isLastPage && (
                  <div style={{ marginTop: "auto", paddingTop: "12px", borderTop: "1px solid #dddddd" }}>
                    <p style={{ textAlign: "center", fontSize: "13px", fontWeight: "600", marginBottom: "0", color: "#000000" }}>
                      Thank You For Your Business
                    </p>
                  </div>
                )}
              </div>

              <div style={{ padding: "16px 48px", borderTop: "1px solid #000000" }}>
                <div style={{ textAlign: "center", fontSize: "10px", color: "#666666" }}>
                  {invoiceData.contact.phone && invoiceData.contact.email && (
                    <p style={{ margin: "0 0 4px 0" }}>
                      {invoiceData.contact.phone} | {invoiceData.contact.email}
                    </p>
                  )}
                  {!invoiceData.contact.phone && invoiceData.contact.email && (
                    <p style={{ margin: "0 0 4px 0" }}>{invoiceData.contact.email}</p>
                  )}
                  {invoiceData.contact.phone && !invoiceData.contact.email && (
                    <p style={{ margin: "0 0 4px 0" }}>{invoiceData.contact.phone}</p>
                  )}
                  {invoiceData.contact.website && (
                    <p style={{ margin: "0" }}>{invoiceData.contact.website}</p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Eye, Loader2, Image as ImageIcon, ExternalLink, CheckCircle2 } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { PaidStamp } from "@/components/ui/paid-stamp"
import { firePaidCelebration } from "@/lib/confetti"

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
  includeLogo?: boolean
  logoUrl?: string | null
  isPaid?: boolean
  paidAt?: string | null
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
    isPaid?: boolean
    paidAt?: string | null
  }
  contact: {
    phone: string
    email: string
    website: string
  }
}

export default function EditInvoicePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [profileLogoUrl, setProfileLogoUrl] = useState<string | null>(null)
  const [hasProfileLogo, setHasProfileLogo] = useState(false)

  const groupId = searchParams.get("groupId")
  const invoiceId = searchParams.get("invoiceId")

  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    date: new Date().toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    invoiceNo: `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    includeLogo: true,
    logoUrl: null,
    billedTo: {
      name: "",
      address: "",
      gst: "",
    },
    paymentTo: {
      name: "",
      address: "",
    },
    items: [
      {
        no: 1,
        description: "",
        price: 0,
        qty: 1,
        subtotal: 0,
      },
    ],
    paymentDetails: {
      accountNumber: "",
      ifsc: "",
      accountType: "",
      branch: "",
      upi: "",
    },
    contact: {
      phone: "",
      email: "",
      website: "",
    },
  })

  // Load invoice data for editing or from localStorage + fetch profile logo
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      let currentLogo: string | null = null

      try {
        const profRes = await fetch("/api/profile")
        if (profRes.ok) {
          const profData = await profRes.json()
          const logo =
            profData.user?.logoUrl ||
            (profData.user?.image
              ? profData.user.image.startsWith("http")
                ? profData.user.image
                : "/api/profile/logo"
              : null)
          setProfileLogoUrl(logo)
          setHasProfileLogo(Boolean(logo))
          currentLogo = logo
        }
      } catch (e) {
        console.error("Error fetching profile logo:", e)
      }

      if (invoiceId) {
        // Load existing invoice for editing
        setIsEditing(true)
        try {
          const response = await fetch(`/api/invoices/${invoiceId}`)
          if (!response.ok) throw new Error("Failed to load invoice")

          const data = await response.json()
          const invoice = data.invoice

          const includeLogo =
            invoice.contactInfo?.includeLogo !== undefined
              ? Boolean(invoice.contactInfo.includeLogo)
              : Boolean(currentLogo)

          const isPaid = Boolean(invoice.paymentDetails?.isPaid || invoice.isPaid)
          const paidAt = invoice.paymentDetails?.paidAt || invoice.paidAt || null

          // Transform database invoice to form data
          setInvoiceData({
            date: invoice.invoiceDate || "",
            invoiceNo: invoice.invoiceNumber || "",
            includeLogo,
            logoUrl: invoice.contactInfo?.logoUrl || currentLogo,
            isPaid,
            paidAt,
            billedTo: {
              name: invoice.billedToName || "",
              address: invoice.billedToAddress || "",
              gst: invoice.billedToGst || "",
            },
            paymentTo: {
              name: invoice.paymentToName || "",
              address: invoice.paymentToAddress || "",
            },
            items:
              invoice.items && invoice.items.length > 0
                ? invoice.items
                : [{ no: 1, description: "", price: 0, qty: 1, subtotal: 0 }],
            paymentDetails: {
              accountNumber: invoice.paymentDetails?.accountNumber || "",
              ifsc: invoice.paymentDetails?.ifsc || "",
              accountType: invoice.paymentDetails?.accountType || "",
              branch: invoice.paymentDetails?.branch || "",
              upi: invoice.paymentDetails?.upi || "",
              isPaid,
              paidAt,
            },
            contact: invoice.contactInfo || {
              phone: "",
              email: "",
              website: "",
            },
          })
        } catch (error) {
          console.error("Error loading invoice:", error)
          toast({
            title: "Error",
            description: "Failed to load invoice for editing",
            variant: "destructive",
          })
        } finally {
          setLoading(false)
        }
      } else {
        // Clear old edit session IDs from localStorage
        localStorage.removeItem("invoiceId")
        localStorage.removeItem("invoiceGroupId")
        setIsEditing(false)

        // Load from localStorage if available
        const saved = localStorage.getItem("invoiceData")
        if (saved) {
          try {
            const parsed = JSON.parse(saved)
            const isPaid = Boolean(parsed.isPaid || parsed.paymentDetails?.isPaid)
            const paidAt = parsed.paidAt || parsed.paymentDetails?.paidAt || null

            setInvoiceData({
              ...parsed,
              isPaid,
              paidAt,
              paymentDetails: {
                ...(parsed.paymentDetails || {}),
                isPaid,
                paidAt,
              },
              includeLogo:
                parsed.includeLogo !== undefined ? parsed.includeLogo : Boolean(currentLogo),
              logoUrl: parsed.logoUrl || currentLogo,
            })
          } catch (error) {
            console.error("Error parsing saved invoice data:", error)
          }
        } else {
          setInvoiceData((prev) => ({
            ...prev,
            includeLogo: Boolean(currentLogo),
            logoUrl: currentLogo,
          }))
        }
        setLoading(false)
      }
    }

    loadData()
  }, [invoiceId])

  useEffect(() => {
    if (invoiceData) {
      localStorage.setItem("invoiceData", JSON.stringify(invoiceData))
    }
  }, [invoiceData])

  const updateField = (path: string[], value: any) => {
    setInvoiceData((prev) => {
      const newData = { ...prev }
      let current: any = newData
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]]
      }
      current[path[path.length - 1]] = value
      return newData
    })
  }

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    setInvoiceData((prev) => {
      const newItems = [...prev.items]
      newItems[index] = { ...newItems[index], [field]: value }

      // Auto-calculate subtotal
      if (field === "price" || field === "qty") {
        const price = field === "price" ? Number.parseFloat(value) || 0 : newItems[index].price
        const qty = field === "qty" ? Number.parseFloat(value) || 0 : newItems[index].qty
        newItems[index].subtotal = price * qty
      }

      return { ...prev, items: newItems }
    })
  }

  const addItem = () => {
    setInvoiceData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          no: prev.items.length + 1,
          description: "",
          price: 0,
          qty: 1,
          subtotal: 0,
        },
      ],
    }))
  }

  const removeItem = (index: number) => {
    setInvoiceData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index).map((item, i) => ({ ...item, no: i + 1 })),
    }))
  }

  const handleSaveAndPreview = () => {
    console.log("Navigating to preview page")
    console.log("Current invoice data:", invoiceData)

    // Save groupId and invoiceId to localStorage for preview page
    localStorage.setItem("invoiceGroupId", groupId || "")
    localStorage.setItem("invoiceId", invoiceId || "")

    // Data is already saved via useEffect, just navigate
    const params = new URLSearchParams()
    if (groupId) params.set("groupId", groupId)
    if (invoiceId) params.set("invoiceId", invoiceId)

    router.push(`/preview${params.toString() ? `?${params.toString()}` : ""}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p>Loading invoice...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? "Edit Invoice" : "Create Invoice"}
          </h1>
          <p className="text-gray-600 mt-1">Fill in the details to generate your invoice</p>
        </div>

        <div className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" value={invoiceData.date} onChange={(e) => updateField(["date"], e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="invoiceNo">Invoice Number</Label>
                  <Input
                    id="invoiceNo"
                    value={invoiceData.invoiceNo}
                    onChange={(e) => updateField(["invoiceNo"], e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Branding & Logo */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                    <ImageIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold">Branding & Company Logo</CardTitle>
                    <CardDescription className="text-xs">
                      Optionally display your company logo on the generated invoice and PDF
                    </CardDescription>
                  </div>
                </div>
                {hasProfileLogo && (
                  <Badge
                    variant="secondary"
                    className="text-[10px] font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  >
                    Profile Logo Available
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {hasProfileLogo ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3.5 rounded-xl border border-border/70 bg-muted/20">
                  <div className="flex items-center gap-3.5">
                    <div
                      className="w-16 h-12 rounded-lg border border-border/80 flex items-center justify-center p-1.5 bg-white shadow-2xs overflow-hidden shrink-0"
                      style={{
                        backgroundImage:
                          "linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)",
                        backgroundSize: "8px 8px",
                      }}
                    >
                      <img
                        src={profileLogoUrl || "/api/profile/logo"}
                        alt="Profile Logo"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <Label htmlFor="includeLogo" className="text-xs font-semibold cursor-pointer text-foreground">
                        Include company logo in this invoice
                      </Label>
                      <p className="text-[11px] text-muted-foreground">
                        Displayed at the top of the invoice header.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <Checkbox
                      id="includeLogo"
                      checked={Boolean(invoiceData.includeLogo)}
                      onCheckedChange={(checked) => {
                        setInvoiceData((prev) => ({
                          ...prev,
                          includeLogo: Boolean(checked),
                          logoUrl: checked ? profileLogoUrl || "/api/profile/logo" : null,
                        }))
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-dashed border-border/80 bg-muted/10 text-xs">
                  <div className="space-y-0.5">
                    <p className="font-medium text-foreground">No brand logo found in profile</p>
                    <p className="text-[11px] text-muted-foreground">
                      Upload your brand logo in your Profile to automatically display it on invoices.
                    </p>
                  </div>
                  <Link
                    href="/profile"
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline shrink-0"
                  >
                    <span>Upload Logo</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Billed To */}
          <Card>
            <CardHeader>
              <CardTitle>Billed To</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="billedToName">Name</Label>
                <Input
                  id="billedToName"
                  value={invoiceData.billedTo.name}
                  onChange={(e) => updateField(["billedTo", "name"], e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="billedToAddress">Address</Label>
                <Textarea
                  id="billedToAddress"
                  value={invoiceData.billedTo.address}
                  onChange={(e) => updateField(["billedTo", "address"], e.target.value)}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="billedToGst">GST Number</Label>
                <Input
                  id="billedToGst"
                  value={invoiceData.billedTo.gst}
                  onChange={(e) => updateField(["billedTo", "gst"], e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment To */}
          <Card>
            <CardHeader>
              <CardTitle>Payment To</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="paymentToName">Name</Label>
                <Input
                  id="paymentToName"
                  value={invoiceData.paymentTo.name}
                  onChange={(e) => updateField(["paymentTo", "name"], e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="paymentToAddress">Address</Label>
                <Textarea
                  id="paymentToAddress"
                  value={invoiceData.paymentTo.address}
                  onChange={(e) => updateField(["paymentTo", "address"], e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Items</CardTitle>
                <Button onClick={addItem} size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {invoiceData.items.map((item, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm">Item {item.no}</span>
                    {invoiceData.items.length > 1 && (
                      <Button
                        onClick={() => removeItem(index)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div>
                    <Label htmlFor={`item-desc-${index}`}>Description</Label>
                    <Textarea
                      id={`item-desc-${index}`}
                      value={item.description}
                      onChange={(e) => updateItem(index, "description", e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label htmlFor={`item-price-${index}`}>Price (₹)</Label>
                      <Input
                        id={`item-price-${index}`}
                        type="number"
                        step="0.1"
                        value={item.price}
                        onChange={(e) => updateItem(index, "price", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`item-qty-${index}`}>Quantity</Label>
                      <Input
                        id={`item-qty-${index}`}
                        type="number"
                        value={item.qty}
                        onChange={(e) => updateItem(index, "qty", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Subtotal (₹)</Label>
                      <Input value={item.subtotal.toFixed(2)} disabled className="bg-gray-50" />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Payment Details */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    value={invoiceData.paymentDetails.accountNumber}
                    onChange={(e) => updateField(["paymentDetails", "accountNumber"], e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="ifsc">IFSC Code</Label>
                  <Input
                    id="ifsc"
                    value={invoiceData.paymentDetails.ifsc}
                    onChange={(e) => updateField(["paymentDetails", "ifsc"], e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="accountType">Account Type</Label>
                  <Input
                    id="accountType"
                    value={invoiceData.paymentDetails.accountType}
                    onChange={(e) => updateField(["paymentDetails", "accountType"], e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="branch">Branch</Label>
                  <Input
                    id="branch"
                    value={invoiceData.paymentDetails.branch}
                    onChange={(e) => updateField(["paymentDetails", "branch"], e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="upi">UPI ID</Label>
                <Input
                  id="upi"
                  value={invoiceData.paymentDetails.upi}
                  onChange={(e) => updateField(["paymentDetails", "upi"], e.target.value)}
                />
              </div>

              {/* DevAlly Verified Paid Status Toggle */}
              <div className="pt-3 border-t border-border/60">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-neutral-50/80 dark:bg-neutral-900/50 border border-neutral-200/80 dark:border-neutral-800">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="isPaidCheckbox"
                      checked={Boolean(invoiceData.isPaid)}
                      onCheckedChange={(checked) => {
                        const val = Boolean(checked)
                        if (val) {
                          firePaidCelebration()
                        }
                        const updatedPaidAt = val
                          ? new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                          : null
                        setInvoiceData((prev) => ({
                          ...prev,
                          isPaid: val,
                          paidAt: updatedPaidAt,
                          paymentDetails: {
                            ...prev.paymentDetails,
                            isPaid: val,
                            paidAt: updatedPaidAt,
                          },
                        }))
                        toast({
                          title: val ? "DevAlly PAID Stamp Enabled! 🎉" : "Marked as Unpaid",
                          description: val
                            ? "Translucent DevAlly verified PAID stamp will appear on the invoice."
                            : "Invoice marked as pending / unpaid.",
                        })
                      }}
                      className="mt-0.5"
                    />
                    <div className="space-y-1">
                      <Label htmlFor="isPaidCheckbox" className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 cursor-pointer flex items-center gap-2">
                        <span>Mark Invoice as Settled / Paid</span>
                        {invoiceData.isPaid && (
                          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px] font-semibold">
                            DevAlly Verified
                          </Badge>
                        )}
                      </Label>
                      <p className="text-xs text-neutral-500">
                        Applies a translucent DevAlly verified PAID stamp across your invoice and PDF download.
                      </p>
                    </div>
                  </div>

                  {invoiceData.isPaid && (
                    <div className="self-center sm:self-auto shrink-0 animate-in fade-in zoom-in-95 duration-200">
                      <PaidStamp date={invoiceData.paidAt || undefined} size="sm" />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={invoiceData.contact.phone}
                    onChange={(e) => updateField(["contact", "phone"], e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={invoiceData.contact.email}
                    onChange={(e) => updateField(["contact", "email"], e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={invoiceData.contact.website}
                    onChange={(e) => updateField(["contact", "website"], e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pb-8">
            <Button onClick={handleSaveAndPreview} size="lg" className="gap-2">
              <Eye className="h-4 w-4" />
              Save & Preview Invoice
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

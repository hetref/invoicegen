"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, Eye, Loader2 } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
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

export default function EditInvoicePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  
  const groupId = searchParams.get("groupId")
  const invoiceId = searchParams.get("invoiceId")

  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    date: new Date().toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    invoiceNo: `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
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

  // Load invoice data for editing or from localStorage
  useEffect(() => {
    const loadInvoiceData = async () => {
      if (invoiceId) {
        // Load existing invoice for editing
        setLoading(true)
        setIsEditing(true)
        try {
          const response = await fetch(`/api/invoices/${invoiceId}`)
          if (!response.ok) throw new Error("Failed to load invoice")
          
          const data = await response.json()
          const invoice = data.invoice

          // Transform database invoice to form data
          setInvoiceData({
            date: invoice.invoiceDate || "",
            invoiceNo: invoice.invoiceNumber || "",
            billedTo: {
              name: invoice.billedToName || "",
              address: invoice.billedToAddress || "",
              gst: invoice.billedToGst || "",
            },
            paymentTo: {
              name: invoice.paymentToName || "",
              address: invoice.paymentToAddress || "",
            },
            items: invoice.items || [],
            paymentDetails: invoice.paymentDetails || {
              accountNumber: "",
              ifsc: "",
              accountType: "",
              branch: "",
              upi: "",
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
        // Load from localStorage if available
        const saved = localStorage.getItem("invoiceData")
        if (saved) {
          try {
            setInvoiceData(JSON.parse(saved))
          } catch (error) {
            console.error("Error parsing saved invoice data:", error)
          }
        }
      }
    }

    loadInvoiceData()
  }, [invoiceId])

  useEffect(() => {
    if (invoiceData) {
      console.log("Auto-saving invoice data to localStorage")
      localStorage.setItem("invoiceData", JSON.stringify(invoiceData))
      console.log("Data saved successfully")
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

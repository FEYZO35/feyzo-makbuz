"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { generateReceipt, downloadPDF } from "./actions"
import { Download, Mail, FileText, Eye, Shield } from "lucide-react"
import Image from "next/image"

interface FormData {
  receiptNumber: string
  paidTo: string
  idCardNumber: string
  amount: string
  currency: string
  motifs: string
  justificativeDocuments: string
  cashierName: string
  orderGiverName: string
  email: string
  date: string
}

export default function ReceiptForm() {
  const [formData, setFormData] = useState<FormData>({
    receiptNumber: "",
    paidTo: "",
    idCardNumber: "",
    amount: "",
    currency: "XAF",
    motifs: "",
    justificativeDocuments: "",
    cashierName: "",
    orderGiverName: "",
    email: "",
    date: new Date().toISOString().split("T")[0],
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")

    try {
      const result = await generateReceipt(formData)

      if (result.success) {
        setMessage(result.message || "✅ E-posta başarıyla gönderildi!")

        // Form'u temizle (e-posta hariç)
        setFormData({
          receiptNumber: "",
          paidTo: "",
          idCardNumber: "",
          amount: "",
          currency: "XAF",
          motifs: "",
          justificativeDocuments: "",
          cashierName: "",
          orderGiverName: "",
          email: formData.email,
          date: new Date().toISOString().split("T")[0],
        })
      } else {
        setMessage(`❌ Hata: ${result.error}`)
      }
    } catch (error) {
      console.error("❌ Form gönderim hatası:", error)
      setMessage("❌ Bir hata oluştu. Lütfen tekrar deneyin.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!formData.receiptNumber || !formData.paidTo) {
      setMessage("⚠️ PDF indirmek için en az Makbuz N° ve Payé à alanlarını doldurun.")
      return
    }

    setIsDownloading(true)
    try {
      const result = await downloadPDF(formData)
      if (result.success && result.pdfUrl) {
        const link = document.createElement("a")
        link.href = result.pdfUrl
        link.download = `makbuz-${formData.receiptNumber}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        setMessage("📄 PDF başarıyla indirildi!")
      } else {
        setMessage("❌ " + result.error)
      }
    } catch (error) {
      setMessage("❌ PDF indirme sırasında hata oluştu.")
    } finally {
      setIsDownloading(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR")
  }

  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case "USD":
        return "$"
      case "EUR":
        return "€"
      case "TL":
        return "₺"
      case "XAF":
        return "FCFA"
      default:
        return "FCFA"
    }
  }

  return (
    <div className="min-h-screen py-4 sm:py-8 relative bg-gradient-to-br from-blue-50 via-green-50 to-yellow-50">
      {/* Transparan overlay */}
      <div
        className="absolute inset-0 bg-white/80"
        style={{
          backgroundImage: `url('/acced-logo.png')`,
          backgroundSize: "200px 200px",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
          opacity: 0.1,
        }}
      ></div>

      <div className="container mx-auto px-2 sm:px-4 max-w-7xl relative z-10">
        {/* Header - Mobil Uyumlu */}
        <div className="text-center mb-4 sm:mb-8 bg-white/95 backdrop-blur-sm p-4 sm:p-8 rounded-xl shadow-lg border-2 border-green-200">
          <div className="flex flex-col sm:flex-row justify-between items-start mb-4 sm:mb-6 gap-4">
            <div className="text-left w-full sm:w-auto">
              <p className="font-bold text-xs sm:text-sm text-green-800">REPUBLIQUE DU CAMEROUN</p>
              <p className="text-xs italic text-green-600">Paix-Travail-Patrie</p>
            </div>
            <div className="text-left sm:text-right w-full sm:w-auto">
              <p className="font-bold text-xs sm:text-sm text-green-800">REPUBLIC OF CAMEROON</p>
              <p className="text-xs italic text-green-600">Peace-Work-Fatherland</p>
            </div>
          </div>

          <div className="text-center">
            <div className="flex flex-col sm:flex-row items-center justify-center mb-4 gap-4">
              <Image
                src="/acced-logo.png"
                alt="ACCED Logo"
                width={120}
                height={120}
                className="sm:w-[200px] sm:h-[200px]"
              />
              <div className="text-center sm:text-left">
                <h1 className="font-bold text-sm sm:text-xl text-gray-800 leading-tight">
                  ASSOCIATION CAMEROUNAISE POUR LA CULTURE ET L'EDUCATION
                </h1>
                <div className="bg-red-600 text-white px-4 sm:px-6 py-1 sm:py-2 inline-block rounded-lg shadow-md mt-2">
                  <h2 className="font-bold text-lg sm:text-2xl">ACCED</h2>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
          {/* Form Kısmı - Mobil Uyumlu */}
          <Card className="shadow-xl border-2 border-green-100 bg-white/95 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-green-600 to-red-600 text-white rounded-t-lg p-4 sm:p-6">
              <div className="text-center">
                <FileText className="mx-auto mb-2" size={24} />
                <h3 className="font-bold text-lg sm:text-xl">BON D'ENTREE EN CAISSE</h3>
                <p className="text-xs sm:text-sm opacity-90">(EXIT ORDER FROM THE COUNTER)</p>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="receiptNumber" className="text-sm font-semibold text-gray-700">
                      N° Makbuz / Receipt Number *
                    </Label>
                    <Input
                      id="receiptNumber"
                      value={formData.receiptNumber}
                      onChange={(e) => handleInputChange("receiptNumber", e.target.value)}
                      placeholder="002964"
                      className="mt-1 border-2 border-green-200 focus:border-green-500 text-base"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="date" className="text-sm font-semibold text-gray-700">
                      Tarih / Date *
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleInputChange("date", e.target.value)}
                      className="mt-1 border-2 border-green-200 focus:border-green-500 text-base"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                    E-posta Adresi / Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="ornek@email.com"
                    className="mt-1 border-2 border-green-200 focus:border-green-500 text-base"
                    required
                  />
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-2">
                    <div className="flex items-start">
                      <Shield className="text-orange-600 mr-2 mt-0.5 flex-shrink-0" size={16} />
                      <p className="text-xs text-orange-700">
                        <strong>Güvenlik:</strong> Makbuz kontrolü ve güvenliği için e-posta gönderimi sağlanmadan PDF
                        indiremezsiniz
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="paidTo" className="text-sm font-semibold text-gray-700">
                      Payé à / Paid to *
                    </Label>
                    <Input
                      id="paidTo"
                      value={formData.paidTo}
                      onChange={(e) => handleInputChange("paidTo", e.target.value)}
                      className="mt-1 border-2 border-green-200 focus:border-green-500 text-base"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="idCardNumber" className="text-sm font-semibold text-gray-700">
                      CNI N° / ID Card N° *
                    </Label>
                    <Input
                      id="idCardNumber"
                      value={formData.idCardNumber}
                      onChange={(e) => handleInputChange("idCardNumber", e.target.value)}
                      className="mt-1 border-2 border-green-200 focus:border-green-500 text-base"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount" className="text-sm font-semibold text-gray-700">
                      Tutar / Amount *
                    </Label>
                    <Input
                      id="amount"
                      value={formData.amount}
                      onChange={(e) => handleInputChange("amount", e.target.value)}
                      placeholder="0"
                      className="mt-1 border-2 border-green-200 focus:border-green-500 text-base font-semibold"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="currency" className="text-sm font-semibold text-gray-700">
                      Para Birimi / Currency *
                    </Label>
                    <Select value={formData.currency} onValueChange={(value) => handleInputChange("currency", value)}>
                      <SelectTrigger className="mt-1 border-2 border-green-200 focus:border-green-500 text-base">
                        <SelectValue placeholder="Para birimi seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="XAF">🇨🇲 XAF (FCFA)</SelectItem>
                        <SelectItem value="USD">🇺🇸 USD ($)</SelectItem>
                        <SelectItem value="EUR">🇪🇺 EUR (€)</SelectItem>
                        <SelectItem value="TL">🇹🇷 TL (₺)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="motifs" className="text-sm font-semibold text-gray-700">
                    Motifs / Motifs
                  </Label>
                  <Textarea
                    id="motifs"
                    value={formData.motifs}
                    onChange={(e) => handleInputChange("motifs", e.target.value)}
                    rows={3}
                    className="mt-1 border-2 border-green-200 focus:border-green-500 text-base"
                  />
                </div>

                <div>
                  <Label htmlFor="justificativeDocuments" className="text-sm font-semibold text-gray-700">
                    Pièces justificatives / Justificative documents
                  </Label>
                  <Textarea
                    id="justificativeDocuments"
                    value={formData.justificativeDocuments}
                    onChange={(e) => handleInputChange("justificativeDocuments", e.target.value)}
                    rows={2}
                    className="mt-1 border-2 border-green-200 focus:border-green-500 text-base"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cashierName" className="text-sm font-semibold text-gray-700">
                      Le Caissier / The Cashier *
                    </Label>
                    <Input
                      id="cashierName"
                      value={formData.cashierName}
                      onChange={(e) => handleInputChange("cashierName", e.target.value)}
                      className="mt-1 border-2 border-green-200 focus:border-green-500 text-base"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="orderGiverName" className="text-sm font-semibold text-gray-700">
                      L'ordonnateur / Order Giver *
                    </Label>
                    <Input
                      id="orderGiverName"
                      value={formData.orderGiverName}
                      onChange={(e) => handleInputChange("orderGiverName", e.target.value)}
                      className="mt-1 border-2 border-green-200 focus:border-green-500 text-base"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-4 sm:pt-6">
                  <Button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-3 text-base"
                  >
                    <Eye className="mr-2" size={18} />
                    {showPreview ? "Önizlemeyi Gizle" : "Makbuz Önizlemesi"}
                  </Button>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 font-semibold text-base"
                      disabled={isLoading}
                    >
                      <Mail className="mr-2" size={18} />
                      {isLoading ? "Gönderiliyor..." : "E-posta Gönder"}
                    </Button>

                    <Button
                      type="button"
                      onClick={handleDownloadPDF}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 font-semibold text-base"
                      disabled={isDownloading}
                    >
                      <Download className="mr-2" size={18} />
                      {isDownloading ? "İndiriliyor..." : "PDF İndir"}
                    </Button>
                  </div>
                </div>

                {message && (
                  <div
                    className={`text-center p-4 rounded-lg font-semibold text-sm sm:text-base ${
                      message.includes("✅")
                        ? "bg-green-100 text-green-800 border border-green-300"
                        : message.includes("⚠️")
                          ? "bg-yellow-100 text-yellow-800 border border-yellow-300"
                          : "bg-red-100 text-red-800 border border-red-300"
                    }`}
                  >
                    {message}
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Önizleme Kısmı - Mobil Uyumlu */}
          {showPreview && (
            <Card className="shadow-xl border-2 border-blue-100 bg-white/95 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg p-4 sm:p-6">
                <div className="text-center">
                  <Eye className="mx-auto mb-2" size={24} />
                  <h3 className="font-bold text-lg sm:text-xl">Makbuz Önizlemesi</h3>
                </div>
              </CardHeader>

              <CardContent className="p-4 sm:p-6">
                <div className="bg-white border-2 border-gray-200 rounded-lg p-4 sm:p-6 text-xs sm:text-sm">
                  {/* Önizleme Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start mb-4 text-xs gap-2">
                    <div>
                      <p className="font-bold text-green-800">REPUBLIQUE DU CAMEROUN</p>
                      <p className="italic text-green-600">Paix-Travail-Patrie</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="font-bold text-green-800">REPUBLIC OF CAMEROON</p>
                      <p className="italic text-green-600">Peace-Work-Fatherland</p>
                    </div>
                  </div>

                  <div className="text-center mb-6">
                    <div className="flex flex-col sm:flex-row items-center justify-center mb-2 gap-2">
                      <Image
                        src="/acced-logo.png"
                        alt="ACCED Logo"
                        width={60}
                        height={60}
                        className="sm:w-[100px] sm:h-[100px]"
                      />
                      <div className="text-center sm:text-left">
                        <h2 className="font-bold text-xs sm:text-sm">
                          ASSOCIATION CAMEROUNAISE POUR LA CULTURE ET L'EDUCATION
                        </h2>
                        <div className="bg-red-600 text-white px-2 py-1 inline-block rounded text-sm sm:text-lg font-bold">
                          ACCED
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-center mb-4">
                    <h3 className="font-bold text-sm sm:text-lg text-green-700">
                      BON D'ENTREE EN CAISSE N°: {formData.receiptNumber || "___"}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600">(EXIT ORDER FROM THE COUNTER)</p>
                  </div>

                  <div className="space-y-3 text-xs sm:text-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <span className="font-bold">Payé à / Paid to:</span>
                        <div className="border-b border-gray-300 min-h-[20px] break-words">{formData.paidTo}</div>
                      </div>
                      <div>
                        <span className="font-bold">CNI N° / ID Card N°:</span>
                        <div className="border-b border-gray-300 min-h-[20px] break-words">{formData.idCardNumber}</div>
                      </div>
                    </div>

                    <div>
                      <span className="font-bold">La somme de / The sum of:</span>
                      <div className="border-b border-gray-300 min-h-[20px] text-base sm:text-lg font-bold text-green-700 break-words">
                        ## {formData.amount} {getCurrencySymbol(formData.currency)} ##
                      </div>
                    </div>

                    <div>
                      <span className="font-bold">Motifs / Motifs:</span>
                      <div className="border border-gray-300 min-h-[40px] p-2 rounded break-words">
                        {formData.motifs}
                      </div>
                    </div>

                    {formData.justificativeDocuments && (
                      <div>
                        <span className="font-bold">Pièces justificatives / Justificative documents:</span>
                        <div className="border border-gray-300 min-h-[30px] p-2 rounded break-words">
                          {formData.justificativeDocuments}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mt-8 pt-4 border-t gap-4">
                      <div className="text-center sm:text-left">
                        <p className="font-bold text-xs">Le Caissier / The Cashier</p>
                        <div className="mt-2 text-xs sm:text-sm break-words">{formData.cashierName}</div>
                        <div className="border-b border-gray-400 w-16 sm:w-20 mt-2 mx-auto sm:mx-0"></div>
                      </div>
                      <div className="text-center order-first sm:order-none">
                        <p className="text-xs sm:text-sm">Yaoundé, le {formatDate(formData.date)}</p>
                      </div>
                      <div className="text-center sm:text-right">
                        <p className="font-bold text-xs">L'ordonnateur / Order Giver</p>
                        <div className="mt-2 text-xs sm:text-sm break-words">{formData.orderGiverName}</div>
                        <div className="border-b border-gray-400 w-16 sm:w-20 mt-2 mx-auto sm:ml-auto sm:mr-0"></div>
                      </div>
                    </div>

                    <div className="text-center mt-4">
                      <p className="text-xs text-gray-500 italic">Bu belge e-imza ile desteklenmektedir</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

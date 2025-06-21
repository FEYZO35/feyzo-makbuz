import jsPDF from "jspdf"
import fs from "fs"
import path from "path"

interface ReceiptData {
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

export async function generatePDF(data: ReceiptData): Promise<Buffer> {
  try {
    const doc = new jsPDF("p", "mm", "a4")
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()

    // Türkçe karakter desteği için font ayarları
    doc.setFont("helvetica", "normal")

    // Tarih formatla (Türkçe)
    const formattedDate = new Date(data.date).toLocaleDateString("tr-TR")

    // Para birimi sembolü
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

    const currencySymbol = getCurrencySymbol(data.currency)

    // Temiz beyaz arka plan
    doc.setFillColor(255, 255, 255)
    doc.rect(0, 0, pageWidth, pageHeight, "F")

    // ÜST HEADER - Kamerun bayrağı renkleri
    doc.setFillColor(0, 122, 51) // Yeşil
    doc.rect(0, 0, pageWidth / 3, 20, "F")
    doc.setFillColor(206, 17, 38) // Kırmızı
    doc.rect(pageWidth / 3, 0, pageWidth / 3, 20, "F")
    doc.setFillColor(252, 209, 22) // Sarı
    doc.rect((pageWidth / 3) * 2, 0, pageWidth / 3, 20, "F")

    // Üst başlık metinleri - BÜYÜK FONT
    doc.setFontSize(10)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(255, 255, 255)
    doc.text("REPUBLIQUE DU CAMEROUN", 10, 8)
    doc.text("REPUBLIC OF CAMEROON", pageWidth - 10, 8, { align: "right" })

    doc.setFont("helvetica", "italic")
    doc.setFontSize(8)
    doc.text("Paix - Travail - Patrie", 10, 14)
    doc.text("Peace - Work - Fatherland", pageWidth - 10, 14, { align: "right" })

    // Ana çerçeve
    doc.setDrawColor(0, 0, 0)
    doc.setLineWidth(1.5)
    doc.rect(10, 25, pageWidth - 20, pageHeight - 40, "D")

    // LOGO VE KURUM BİLGİLERİ ALANI
    let yPos = 35

    // Logo alanı - sol taraf
    try {
      const logoPath = path.join(process.cwd(), "public", "acced-logo.png")
      const logoExists = fs.existsSync(logoPath)

      if (logoExists) {
        const logoBuffer = fs.readFileSync(logoPath)
        const logoBase64 = logoBuffer.toString("base64")
        doc.addImage(`data:image/png;base64,${logoBase64}`, "PNG", 15, yPos, 30, 30)
      } else {
        // Logo placeholder
        doc.setFillColor(0, 122, 51)
        doc.circle(30, yPos + 15, 12, "F")
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(8)
        doc.setFont("helvetica", "bold")
        doc.text("ACCED", 30, yPos + 17, { align: "center" })
      }
    } catch (error) {
      console.log("Logo yüklenemedi, placeholder kullanılıyor")
      // Logo placeholder
      doc.setFillColor(0, 122, 51)
      doc.circle(30, yPos + 15, 12, "F")
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(8)
      doc.setFont("helvetica", "bold")
      doc.text("ACCED", 30, yPos + 17, { align: "center" })
    }

    // Kurum bilgileri - sağ taraf - BÜYÜK FONT
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("ASSOCIATION CAMEROUNAISE", 55, yPos + 8)
    doc.text("POUR LA CULTURE ET L'EDUCATION", 55, yPos + 16)

    // ACCED vurgusu
    doc.setFillColor(206, 17, 38)
    doc.rect(55, yPos + 20, 35, 10, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text("A.C.C.E.D", 72.5, yPos + 27, { align: "center" })

    yPos += 50

    // MAKBUZ BAŞLIĞI - BÜYÜK VE NET
    doc.setFillColor(0, 122, 51)
    doc.rect(15, yPos, pageWidth - 30, 18, "F")

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.text("BON D'ENTREE EN CAISSE", pageWidth / 2, yPos + 8, { align: "center" })
    doc.setFontSize(14)
    doc.text(`N° ${data.receiptNumber || "___________"}`, pageWidth / 2, yPos + 14, { align: "center" })

    yPos += 25

    // Alt başlık
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(10)
    doc.setFont("helvetica", "italic")
    doc.text("(EXIT ORDER FROM THE COUNTER)", pageWidth / 2, yPos, { align: "center" })

    yPos += 15

    // FORM ALANLARI - BÜYÜK VE TEMİZ

    // Payé à ve CNI - yan yana kutular
    const boxWidth = (pageWidth - 40) / 2
    const boxHeight = 20

    // Sol kutu - Payé à
    doc.setDrawColor(0, 0, 0)
    doc.setLineWidth(0.5)
    doc.rect(15, yPos, boxWidth, boxHeight, "D")

    doc.setFillColor(245, 245, 245)
    doc.rect(15, yPos, boxWidth, 6, "F")

    doc.setTextColor(0, 0, 0)
    doc.setFontSize(9)
    doc.setFont("helvetica", "bold")
    doc.text("Paye a / Paid to:", 17, yPos + 4)

    doc.setFont("helvetica", "normal")
    doc.setFontSize(14)
    // Türkçe karakter desteği için text encoding
    const paidToText = data.paidTo || ""
    doc.text(paidToText, 17, yPos + 12)

    // Sağ kutu - CNI
    const rightX = 20 + boxWidth
    doc.rect(rightX, yPos, boxWidth, boxHeight, "D")

    doc.setFillColor(245, 245, 245)
    doc.rect(rightX, yPos, boxWidth, 6, "F")

    doc.setFont("helvetica", "bold")
    doc.setFontSize(9)
    doc.text("CNI N° / ID Card N°:", rightX + 2, yPos + 4)

    doc.setFont("helvetica", "normal")
    doc.setFontSize(14)
    doc.text(data.idCardNumber || "", rightX + 2, yPos + 12)

    yPos += 30

    // TUTAR KUTUSU - ÇOK BÜYÜK VE VURGULU - ## ile çevrili
    doc.setFillColor(255, 248, 220)
    doc.setDrawColor(206, 17, 38)
    doc.setLineWidth(2)
    doc.rect(15, yPos, pageWidth - 30, 25, "FD")

    doc.setTextColor(0, 0, 0)
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text(`La somme de / The sum of:`, 20, yPos + 8)

    // Tutar - ÇOK BÜYÜK - ## ile çevrili
    doc.setTextColor(206, 17, 38)
    doc.setFontSize(18)
    doc.setFont("helvetica", "bold")
    doc.text(`## ${data.amount || "0"} ${currencySymbol} ##`, pageWidth / 2, yPos + 18, { align: "center" })

    yPos += 35

    // MOTİFS KUTUSU - BÜYÜK
    if (data.motifs) {
      const motifsHeight = 30
      doc.setFillColor(248, 250, 252)
      doc.setDrawColor(0, 0, 0)
      doc.setLineWidth(0.5)
      doc.rect(15, yPos, pageWidth - 30, motifsHeight, "FD")

      doc.setFillColor(240, 240, 240)
      doc.rect(15, yPos, pageWidth - 30, 6, "F")

      doc.setTextColor(0, 0, 0)
      doc.setFontSize(10)
      doc.setFont("helvetica", "bold")
      doc.text("Motifs / Motifs:", 20, yPos + 4)

      doc.setFont("helvetica", "normal")
      doc.setFontSize(12)
      const motifsLines = doc.splitTextToSize(data.motifs, pageWidth - 40)
      doc.text(motifsLines, 20, yPos + 12)

      yPos += motifsHeight + 10
    }

    // Pièces justificatives - sadece dolu ise
    if (data.justificativeDocuments) {
      const docsHeight = 20
      doc.setFillColor(248, 250, 252)
      doc.rect(15, yPos, pageWidth - 30, docsHeight, "FD")

      doc.setFillColor(240, 240, 240)
      doc.rect(15, yPos, pageWidth - 30, 6, "F")

      doc.setFont("helvetica", "bold")
      doc.setFontSize(9)
      doc.text("Pieces justificatives / Justificative documents:", 20, yPos + 4)

      doc.setFont("helvetica", "normal")
      doc.setFontSize(11)
      const docsLines = doc.splitTextToSize(data.justificativeDocuments, pageWidth - 40)
      doc.text(docsLines, 20, yPos + 12)

      yPos += docsHeight + 10
    }

    // İMZA ALANLARI - BÜYÜK VE NET
    yPos = pageHeight - 50

    doc.setFillColor(248, 250, 252)
    doc.setDrawColor(0, 0, 0)
    doc.setLineWidth(0.5)
    doc.rect(15, yPos, pageWidth - 30, 30, "FD")

    // İmza başlığı
    doc.setFillColor(0, 122, 51)
    doc.rect(15, yPos, pageWidth - 30, 6, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(10)
    doc.setFont("helvetica", "bold")
    doc.text("SIGNATURES / SIGNATURES", 20, yPos + 4)

    yPos += 12

    // Sol imza - Caissier
    doc.setTextColor(0, 0, 0)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(9)
    doc.text("Le Caissier / The Cashier", 20, yPos)

    doc.setFont("helvetica", "normal")
    doc.setFontSize(13)
    doc.text(data.cashierName || "", 20, yPos + 8)

    // İmza çizgisi
    doc.setDrawColor(0, 0, 0)
    doc.setLineWidth(0.3)
    doc.line(20, yPos + 20, 70, yPos + 20)

    // Orta - Tarih - BÜYÜK
    doc.setFont("helvetica", "bold")
    doc.setFontSize(11)
    doc.text(`Yaounde, le ${formattedDate}`, pageWidth / 2, yPos + 4, { align: "center" })

    // Sağ imza - Ordonnateur
    doc.setFont("helvetica", "bold")
    doc.setFontSize(9)
    doc.text("L'ordonnateur / Order Giver", pageWidth - 70, yPos, { align: "left" })

    doc.setFont("helvetica", "normal")
    doc.setFontSize(13)
    doc.text(data.orderGiverName || "", pageWidth - 70, yPos + 8, { align: "left" })

    // İmza çizgisi
    doc.setDrawColor(0, 0, 0)
    doc.setLineWidth(0.3)
    doc.line(pageWidth - 70, yPos + 20, pageWidth - 20, yPos + 20)

    // E-imza ibaresi - imza kutusunun içinde, en alt kısmında
    doc.setTextColor(100, 100, 100) // Gri renk
    doc.setFontSize(8) // Küçük font
    doc.setFont("helvetica", "italic")
    doc.text("Bu belge e-imza ile desteklenmektedir", pageWidth / 2, yPos + 26, { align: "center" })

    // Transparan arka plan logosu
    try {
      const logoPath = path.join(process.cwd(), "public", "acced-logo.png")
      const logoExists = fs.existsSync(logoPath)

      if (logoExists) {
        const logoBuffer = fs.readFileSync(logoPath)
        const logoBase64 = logoBuffer.toString("base64")

        // Çok büyük ve transparan logo - arka plan için
        doc.saveGraphicsState()
        doc.setGState(new doc.GState({ opacity: 0.1 })) // %10 şeffaflık
        doc.addImage(`data:image/png;base64,${logoBase64}`, "PNG", pageWidth / 2 - 40, pageHeight / 2 - 40, 80, 80)
        doc.restoreGraphicsState()
      }
    } catch (error) {
      console.log("Arka plan logosu eklenemedi")
    }

    // Alt footer
    doc.setFillColor(0, 122, 51)
    doc.rect(0, pageHeight - 10, pageWidth, 10, "F")

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")
    doc.text(
      "Association Camerounaise pour la Culture et l'Education - Yaounde, Cameroun",
      pageWidth / 2,
      pageHeight - 5,
      { align: "center" },
    )

    // PDF'i buffer olarak döndür
    const pdfOutput = doc.output("arraybuffer")
    return Buffer.from(pdfOutput)
  } catch (error) {
    console.error("PDF oluşturma detaylı hatası:", error)
    throw new Error("PDF oluşturulamadı: " + error.message)
  }
}

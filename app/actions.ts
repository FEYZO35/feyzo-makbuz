"use server"

import { Resend } from "resend"
import { generatePDF } from "./pdf-generator"

const resend = new Resend("re_jN9grgNf_L67bpSrfogqNzLoNxdScTtrP")

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

// E-posta gönderim durumunu takip etmek için
let lastEmailSent = false
let lastEmailData: ReceiptData | null = null

export async function generateReceipt(data: ReceiptData) {
  try {
    console.log("🚀 E-posta gönderim işlemi başlatılıyor...")
    console.log("📧 Gelen veri:", JSON.stringify(data, null, 2))

    // E-posta alıcılarını ayır ve temizle
    const emailList = data.email
      .split(",")
      .map((email) => email.trim())
      .filter((email) => email && email.includes("@"))

    console.log("📋 İşlenmiş e-posta listesi:", emailList)

    if (emailList.length === 0) {
      console.log("❌ Geçerli e-posta adresi bulunamadı")
      return { success: false, error: "Geçerli e-posta adresi bulunamadı" }
    }

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
    const formattedDate = new Date(data.date).toLocaleDateString("tr-TR")

    // Önce basit e-posta gönder (PDF olmadan test)
    console.log("📧 Basit e-posta testi yapılıyor...")

    try {
      const testEmail = await resend.emails.send({
        from: "ACCED <onboarding@resend.dev>",
        to: emailList,
        subject: `🧾 Makbuz N°: ${data.receiptNumber} - BON D'ENTREE EN CAISSE`,
        html: `
          <!DOCTYPE html>
          <html lang="tr">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>ACCED Makbuz</title>
          </head>
          <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border: 2px solid #16a34a;">
                
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
                  <h2 style="margin: 0; font-size: 18px;">ASSOCIATION CAMEROUNAISE POUR LA CULTURE ET L'ÉDUCATION</h2>
                  <div style="background: #dc2626; color: white; padding: 8px 16px; display: inline-block; border-radius: 6px; margin-top: 10px;">
                    <h3 style="margin: 0; font-size: 16px;">ACCED</h3>
                  </div>
                </div>
                
                <!-- Mesaj -->
                <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid #16a34a; margin-bottom: 20px;">
                  <h3 style="color: #16a34a; margin-top: 0;">🎯 Sayın ${data.paidTo},</h3>
                  <p style="color: #333; line-height: 1.6; margin: 0;">Makbuzunuz başarıyla oluşturulmuştur.</p>
                </div>
                
                <!-- Makbuz Detayları -->
                <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #f59e0b;">
                  <h4 style="color: #92400e; margin-top: 0;">📋 Makbuz Detayları</h4>
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 8px; font-weight: bold;">Makbuz N°:</td>
                      <td style="padding: 8px; color: #16a34a; font-weight: bold;">${data.receiptNumber}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px; font-weight: bold;">Tutar:</td>
                      <td style="padding: 8px; font-size: 18px; color: #dc2626; font-weight: bold;">## ${data.amount} ${currencySymbol} ##</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px; font-weight: bold;">Tarih:</td>
                      <td style="padding: 8px; font-weight: bold;">${formattedDate}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px; font-weight: bold;">Kimlik N°:</td>
                      <td style="padding: 8px;">${data.idCardNumber}</td>
                    </tr>
                    ${
                      data.motifs
                        ? `
                    <tr>
                      <td style="padding: 8px; font-weight: bold;">Motifs:</td>
                      <td style="padding: 8px;">${data.motifs}</td>
                    </tr>
                    `
                        : ""
                    }
                  </table>
                </div>
                
                <!-- Başarı Mesajı -->
                <div style="text-align: center; margin: 20px 0;">
                  <div style="background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%); color: white; padding: 15px; border-radius: 8px; display: inline-block;">
                    ✅ <strong>E-posta Başarıyla Gönderildi</strong>
                  </div>
                </div>
                
                <p style="color: #333; text-align: center; margin: 15px 0;">Teşekkür ederiz! 🙏</p>
                
                <!-- Footer -->
                <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
                <div style="text-align: center; color: #666; font-size: 12px;">
                  <strong style="color: #16a34a;">ASSOCIATION CAMEROUNAISE POUR LA CULTURE ET L'ÉDUCATION</strong><br>
                  📍 Yaoundé, Cameroun | 📧 noreply@acced.org | 📞 +237 XXX XXX XXX
                </div>
              </div>
            </div>
          </body>
          </html>
        `,
      })

      if (testEmail.error) {
        console.error("❌ E-posta gönderim hatası:", testEmail.error)
        return {
          success: false,
          error: `E-posta hatası: ${JSON.stringify(testEmail.error)}`,
        }
      }

      console.log("✅ E-posta başarıyla gönderildi!")
      console.log("📧 E-posta ID:", testEmail.data?.id)

      // E-posta gönderim durumunu kaydet
      lastEmailSent = true
      lastEmailData = { ...data }

      // PDF oluşturmayı dene (hata olsa bile e-posta gönderildi)
      try {
        console.log("📄 PDF oluşturuluyor...")
        const pdfBuffer = await generatePDF(data)
        console.log("✅ PDF de başarıyla oluşturuldu")

        // PDF'li e-posta gönder
        const pdfEmail = await resend.emails.send({
          from: "ACCED <onboarding@resend.dev>",
          to: emailList,
          subject: `📎 PDF Makbuz N°: ${data.receiptNumber} - BON D'ENTREE EN CAISSE`,
          html: `
            <!DOCTYPE html>
            <html lang="tr">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>ACCED PDF Makbuz</title>
            </head>
            <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
              <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border: 2px solid #16a34a;">
                  <div style="text-align: center; margin: 20px 0;">
                    <div style="background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%); color: white; padding: 15px; border-radius: 8px; display: inline-block;">
                      📎 <strong>PDF Makbuz Ekte</strong>
                    </div>
                  </div>
                  <p style="color: #333; text-align: center; margin: 15px 0;">Sayın ${data.paidTo}, PDF makbuzunuz ekte bulunmaktadır.</p>
                </div>
              </div>
            </body>
            </html>
          `,
          attachments: [
            {
              filename: `makbuz-${data.receiptNumber}.pdf`,
              content: pdfBuffer,
            },
          ],
        })

        if (!pdfEmail.error) {
          console.log("✅ PDF'li e-posta da gönderildi!")
        }
      } catch (pdfError) {
        console.log("⚠️ PDF oluşturulamadı ama e-posta gönderildi:", pdfError.message)
      }

      return {
        success: true,
        message: "✅ E-posta başarıyla gönderildi!",
        emailId: testEmail.data?.id,
      }
    } catch (emailError) {
      console.error("❌ E-posta gönderim hatası:", emailError)
      return {
        success: false,
        error: `E-posta gönderim hatası: ${emailError.message}`,
      }
    }
  } catch (error) {
    console.error("❌ Genel Hata:", error)
    return {
      success: false,
      error: `Genel hata: ${error.message}`,
    }
  }
}

export async function downloadPDF(data: ReceiptData) {
  try {
    // E-posta gönderim kontrolü
    if (!lastEmailSent || !lastEmailData || lastEmailData.receiptNumber !== data.receiptNumber) {
      return {
        success: false,
        error: "Makbuz kontrolü ve güvenliği için e-posta gönderimi sağlanmadan PDF indiremezsiniz",
      }
    }

    console.log("📄 PDF indirme işlemi başlatılıyor...")
    const pdfBuffer = await generatePDF(data)
    console.log("✅ PDF başarıyla oluşturuldu")

    // Buffer'ı base64'e çevir
    const base64 = pdfBuffer.toString("base64")
    const dataUrl = `data:application/pdf;base64,${base64}`

    return { success: true, pdfUrl: dataUrl }
  } catch (error) {
    console.error("❌ PDF indirme hatası:", error)
    return { success: false, error: "PDF oluşturulamadı: " + error.message }
  }
}

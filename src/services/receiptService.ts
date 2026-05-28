import puppeteer from 'puppeteer'
import dayjs from 'dayjs'
import 'dayjs/locale/sr'
import { formatSeatLabel } from '../utils/seat'
import type { Invoice } from '../models/Invoice'
import { MovieService } from './movieService'

export class InvoicePdfService {
  static async generateReceiptPdf(
    invoice: Invoice,
    user: { firstName: string; lastName: string },
  ): Promise<Buffer> {
    const firstItem = invoice.invoiceItems[0]
    const timeTable = firstItem?.timeTable
    const movieTitle = timeTable?.movieId ? (await MovieService.getById(timeTable?.movieId)).title : 'Биоскопске Карте'
    const totalAmount = invoice.invoiceItems.reduce((sum, item) => sum + item.pricePerItem, 0)
    const issueDate = dayjs(invoice.pursTime).format('DD.MM.YYYY. HH:mm')
    const screeningDate = timeTable?.screeningDate
      ? dayjs(timeTable.screeningDate).locale('sr').format('DD. MMM YYYY.')
      : '-'
    const screeningTime = timeTable?.startTime ? timeTable.startTime.substring(0, 5) : '00:00'

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: 'Courier New', Courier, 'Liberation Mono', monospace;
            color: #000;
            margin: 0;
            padding: 30px;
            font-size: 14px;
            line-height: 1.4;
          }
          .receipt-wrapper {
            max-width: 400px;
            margin: 0 auto;
          }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .bold { font-weight: bold; }
          .brand {
            font-size: 22px;
            font-weight: bold;
            letter-spacing: 2px;
            margin-bottom: 5px;
          }
          .divider {
            border-top: 1px dashed #000;
            margin: 15px 0;
          }
          .meta-table, .items-table {
            width: 100%;
            border-collapse: collapse;
          }
          .meta-table td { padding: 3px 0; }
          .items-table th {
            border-bottom: 1px solid #000;
            padding-bottom: 5px;
            text-align: left;
          }
          .items-table td { padding: 8px 0; vertical-align: top; }
          .total-section {
            margin-top: 15px;
            font-size: 16px;
          }
          .footer-note {
            margin-top: 30px;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="receipt-wrapper">
          <div class="text-center">
            <div class="brand">SNAPSEAT</div>
            <div>Мрежа Биоскопа</div>
            <div>Каса: ${invoice.pursCounter || 'Онлајн Куповина'}</div>
          </div>

          <div class="divider"></div>

          <table class="meta-table">
            <tr>
              <td class="bold">ИД Рачуна:</td>
              <td class="text-right">${invoice.pursId || invoice.invoiceId}</td>
            </tr>
            <tr>
              <td class="bold">Датум:</td>
              <td class="text-right">${issueDate}</td>
            </tr>
            <tr>
              <td class="bold">Купац:</td>
              <td class="text-right">${user.firstName} ${user.lastName}</td>
            </tr>
          </table>

          <div class="divider"></div>

          <div class="bold" style="font-size: 16px; margin-bottom: 5px;">${movieTitle}</div>
          <div style="margin-bottom: 3px;">Биоскоп: ${timeTable?.cinema?.name || '-'}</div>
          <div>Пројекција: ${screeningDate} у ${screeningTime} ч</div>

          <div class="divider"></div>

          <table class="items-table">
            <thead>
              <tr>
                <th>Опис</th>
                <th class="text-right" style="width: 80px;">Цена</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.invoiceItems
                .map(
                  (item, index) => `
                <tr>
                  <td>Карта #${index + 1} (Седиште: ${formatSeatLabel(item.seatNumber)})</td>
                  <td class="text-right">${item.pricePerItem.toFixed(2)} РСД</td>
                </tr>
              `,
                )
                .join('')}
            </tbody>
          </table>

          <div class="divider"></div>

          <table class="meta-table total-section">
            <tr class="bold">
              <td>УКУПНО ПЛАЋЕНО:</td>
              <td class="text-right" style="color: #000;">${totalAmount.toFixed(2)} РСД</td>
            </tr>
          </table>

          <div class="divider"></div>

          <div class="text-center footer-note">
            <p>Хвала вам што користите SnapSeat!</p>
            <p>Молимо вас да покажете овај рачун на улазу ради скенирања ваших дигиталних улазница.</p>
          </div>
        </div>
      </body>
      </html>
    `

    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] })
    const page = await browser.newPage()

    await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' })

    const pdfBuffer = await page.pdf({
      width: '5in',
      height: '8.5in',
      printBackground: true,
      margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
    })

    await browser.close()
    return Buffer.from(pdfBuffer)
  }
}

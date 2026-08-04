// ── PDF Builder ───────────────────────────────────────────────────────────────
// All jsPDF generation logic extracted from ReportPage.tsx into this module.
// ReportPage.downloadReport() delegates here.
// Accepts optional transfer and stroke clock data to append extra sections.

import type { PatientFormState, ScanState, AnalysisResult } from './workflow'
import type { TransferRecord } from './registry'

export type PdfOptions = {
  patient: PatientFormState
  scan: ScanState
  analysis: AnalysisResult
  reportId: string
  strokeOnsetTime?: string       // ISO timestamp, optional
  elapsedAtGeneration?: string   // HH:MM:SS, computed by caller at generation time
  transfer?: TransferRecord | null
}

export async function generateAndDownloadPdf(options: PdfOptions): Promise<void> {
  const { patient, scan, analysis, reportId, strokeOnsetTime, elapsedAtGeneration, transfer } = options

  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const margin = 18
  const contentW = pageW - margin * 2
  let y = margin

  // ── Helper functions ──────────────────────────────────────────────────────
  const addPageIfNeeded = (neededHeight: number) => {
    if (y + neededHeight > pageH - margin) {
      doc.addPage()
      y = margin
    }
  }

  const drawDivider = () => {
    addPageIfNeeded(6)
    doc.setDrawColor(220, 220, 220)
    doc.setLineWidth(0.3)
    doc.line(margin, y, pageW - margin, y)
    y += 5
  }

  const sectionTitle = (text: string) => {
    addPageIfNeeded(10)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(120, 120, 120)
    doc.text(text.toUpperCase(), margin, y)
    y += 6
  }

  const bodyText = (text: string, indent = 0) => {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(30, 30, 30)
    const lines = doc.splitTextToSize(text, contentW - indent)
    addPageIfNeeded(lines.length * 5 + 2)
    doc.text(lines, margin + indent, y)
    y += lines.length * 5 + 2
  }

  const valueRow = (label: string, value: string) => {
    addPageIfNeeded(7)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(60, 60, 60)
    doc.text(label + ':', margin, y)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(30, 30, 30)
    doc.text(value, margin + 52, y)
    y += 7
  }

  // ── Header bar ────────────────────────────────────────────────────────────
  doc.setFillColor(10, 10, 10)
  doc.rect(0, 0, pageW, 22, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.setTextColor(255, 255, 255)
  doc.text('NeuroAssist', margin, 14)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(180, 180, 180)
  doc.text('Clinical Decision Support System', margin + 47, 14)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(180, 180, 180)
  doc.text(`Report ID: ${reportId}`, pageW - margin, 10, { align: 'right' })
  doc.text(`Generated: ${analysis.generatedAt}`, pageW - margin, 16, { align: 'right' })

  y = 32

  // ── Title ─────────────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(10, 10, 10)
  doc.text('Clinical Assessment Report', margin, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text('AI-assisted stroke risk evaluation — for clinical review only', margin, y + 3)
  y += 12

  drawDivider()

  // ── Section 1: Patient Information ───────────────────────────────────────
  sectionTitle('Patient Information')
  valueRow('Name', patient.name || 'Anonymous')
  valueRow('Age', `${patient.age} years`)
  valueRow('Gender', patient.gender)
  valueRow('Blood Pressure', `${patient.systolic}/${patient.diastolic} mmHg`)
  valueRow('Blood Glucose', `${patient.glucose} mg/dL`)
  valueRow('BMI', patient.bmi)
  valueRow('Smoking History', patient.smokingHistory)
  const comorbidities =
    [
      patient.hypertension && 'Hypertension',
      patient.diabetes && 'Diabetes',
      patient.heartDisease && 'Heart Disease',
      patient.previousStroke && 'Previous Stroke',
    ]
      .filter(Boolean)
      .join(', ') || 'None'
  valueRow('Comorbidities', comorbidities)
  if (patient.symptoms) valueRow('Symptoms', patient.symptoms)
  valueRow('Scan Modality', scan.modality)

  // Stroke onset time (NEW — optional section)
  if (strokeOnsetTime) {
    const onsetDate = new Date(strokeOnsetTime)
    valueRow('Stroke Onset Time', onsetDate.toLocaleString())
    if (elapsedAtGeneration) {
      valueRow('Elapsed at Report Generation', elapsedAtGeneration)
    }
  }
  y += 2

  drawDivider()

  // ── Section 2: Clinical AI Results ───────────────────────────────────────
  sectionTitle('Clinical AI Results')

  addPageIfNeeded(22)
  const riskColor: Record<string, [number, number, number]> = {
    Critical: [220, 38, 38],
    High: [234, 88, 12],
    Moderate: [202, 138, 4],
    Low: [22, 163, 74],
  }
  const [r, g, b] = riskColor[analysis.riskLevel] ?? [10, 10, 10]
  doc.setFillColor(r, g, b)
  doc.roundedRect(margin, y, 55, 16, 3, 3, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(255, 255, 255)
  doc.text(`${analysis.riskLevel} Risk`, margin + 27.5, y + 10, { align: 'center' })

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(26)
  doc.setTextColor(10, 10, 10)
  doc.text(`${analysis.strokeProbability}%`, margin + 65, y + 12)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(100, 100, 100)
  doc.text('Stroke Probability', margin + 65, y + 17)
  y += 24

  valueRow('Predicted Stroke Type', analysis.strokeType)
  valueRow('Clinical Confidence', `${analysis.confidence}%`)
  y += 2

  sectionTitle('Summary')
  bodyText(analysis.reportSummary)
  y += 2

  sectionTitle('Clinical Considerations')
  for (const item of analysis.clinicalConsiderations) {
    addPageIfNeeded(8)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(30, 30, 30)
    const lines = doc.splitTextToSize(`• ${item}`, contentW - 4)
    doc.text(lines, margin + 2, y)
    y += lines.length * 5 + 2
  }
  y += 2

  sectionTitle('Risk Factors')
  for (const factor of analysis.riskFactors) {
    addPageIfNeeded(12)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(30, 30, 30)
    doc.text(factor.label, margin + 2, y)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(80, 80, 80)
    const detailLines = doc.splitTextToSize(factor.detail, contentW - 20)
    doc.text(detailLines, margin + 2, y + 5)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(30, 30, 30)
    doc.text(`Score: ${factor.score}`, pageW - margin, y, { align: 'right' })
    y += detailLines.length * 5 + 6
  }

  drawDivider()

  // ── Section 3: Imaging ────────────────────────────────────────────────────
  sectionTitle('Imaging Analysis')
  valueRow('Lesion Location', analysis.lesionLocation)
  bodyText(analysis.imagingSummary)
  y += 2

  // ── Section 4: Image AI Results ───────────────────────────────────────────
  if (analysis.imagePrediction) {
    drawDivider()
    sectionTitle('Image AI Results (EfficientNet-B0)')
    valueRow('Prediction', analysis.imagePrediction.prediction)
    valueRow('Image Confidence', `${(analysis.imagePrediction.confidence * 100).toFixed(2)}%`)
    y += 2

    // CT scan + GradCAM side-by-side (NEW)
    const API_BASE = (import.meta.env.VITE_API_URL ?? 'http://localhost:8080').replace(/\/api$/, '')
    const heatmapUrl = `${API_BASE}${analysis.imagePrediction.heatmapPath}`

    // Try to embed CT scan (from scan preview URL)
    let ctDataUrl: string | null = null
    if (scan.previewUrl && scan.previewUrl.startsWith('blob:')) {
      try {
        const resp = await fetch(scan.previewUrl)
        if (resp.ok) {
          const blob = await resp.blob()
          ctDataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = reject
            reader.readAsDataURL(blob)
          })
        }
      } catch { /* skip */ }
    }

    // Try to embed Grad-CAM
    let gradcamDataUrl: string | null = null
    try {
      const response = await fetch(heatmapUrl)
      if (response.ok) {
        const blob = await response.blob()
        gradcamDataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(blob)
        })
      }
    } catch { /* skip */ }

    if (ctDataUrl || gradcamDataUrl) {
      sectionTitle('CT Scan & Grad-CAM Heatmap')
      addPageIfNeeded(100)
      const imgH = 80
      const halfW = (contentW - 5) / 2

      if (ctDataUrl) {
        doc.addImage(ctDataUrl, 'JPEG', margin, y, halfW, imgH, undefined, 'FAST')
        doc.setFontSize(8)
        doc.setTextColor(100, 100, 100)
        doc.text('Original CT Scan', margin + halfW / 2, y + imgH + 4, { align: 'center' })
      }
      if (gradcamDataUrl) {
        doc.addImage(gradcamDataUrl, 'PNG', margin + halfW + 5, y, halfW, imgH, undefined, 'FAST')
        doc.setFontSize(8)
        doc.setTextColor(100, 100, 100)
        doc.text('Grad-CAM Heatmap', margin + halfW + 5 + halfW / 2, y + imgH + 4, { align: 'center' })
      }
      y += imgH + 10

      // AI interpretation text (NEW)
      bodyText(
        'The highlighted regions in the Grad-CAM heatmap indicate the areas of the CT scan that contributed most strongly to the AI prediction. Warmer colors (red/yellow) represent higher activation, suggesting these regions were most influential in the model\'s assessment.',
      )
      y += 2
    } else if (!ctDataUrl && gradcamDataUrl) {
      sectionTitle('Grad-CAM Heatmap')
      addPageIfNeeded(100)
      doc.addImage(gradcamDataUrl, 'PNG', margin, y, contentW, 90, undefined, 'FAST')
      y += 94
    }
  }

  drawDivider()

  // ── Section 5: Transfer Summary (NEW — optional) ──────────────────────────
  if (transfer) {
    sectionTitle('Hospital Transfer Summary')
    valueRow('Sending Hospital', transfer.sendingHospital)
    valueRow('Receiving Hospital', transfer.receivingHospital)
    valueRow('Receiving Doctor', transfer.receivingDoctor)
    valueRow('Priority', transfer.priority)
    valueRow('Transfer Time', new Date(transfer.transferredAt).toLocaleString())
    valueRow('Transfer Status', transfer.status)
    if (transfer.acceptedAt) {
      valueRow('Acceptance Time', new Date(transfer.acceptedAt).toLocaleString())
      valueRow('Accepted By', transfer.acceptedBy ?? transfer.receivingHospital)
    }
    if (transfer.transferNotes) {
      sectionTitle('Transfer Notes')
      bodyText(transfer.transferNotes)
    }
    y += 2
    drawDivider()
  }

  // ── Disclaimer ────────────────────────────────────────────────────────────
  addPageIfNeeded(22)
  doc.setFillColor(248, 248, 248)
  doc.roundedRect(margin, y, contentW, 18, 2, 2, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(80, 80, 80)
  doc.text('DISCLAIMER', margin + 4, y + 6)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(100, 100, 100)
  const disclaimer =
    'NeuroAssist provides clinical decision support only. This report must not replace clinical judgment, direct patient assessment, or formal diagnostic review by the treating physician.'
  const dLines = doc.splitTextToSize(disclaimer, contentW - 8)
  doc.text(dLines, margin + 4, y + 11)
  y += 22

  // ── Footer on every page ──────────────────────────────────────────────────
  const totalPages = (doc.internal as unknown as { getNumberOfPages: () => number }).getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(160, 160, 160)
    doc.text(
      `NeuroAssist Clinical Report  •  ${reportId}  •  Page ${i} of ${totalPages}`,
      pageW / 2,
      pageH - 8,
      { align: 'center' },
    )
  }

  doc.save(`neuroassist-report-${reportId}.pdf`)
}

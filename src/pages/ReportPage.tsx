import { useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Download, FileText } from 'lucide-react'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { PageHeader } from '../components/layout/PageHeader'
import { Separator } from '../components/ui/separator'
import { useWorkflow } from '../context/workflow-context'
import { API_BASE_URL } from '../services/api'
import { ROUTES } from '../utils/routes'

export function ReportPage() {
  const navigate = useNavigate()
  const { analysis, patient, scan } = useWorkflow()

  useEffect(() => {
    if (!analysis) {
      navigate(ROUTES.patient, { replace: true })
    }
  }, [analysis, navigate])

  if (!analysis) {
    return <Navigate to={ROUTES.patient} replace />
  }

  const reportId = `NA-${new Date().toISOString().slice(0, 10)}`

  const reportSections = [
    { title: 'Patient summary', content: `${patient.name}, age ${patient.age}, ${patient.gender}. Blood pressure ${patient.systolic}/${patient.diastolic} mmHg, glucose ${patient.glucose} mg/dL, BMI ${patient.bmi}.` },
    { title: 'AI findings', content: `Estimated stroke probability ${analysis.strokeProbability}%, clinical confidence ${analysis.confidence}%, predicted stroke type ${analysis.strokeType}, risk level ${analysis.riskLevel}.` },
    { title: 'Imaging analysis', content: analysis.imagingSummary },
    { title: 'Clinical considerations', content: analysis.clinicalConsiderations.join(' ') },
  ]

  const downloadReport = async () => {
    // Always generate the PDF in the browser.

    // Generate professional PDF in-browser using jsPDF
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

    const pageW = doc.internal.pageSize.getWidth()
    const pageH = doc.internal.pageSize.getHeight()
    const margin = 18
    const contentW = pageW - margin * 2
    let y = margin

    // ── Helper functions ──────────────────────────────────────────
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

    // ── Header bar ───────────────────────────────────────────────
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
    // Report meta top-right
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(180, 180, 180)
    doc.text(`Report ID: ${reportId}`, pageW - margin, 10, { align: 'right' })
    doc.text(`Generated: ${analysis.generatedAt}`, pageW - margin, 16, { align: 'right' })

    y = 32

    // ── Title ────────────────────────────────────────────────────
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

    // ── Section 1: Patient Information ───────────────────────────
    sectionTitle('Patient Information')
    valueRow('Name', patient.name || 'Anonymous')
    valueRow('Age', `${patient.age} years`)
    valueRow('Gender', patient.gender)
    valueRow('Blood Pressure', `${patient.systolic}/${patient.diastolic} mmHg`)
    valueRow('Blood Glucose', `${patient.glucose} mg/dL`)
    valueRow('BMI', patient.bmi)
    valueRow('Smoking History', patient.smokingHistory)
    const comorbidities = [
      patient.hypertension && 'Hypertension',
      patient.diabetes && 'Diabetes',
      patient.heartDisease && 'Heart Disease',
      patient.previousStroke && 'Previous Stroke',
    ].filter(Boolean).join(', ') || 'None'
    valueRow('Comorbidities', comorbidities)
    if (patient.symptoms) valueRow('Symptoms', patient.symptoms)
    valueRow('Scan Modality', scan.modality)
    y += 2

    drawDivider()

    // ── Section 2: Clinical AI Results ───────────────────────────
    sectionTitle('Clinical AI Results')

    // Risk badge box
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

    // ── Section 3: Imaging ───────────────────────────────────────
    sectionTitle('Imaging Analysis')
    valueRow('Lesion Location', analysis.lesionLocation)
    bodyText(analysis.imagingSummary)
    y += 2

    // ── Section 4: Image AI Results ──────────────────────────────
    if (analysis.imagePrediction) {
      drawDivider()
      sectionTitle('Image AI Results (EfficientNet-B0)')
      valueRow('Prediction', analysis.imagePrediction.prediction)
      valueRow('Image Confidence', `${(analysis.imagePrediction.confidence * 100).toFixed(2)}%`)
      y += 2

      // Attempt to embed Grad-CAM heatmap
      try {
        const heatmapUrl = `${API_BASE_URL}${analysis.imagePrediction.heatmapPath}`
        const response = await fetch(heatmapUrl)
        if (response.ok) {
          const blob = await response.blob()
          const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = reject
            reader.readAsDataURL(blob)
          })

          sectionTitle('Grad-CAM Heatmap')
          addPageIfNeeded(100)
          const imgMaxW = contentW
          const imgMaxH = 90
          doc.addImage(dataUrl, 'PNG', margin, y, imgMaxW, imgMaxH, undefined, 'FAST')
          y += imgMaxH + 4
        }
      } catch {
        bodyText('(Grad-CAM image could not be embedded in this report.)')
      }
    }

    drawDivider()

    // ── Disclaimer ───────────────────────────────────────────────
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
    const disclaimer = 'NeuroAssist provides clinical decision support only. This report must not replace clinical judgment, direct patient assessment, or formal diagnostic review by the treating physician.'
    const dLines = doc.splitTextToSize(disclaimer, contentW - 8)
    doc.text(dLines, margin + 4, y + 11)
    y += 22

    // ── Footer on every page ────────────────────────────────────
    const totalPages = (doc.internal as unknown as { getNumberOfPages: () => number }).getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(160, 160, 160)
      doc.text(`NeuroAssist Clinical Report  •  ${reportId}  •  Page ${i} of ${totalPages}`, pageW / 2, pageH - 8, { align: 'center' })
    }

    doc.save(`neuroassist-report-${reportId}.pdf`)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <PageHeader
        eyebrow="Step 5 of 6"
        title="Clinical report"
        description="A formatted summary suitable for physician-facing handoff. Download exports a professional PDF with Clinical AI results, Image AI findings, and the Grad-CAM heatmap."
        action={
          <Button type="button" onClick={downloadReport}>
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        }
      />

      <div className="mt-8 grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle>NeuroAssist clinical summary</CardTitle>
                <CardDescription>Report generated from the current workflow analysis.</CardDescription>
              </div>
              <Badge>{reportId}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 text-sm leading-7 text-steel-700">
            <div className="grid gap-4 lg:grid-cols-2">
              {reportSections.map((section) => (
                  <div key={section.title} className="rounded-3xl border border-steel-900 bg-white p-5">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-steel-500">{section.title}</div>
                  <p className="mt-2 text-sm leading-7 text-steel-700">{section.content}</p>
                </div>
              ))}
            </div>

            <Separator />

            <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-3xl border border-steel-900 bg-white p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-steel-500">Risk factors</div>
                <ul className="mt-3 space-y-2">
                  {analysis.riskFactors.map((factor) => (
                    <li key={factor.label} className="flex items-start justify-between gap-4 border-b border-steel-200 pb-2 last:border-0 last:pb-0">
                      <div>
                        <div className="font-medium text-steel-900">{factor.label}</div>
                        <div className="text-sm text-steel-500">{factor.detail}</div>
                      </div>
                      <div className="font-semibold text-steel-900">{factor.score}</div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-3xl border border-steel-900 bg-white p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-steel-500">Imaging overview</div>
                <div className="mt-3 space-y-3 text-sm leading-7 text-steel-700">
                  <p>Scan modality: {scan.modality}</p>
                  <p>Lesion location: {analysis.lesionLocation}</p>
                  <p>{analysis.imagingSummary}</p>
                </div>
              </div>
            </div>

            {analysis.imagePrediction && (
              <>
                <Separator />
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-3xl border border-steel-900 bg-white p-5">
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-steel-500">Image AI — Prediction</div>
                    <div className="mt-2 text-base font-semibold text-steel-900">{analysis.imagePrediction.prediction}</div>
                    <div className="mt-1 text-sm text-steel-500">Confidence: {(analysis.imagePrediction.confidence * 100).toFixed(2)}%</div>
                  </div>
                  <div className="rounded-3xl border border-steel-900 bg-white p-5">
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-steel-500">Image AI — Grad-CAM</div>
                    <img
                      src={`${API_BASE_URL}${analysis.imagePrediction.heatmapPath}`}
                      alt="Grad-CAM Heatmap"
                      className="mt-2 w-full rounded-xl object-contain"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="rounded-3xl border border-steel-900 bg-white p-5 text-steel-900">
              <div className="flex items-center gap-2 font-semibold">
                <FileText className="h-4 w-4" />
                Disclaimer
              </div>
              <p className="mt-2 text-sm leading-7">
                NeuroAssist provides clinical decision support only. This report must not replace clinical judgment, direct patient assessment, or formal diagnostic review by the treating physician.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

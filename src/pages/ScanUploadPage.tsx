import { useEffect, useRef, useState } from 'react'
import { FileUp, ImagePlus, UploadCloud } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/layout/PageHeader'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Progress } from '../components/ui/progress'
import { useWorkflow } from '../context/workflow-context'
import { ROUTES } from '../utils/routes'

export function ScanUploadPage() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const { scan, updateScanField } = useWorkflow()
  const [localPreview, setLocalPreview] = useState<string>(scan.previewUrl)
  const [uploadProgress, setUploadProgress] = useState(scan.uploadProgress)
  const [dragActive, setDragActive] = useState(false)

  useEffect(() => {
    if (!scan.fileName) return undefined
    if (uploadProgress >= 100) return undefined

    const interval = window.setInterval(() => {
      setUploadProgress((current) => {
        if (current >= 100) {
          window.clearInterval(interval)
          return 100
        }
        const next = Math.min(100, current + 1.5)
        updateScanField('uploadProgress', next)
        return next
      })
    }, 30)

    return () => window.clearInterval(interval)
  }, [scan.fileName, updateScanField, uploadProgress])

  const handleFile = (file: File | null) => {
    if (!file) return

    const objectUrl = URL.createObjectURL(file)
    setLocalPreview(objectUrl)
    updateScanField('fileName', file.name)
    updateScanField('previewUrl', objectUrl)
    updateScanField('file', file)
    setUploadProgress(0)
    updateScanField('uploadProgress', 0)
  }

  const handleAnalyze = () => {
    navigate(ROUTES.processing)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <PageHeader
        eyebrow="Step 2 of 6"
        title="Brain scan upload"
        description="Upload a CT or MRI image to complete the mock handoff before AI processing. The progress indicator is simulated for the demo."
      />

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader>
            <CardTitle>Upload imaging</CardTitle>
            <CardDescription>Drop a file into the zone below or browse from disk.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-3">
              {[
                { label: 'CT Scan', value: 'CT' },
                { label: 'MRI', value: 'MRI' }
              ].map(({ label, value }) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={scan.modality === value}
                  onClick={() => updateScanField('modality', value as 'CT' | 'MRI')}
                  className={[
                    'rounded-full border border-black px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-white',
                    scan.modality === value ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100',
                  ].join(' ')}
                >
                  {label}
                </button>
              ))}
            </div>

            <div
              onDragOver={(event) => {
                event.preventDefault()
                setDragActive(true)
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(event) => {
                event.preventDefault()
                setDragActive(false)
                handleFile(event.dataTransfer.files[0] ?? null)
              }}
              className={[
                'flex min-h-72 flex-col items-center justify-center rounded-3xl border-2 border-dashed p-8 text-center transition',
                dragActive ? 'border-steel-900 bg-steel-200' : 'border-steel-900 bg-steel-50/60',
              ].join(' ')}
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-steel-900 bg-white text-steel-900 shadow-sm">
                <UploadCloud className="h-8 w-8" />
              </div>
              <div className="mt-5 space-y-2">
                <div className="text-lg font-semibold text-steel-900">Drag and drop scan file here</div>
                <div className="text-sm text-steel-600">Supported demo flow: CT or MRI image preview with immediate analysis handoff.</div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                  <FileUp className="h-4 w-4" />
                  Choose file
                </Button>
                <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()}>
                  <ImagePlus className="h-4 w-4" />
                  Browse image
                </Button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
              />
            </div>

            <div className="space-y-3 rounded-2xl border border-steel-200 bg-white p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-steel-700">Upload progress</span>
                <span className="text-steel-500">{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} />
              <div className="text-xs text-steel-500">This is a staged progress animation to support the demo experience.</div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current scan selection</CardTitle>
              <CardDescription>Demo metadata linked to the current workflow state.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-steel-700">
              <Row label="Patient">{scan.fileName ? 'Ready for analysis' : 'Awaiting file upload'}</Row>
              <Row label="Modality">{scan.modality}</Row>
              <Row label="File">{scan.fileName || 'Awaiting upload'}</Row>
              <Row label="Estimated status">{scan.fileName ? 'Ready for analysis' : 'Pending file upload'}</Row>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <div className="bg-steel-950 px-6 py-4 text-white">
              <div className="text-sm font-semibold uppercase tracking-[0.18em] text-steel-300">Preview</div>
              <div className="mt-1 text-lg font-semibold">Selected file snapshot</div>
            </div>
            <CardContent className="space-y-4 p-6">
              {localPreview ? (
                <div className="overflow-hidden rounded-3xl border border-steel-900 bg-steel-50">
                  <img src={localPreview} alt="Uploaded brain scan preview" className="h-72 w-full object-cover" />
                </div>
              ) : (
                <div className="flex h-72 items-center justify-center rounded-3xl border border-steel-900 bg-steel-50 text-steel-500">
                  Upload a scan to preview it here.
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3">
            <Button className="w-full" size="lg" disabled={!scan.fileName} onClick={handleAnalyze}>
              Analyze scan
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-steel-50 px-4 py-3">
      <span className="text-steel-500">{label}</span>
      <span className="font-medium text-steel-900">{children}</span>
    </div>
  )
}

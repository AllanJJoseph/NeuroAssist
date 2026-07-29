import { ArrowLeft, Brain, FileScan, Stethoscope } from 'lucide-react'
import { Link } from 'react-router-dom'
import { FeatureCard } from '../components/layout/FeatureCard'
import { Footer } from '../components/layout/Footer'
import { PageContainer } from '../components/layout/PageContainer'
import { SectionHeading } from '../components/layout/SectionHeading'
import { SecondaryButton } from '../components/ui/SecondaryButton'
import { ROUTES } from '../utils/routes'

const features = [
  {
    icon: <Stethoscope className="h-6 w-6" />,
    title: 'Clinical intake',
    description: 'Structured patient capture for stroke triage with a familiar hospital-style layout.',
  },
  {
    icon: <FileScan className="h-6 w-6" />,
    title: 'Scan workflow',
    description: 'Upload, preview, and process scan images within a guided sequence that is ready for backend integration.',
  },
  {
    icon: <Brain className="h-6 w-6" />,
    title: 'Explainable output',
    description: 'Results and report views surface the clinical signals that drive the mock analysis summary.',
  },
]

export function AboutPage() {
  return (
    <>
      <PageContainer>
        <SectionHeading
          eyebrow="About"
          title="NeuroAssist overview"
          description="A focused stroke decision support demo that combines patient intake, imaging handoff, simulated processing, and a report-ready result screen."
          action={
            <SecondaryButton asChild>
              <Link to={ROUTES.home} className="inline-flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </SecondaryButton>
          }
        />

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard key={feature.title} icon={feature.icon} title={feature.title} description={feature.description} />
          ))}
        </div>
      </PageContainer>
      <Footer />
    </>
  )
}

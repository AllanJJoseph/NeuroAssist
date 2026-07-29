import { ArrowLeft, Mail, MessageSquare, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { FeatureCard } from '../components/layout/FeatureCard'
import { Footer } from '../components/layout/Footer'
import { PageContainer } from '../components/layout/PageContainer'
import { SectionHeading } from '../components/layout/SectionHeading'
import { SecondaryButton } from '../components/ui/SecondaryButton'
import { ROUTES } from '../utils/routes'

const contactItems = [
  {
    icon: <Mail className="h-6 w-6" />,
    title: 'Email',
    description: 'Use this placeholder page for team or stakeholder contact details during the hackathon demo.',
  },
  {
    icon: <Phone className="h-6 w-6" />,
    title: 'Phone',
    description: 'Add the clinic or project contact line here when the deployment process is finalized.',
  },
  {
    icon: <MessageSquare className="h-6 w-6" />,
    title: 'Support channel',
    description: 'Reserve this area for the backend and product support workflow once integration begins.',
  },
]

export function ContactPage() {
  return (
    <>
      <PageContainer>
        <SectionHeading
          eyebrow="Contact"
          title="Get in touch"
          description="This placeholder contact page keeps the same clinical palette and structure as the rest of the app while leaving room for future operational details."
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
          {contactItems.map((item) => (
            <FeatureCard key={item.title} icon={item.icon} title={item.title} description={item.description} />
          ))}
        </div>
      </PageContainer>
      <Footer />
    </>
  )
}

import { generateHelpMetadata } from '@/components/seo/page-seo';
import { PolicyLayout } from '../components/policy-layout';
import { HelpCircle } from 'lucide-react';
import Link from 'next/link';

export const metadata = generateHelpMetadata();

export default function HelpCenterPage() {
  return (
    <PolicyLayout title="Help Center" lastUpdated="April 2024" icon={HelpCircle}>
      <div className="text-foreground/80 space-y-8">
        <section>
          <h2 className="text-foreground mb-4 text-2xl font-bold">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-foreground mb-2 text-xl font-semibold">
                How do I purchase a course?
              </h3>
              <p className="leading-relaxed">
                You can browse our catalog of courses, click &quot;Enroll Now&quot; or &quot;Add to
                Cart&quot;, and proceed through our secure checkout process. We support major credit
                cards and various local payment methods depending on your region.
              </p>
            </div>

            <div>
              <h3 className="text-foreground mb-2 text-xl font-semibold">
                How long do I have access to a course?
              </h3>
              <p className="leading-relaxed">
                Once purchased, you get true <strong>lifetime access</strong> to the course content.
                This includes any future updates or additional materials the instructor adds to the
                curriculum.
              </p>
            </div>

            <div>
              <h3 className="text-foreground mb-2 text-xl font-semibold">
                Do I get a certificate?
              </h3>
              <p className="leading-relaxed">
                Yes! Upon completing 100% of the lessons and passing all required quizzes, you will
                automatically receive a verifiable digital certificate that you can add to your
                LinkedIn profile.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-foreground mt-8 mb-4 text-2xl font-bold">Account Status</h2>
          <p className="mb-4 leading-relaxed">
            If you are having trouble logging into your account, please ensure that you are using
            the correct login method (Google, GitHub, or Email). If you&apos;ve forgotten your
            password, use the &quot;Forgot Password&quot; link on the login page to reset it.
          </p>
        </section>

        <section className="bg-primary/5 border-primary/20 mt-12 rounded-xl border p-6">
          <h2 className="text-foreground mb-3 text-2xl font-bold">Still need help?</h2>
          <p className="mb-4 leading-relaxed">
            Our support team is always ready to assist you. If you couldn&apos;t find the answer you
            were looking for, please don&apos;t hesitate to contact us.
          </p>
          <Link
            href="/contact"
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-md px-6 py-2 text-sm font-medium shadow-sm transition-colors"
          >
            Contact Support
          </Link>
        </section>
      </div>
    </PolicyLayout>
  );
}

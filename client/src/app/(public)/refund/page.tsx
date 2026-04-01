import { generateRefundMetadata } from '@/components/seo/page-seo';
import { RefreshCcw } from 'lucide-react';
import { PolicyLayout } from '../components/policy-layout';

export const metadata = generateRefundMetadata();

export default function RefundPolicyPage() {
  return (
    <PolicyLayout title="Refund Policy" lastUpdated="April 2024" icon={RefreshCcw}>
      <div className="text-foreground/80 space-y-8">
        <section>
          <h2 className="text-foreground mb-4 text-2xl font-bold">
            1. Our 30-Day Money-Back Guarantee
          </h2>
          <p className="mb-4 leading-relaxed">
            We want you to be absolutely satisfied with your learning experience at LearnHub.
            That&apos;s why we offer a comprehensive 30-day money-back guarantee for all individual
            course purchases. If you are unhappy with a course, you can request a full refund within
            30 days of purchasing it.
          </p>
          <p className="leading-relaxed">
            Please note that our refund policy is governed by the guidelines below to protect our
            instructors and ensure fair use of the platform.
          </p>
        </section>

        <section>
          <h2 className="text-foreground mb-4 text-2xl font-bold">2. Conditions for Refund</h2>
          <div className="mb-4 leading-relaxed">
            A refund may be issued if the following conditions are met:
            <ul className="mt-2 ml-6 list-disc space-y-2">
              <li>
                <strong>Timeframe:</strong> The refund request is submitted within 30 days of the
                original purchase date.
              </li>
              <li>
                <strong>Course Consumption:</strong> You have not completed more than 20% of the
                course content.
              </li>
              <li>
                <strong>Certificate:</strong> You have not earned or downloaded the course
                completion certificate.
              </li>
              <li>
                <strong>Fair Use:</strong> You do not have a history of excessively refunding
                courses (which we consider an abuse of our policy).
              </li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-foreground mb-4 text-2xl font-bold">3. How to Request a Refund</h2>
          <div className="mb-4 leading-relaxed">
            To request a refund, please follow these steps:
            <ol className="mt-2 ml-6 list-decimal space-y-2">
              <li>Log in to your LearnHub account.</li>
              <li>
                Navigate to your &quot;Purchase History&quot; or &quot;Order Details&quot; page.
              </li>
              <li>
                Find the course you wish to refund and click the &quot;Request Refund&quot; button.
              </li>
              <li>
                Provide a brief explanation of why the course didn&apos;t meet your expectations.
              </li>
            </ol>
          </div>
          <p className="mt-4 leading-relaxed">
            Alternatively, you can email our support team at <strong>support@learnhub.com</strong>
            with your order number and email address associated with your account.
          </p>
        </section>

        <section>
          <h2 className="text-foreground mb-4 text-2xl font-bold">4. Refund Processing Time</h2>
          <p className="leading-relaxed">
            Once a refund is approved, it will be processed immediately on our end. However,
            depending on your payment method and financial institution, it may take{' '}
            <strong>5 to 10 business days</strong> for the funds to appear back on your account or
            credit card statement.
          </p>
        </section>

        <section>
          <h2 className="text-foreground mb-4 text-2xl font-bold">5. Denial of Refund</h2>
          <p className="leading-relaxed">
            We reserve the right, in our sole discretion, to limit or deny refund requests in cases
            where we believe there is refund abuse, including but not limited to instances where a
            significant portion of the course has been consumed or downloaded before the refund was
            requested, or multiple refunds have been requested by the same user.
          </p>
        </section>
      </div>
    </PolicyLayout>
  );
}

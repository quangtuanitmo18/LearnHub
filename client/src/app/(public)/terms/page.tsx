import { generateTermsMetadata } from '@/components/seo/page-seo';
import { PolicyLayout } from '../components/policy-layout';
import { FileText } from 'lucide-react';

export const metadata = generateTermsMetadata();

export default function TermsOfServicePage() {
  return (
    <PolicyLayout title="Terms of Service" lastUpdated="April 2024" icon={FileText}>
      <div className="space-y-8 text-foreground/80">
        <section>
          <h2 className="mb-4 text-2xl font-bold text-foreground">1. Introduction</h2>
          <p className="mb-4 leading-relaxed">
            Welcome to LearnHub. These Terms of Service ("Terms") govern your use of the LearnHub
            website, courses, materials, and associated services (collectively the "Services"). By
            accessing or using our Services, you agree to be bound by these Terms and our Privacy
            Policy.
          </p>
          <p className="leading-relaxed">
            If you do not agree to these Terms, you may not access or use to our Services. We may
            modify these Terms at any time, and such modifications shall be effective immediately
            upon posting on the website.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-bold text-foreground">2. User Accounts</h2>
          <p className="mb-4 leading-relaxed">
            In order to access certain features of the Services, you must register for an account.
            You promise to provide us with accurate, complete, and updated registration information.
            You may not select a username that you don't have the right to use, or another person's
            name with the intent to impersonate that person.
          </p>
          <p className="leading-relaxed">
            You are entirely responsible for maintaining the confidentiality of your account password
            and for all activities that occur under your account. You agree to notify us immediately
            of any unauthorized use of your account or any other breach of security.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-bold text-foreground">3. Course Content and Intellectual Property</h2>
          <p className="mb-4 leading-relaxed">
            The courses, materials, videos, texts, and quizzes provided on LearnHub are owned by us
            or our instructors and are protected by copyright, trademark, and other intellectual
            property laws.
          </p>
          <p className="leading-relaxed">
            When you enroll in a course, LearnHub grants you a limited, non-exclusive, non-transferable
            license to access and view the course content solely for your personal, non-commercial,
            educational purposes. You may not reproduce, redistribute, transmit, assign, sell,
            broadcast, rent, share, lend, modify, adapt, or edit any course materials.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-bold text-foreground">4. Code of Conduct</h2>
          <div className="mb-4 leading-relaxed">
            While using our Services, you agree not to:
            <ul className="ml-6 mt-2 list-disc space-y-2">
              <li>Use the Services for any illegal purpose</li>
              <li>Harass, threaten, or intimidate other users or instructors</li>
              <li>Post content that is offensive, defamatory, or violates intellectual property rights</li>
              <li>Attempt to gain unauthorized access to any portion of the Services or our systems</li>
              <li>Share your account credentials with anyone else</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-bold text-foreground">5. Termination</h2>
          <p className="leading-relaxed">
            We reserve the right to suspend or terminate your account and your access to the Services
            at any time, for any reason, including but not limited to, a violation of these Terms or
            our Code of Conduct. Upon termination, your right to use the Services will immediately
            cease, and you will not be entitled to any refunds for purchased courses.
          </p>
        </section>
      </div>
    </PolicyLayout>
  );
}

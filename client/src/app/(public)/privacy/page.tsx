import { generatePrivacyMetadata } from '@/components/seo/page-seo';
import { PolicyLayout } from '../components/policy-layout';
import { Shield } from 'lucide-react';

export const metadata = generatePrivacyMetadata();

export default function PrivacyPolicyPage() {
  return (
    <PolicyLayout title="Privacy Policy" lastUpdated="April 2024" icon={Shield}>
      <div className="text-foreground/80 space-y-8">
        <section>
          <h2 className="text-foreground mb-4 text-2xl font-bold">1. Introduction</h2>
          <p className="mb-4 leading-relaxed">
            At LearnHub, we take your privacy seriously. This Privacy Policy explains how we
            collect, use, disclose, and safeguard your information when you visit our website, use
            our learning platform, and interact with our services.
          </p>
          <p className="leading-relaxed">
            Please read this policy carefully. By accessing or using our platform, you signify your
            understanding and agreement to the terms outlined in this Privacy Policy.
          </p>
        </section>

        <section>
          <h2 className="text-foreground mb-4 text-2xl font-bold">2. Information We Collect</h2>
          <div className="mb-4 leading-relaxed">
            We may collect information about you in a variety of ways. Information we may collect on
            the site includes:
            <ul className="mt-2 ml-6 list-disc space-y-2">
              <li>
                <strong>Personal Data:</strong> Personally identifiable information, such as your
                name, email address, profile picture, and chosen payment methods.
              </li>
              <li>
                <strong>Derivative Data:</strong> Information our servers automatically collect when
                you access the Site, such as your IP address, your browser type, your operating
                system, your access times, and the pages you have viewed directly before and after
                accessing the site.
              </li>
              <li>
                <strong>Financial Data:</strong> Financial information securely processed by our
                payment gateways (Stripe/VietQR) when you purchase courses. We do not store your
                full credit card numbers on our servers.
              </li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-foreground mb-4 text-2xl font-bold">
            3. How We Use Your Information
          </h2>
          <div className="mb-4 leading-relaxed">
            Having accurate information about you permits us to provide you with a smooth,
            efficient, and customized learning experience. We specifically use information collected
            about you to:
            <ul className="mt-2 ml-6 list-disc space-y-2">
              <li>Create and manage your account</li>
              <li>Process your transactions and deliver the courses you purchase</li>
              <li>Track your course progress and issue certificates</li>
              <li>Email you regarding your account, course updates, and new features</li>
              <li>Increase the efficiency and operation of our platform</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-foreground mb-4 text-2xl font-bold">
            4. Disclosure of Your Information
          </h2>
          <p className="leading-relaxed">
            We may share information we have collected about you in certain situations. Your
            information may be disclosed to our third-party service providers that perform services
            for us or on our behalf, including payment processing, data analysis, email delivery,
            hosting services, and customer service.
          </p>
        </section>

        <section>
          <h2 className="text-foreground mb-4 text-2xl font-bold">
            5. Security of Your Information
          </h2>
          <p className="leading-relaxed">
            We use robust administrative, technical, and physical security measures to help protect
            your personal information. While we have taken reasonable steps to secure the personal
            information you provide to us, please be aware that despite our efforts, no security
            measures are perfect or impenetrable, and no method of data transmission can be
            guaranteed against any interception or other type of misuse.
          </p>
        </section>
      </div>
    </PolicyLayout>
  );
}

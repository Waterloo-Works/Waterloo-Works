import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for Waterloo Works",
};

export default function PrivacyPolicyPage() {
  const siteName = "Waterloo Works";
  const contactEmail = "contact@waterloo.works";
  const lastUpdated = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <header className="mb-8">
          <h2 className="font-header text-h2 tracking-tight-04 leading-heading text-zinc-900">Privacy Policy</h2>
          <p className="font-body tracking-wide-01 leading-body mt-2 text-sm text-zinc-500">Last updated: {lastUpdated}</p>
        </header>

        <div className="prose prose-zinc max-w-none font-body">
          <p className="text-zinc-700">
            This Privacy Policy describes how {siteName} (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) collects,
            uses, and shares information about you when you use our website and services (the
            &quot;Service&quot;). By using the Service, you agree to the practices described in this
            policy.
          </p>

          <h2 className="font-header text-lg font-semibold text-zinc-900 mt-8">1. Information We Collect</h2>
          <ul className="list-disc pl-6 text-zinc-700">
            <li>
              Account Information: If you sign in, we may receive your name, email address,
              and basic profile details from your identity provider (for example, Google
              Sign-In).
            </li>
            <li>
              Usage Data: We collect information about how you use the Service, such as pages
              visited, actions taken, and system events. We may use analytics tools to help
              us understand usage and improve performance.
            </li>
            <li>
              Cookies and Local Storage: We use cookies and similar technologies to keep you
              signed in, remember preferences, and measure engagement.
            </li>
            <li>
              Content You Provide: If you post or upload content (for example, job listings
              or a resume), we process that content to operate the Service.
            </li>
          </ul>

          <h2 className="font-header text-lg font-semibold text-zinc-900 mt-8">2. How We Use Information</h2>
          <ul className="list-disc pl-6 text-zinc-700">
            <li>Provide, maintain, and improve the Service.</li>
            <li>Authenticate users and secure accounts.</li>
            <li>Personalize features and content.</li>
            <li>Monitor performance and analyze usage.</li>
            <li>Communicate with you about updates and support.</li>
            <li>Detect, prevent, and address technical or security issues.</li>
          </ul>

          <h2 className="font-header text-lg font-semibold text-zinc-900 mt-8">3. Legal Bases</h2>
          <p className="text-zinc-700">
            Where applicable, our legal bases include your consent, performance of a contract,
            compliance with legal obligations, and our legitimate interests in operating,
            improving, and securing the Service.
          </p>

          <h2 className="font-header text-lg font-semibold text-zinc-900 mt-8">4. Sharing of Information</h2>
          <p className="text-zinc-700">
            We may share information with service providers that help us operate the Service
            (for example, hosting, authentication, analytics), to comply with law, or in
            connection with a business transfer. We do not sell your personal information.
          </p>

          <h2 className="font-header text-lg font-semibold text-zinc-900 mt-8">5. Data Retention</h2>
          <p className="text-zinc-700">
            We retain information for as long as necessary to provide the Service and for
            legitimate and essential purposes such as maintaining security, complying with
            legal obligations, and resolving disputes. Retention periods vary depending on
            the type of data and your account activity.
          </p>

          <h2 className="font-header text-lg font-semibold text-zinc-900 mt-8">6. Your Rights and Choices</h2>
          <ul className="list-disc pl-6 text-zinc-700">
            <li>Access, correct, or delete your account information.</li>
            <li>Opt out of non-essential analytics where offered.</li>
            <li>Manage cookies through your browser settings.</li>
            <li>Contact us to exercise additional rights available in your region.</li>
          </ul>

          <h2 className="font-header text-lg font-semibold text-zinc-900 mt-8">7. International Transfers</h2>
          <p className="text-zinc-700">
            We may process and store information in countries other than where you live.
            When we transfer personal data internationally, we take appropriate measures to
            protect it under applicable laws.
          </p>

          <h2 className="font-header text-lg font-semibold text-zinc-900 mt-8">8. Children&apos;s Privacy</h2>
          <p className="text-zinc-700">
            The Service is not directed to children under the age of 13, and we do not
            knowingly collect personal information from children. If you believe a child has
            provided us with personal information, please contact us and we will take steps
            to remove such information.
          </p>

          <h2 className="font-header text-lg font-semibold text-zinc-900 mt-8">9. Changes to This Policy</h2>
          <p className="text-zinc-700">
            We may update this policy from time to time. We will post the updated policy on
            this page and update the &quot;Last updated&quot; date. Your continued use of the Service
            after changes means you accept the updated policy.
          </p>

          <h2 className="font-header text-lg font-semibold text-zinc-900 mt-8">10. Contact Us</h2>
          <p className="text-zinc-700">
            If you have questions about this policy, please contact us at
            {" "}
            <a href={`mailto:${contactEmail}`} className="text-zinc-900 underline hover:no-underline">
              {contactEmail}
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

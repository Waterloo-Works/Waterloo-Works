import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for Waterloo App",
};

export default function TermsOfServicePage() {
  const siteName = "Waterloo App";
  const contactEmail = "contact@waterloo.app";
  const lastUpdated = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <header className="mb-8">
          <h2 className="font-header text-h2 tracking-tight-04 leading-heading text-zinc-900">Terms of Service</h2>
          <p className="font-body tracking-wide-01 leading-body mt-2 text-sm text-zinc-500">Last updated: {lastUpdated}</p>
        </header>

        <div className="prose prose-zinc max-w-none font-body">
          <p className="text-zinc-700">
            These Terms of Service (&quot;Terms&quot;) govern your access to and use of {siteName}
            (the &quot;Service&quot;). By accessing or using the Service, you agree to be bound by
            these Terms. If you do not agree to these Terms, do not use the Service.
          </p>

          <h2 className="font-header text-lg font-semibold text-zinc-900 mt-8">Affiliation Disclaimer</h2>
          <p className="text-zinc-700">
            {siteName} is an independent community project and is not affiliated with, endorsed by,
            or sponsored by the University of Waterloo or the University&apos;s official co‑op program,
            WaterlooWorks. Any references to &quot;Waterloo&quot; or &quot;WaterlooWorks&quot; on this site are for
            descriptive or comparative purposes only. All trademarks, service marks, and logos remain
            the property of their respective owners.
          </p>

          <h2 className="font-header text-lg font-semibold text-zinc-900 mt-8">1. Eligibility</h2>
          <p className="text-zinc-700">
            You must be at least the age of majority in your jurisdiction and have the legal
            capacity to enter into these Terms. If you access the Service on behalf of an
            organization, you represent that you have authority to bind that organization.
          </p>

          <h2 className="font-header text-lg font-semibold text-zinc-900 mt-8">2. Accounts and Authentication</h2>
          <p className="text-zinc-700">
            To use certain features, you may need an account authenticated through a third party
            identity provider (e.g., Google Sign-In). You are responsible for maintaining the
            confidentiality of your credentials and for all activities under your account. You must
            promptly notify us of any unauthorized use of your account.
          </p>

          <h2 className="font-header text-lg font-semibold text-zinc-900 mt-8">3. Acceptable Use</h2>
          <p className="text-zinc-700">
            You agree not to misuse the Service. For example, you shall not: (a) access or use the
            Service in any manner that could damage, disable, overburden, or impair it; (b) interfere
            with or disrupt the integrity or performance of the Service; (c) attempt to gain
            unauthorized access to the Service or related systems; (d) reverse engineer or decompile
            any part of the Service except to the extent permitted by law; or (e) use the Service to
            violate any applicable law or third-party rights.
          </p>

          <h2 className="font-header text-lg font-semibold text-zinc-900 mt-8">4. User Content</h2>
          <p className="text-zinc-700">
            You retain ownership of content you submit, post, or display on or through the Service
            (&quot;User Content&quot;). By providing User Content, you grant {siteName} a worldwide,
            non-exclusive, royalty-free license to use, reproduce, modify, adapt, publish, translate,
            distribute, and display such content solely to operate and improve the Service. You
            represent that you have all necessary rights to provide the User Content and that it does
            not infringe or violate any third-party rights or laws.
          </p>

          <h2 className="font-header text-lg font-semibold text-zinc-900 mt-8">5. Intellectual Property</h2>
          <p className="text-zinc-700">
            The Service and its original content, features, and functionality are and will remain the
            exclusive property of {siteName} and its licensors. These Terms do not grant you any
            rights to use the {siteName} name, trademarks, logos, domain names, or other distinctive
            brand features without prior written consent.
          </p>

          <h2 className="font-header text-lg font-semibold text-zinc-900 mt-8">6. Third-Party Services</h2>
          <p className="text-zinc-700">
            The Service may integrate with or link to third-party products or services (such as
            authentication providers or analytics). We do not control and are not responsible for
            third-party services. Your use of third-party services is governed by their respective
            terms and privacy policies.
          </p>

          <h2 className="font-header text-lg font-semibold text-zinc-900 mt-8">7. Paid Features</h2>
          <p className="text-zinc-700">
            If paid features or subscriptions are offered, additional terms, pricing, and billing
            policies may apply. Unless otherwise stated, fees are non-refundable, except where
            required by law.
          </p>

          <h2 className="font-header text-lg font-semibold text-zinc-900 mt-8">8. Disclaimer of Warranties</h2>
          <p className="text-zinc-700">
            THE SERVICE IS PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS WITHOUT WARRANTIES OF ANY
            KIND, WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING BUT NOT LIMITED TO IMPLIED
            WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE
            DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, TIMELY, SECURE, OR ERROR-FREE.
          </p>

          <h2 className="font-header text-lg font-semibold text-zinc-900 mt-8">9. Limitation of Liability</h2>
          <p className="text-zinc-700">
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, {siteName} AND ITS AFFILIATES, OFFICERS,
            EMPLOYEES, AGENTS, SUPPLIERS, AND LICENSORS SHALL NOT BE LIABLE FOR ANY INDIRECT,
            INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR
            REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR
            OTHER INTANGIBLE LOSSES, RESULTING FROM (A) YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS
            OR USE THE SERVICE; (B) ANY CONDUCT OR CONTENT OF ANY THIRD PARTY ON THE SERVICE; OR (C)
            UNAUTHORIZED ACCESS, USE, OR ALTERATION OF YOUR TRANSMISSIONS OR CONTENT.
          </p>

          <h2 className="font-header text-lg font-semibold text-zinc-900 mt-8">10. Indemnification</h2>
          <p className="text-zinc-700">
            You agree to defend, indemnify, and hold harmless {siteName} and its affiliates from and
            against any claims, liabilities, damages, losses, and expenses, including reasonable
            attorneys’ fees, arising out of or in any way connected with your use of the Service or
            violation of these Terms.
          </p>

          <h2 className="font-header text-lg font-semibold text-zinc-900 mt-8">11. Termination</h2>
          <p className="text-zinc-700">
            We may suspend or terminate your access to the Service at any time, with or without cause
            or notice, including for any violation of these Terms. Upon termination, your right to use
            the Service will immediately cease.
          </p>

          <h2 className="font-header text-lg font-semibold text-zinc-900 mt-8">12. Governing Law</h2>
          <p className="text-zinc-700">
            These Terms are governed by the laws of the jurisdiction in which {siteName} is
            established, without regard to its conflict of laws principles. You agree to the
            exclusive jurisdiction and venue of the courts located there for any disputes arising out
            of or relating to these Terms or the Service.
          </p>

          <h2 className="font-header text-lg font-semibold text-zinc-900 mt-8">13. Changes to These Terms</h2>
          <p className="text-zinc-700">
            We may update these Terms from time to time. We will post the updated Terms on this page
            and update the &quot;Last updated&quot; date. Your continued use of the Service after any changes
            constitutes acceptance of the updated Terms.
          </p>

          <h2 className="font-header text-lg font-semibold text-zinc-900 mt-8">14. Contact Us</h2>
          <p className="text-zinc-700">
            If you have questions about these Terms, please contact us at
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

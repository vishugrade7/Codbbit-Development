
'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function TermsAndConditionsPage() {
  return (
    <div className="container mx-auto px-4 py-24 sm:px-6 lg:px-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-extrabold tracking-tight font-headline sm:text-5xl">
            Terms and Conditions
          </CardTitle>
          <p className="pt-2 text-muted-foreground">
            Last updated on October 26, 2023
          </p>
        </CardHeader>
        <CardContent className="space-y-8 px-8 pb-8">
          <section>
            <h2 className="text-2xl font-bold mb-4 border-b pb-2">
              1. Agreement to Terms
            </h2>
            <p className="text-muted-foreground">
              By using our application ("Service"), you agree to be bound by
              these Terms and Conditions. If you do not agree to these Terms, do
              not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 border-b pb-2">
              2. User Accounts
            </h2>
            <p className="text-muted-foreground">
              When you create an account with us, you must provide us with
              information that is accurate, complete, and current at all times.
              Failure to do so constitutes a breach of the Terms, which may
              result in immediate termination of your account on our Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 border-b pb-2">
              3. Intellectual Property
            </h2>
            <p className="text-muted-foreground">
              The Service and its original content, features, and functionality
              are and will remain the exclusive property of Codbbit and its
              licensors.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 border-b pb-2">
              4. User Conduct
            </h2>
            <p className="text-muted-foreground">
              You agree not to use the Service to violate any laws, post
              harmful content, or attempt to gain unauthorized access to our
              systems.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 border-b pb-2">
              5. Termination
            </h2>
            <p className="text-muted-foreground">
              We may terminate or suspend your account immediately, without
              prior notice, for any reason, including a breach of these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 border-b pb-2">
              6. Limitation of Liability
            </h2>
            <p className="text-muted-foreground">
              Our Service is provided "as is." In no event shall Codbbit be liable
              for any indirect, incidental, or consequential damages resulting
              from your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 border-b pb-2">
              7. Governing Law
            </h2>
            <p className="text-muted-foreground">
              These Terms shall be governed by the laws of the jurisdiction in
              which our company is based, without regard to its conflict of law
              provisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 border-b pb-2">
              8. Changes to Terms
            </h2>
            <p className="text-muted-foreground">
              We reserve the right to modify these terms at any time. We will
              provide notice of material changes.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}


'use client';

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <div className="container mx-auto px-4 pt-24 pb-16 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <header className="text-center mb-12">
            <h1 className="text-4xl font-extrabold tracking-tight font-headline sm:text-5xl">Privacy Policy</h1>
            <p className="mt-4 text-lg text-muted-foreground">Last updated on October 26, 2023</p>
          </header>

          <div className="space-y-10">
            <section>
              <h2 className="text-2xl font-bold mb-4 border-b pb-2">Introduction</h2>
              <p className="text-muted-foreground">This Privacy Policy describes how Codbbit ("we", "us", or "our") collects, uses, and protects the personal information of users. By using our platform, you consent to the data practices described in this policy.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 border-b pb-2">Information We Collect</h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>Account Information:</strong> Name, email, and billing information for premium features.</li>
                <li><strong>Usage Data:</strong> Problems attempted, solutions submitted, and AI interactions.</li>
                <li><strong>Technical Data:</strong> IP address, browser type, and device information for analytics and security.</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold mb-4 border-b pb-2">How We Use Your Information</h2>
               <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>To provide, maintain, and personalize the Codbbit platform.</li>
                <li>To process payments for premium subscriptions.</li>
                <li>To improve our services, features, and AI models.</li>
                <li>To communicate important updates and offers where permitted.</li>
              </ul>
            </section>

             <section>
              <h2 className="text-2xl font-bold mb-4 border-b pb-2">Data Sharing</h2>
               <p className="text-muted-foreground">We do not sell your personal data. We may share limited data with:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-4">
                <li>Payment processors for transaction fulfillment.</li>
                <li>Third-party AI providers to generate responses to your requests.</li>
                <li>Service providers helping us maintain the platform.</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold mb-4 border-b pb-2">Contact Us</h2>
              <p className="text-muted-foreground">For any questions or concerns about your privacy, please contact us at <a href="mailto:support@codbbit.com" className="text-primary hover:underline">support@codbbit.com</a>.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

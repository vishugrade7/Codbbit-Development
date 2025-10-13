
'use client';

import {
  AppSidebar,
  Sidebar,
  SidebarInset,
  SidebarProvider,
} from '@/components';

export default function TermsAndConditionsPage() {
  return (
    <SidebarProvider>
      <Sidebar>
        <AppSidebar />
      </Sidebar>
      <SidebarInset>
        <div className="min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="prose dark:prose-invert max-w-4xl mx-auto">
                <h1>Terms and Conditions</h1>
                <p>Last updated: {new Date().toLocaleDateString()}</p>

                <h2>1. Agreement to Terms</h2>
                <p>By using our application, you agree to be bound by these Terms and Conditions. If you do not agree to these Terms, do not use the Service.</p>

                <h2>2. User Accounts</h2>
                <p>When you create an account with us, you must provide us with information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.</p>

                <h2>3. Intellectual Property</h2>
                <p>The Service and its original content, features, and functionality are and will remain the exclusive property of Codbbit and its licensors. The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries.</p>

                <h2>4. User Conduct</h2>
                <p>You agree not to use the Service to:</p>
                <ul>
                    <li>Violate any local, state, national, or international law.</li>
                    <li>Post any content that is threatening, abusive, defamatory, obscene, or invasive of another's privacy.</li>
                    <li>Attempt to gain unauthorized access to any portion of the Service or any other systems or networks connected to the Service.</li>
                </ul>

                <h2>5. Termination</h2>
                <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>

                <h2>6. Limitation of Liability</h2>
                <p>In no event shall Codbbit, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>

                <h2>7. Governing Law</h2>
                <p>These Terms shall be governed and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.</p>
                
                <h2>8. Changes</h2>
                <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days' notice prior to any new terms taking effect.</p>

                <h2>9. Contact Us</h2>
                <p>If you have any questions about these Terms, please contact us at: support@codbbit.com</p>
            </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

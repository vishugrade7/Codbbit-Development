'use client';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 pt-20">
        <div className="prose dark:prose-invert max-w-4xl mx-auto">
            <h1>Privacy Policy</h1>
            <p>Effective Date: {new Date().toLocaleDateString()}</p>

            <h2>1. Introduction</h2>
            <p>This Privacy Policy describes how Fiesta Labs Inc. collects, uses, and protects the personal information of users of Al Fiesta.</p>
            <p>By using Al Fiesta, you consent to the collection and use of your data as outlined here.</p>

            <h2>2. Information We Collect</h2>
            <p>We may collect:</p>
            <ul>
                <li><strong>Account Information:</strong> Name, email, billing information.</li>
                <li><strong>Payment details:</strong> Processed securely through TagMango Inc (outside India) or TagMango Pvt Ltd (India).</li>
                <li><strong>Usage data:</strong> Tokens used, prompts submitted, AI responses generated.</li>
                <li><strong>Technical data:</strong> IP address, browser type, device Information.</li>
            </ul>

            <h2>3. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul>
                <li>Provide, personalize, and maintain services.</li>
                <li>Process subscription payments.</li>
                <li>Improve Al Fiesta features and offerings.</li>
                <li>Communicate important updates and offers where permitted.</li>
                <li>Ensure platform safety and compliance.</li>
            </ul>

            <h2>4. Data Sharing</h2>
            <p>We may share limited data with:</p>
            <ul>
                <li>Payment processors (TagMango Inc / TagMango Pvt Ltd) for transaction fulfillment.</li>
                <li>Third-party AI providers to generate responses to your requests.</li>
                <li>Service providers are helping us maintain the platform.</li>
            </ul>
            <p>We do not sell your personal data.</p>
            
            <h2>5. Data Security</h2>
            <p>We implement encryption, access controls, and secure data storage. However, no system is 100% secure.</p>

            <h2>6. Data Retention</h2>
            <p>We retain personal and usage data only as long as necessary to provide services or comply with legal obligations.</p>

            <h2>7. Your Rights</h2>
            <p>Depending on your jurisdiction, you may have the right to access, correct, delete, or limit your data. Contact us at support@aifiesta.ai to exercise these rights.</p>

            <h2>8. Your Rights (GDPR - EU / CCPA - California)</h2>
            <p><strong>If You Are in the European Economic Area (EEA):</strong></p>
            <p>Under the General Data Protection Regulation (GDPR), you have the right to:</p>
            <ul>
                <li>Access, correct, update, or request deletion of your personal information.</li>
                <li>Object to the processing of your personal data and request data portability.</li>
                <li>Withdraw consent at any time where processing is based on consent.</li>
                <li>Lodge a complaint with your local Data Protection Authority if you believe your rights have been violated.</li>
            </ul>
            <p><strong>If You Are a California Resident:</strong></p>
            <p>Under the California Consumer Privacy Act (CCPA), you have the right to:</p>
            <ul>
                <li>Request disclosure of the categories and specific pieces of personal information we have collected about you.</li>
                <li>Request deletion of your personal information, subject to certain legal exceptions.</li>
                <li>Opt-out of the sale of your personal information (note: Al Fiesta does not sell personal data).</li>
                <li>Be free from discrimination for exercising your privacy rights.</li>
            </ul>
            <p>To exercise any of these rights, contact us at support@aifiesta.ai with the subject line "Privacy Request".</p>

            <h2>9. Age & Parental Consent</h2>
            <ul>
              <li>Al Fiesta is not directed towards children under the minimum digital consent age in their country (13 in the US, 16 in the EU unless lowered by law).</li>
              <li>By using this platform, you confirm that you meet the legal minimum age in your jurisdiction or have obtained verifiable parental consent.</li>
              <li>We do not knowingly collect personal data from children under these ages without consent. If we discover that such data has been provided, we will delete it promptly.</li>
            </ul>

            <h2>10. Third-Party Content and Links</h2>
            <p>AI responses may contain third-party information. We are not responsible for the accuracy or legality of third-party outputs.</p>

            <h2>11. Changes to Privacy Policy</h2>
            <p>We may update this policy from time to time. Continued use of Al Fiesta after updates means you accept the revised policy.</p>

            <h2>12. Contact Us</h2>
            <p>For questions, support, or legal notices, contact:</p>
            <ul>
              <li>support@aifiesta.ai</li>
              <li>Fiesta Labs Inc., 1 Chestnut Hill Plaza #1088, Newark, DE 19713, Delaware, USA</li>
            </ul>
        </div>
    </div>
  );
}

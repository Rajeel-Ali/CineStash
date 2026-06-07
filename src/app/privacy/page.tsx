'use client';

import { PageHeader } from '@/components/page-header';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground pb-12">
      <div className="container mx-auto px-4 pt-8 max-w-3xl">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-8 group">
          <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
          Back to App
        </Link>
        <PageHeader
          title="Privacy Policy"
          description="Learn how CineStash handles your data."
          className="mb-8"
        />
        <p className="text-sm text-muted-foreground mb-8">Last updated: October 14, 2025</p>
        
        <div className="mb-10 p-6 border rounded-lg bg-card text-card-foreground">
          <h2 className="text-xl font-bold mb-4">Developer Information</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Developer:</strong> Rajeel Ali</p>
            <p><strong>Contact:</strong> <a href="mailto:app@rajeel.me" className="text-primary hover:underline">app@rajeel.me</a></p>
            <p><strong>Website:</strong> <a href="https://app.rajeel.me" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://app.rajeel.me</a></p>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold border-b pb-2 mb-4">1. Introduction</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>CineStash (“the App”) is committed to protecting your privacy. This policy explains what information is collected, how it is used, and your choices regarding your data.</p>
              <p>By using CineStash, you agree to the terms described in this Privacy Policy.</p>
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold border-b pb-2 mb-4">2. Information We Collect</h2>
            <div className="space-y-4 text-muted-foreground">
                <p>CineStash is primarily a local-first app, meaning your watchlist data is stored on your device. However, certain limited information may be collected automatically for performance and usage insights.</p>
                
                <h3 className="text-lg font-semibold text-foreground pt-2">Local Data:</h3>
                <ul className="list-disc list-inside space-y-2">
                <li>All watchlist items, preferences, and settings are stored locally on your device.</li>
                <li>This data is not uploaded to any external server.</li>
                </ul>

                <h3 className="text-lg font-semibold text-foreground pt-2">Analytics Data:</h3>
                <ul className="list-disc list-inside space-y-2">
                <li>CineStash uses Google Analytics to collect anonymous usage statistics (e.g., session counts, page views, device type) to improve the app’s performance and usability.</li>
                <li>No personally identifiable information (PII) is collected.</li>
                </ul>

                <h3 className="text-lg font-semibold text-foreground pt-2">Cookies and Storage:</h3>
                <ul className="list-disc list-inside space-y-2">
                <li>Cookies and local storage are used to remember app preferences and improve functionality.</li>
                </ul>

                <h3 className="text-lg font-semibold text-foreground pt-2">AI Features:</h3>
                <ul className="list-disc list-inside space-y-2">
                <li>CineStash integrates Google Gemini APIs via Genkit to offer optional AI-based suggestions.</li>
                <li>These requests may send relevant context (e.g., genre or title metadata) to Google’s servers for processing.</li>
                <li>No personal identifiers are transmitted.</li>
                </ul>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold border-b pb-2 mb-4">3. How We Use Information</h2>
            <div className="space-y-4 text-muted-foreground">
                <p>Collected information is used solely to:</p>
                <ul className="list-disc list-inside space-y-2">
                    <li>Maintain and improve app performance and reliability.</li>
                    <li>Provide AI-based recommendations when enabled.</li>
                    <li>Diagnose and fix technical issues.</li>
                </ul>
                <p>We do not sell, rent, or share user data with third parties for marketing or advertising.</p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold border-b pb-2 mb-4">4. Data Storage and Security</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>CineStash is hosted via Firebase Hosting (Google Cloud infrastructure).</li>
                <li>Firebase and Google Analytics comply with GDPR and other data protection standards.</li>
                <li>All connections use secure HTTPS encryption.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold border-b pb-2 mb-4">5. User Control & Data Deletion</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Users can delete all locally stored data from within the app at any time.</li>
                <li>If you wish to delete analytics data associated with your device, contact us at <a href="mailto:app@rajeel.me" className="text-primary hover:underline">app@rajeel.me</a>.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold border-b pb-2 mb-4">6. Children’s Privacy</h2>
            <p className="text-muted-foreground">CineStash is designed for all ages, but it does not knowingly collect personal data from children under 13. If you believe a child has provided personal information, please contact us for immediate removal.</p>
          </div>

          <div>
            <h2 className="text-2xl font-bold border-b pb-2 mb-4">7. Global Use</h2>
            <p className="text-muted-foreground">CineStash is available worldwide. By using the app, you acknowledge that your data may be processed by services (e.g., Google) that operate internationally.</p>
          </div>

          <div>
            <h2 className="text-2xl font-bold border-b pb-2 mb-4">8. Updates to This Policy</h2>
            <p className="text-muted-foreground">We may update this Privacy Policy periodically. Any changes will be posted on this page with a new “Last updated” date.</p>
          </div>

          <div>
            <h2 className="text-2xl font-bold border-b pb-2 mb-4">9. Contact</h2>
            <p className="text-muted-foreground">If you have any questions or concerns about this Privacy Policy, please contact:<br/>
            <a href="mailto:app@rajeel.me" className="text-primary hover:underline">📧 app@rajeel.me</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

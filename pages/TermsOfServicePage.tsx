import React from 'react';
import { NavLink } from 'react-router-dom';

const TermsOfServicePage: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto bg-surface p-8 rounded-xl shadow-lg text-text-secondary leading-relaxed">
            <h1 className="text-4xl font-bold text-primary mb-6">Terms of Service</h1>
            <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>

            <div className="space-y-6">
                <p>Please read these Terms of Service carefully before using the FreeMemesGenerator.com website.</p>

                <h2 className="text-2xl font-bold text-text-primary pt-4 border-t border-gray-600">1. Acceptance of Terms</h2>
                <p>By accessing and using our website, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.</p>

                <h2 className="text-2xl font-bold text-text-primary pt-4 border-t border-gray-600">2. User Conduct</h2>
                <p>You agree not to use the service to create, upload, or share any content that:</p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                    <li>Is unlawful, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or hateful.</li>
                    <li>Is sexually explicit or pornographic (NSFW).</li>
                    <li>Infringes any patent, trademark, trade secret, copyright, or other proprietary rights of any party.</li>
                    <li>Constitutes spam, junk mail, or any form of unauthorized solicitation.</li>
                </ul>
                <p>We reserve the right to remove any content and terminate user access for violating these terms.</p>

                <h2 className="text-2xl font-bold text-text-primary pt-4 border-t border-gray-600">3. Content Ownership and Rights</h2>
                <p>You retain ownership of the content you create. However, by publishing a meme on our platform, you grant FreeMemesGenerator.com a worldwide, royalty-free, non-exclusive license to host, display, reproduce, and distribute your content for the purpose of operating and promoting the service.</p>
                <p>You are solely responsible for the content you create. You represent that you have the necessary rights to any images you upload and that your content does not infringe on the rights of any third party.</p>
                
                <h2 className="text-2xl font-bold text-text-primary pt-4 border-t border-gray-600">4. Prize Draw</h2>
                <p>The monthly prize draw is governed by the rules outlined on our <NavLink to="/about" className="text-primary hover:underline">About Page</NavLink>. We reserve the right to modify or cancel the prize draw at any time. The prize has no cash alternative in jurisdictions where cash prizes are prohibited.</p>

                <h2 className="text-2xl font-bold text-text-primary pt-4 border-t border-gray-600">5. Disclaimer of Warranties</h2>
                <p>This site is provided on an "as-is" and "as-available" basis. FreeMemesGenerator.com makes no warranties, expressed or implied, and hereby disclaims all other warranties including, without limitation, implied warranties of merchantability, fitness for a particular purpose, or non-infringement of intellectual property.</p>

                <h2 className="text-2xl font-bold text-text-primary pt-4 border-t border-gray-600">6. Limitation of Liability</h2>
                <p>In no event shall FreeMemesGenerator.com or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on our website.</p>
            </div>
        </div>
    );
};

export default TermsOfServicePage;
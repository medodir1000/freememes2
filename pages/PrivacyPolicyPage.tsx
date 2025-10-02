import React from 'react';

const PrivacyPolicyPage: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto bg-surface p-8 rounded-xl shadow-lg text-text-secondary leading-relaxed">
            <h1 className="text-4xl font-bold text-primary mb-6">Privacy Policy</h1>
            <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>

            <div className="space-y-6">
                <p>Welcome to FreeMemesGenerator.com. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.</p>

                <h2 className="text-2xl font-bold text-text-primary pt-4 border-t border-gray-600">Information We Collect</h2>
                <p>We may collect information about you in a variety of ways. The information we may collect on the Site includes:</p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                    <li><strong>User-Generated Content:</strong> We collect the memes you create, including the images you upload and the text you add. By uploading, you confirm you have the rights to use the image.</li>
                    <li><strong>Usage Data:</strong> We automatically collect information when you access and use the site, such as your IP address, browser type, and pages you've visited. This helps us improve our service.</li>
                    <li><strong>Cookies:</strong> We use cookies to enhance your experience, such as keeping you logged in (if applicable) and understanding usage patterns.</li>
                </ul>

                <h2 className="text-2xl font-bold text-text-primary pt-4 border-t border-gray-600">How We Use Your Information</h2>
                <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:</p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                    <li>Operate and manage the FreeMemesGenerator.com website.</li>
                    <li>Display your created memes in a public gallery for others to view, vote, and share.</li>
                    <li>Monitor and analyze usage and trends to improve your experience with the Site.</li>
                    <li>Administer the monthly prize draw and contact winners.</li>
                </ul>

                <h2 className="text-2xl font-bold text-text-primary pt-4 border-t border-gray-600">Sharing Your Information</h2>
                <p>We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties. Your created memes are public and will be displayed on the website. We are not responsible for what third parties do with content they see on our public feed.</p>
                
                <h2 className="text-2xl font-bold text-text-primary pt-4 border-t border-gray-600">Content Moderation</h2>
                <p>We may use automated systems (like Google's Gemini API) to screen for and remove content that violates our Terms of Service, such as NSFW or hateful content. However, we cannot guarantee all such content will be removed.</p>

                <h2 className="text-2xl font-bold text-text-primary pt-4 border-t border-gray-600">Changes to This Privacy Policy</h2>
                <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.</p>
            </div>
        </div>
    );
};

export default PrivacyPolicyPage;
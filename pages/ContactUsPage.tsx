import React, { useState } from 'react';

interface ContactUsPageProps {
    showNotification: (message: string, type?: 'success' | 'info' | 'error') => void;
}

const ContactUsPage: React.FC<ContactUsPageProps> = ({ showNotification }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email || !message) {
            showNotification('Please fill out all fields.', 'error');
            return;
        }
        setIsSubmitting(true);
        // Simulate an API call
        setTimeout(() => {
            setIsSubmitting(false);
            setName('');
            setEmail('');
            setMessage('');
            showNotification('Your message has been sent! We will get back to you soon.', 'success');
        }, 1000);
    };

    return (
        <div className="max-w-2xl mx-auto bg-surface p-8 rounded-xl shadow-lg">
            <h1 className="text-4xl font-bold text-primary mb-4 text-center">Contact Us</h1>
            <p className="text-center text-text-secondary mb-8">
                Have a question, feedback, or a partnership inquiry? We'd love to hear from you!
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-2">Your Name</label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-3 bg-background rounded-lg border-2 border-gray-600 focus:border-primary focus:outline-none"
                        placeholder="Meme Lord"
                    />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">Your Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-3 bg-background rounded-lg border-2 border-gray-600 focus:border-primary focus:outline-none"
                        placeholder="you@example.com"
                    />
                </div>
                <div>
                    <label htmlFor="message" className="block text-sm font-medium text-text-primary mb-2">Message</label>
                    <textarea
                        id="message"
                        rows={5}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full p-3 bg-background rounded-lg border-2 border-gray-600 focus:border-primary focus:outline-none"
                        placeholder="Your message here..."
                    />
                </div>
                <div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-lg text-lg shadow-lg transition-colors disabled:bg-gray-500"
                    >
                        {isSubmitting ? 'Sending...' : 'Send Message'}
                    </button>
                </div>
            </form>

            <div className="mt-8 text-center text-text-secondary">
                <p>You can also email us directly at <a href="mailto:support@freememesgenerator.com" className="text-primary hover:underline">support@freememesgenerator.com</a></p>
            </div>
        </div>
    );
};

export default ContactUsPage;
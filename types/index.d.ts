export interface MailgunAppender {
        type: 'mailgun';
        // your mailgun API key
        apiKey: string;
        // your domain
        domain: string;
        from: string;
        to: string;
        subject: string;
        // (defaults to basicLayout)
        layout?: Layout;
}

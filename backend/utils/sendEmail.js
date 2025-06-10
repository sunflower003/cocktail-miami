const sgMail = require('@sendgrid/mail');

const sendEmail = async (to, subject, text, html) => {
    // Force check và set API key mỗi lần gọi hàm
    if (!process.env.SENDGRID_API_KEY) {
        throw new Error('SendGrid API key not configured');
    }

    if (!process.env.FROM_EMAIL) {
        throw new Error('FROM_EMAIL not configured');
    }

    // Set API key mỗi lần để tránh cache issues
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    try {
        const msg = {
            to,
            from: {
                email: process.env.FROM_EMAIL,
                name: 'Cocktail Miami'
            },
            subject,
            text,
            html,
            // Tracking settings
            trackingSettings: {
                clickTracking: {
                    enable: true,
                    enableText: false
                },
                openTracking: {
                    enable: true
                }
            }
        };

        console.log(`📧 Sending email to: ${to}`);
        console.log(`📧 From: ${process.env.FROM_EMAIL}`);
        console.log(`📧 Subject: ${subject}`);
        console.log(`📧 API Key prefix: ${process.env.SENDGRID_API_KEY.substring(0, 15)}...`);

        const response = await sgMail.send(msg);
        console.log('✅ Email sent successfully! Status:', response[0].statusCode);
        return response;
    } catch (error) {
        console.error('❌ Email sending error:', error.message);
        
        // Log chi tiết lỗi để debug
        if (error.response) {
            console.error('📧 SendGrid error details:');
            console.error('Status:', error.response.statusCode);
            console.error('Body:', JSON.stringify(error.response.body, null, 2));
        }
        
        // Rethrow với message rõ ràng hơn
        if (error.code === 401) {
            throw new Error('SendGrid API key is invalid or expired');
        } else if (error.code === 403) {
            throw new Error('SendGrid sender email not verified');
        } else {
            throw new Error('Failed to send email: ' + error.message);
        }
    }
};

module.exports = sendEmail;
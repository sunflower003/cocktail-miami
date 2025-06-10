const sgMail = require('@sendgrid/mail');

// Thiết lập API key từ environment variable
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (to, subject, text, html) => {
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
            // Thêm tracking và analytics
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

        const response = await sgMail.send(msg);
        console.log('Email sent successfully:', response[0].statusCode);
        return response;
    } catch (error) {
        console.error('Email sending error:', error);
        
        // Log chi tiết lỗi để debug
        if (error.response) {
            console.error('SendGrid error body:', error.response.body);
        }
        
        throw new Error('Failed to send email');
    }
};

module.exports = sendEmail;
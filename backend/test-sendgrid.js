require('dotenv').config();
const sgMail = require('@sendgrid/mail');

console.log('Testing SendGrid configuration...');
console.log('API Key:', process.env.SENDGRID_API_KEY ? `${process.env.SENDGRID_API_KEY.substring(0, 15)}...` : 'NOT SET');
console.log('From Email:', process.env.FROM_EMAIL);

if (!process.env.SENDGRID_API_KEY) {
    console.error('❌ SENDGRID_API_KEY not found in .env file');
    process.exit(1);
}

if (!process.env.FROM_EMAIL) {
    console.error('❌ FROM_EMAIL not found in .env file');
    process.exit(1);
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const testEmail = async () => {
    try {
        const msg = {
            to: 'huylee63897@gmail.com', // Send to yourself
            from: {
                email: process.env.FROM_EMAIL,
                name: 'Cocktail Miami Test'
            },
            subject: 'Test Email - SendGrid Configuration V2',
            text: 'This is a test email to verify SendGrid configuration.',
            html: `
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
                    <h1>✅ Test Email Successful!</h1>
                    <p>This is a test email to verify SendGrid configuration.</p>
                    <p>If you receive this email, SendGrid is working correctly!</p>
                    <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
                </div>
            `
        };

        console.log('Sending test email...');
        const response = await sgMail.send(msg);
        console.log('✅ Email sent successfully!');
        console.log('Response status:', response[0].statusCode);
        console.log('Message ID:', response[0].headers['x-message-id']);
        
        // Test multiple sends
        console.log('\nTesting second email...');
        const msg2 = {
            ...msg,
            subject: 'Test Email #2 - Multiple Send Test'
        };
        
        const response2 = await sgMail.send(msg2);
        console.log('✅ Second email sent successfully!');
        console.log('Response status:', response2[0].statusCode);
        
    } catch (error) {
        console.error('❌ Email test failed:');
        console.error('Error message:', error.message);
        console.error('Error code:', error.code);
        
        if (error.response) {
            console.error('Status Code:', error.response.statusCode);
            console.error('Error Body:', JSON.stringify(error.response.body, null, 2));
        }
        
        // Specific error handling
        if (error.code === 401) {
            console.error('\n🔑 API Key Issues:');
            console.error('1. Check if API key is correct');
            console.error('2. Ensure API key has Mail Send permissions');
            console.error('3. Try creating a new API key with Full Access');
        }
        
        if (error.code === 403) {
            console.error('\n📧 Sender Issues:');
            console.error('1. Verify sender email at SendGrid');
            console.error('2. Check domain authentication');
        }
    }
};

testEmail();
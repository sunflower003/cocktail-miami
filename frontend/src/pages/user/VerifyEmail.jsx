import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';


export default function VerifyEmail() {
    const [verificationCode, setVerificationCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [resendLoading, setResendLoading] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email;

    // API URL tự động chuyển đổi
    const API_URL = import.meta.env.VITE_API_URL || 
                   (import.meta.env.PROD 
                       ? 'https://cocktail-miami-api.onrender.com' // Thay bằng URL thật
                       : 'http://localhost:5000');

    useEffect(() => {
        document.title = 'Verify Email - Cocktail Miami';
        if (!email) {
            navigate('/register');
        }
        console.log('🔗 VerifyEmail API URL:', API_URL);
    }, [email, navigate, API_URL]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/api/auth/verify-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    verificationToken: verificationCode
                }),
            });

            const data = await response.json();

            if (data.success) {
                setSuccess('Email verified successfully! Redirecting to login...');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                setError(data.message || 'Verification failed');
            }
        } catch (error) {
            setError('Network error. Please check your internet connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResendLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch(`${API_URL}/api/auth/resend-verification`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (data.success) {
                setSuccess('New verification code sent to your email! Please check your inbox.');
            } else {
                setError(data.message || 'Failed to resend code');
            }
        } catch (error) {
            setError('Network error. Please check your internet connection and try again.');
        } finally {
            setResendLoading(false);
        }
    };

    if (!email) {
        return null;
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-white px-4">
            <div className="w-full max-w-md">
                <h2 className="text-3xl font-semibold text-center mb-6 border-b pb-2 border-yellow-200">
                    Verify Email
                </h2>

                <p className="text-gray-600 text-center mb-6">
                    We've sent a verification code to <strong>{email}</strong>. Please check your email and enter the code below.
                </p>

                <div className="mb-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded">
                    <p className="text-sm">
                        <strong>📧 Check your email</strong> for the 6-digit verification code. 
                        It may take a few minutes to arrive.
                    </p>
                    <p className="text-xs mt-1">
                        Don't forget to check your spam/junk folder if you don't see it in your inbox.
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                        {success}
                    </div>
                )}

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <input 
                        type="text" 
                        placeholder="Enter 6-digit code" 
                        className="w-full px-4 py-3 border rounded-md text-center text-2xl tracking-widest font-mono" 
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').substring(0, 6))}
                        maxLength={6}
                        required
                    />

                    <button 
                        type="submit"
                        className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 transition disabled:opacity-50"
                        disabled={loading || verificationCode.length !== 6}
                    >
                        {loading ? 'Verifying...' : 'Verify Email'}
                    </button>

                    <button 
                        type="button"
                        className="w-full border border-black text-black py-3 rounded-md hover:bg-gray-100 transition disabled:opacity-50"
                        onClick={handleResend}
                        disabled={resendLoading}
                    >
                        {resendLoading ? 'Sending...' : 'Resend Code'}
                    </button>

                    <button 
                        type="button"
                        className="w-full text-gray-600 py-2 text-sm hover:text-gray-800 transition"
                        onClick={() => navigate('/register')}
                    >
                        Back to Register
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-500">
                    <p>Code expires in 10 minutes</p>
                </div>
            </div>
        </div>
    );
}
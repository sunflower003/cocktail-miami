import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Register() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        gender: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [registrationResponse, setRegistrationResponse] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            
            const response = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: `${formData.firstName} ${formData.lastName}`,
                    email: formData.email,
                    password: formData.password,
                    phone: formData.phone,
                    gender: formData.gender
                }),
            });

            const data = await response.json();
            console.log('Registration response:', data);

            if (response.ok && data.success) {
                setRegistrationResponse(data);
                
                // Chờ 3 giây để user đọc message
                setTimeout(() => {
                    navigate('/verify-email', { 
                        state: { 
                            email: formData.email
                            // BỎ phần verificationCode - User phải vào email để lấy mã
                        } 
                    });
                }, 3000);
            } else {
                setError(data.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-start justify-center min-h-screen bg-white px-4">
            <div className="w-full max-w-md">
                <h2 className="text-3xl font-semibold text-center mb-6 border-b pb-2 border-yellow-200">Sign up</h2>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}

                {registrationResponse && (
                    <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                        <p className="font-medium">{registrationResponse.message}</p>
                        {registrationResponse.data.emailSent === false && (
                            <div className="mt-3 p-3 bg-yellow-100 border border-yellow-300 rounded">
                                <p className="text-sm text-yellow-800">
                                    <strong>Note:</strong> Email could not be sent. You can use the "Resend Code" feature on the verification page.
                                </p>
                            </div>
                        )}
                        <p className="text-sm text-green-600 mt-2 text-center">
                            Redirecting to verification page in 3 seconds...
                        </p>
                    </div>
                )}

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input 
                            type="text" 
                            name="firstName"
                            placeholder="First name" 
                            className="px-4 py-3 border rounded-md w-full" 
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                        />
                        <input 
                            type="text" 
                            name="lastName"
                            placeholder="Last name" 
                            className="px-4 py-3 border rounded-md w-full" 
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <input 
                        type="email" 
                        name="email"
                        placeholder="Email" 
                        className="w-full px-4 py-3 border rounded-md" 
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input 
                            type="password" 
                            name="password"
                            placeholder="Password" 
                            className="px-4 py-3 border rounded-md w-full" 
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                        <input 
                            type="password" 
                            name="confirmPassword"
                            placeholder="Confirm password" 
                            className="px-4 py-3 border rounded-md w-full" 
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <input 
                        type="text" 
                        name="phone"
                        placeholder="Phone" 
                        className="px-4 py-3 border rounded-md w-full" 
                        value={formData.phone}
                        onChange={handleChange}
                        required
                    />

                    <select 
                        name="gender"
                        className="w-full px-4 py-3 border rounded-md"
                        value={formData.gender}
                        onChange={handleChange}
                        required
                    >
                        <option value="" disabled>Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>

                    <div className="space-y-2 mt-4">
                        <button 
                            type="submit"
                            className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 transition disabled:opacity-50"
                            disabled={loading || registrationResponse}
                        >
                            {loading ? 'Creating Account...' : 'Sign up'}
                        </button>
                        <button 
                            type="button"
                            className="w-full border border-black text-black py-3 rounded-md hover:bg-gray-100 transition"
                            onClick={() => navigate('/login')}
                        >
                            Login
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
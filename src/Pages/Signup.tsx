import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaLock, FaBuilding } from 'react-icons/fa';

interface FormData {
  username: string;
  email: string;
  password: string;
  role: 'customer' | 'developer';
}

const SignUp = () => {
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
    role: 'customer',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0); // Strength level from 0 to 4
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'password') {
      calculatePasswordStrength(value);
    }
  };

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length > 0) {
      strength = 1; // 1/4: At least one character
      if (/^[A-Z][a-z]*$/.test(password)) {
        strength = 2; // 2/4: Starts with capital, followed by lowercase
      }
      if (/^[A-Z][a-z]*[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        strength = 3; // 3/4: Includes a special character
      }
      if (/^[A-Z][a-z]*[!@#$%^&*(),.?":{}|<>].*\d/.test(password)) {
        strength = 4; // 4/4: Includes a number
      }
    }
    setPasswordStrength(strength);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    if (!formData.password) {
      setError('Password cannot be empty.');
      setLoading(false);
      return;
    }

    try {
      const { data: existingUsers, error: checkError } = await supabase
        .from('users')
        .select('username')
        .eq('username', formData.username);

      if (checkError) throw new Error('Error checking username availability.');
      if (existingUsers.length > 0) throw new Error('Username already taken. Please choose a different one.');

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: { username: formData.username, role: formData.role },
        },
      });

      if (authError) throw new Error(authError.message);
      if (!authData.user) throw new Error('User creation failed');

      const { error: insertError } = await supabase.from('users').insert([
        {
          id: authData.user.id,
          username: formData.username,
          email: formData.email,
          role: formData.role,
        },
      ]);

      if (insertError) throw new Error(`Failed to create user profile: ${insertError.message}`);

      setSuccess(true);
      // Delay redirect to allow user to see success message
      setTimeout(() => navigate('/login', { state: { message: 'Signup successful! Please confirm your email to log in.' } }), 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(
        errorMessage.includes('email')
          ? 'This email is already registered. Please use a different email or log in.'
          : errorMessage
      );
    } finally {
      setLoading(false);
    }
  };



  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        backgroundImage: "url('/public/bgsignup.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative',
      }}
    >
      <div
        className="absolute inset-0 bg-black/40"
        style={{ zIndex: 0 }}
      ></div>
      <motion.section
        className="max-w-md w-full bg-white shadow-md rounded-lg p-8 relative m-5 z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl font-bold text-stone-700 mb-6 text-center">Sign Up</h2>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}
        {success && !error && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6 text-center">
            Signup successful! Redirecting to login in 2 seconds...
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-sm font-semibold text-stone-700 mb-2 flex items-center">
              <FaUser className="mr-2" /> Username *
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-none focus:ring-stone-500 focus:border-transparent text-sm"
              placeholder="Enter your username"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-stone-700 mb-2 flex items-center">
              <FaEnvelope className="mr-2" /> Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-none focus:ring-stone-500 focus:border-transparent text-sm"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-stone-700 mb-2 flex items-center">
              <FaLock className="mr-2" /> Password *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-none focus:ring-stone-500 focus:border-transparent text-sm"
              placeholder="Enter your password"
            />
            <div className="mt-2">
              <p className="text-sm text-stone-600">
                Password Strength: {passwordStrength}/4
              </p>
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-stone-700 mb-2 flex items-center">
              <FaBuilding className="mr-2" /> Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-none focus:ring-stone-500 focus:border-transparent text-sm"
            >
              <option value="customer">Customer</option>
              <option value="developer">Developer</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`relative w-full py-3 px-6 rounded-lg font-semibold text-white bg-stone-700 z-10 overflow-hidden
              before:absolute before:left-0 before:top-0 before:h-full before:w-0 before:bg-stone-600
              before:z-[-1] before:transition-all before:duration-300 hover:before:w-full hover:text-white
              ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-stone-600">
          Already have an account?{' '}
          <Link to="/login" className="text-stone-700 hover:underline">
            Log In
          </Link>
        </p>
      </motion.section>
    </div>
  );
};

export default SignUp;
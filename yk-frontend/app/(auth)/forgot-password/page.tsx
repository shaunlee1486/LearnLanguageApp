'use client';

import { useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      await api.post('/auth/forgot-password', { email });
      setSuccess('Liên kết đặt lại mật khẩu đã được gửi đến email của bạn.');
    } catch (err: any) {
      setError(err.response?.data?.errors?.[0] || err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center">
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
          Quên mật khẩu
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Nhập email của bạn để nhận liên kết đặt lại mật khẩu.
        </p>
      </div>
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/30 p-2 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="text-green-500 text-sm text-center bg-green-50 dark:bg-green-900/30 p-2 rounded">
            {success}
          </div>
        )}
        <div className="rounded-md shadow-sm space-y-4">
          <div>
            <label htmlFor="email" className="sr-only">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              placeholder="Địa chỉ Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isLoading ? 'Đang gửi...' : 'Gửi liên kết'}
          </button>
        </div>
        
        <div className="text-center mt-4">
          <Link href="/login" className="font-medium text-sm text-indigo-600 hover:text-indigo-500">
            Quay lại trang đăng nhập
          </Link>
        </div>
      </form>
    </div>
  );
}

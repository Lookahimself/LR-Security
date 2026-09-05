'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Shield, AlertTriangle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push('/cases');
        router.refresh();
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        // In a real app, you might want to show a success message or redirect to a verification page
        router.push('/cases');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-md min-h-screen flex flex-col justify-center">
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2 mb-4">
          <Shield className="h-8 w-8 text-blue-600" />
          <span className="text-2xl font-bold text-slate-900">ملاذ</span>
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          {isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
        </h1>
        <p className="text-slate-600">
          مساحتك الآمنة للحماية الرقمية
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        {error && (
          <div className="p-4 mb-6 bg-red-50 text-red-700 rounded-xl border border-red-100 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-left"
              dir="ltr"
              required
              disabled={loading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              كلمة المرور
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-left"
              dir="ltr"
              required
              disabled={loading}
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
            ) : isLogin ? (
              'دخول'
            ) : (
              'إنشاء حساب'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-slate-600 hover:text-blue-600 font-medium transition-colors"
          >
            {isLogin ? 'ليس لديك حساب؟ سجل الآن' : 'لديك حساب بالفعل؟ سجل دخولك'}
          </button>
        </div>
      </div>
    </div>
  );
}

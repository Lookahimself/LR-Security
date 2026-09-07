'use client';

import { useState } from 'react';
import { Share2, X, AlertTriangle, Link as LinkIcon, Calendar } from 'lucide-react';

interface ShareModalProps {
  caseId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ShareModal({ caseId, isOpen, onClose }: ShareModalProps) {
  const [email, setEmail] = useState('');
  const [expiresInDays, setExpiresInDays] = useState(7);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successLink, setSuccessLink] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessLink(null);

    try {
      const res = await fetch('/api/shares', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId,
          email,
          expiresInDays,
          permissions: {
            view_summary: true,
            view_evidence: false // Least privilege by default
          }
        })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'فشل إنشاء رابط المشاركة');
      }

      // In a real app, this link would point to a specific public/shared route
      // that verifies the token/email against the case_shares table
      setSuccessLink(`${window.location.origin}/shared/${data.share.id}`);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <Share2 className="h-5 w-5 text-blue-600" />
            مشاركة مع شخص موثوق
          </h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {successLink ? (
            <div className="text-center space-y-4">
              <div className="h-12 w-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <LinkIcon className="h-6 w-6" />
              </div>
              <h4 className="font-bold text-slate-900">تم إنشاء رابط المشاركة</h4>
              <p className="text-sm text-slate-500">تم منح الصلاحية بنجاح. يمكنك نسخ الرابط أدناه وإرساله للشخص الموثوق.</p>
              
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg break-all text-left text-sm font-mono mt-4">
                {successLink}
              </div>
              
              <button 
                onClick={onClose}
                className="w-full mt-4 bg-slate-900 text-white py-2.5 rounded-xl font-medium hover:bg-slate-800"
              >
                إغلاق
              </button>
            </div>
          ) : (
            <form onSubmit={handleShare} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-100 flex items-start gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  البريد الإلكتروني للشخص الموثوق
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-left"
                  dir="ltr"
                  placeholder="trusted@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  مدة الصلاحية (بالأيام)
                </label>
                <select
                  value={expiresInDays}
                  onChange={e => setExpiresInDays(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value={1}>يوم واحد</option>
                  <option value={3}>3 أيام</option>
                  <option value={7}>أسبوع</option>
                  <option value={14}>أسبوعين</option>
                </select>
              </div>

              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-slate-700 mt-6">
                <strong>ملاحظة الخصوصية:</strong> سيتم منح هذا الشخص صلاحية قراءة الملخص والتسلسل الزمني فقط، ولن يتمكن من الوصول إلى الأدلة أو تعديل الحالة.
              </div>

              <button
                type="submit"
                disabled={isLoading || !email}
                className="w-full mt-6 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:bg-slate-300"
              >
                {isLoading ? 'جاري الإنشاء...' : 'إنشاء رابط آمن'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

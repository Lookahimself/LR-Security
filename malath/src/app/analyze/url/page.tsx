'use client';

import { useState } from 'react';
import { AlertCircle, Shield, ArrowRight, Save, Globe, AlertTriangle, Link as LinkIcon, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { UrlScanResult } from '@/types';

export default function AnalyzeUrlPage() {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<UrlScanResult | null>(null);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!url.trim()) return;

    setIsAnalyzing(true);
    setError('');
    
    try {
      const res = await fetch('/api/urls/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() })
      });

      if (!res.ok) {
        throw new Error('فشل الفحص');
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError('حدث خطأ أثناء فحص الرابط. يرجى التأكد من صحة الرابط والمحاولة مرة أخرى.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl min-h-screen flex flex-col">
      <header className="mb-8 flex items-center gap-4">
        <Link href="/" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowRight className="h-6 w-6 text-slate-600" />
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <AlertCircle className="h-6 w-6 text-blue-600" />
          فحص رابط
        </h1>
      </header>

      {!result ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              الرابط المراد فحصه
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 end-0 flex items-center pe-4 pointer-events-none">
                <Globe className="h-5 w-5 text-slate-400" />
              </div>
              <input 
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full ps-4 pe-12 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-left"
                dir="ltr"
                disabled={isAnalyzing}
              />
            </div>
            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
              <Shield className="h-3 w-3" />
              يتم فحص الرابط في بيئة معزولة ولا نقوم بزيارته من جهازك.
            </p>
          </div>

          {error && (
            <div className="p-4 mb-6 bg-red-50 text-red-700 rounded-xl border border-red-100 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={!url.trim() || isAnalyzing}
            className={`w-full py-4 rounded-xl font-medium text-white transition-all flex items-center justify-center gap-2
              ${!url.trim() || isAnalyzing 
                ? 'bg-slate-300 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-sm'
              }`}
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                جاري التحقق من الرابط...
              </>
            ) : (
              'فحص الرابط'
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            
            <div className="flex items-start justify-between mb-6 pb-6 border-b border-slate-100">
              <div>
                <h2 className="text-lg text-slate-500 mb-1">نتيجة الفحص</h2>
                <div className="flex items-center gap-3">
                  <div className={`
                    px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2
                    ${result.risk_level === 'high' || result.risk_level === 'critical' ? 'bg-red-100 text-red-700' : ''}
                    ${result.risk_level === 'medium' ? 'bg-orange-100 text-orange-700' : ''}
                    ${result.risk_level === 'low' ? 'bg-green-100 text-green-700' : ''}
                  `}>
                    {result.risk_level === 'high' || result.risk_level === 'critical' ? (
                      <><AlertTriangle className="h-4 w-4" /> عالي الخطورة</>
                    ) : ''}
                    {result.risk_level === 'medium' ? (
                      <><AlertTriangle className="h-4 w-4" /> مشتبه به</>
                    ) : ''}
                    {result.risk_level === 'low' ? (
                      <><CheckCircle2 className="h-4 w-4" /> لم يتم رصد مؤشرات خطورة</>
                    ) : ''}
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
               <p className="text-sm text-slate-500 mb-1">الرابط المفحوص:</p>
               <p className="font-mono text-sm text-slate-900 break-all text-left" dir="ltr">{result.normalized_url}</p>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold text-slate-900 mb-2">التفاصيل:</h3>
              <p className="text-slate-700 leading-relaxed">
                {result.explanation}
              </p>
            </div>

            {result.signals && result.signals.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  المؤشرات التقنية المكتشفة:
                </h3>
                <ul className="space-y-2">
                  {result.signals.map((signal: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-slate-700 before:content-['•'] before:text-slate-400 before:me-2">
                      <span className="font-mono text-sm bg-slate-100 px-2 py-0.5 rounded">{signal}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
               <button className="flex-1 flex items-center justify-center gap-2 bg-slate-900 text-white py-3 px-4 rounded-xl font-medium hover:bg-slate-800 transition-colors">
                 <Save className="h-4 w-4" />
                 إضافة إلى حالة
               </button>
               <button 
                 onClick={() => {setResult(null); setUrl('');}}
                 className="flex-1 flex items-center justify-center gap-2 bg-white text-slate-700 border border-slate-200 py-3 px-4 rounded-xl font-medium hover:bg-slate-50 transition-colors"
               >
                 <LinkIcon className="h-4 w-4" />
                 فحص رابط آخر
               </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

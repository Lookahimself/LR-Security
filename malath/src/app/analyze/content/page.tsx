'use client';

import { useState } from 'react';
import { Search, Shield, AlertTriangle, ArrowRight, FileText } from 'lucide-react';
import Link from 'next/link';
import { AnalysisResult } from '@/types';
import { SaveCaseButton } from '@/components/SaveCaseButton';

export default function AnalyzeContentPage() {
  const [content, setContent] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!content.trim()) return;

    setIsAnalyzing(true);
    setError('');
    
    try {
      const res = await fetch('/api/analyze/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: content })
      });

      if (!res.ok) {
        throw new Error('فشل التحليل');
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError('حدث خطأ أثناء الاتصال. يرجى المحاولة مرة أخرى.');
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
          <Search className="h-6 w-6 text-blue-600" />
          تحليل محتوى
        </h1>
      </header>

      {!result ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              النص المشتبه به
            </label>
            <textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="ألصق الرسالة أو المحادثة هنا..."
              className="w-full h-48 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
              disabled={isAnalyzing}
            />
            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
              <Shield className="h-3 w-3" />
              البيانات يتم تحليلها بشكل آمن ولا يتم حفظها دون إذنك.
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
            disabled={!content.trim() || isAnalyzing}
            className={`w-full py-4 rounded-xl font-medium text-white transition-all flex items-center justify-center gap-2
              ${!content.trim() || isAnalyzing 
                ? 'bg-slate-300 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-sm'
              }`}
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                جاري تحليل المؤشرات...
              </>
            ) : (
              'تحليل المحتوى'
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            
            <div className="flex items-start justify-between mb-6 pb-6 border-b border-slate-100">
              <div>
                <h2 className="text-lg text-slate-500 mb-1">مستوى الخطورة</h2>
                <div className="flex items-center gap-3">
                  <div className={`
                    px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2
                    ${result.risk_level === 'high' || result.risk_level === 'critical' ? 'bg-red-100 text-red-700' : ''}
                    ${result.risk_level === 'medium' ? 'bg-orange-100 text-orange-700' : ''}
                    ${result.risk_level === 'low' ? 'bg-green-100 text-green-700' : ''}
                  `}>
                    {result.risk_level === 'high' || result.risk_level === 'critical' ? 'عالي الخطورة' : ''}
                    {result.risk_level === 'medium' ? 'متوسط الخطورة' : ''}
                    {result.risk_level === 'low' ? 'منخفض الخطورة' : ''}
                  </div>
                  <span className="text-sm bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full">
                    ثقة التحليل: {
                      result.confidence === 'high' ? 'عالية' :
                      result.confidence === 'medium' ? 'متوسطة' : 'منخفضة'
                    }
                  </span>
                </div>
              </div>
              <div className="text-left">
                 <h2 className="text-lg text-slate-500 mb-1">التصنيف</h2>
                 <p className="font-semibold text-slate-900">{result.category}</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold text-slate-900 mb-2">سبب هذا التقييم:</h3>
              <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl">
                {result.explanation}
              </p>
            </div>

            {result.signals && result.signals.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  مؤشرات الخطر المكتشفة:
                </h3>
                <ul className="space-y-2">
                  {result.signals.map((signal: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-slate-700 before:content-['•'] before:text-slate-400 before:me-2">
                      {signal}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mb-6 pb-6 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-600" />
                خطوات ننصح بها:
              </h3>
              <div className="bg-blue-50 rounded-xl p-4 space-y-3 border border-blue-100">
                {result.recommended_actions.map((action: string, i: number) => (
                  <div key={i} className="flex gap-3">
                    <div className="bg-blue-200 text-blue-800 h-6 w-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <p className="text-slate-800">{action}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
               <SaveCaseButton analysisResult={result} rawContent={content} />
               <button 
                 onClick={() => {setResult(null); setContent('');}}
                 className="flex-1 flex items-center justify-center gap-2 bg-white text-slate-700 border border-slate-200 py-3 px-4 rounded-xl font-medium hover:bg-slate-50 transition-colors"
               >
                 <FileText className="h-4 w-4" />
                 فحص محتوى آخر
               </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

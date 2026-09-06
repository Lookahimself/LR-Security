import { EvidenceUpload } from '@/components/EvidenceUpload';
import { ArrowRight, FileImage, Shield } from 'lucide-react';
import Link from 'next/link';

export default function AnalyzeImagePage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl min-h-screen flex flex-col">
      <header className="mb-8 flex items-center gap-4">
        <Link href="/" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowRight className="h-6 w-6 text-slate-600" />
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <FileImage className="h-6 w-6 text-blue-600" />
          رفع وحفظ أدلة
        </h1>
      </header>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">حفظ الأدلة بشكل آمن</h2>
          <p className="text-slate-600 text-sm">
            يمكنك رفع صور أو لقطات شاشة للمحادثات أو التهديدات كأدلة. سيتم حفظها بشكل مشفر وخاص بك، ولن يتمكن أحد من الاطلاع عليها بدون إذنك.
          </p>
        </div>

        <EvidenceUpload />
        
        <div className="mt-6 pt-6 border-t border-slate-100">
           <div className="flex items-start gap-3 bg-blue-50/50 p-4 rounded-xl border border-blue-100/50">
             <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
             <div className="text-sm text-slate-700">
               <strong className="block mb-1 text-slate-900">حماية الخصوصية:</strong>
               يتم تشفير كافة الملفات المرفوعة. لا تقوم أداة &quot;ملاذ&quot; بمشاركة صورك أو بياناتك مع أي جهة، ولا يتم تحليلها بواسطة الذكاء الاصطناعي إلا إذا طلبت ذلك صراحة بعد الرفع.
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}

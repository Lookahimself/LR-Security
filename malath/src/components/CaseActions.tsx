'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, AlertTriangle, FileDown, HeartHandshake } from 'lucide-react';

interface CaseActionsProps {
  caseId: string;
}

export function CaseActions({ caseId }: CaseActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm('هل أنت متأكد من حذف هذه الحالة؟ سيتم مسح كافة الأدلة المتعلقة بها ولا يمكن التراجع عن هذا الإجراء.')) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const res = await fetch(`/api/cases/${caseId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('فشل الحذف. يرجى المحاولة لاحقاً.');
      }

      router.push('/cases');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ غير متوقع');
      setIsDeleting(false);
    }
  };

  const handleExportPdf = () => {
     alert('ميزة التصدير إلى PDF قيد التطوير وستتوفر قريباً.');
  };

  const handleShare = () => {
     alert('ميزة المشاركة مع شخص موثوق قيد التطوير وستتوفر قريباً.');
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <h3 className="font-bold text-slate-900 mb-4">الإجراءات</h3>
      
      {error && (
        <div className="mb-3 p-3 bg-red-50 text-red-700 rounded-lg border border-red-100 flex items-start gap-2 text-sm">
          <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="space-y-2 flex flex-col">
        <button 
          onClick={handleShare}
          className="flex items-center gap-2 text-start px-4 py-2 hover:bg-slate-50 rounded-lg text-slate-700 transition-colors text-sm font-medium"
        >
          <HeartHandshake className="h-4 w-4" />
          مشاركة مع شخص موثوق
        </button>
        
        <button 
          onClick={handleExportPdf}
          className="flex items-center gap-2 text-start px-4 py-2 hover:bg-slate-50 rounded-lg text-slate-700 transition-colors text-sm font-medium"
        >
          <FileDown className="h-4 w-4" />
          تصدير الحالة (PDF)
        </button>
        
        <button 
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex items-center gap-2 text-start px-4 py-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
          {isDeleting ? 'جاري الحذف...' : 'حذف الحالة نهائياً'}
        </button>
      </div>
    </div>
  );
}

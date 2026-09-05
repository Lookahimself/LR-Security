'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Save, AlertTriangle } from 'lucide-react';
import { AnalysisResult } from '@/types';

interface SaveCaseButtonProps {
  analysisResult: AnalysisResult;
  rawContent: string;
}

export function SaveCaseButton({ analysisResult, rawContent }: SaveCaseButtonProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      // 1. Check Auth State
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError || !session) {
        // Redirect to login, maybe store state in query params or local storage for a real app
        router.push('/auth');
        return;
      }

      // 2. Create the Parent Case
      const { data: caseData, error: caseError } = await supabase
        .from('cases')
        .insert({
          user_id: session.user.id,
          title: `تحليل محتوى: ${analysisResult.category}`,
          category: analysisResult.category,
          risk_level: analysisResult.risk_level,
          status: 'open',
        })
        .select()
        .single();

      if (caseError) throw caseError;

      // 3. Create the Case Items (Evidence & Analysis)
      const evidenceItem = {
        case_id: caseData.id,
        user_id: session.user.id,
        type: 'evidence',
        content: { text: rawContent }
      };

      const analysisItem = {
        case_id: caseData.id,
        user_id: session.user.id,
        type: 'analysis',
        content: analysisResult
      };

      const { error: itemsError } = await supabase
        .from('case_items')
        .insert([evidenceItem, analysisItem]);

      if (itemsError) throw itemsError;

      // 4. Redirect to the new case
      router.push(`/cases/${caseData.id}`);
      router.refresh();

    } catch (err: any) {
      console.error('Save error:', err);
      setError('حدث خطأ أثناء حفظ الحالة. يرجى المحاولة مرة أخرى.');
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full flex-1">
      {error && (
        <div className="mb-3 p-3 bg-red-50 text-red-700 rounded-lg border border-red-100 flex items-start gap-2 text-sm">
          <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}
      <button 
        onClick={handleSave}
        disabled={isSaving}
        className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-3 px-4 rounded-xl font-medium hover:bg-slate-800 transition-colors disabled:bg-slate-400"
      >
        {isSaving ? (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        حفظ كحالة جديدة
      </button>
    </div>
  );
}

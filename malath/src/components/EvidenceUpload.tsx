'use client';

import { useState } from 'react';
import { UploadCloud, FileImage, X, AlertTriangle, Shield } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export function EvidenceUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Strict client-side validation
      if (!selectedFile.type.startsWith('image/')) {
        setError('عذراً، يمكنك فقط رفع الصور أو لقطات الشاشة.');
        return;
      }
      
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('حجم الملف كبير جداً. الحد الأقصى هو 5 ميجابايت.');
        return;
      }

      setFile(selectedFile);
    }
  };

  const uploadEvidence = async () => {
    if (!file) return;
    setIsUploading(true);
    setError(null);

    try {
      // 1. Get Session
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      if (authError || !session) {
        throw new Error('يجب تسجيل الدخول لرفع الأدلة');
      }

      // 2. Generate Safe Path (user_id / timestamp_safe_random)
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${session.user.id}/${fileName}`;

      // 3. Upload to Supabase Storage Bucket ('evidence')
      const { error: uploadError } = await supabase.storage
        .from('evidence')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // 4. (Optional MVP) For now we just create a placeholder case for the evidence
      const { data: caseData, error: caseError } = await supabase
        .from('cases')
        .insert({
          user_id: session.user.id,
          title: `دليل مرفوع: ${file.name}`,
          status: 'open',
        })
        .select()
        .single();

      if (caseError) throw caseError;

      const { error: itemsError } = await supabase
        .from('case_items')
        .insert({
          case_id: caseData.id,
          user_id: session.user.id,
          type: 'evidence',
          content: { 
            filePath, 
            fileName: file.name,
            fileType: file.type,
            size: file.size
          }
        });

      if (itemsError) throw itemsError;

      router.push(`/cases/${caseData.id}`);
      router.refresh();

    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'حدث خطأ أثناء رفع الملف. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full">
      {!file ? (
        <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-blue-500 hover:bg-slate-50 transition-all">
          <input
            type="file"
            id="evidence-upload"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
          <label
            htmlFor="evidence-upload"
            className="cursor-pointer flex flex-col items-center gap-4"
          >
            <div className="h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center">
              <UploadCloud className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <span className="font-semibold text-blue-600 block mb-1">اضغط هنا لرفع صورة</span>
              <span className="text-sm text-slate-500">أو قم بسحب الملف وإفلاته هنا (الحد الأقصى 5MB)</span>
            </div>
          </label>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                <FileImage className="h-5 w-5" />
              </div>
              <div className="text-right">
                <p className="font-medium text-slate-900 truncate max-w-[200px] text-sm" dir="ltr">
                  {file.name}
                </p>
                <p className="text-xs text-slate-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={() => setFile(null)}
              disabled={isUploading}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-100 flex items-start gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <button
            onClick={uploadEvidence}
            disabled={isUploading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:bg-slate-300"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                جاري الرفع والتشفير...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4" />
                حفظ كدليل آمن
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

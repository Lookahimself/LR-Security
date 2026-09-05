import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { FolderClosed, Plus, Shield, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default async function CasesPage() {
  const supabase = createClient()

  // Verify authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect('/auth')
  }

  // Fetch user cases (RLS ensures they only see their own)
  const { data: cases, error } = await supabase
    .from('cases')
    .select('*')
    .order('updated_at', { ascending: false })

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl min-h-screen">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-2">
            <FolderClosed className="h-6 w-6 text-blue-600" />
            حالاتي
          </h1>
          <p className="text-slate-600">إدارة ومتابعة الحالات التي قمت بحفظها</p>
        </div>
        
        <Link 
          href="/analyze/content"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          حالة جديدة
        </Link>
      </header>

      {error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100">
          حدث خطأ أثناء تحميل الحالات.
        </div>
      ) : !cases || cases.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-slate-400" />
          </div>
          <h2 className="text-xl font-medium text-slate-900 mb-2">لا توجد حالات مسجلة</h2>
          <p className="text-slate-500 mb-6">قم بتحليل محتوى مشتبه به للبدء في حفظ الحالات</p>
          <div className="flex justify-center gap-4">
             <Link href="/analyze/content" className="text-blue-600 bg-blue-50 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors">
               فحص محتوى
             </Link>
             <Link href="/analyze/url" className="text-slate-600 bg-slate-50 px-4 py-2 rounded-lg font-medium hover:bg-slate-100 transition-colors">
               فحص رابط
             </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {cases.map((c) => (
            <Link 
              key={c.id} 
              href={`/cases/${c.id}`}
              className="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-sm transition-all flex items-center justify-between group"
            >
              <div>
                <h3 className="font-medium text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                  {c.title}
                </h3>
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <span className="bg-slate-100 px-2 py-0.5 rounded">
                    {new Date(c.updated_at).toLocaleDateString('ar-SA')}
                  </span>
                  {c.risk_level && (
                    <span className={`px-2 py-0.5 rounded text-xs font-medium
                      ${c.risk_level === 'high' || c.risk_level === 'critical' ? 'bg-red-50 text-red-700' : ''}
                      ${c.risk_level === 'medium' ? 'bg-orange-50 text-orange-700' : ''}
                      ${c.risk_level === 'low' ? 'bg-green-50 text-green-700' : ''}
                    `}>
                      {c.risk_level === 'high' || c.risk_level === 'critical' ? 'عالي الخطورة' : ''}
                      {c.risk_level === 'medium' ? 'متوسط الخطورة' : ''}
                      {c.risk_level === 'low' ? 'منخفض الخطورة' : ''}
                    </span>
                  )}
                  {c.category && <span>{c.category}</span>}
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-blue-500 transform rotate-180" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

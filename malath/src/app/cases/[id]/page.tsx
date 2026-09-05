import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Shield, AlertTriangle, Clock, ArrowRight, FolderClosed } from 'lucide-react'
import Link from 'next/link'

// Force dynamic rendering since we depend on cookies/auth
export const dynamic = 'force-dynamic'

export default async function CaseDetailsPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createClient()
  const caseId = params.id

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect('/auth')
  }

  // Fetch case details (RLS enforced)
  const { data: caseData, error: caseError } = await supabase
    .from('cases')
    .select('*')
    .eq('id', caseId)
    .single()

  if (caseError || !caseData) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-4xl text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">تعذر الوصول للحالة</h2>
        <p className="text-slate-600 mb-8">قد تكون الحالة محذوفة، أو لا تملك صلاحية الوصول إليها.</p>
        <Link href="/cases" className="text-blue-600 hover:underline">العودة إلى حالاتي</Link>
      </div>
    )
  }

  // Fetch case items
  const { data: caseItems, error: itemsError } = await supabase
    .from('case_items')
    .select('*')
    .eq('case_id', caseId)
    .order('created_at', { ascending: false })

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl min-h-screen">
      <header className="mb-8 flex items-center gap-4 border-b pb-6">
        <Link href="/cases" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowRight className="h-6 w-6 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-1">
            <FolderClosed className="h-6 w-6 text-blue-600" />
            {caseData.title}
          </h1>
          <div className="flex gap-3 text-sm text-slate-500">
            <span>تم التحديث: {new Date(caseData.updated_at).toLocaleDateString('ar-SA')}</span>
            <span>•</span>
            <span className="capitalize">الحالة: {caseData.status === 'open' ? 'مفتوحة' : 'مغلقة'}</span>
          </div>
        </div>
      </header>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Content Area (Timeline / Evidence) */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">سجل الأحداث والأدلة</h2>
            <button className="text-sm bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors">
              + إضافة دليل
            </button>
          </div>

          {!caseItems || caseItems.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
              <p className="text-slate-500">لا توجد أدلة أو تحليلات مضافة لهذه الحالة بعد.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {caseItems.map(item => (
                <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-5">
                  <div className="flex items-center gap-2 text-sm text-slate-500 mb-3 border-b pb-3">
                    <Clock className="h-4 w-4" />
                    {new Date(item.created_at).toLocaleString('ar-SA')}
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-xs ms-2">
                      {item.type === 'evidence' ? 'دليل' : item.type === 'analysis' ? 'تحليل' : item.type === 'url_scan' ? 'فحص رابط' : 'ملاحظة'}
                    </span>
                  </div>
                  <div className="text-slate-700 text-sm">
                    {/* Render content based on type safely */}
                    <pre className="whitespace-pre-wrap font-sans">
                      {JSON.stringify(item.content, null, 2)}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar (Metadata & Actions) */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="font-bold text-slate-900 mb-4">تفاصيل المخاطر</h3>
            
            <div className="space-y-4">
              <div>
                <span className="text-xs text-slate-500 block mb-1">مستوى الخطورة</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium inline-block
                  ${caseData.risk_level === 'high' || caseData.risk_level === 'critical' ? 'bg-red-100 text-red-700' : ''}
                  ${caseData.risk_level === 'medium' ? 'bg-orange-100 text-orange-700' : ''}
                  ${caseData.risk_level === 'low' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}
                `}>
                  {caseData.risk_level === 'high' || caseData.risk_level === 'critical' ? 'عالي الخطورة' : ''}
                  {caseData.risk_level === 'medium' ? 'متوسط الخطورة' : ''}
                  {caseData.risk_level === 'low' ? 'منخفض الخطورة' : ''}
                  {!caseData.risk_level && 'غير محدد'}
                </span>
              </div>

              <div>
                <span className="text-xs text-slate-500 block mb-1">التصنيف</span>
                <span className="font-medium text-slate-900">{caseData.category || 'غير محدد'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="font-bold text-slate-900 mb-4">الإجراءات</h3>
            <div className="space-y-2 flex flex-col">
              <button className="text-start px-4 py-2 hover:bg-slate-50 rounded-lg text-slate-700 transition-colors text-sm font-medium">
                مشاركة مع شخص موثوق
              </button>
              <button className="text-start px-4 py-2 hover:bg-slate-50 rounded-lg text-slate-700 transition-colors text-sm font-medium">
                تصدير الحالة (PDF)
              </button>
              <button className="text-start px-4 py-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors text-sm font-medium">
                حذف الحالة
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

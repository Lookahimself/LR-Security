import Link from 'next/link'
import { Shield, Search, FolderClosed, HeartHandshake, AlertCircle } from 'lucide-react'

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold text-slate-900">ملاذ</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/auth" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              تسجيل الدخول
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            وش الشيء اللي مقلقك؟
          </h1>
          <p className="text-lg text-slate-600">
            ملاذ يساعدك على فهم المخاطر الرقمية وحماية نفسك بخطوات واضحة وآمنة.
          </p>
        </div>

        {/* Primary Actions */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Link 
            href="/analyze/content" 
            className="flex flex-col items-center p-8 bg-white rounded-2xl border-2 border-slate-100 hover:border-blue-500 hover:shadow-lg transition-all"
          >
            <div className="h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">تحليل محتوى</h2>
            <p className="text-center text-slate-500 text-sm">
              تحليل رسالة، صورة، أو محادثة لفهم المخاطر المحتملة
            </p>
          </Link>

          <Link 
            href="/analyze/url" 
            className="flex flex-col items-center p-8 bg-white rounded-2xl border-2 border-slate-100 hover:border-blue-500 hover:shadow-lg transition-all"
          >
            <div className="h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">فحص رابط</h2>
            <p className="text-center text-slate-500 text-sm">
              تأكد من سلامة أي رابط قبل فتحه أو التفاعل معه
            </p>
          </Link>
        </div>

        {/* Secondary Actions */}
        <div className="grid md:grid-cols-3 gap-4">
          <Link 
            href="/cases" 
            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <FolderClosed className="h-5 w-5 text-slate-400" />
            <span className="font-medium text-slate-700">حالاتي</span>
          </Link>
          
          <Link 
            href="/trusted-person" 
            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <HeartHandshake className="h-5 w-5 text-slate-400" />
            <span className="font-medium text-slate-700">شخص موثوق</span>
          </Link>

          <Link 
            href="/guidance" 
            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <Shield className="h-5 w-5 text-slate-400" />
            <span className="font-medium text-slate-700">المساعدة والإرشاد</span>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-slate-500">
          <p>ملاذ هو أداة مساعدة رقمية ولا يغني عن الجهات الرسمية.</p>
        </div>
      </footer>
    </div>
  )
}

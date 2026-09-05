import { NextResponse } from 'next/server';
import { UrlScanner } from '@/lib/url-scanner';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Invalid or missing URL' }, { status: 400 });
    }

    const result = await UrlScanner.scanUrl(url);

    return NextResponse.json(result);
  } catch (error) {
    console.error('API /urls/scan error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء فحص الرابط. يرجى المحاولة مرة أخرى لاحقاً.' },
      { status: 500 }
    );
  }
}

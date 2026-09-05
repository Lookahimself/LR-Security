import { NextResponse } from 'next/server';
import { AIProvider } from '@/lib/ai-provider';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { text } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Invalid or missing text content' }, { status: 400 });
    }

    if (text.length > 5000) {
      return NextResponse.json({ error: 'Content too long for analysis' }, { status: 400 });
    }

    const result = await AIProvider.analyzeText(text);

    return NextResponse.json(result);
  } catch (error) {
    console.error('API /analyze/text error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحليل المحتوى. يرجى المحاولة مرة أخرى لاحقاً.' },
      { status: 500 }
    );
  }
}

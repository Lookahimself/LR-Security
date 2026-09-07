import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const shareSchema = z.object({
  caseId: z.string().uuid(),
  email: z.string().email(),
  permissions: z.object({
    view_summary: z.boolean().default(true),
    view_evidence: z.boolean().default(false),
  }),
  expiresInDays: z.number().int().min(1).max(30).default(7)
});

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    
    // 1. Verify Session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse and Validate Payload
    const body = await req.json();
    const result = shareSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid share parameters' }, { status: 400 });
    }
    
    const { caseId, email, permissions, expiresInDays } = result.data;

    // 3. Verify Case Ownership Explicitly (Defense in Depth alongside RLS)
    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .select('id')
      .eq('id', caseId)
      .eq('user_id', user.id)
      .single();
      
    if (caseError || !caseData) {
       return NextResponse.json({ error: 'Case not found or access denied' }, { status: 404 });
    }

    // 4. Calculate Expiry
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    // 5. Create Share Record
    const { data: shareData, error: shareError } = await supabase
      .from('case_shares')
      .insert({
        case_id: caseId,
        owner_id: user.id,
        shared_with_email: email,
        permissions: permissions,
        status: 'active',
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (shareError) {
      console.error('Share Creation Error:', shareError);
      return NextResponse.json({ error: 'Failed to create share link' }, { status: 500 });
    }

    return NextResponse.json({ success: true, share: shareData });

  } catch (error) {
    console.error('Share API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

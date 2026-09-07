import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const shareId = params.id;

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rather than hard delete, we revoke (update status) for audit purposes
    const { error: updateError } = await supabase
      .from('case_shares')
      .update({ 
        status: 'revoked', 
        revoked_at: new Date().toISOString() 
      })
      .eq('id', shareId)
      .eq('owner_id', user.id); // RLS handles this, but explicit check is good defense-in-depth

    if (updateError) {
      console.error('Revoke Share Error:', updateError);
      return NextResponse.json({ error: 'Failed to revoke share' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Revoke Share Exception:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

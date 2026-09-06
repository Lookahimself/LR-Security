import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const caseId = params.id;

    // 1. Check Authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Fetch Evidence items to delete physical storage files first
    const { data: evidenceItems, error: itemsError } = await supabase
      .from('case_items')
      .select('content')
      .eq('case_id', caseId)
      .eq('type', 'evidence');

    if (!itemsError && evidenceItems) {
      const filePathsToDelete = evidenceItems
        .map(item => {
           // Safely extract filePath if it exists (for physical uploads)
           const contentObj = item.content as Record<string, any>;
           return contentObj?.filePath;
        })
        .filter(path => path); // Keep only truthy paths

      if (filePathsToDelete.length > 0) {
        // Delete files from 'evidence' bucket
        const { error: storageError } = await supabase.storage
          .from('evidence')
          .remove(filePathsToDelete);
          
        if (storageError) {
          console.error('Failed to delete physical evidence files:', storageError);
          // Continue execution to delete the database records anyway
        }
      }
    }

    // 3. Delete Case (Supabase RLS ensures they can only delete their own cases)
    // Cascading DB relations will automatically delete case_items and case_shares
    const { error: deleteError } = await supabase
      .from('cases')
      .delete()
      .eq('id', caseId);

    if (deleteError) {
      console.error('Case DB Delete Error:', deleteError);
      return NextResponse.json({ error: 'Failed to delete case database record' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Case Deletion Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

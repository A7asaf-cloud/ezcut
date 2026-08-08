import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function deleteUserFolder(
  admin: ReturnType<typeof createAdminClient>,
  bucket: string,
  userId: string
) {
  try {
    // 1. List contents at the root of the user folder
    const { data: rootItems, error: listError } = await admin.storage
      .from(bucket)
      .list(userId);

    if (listError || !rootItems) {
      console.error(`Error listing storage files in bucket ${bucket}:`, listError);
      return;
    }

    const filesToDelete: string[] = [];

    for (const item of rootItems) {
      // In Supabase Storage, directory entries typically have null/empty metadata
      const isDirectory = !item.metadata || Object.keys(item.metadata).length === 0;

      if (isDirectory) {
        // List files inside the subfolder (e.g., the date folder)
        const { data: subItems } = await admin.storage
          .from(bucket)
          .list(`${userId}/${item.name}`);

        if (subItems) {
          for (const subItem of subItems) {
            filesToDelete.push(`${userId}/${item.name}/${subItem.name}`);
          }
        }
      } else {
        // File directly under user folder
        filesToDelete.push(`${userId}/${item.name}`);
      }
    }

    if (filesToDelete.length > 0) {
      const { error: deleteError } = await admin.storage
        .from(bucket)
        .remove(filesToDelete);
      if (deleteError) {
        console.error(`Error deleting files in bucket ${bucket}:`, deleteError);
      }
    }
  } catch (err) {
    console.error(`Failed to clean up storage bucket ${bucket}:`, err);
  }
}

export async function POST() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const admin = createAdminClient();

    // 1. Clean up storage files first before deleting the user row
    // (so we have valid user permissions if policies/cascade checks are needed,
    // though the admin client bypasses them anyway)
    await Promise.all([
      deleteUserFolder(admin, "physique-photos", user.id),
      deleteUserFolder(admin, "meal-screenshots", user.id),
    ]);

    // 2. Delete user from auth.users.
    // The foreign key constraint 'on delete cascade' on the 'daily_logs' table
    // will automatically delete all the user's log rows.
    const { error: deleteUserError } = await admin.auth.admin.deleteUser(user.id);
    if (deleteUserError) {
      return NextResponse.json(
        { error: deleteUserError.message },
        { status: 500 }
      );
    }

    // 3. Clear auth cookies by logging out the current user session
    await supabase.auth.signOut();

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

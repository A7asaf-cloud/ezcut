import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCoachFeedback } from "@/lib/gemini";

async function downloadAsBase64(
  admin: ReturnType<typeof createAdminClient>,
  bucket: string,
  path: string
) {
  const { data, error } = await admin.storage.from(bucket).download(path);
  if (error || !data) {
    throw new Error(`Could not read ${path} from ${bucket}: ${error?.message}`);
  }
  const buffer = Buffer.from(await data.arrayBuffer());
  return {
    data: buffer.toString("base64"),
    mimeType: data.type || "image/jpeg",
  };
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const { logDate, weightKg, physiquePhotoPath, menuScreenshotPath } = body as {
    logDate?: string;
    weightKg?: number;
    physiquePhotoPath?: string;
    menuScreenshotPath?: string;
  };

  if (!logDate || !weightKg || !physiquePhotoPath || !menuScreenshotPath) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Storage paths are namespaced as `${user.id}/...` — reject anything that
  // doesn't belong to the caller, since a client could otherwise ask the
  // server to read someone else's private bucket objects.
  const ownPrefix = `${user.id}/`;
  if (
    !physiquePhotoPath.startsWith(ownPrefix) ||
    !menuScreenshotPath.startsWith(ownPrefix)
  ) {
    return NextResponse.json({ error: "Invalid photo path" }, { status: 403 });
  }

  try {
    const admin = createAdminClient();

    const [physiqueImage, menuImage] = await Promise.all([
      downloadAsBase64(admin, "physique-photos", physiquePhotoPath),
      downloadAsBase64(admin, "meal-screenshots", menuScreenshotPath),
    ]);

    const aiFeedback = await getCoachFeedback({
      logDate,
      weightKg,
      physiqueImage,
      menuImage,
    });

    const { error: upsertError } = await supabase.from("daily_logs").upsert(
      {
        user_id: user.id,
        log_date: logDate,
        weight_kg: weightKg,
        physique_photo_path: physiquePhotoPath,
        menu_screenshot_path: menuScreenshotPath,
        ai_feedback: aiFeedback,
      },
      { onConflict: "user_id,log_date" }
    );

    if (upsertError) {
      return NextResponse.json({ error: upsertError.message }, { status: 500 });
    }

    return NextResponse.json({ aiFeedback });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

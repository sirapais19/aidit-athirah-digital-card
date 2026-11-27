type D1PreparedStatement = {
  bind: (...values: unknown[]) => D1PreparedStatement;
  all: () => Promise<{ results?: unknown[] }>;
  run: () => Promise<unknown>;
  first: () => Promise<{ image_key?: string } | null>;
};

type Env = {
  DB: { prepare: (query: string) => D1PreparedStatement };
  PHOTOS: {
    put: (
      key: string,
      value: ArrayBuffer,
      options?: { httpMetadata?: { contentType?: string } },
    ) => Promise<unknown>;
    get: (
      key: string,
    ) => Promise<{
      body: ReadableStream;
      httpMetadata?: { contentType?: string };
      httpEtag: string;
    } | null>;
    delete: (key: string) => Promise<void>;
  };
};

type PhotoRow = {
  id: string;
  guest_name: string | null;
  message: string | null;
  image_key: string;
  created_at: string;
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });

export async function onRequestGet(context: {
  request: Request;
  env: Env;
}): Promise<Response> {
  try {
    const result = await context.env.DB.prepare(
      "SELECT id, guest_name, message, image_key, created_at FROM guest_photos ORDER BY created_at DESC LIMIT 80",
    ).all();

    const apiOrigin = new URL(context.request.url).origin;
    const photos = ((result.results ?? []) as PhotoRow[]).map((photo) => ({
      id: photo.id,
      guest_name: photo.guest_name,
      message: photo.message,
      created_at: photo.created_at,
      image_url: `${apiOrigin}/api/photos/${encodeURIComponent(photo.id)}/image`,
    }));

    return json({ photos });
  } catch (error) {
    console.error("Unable to list guest photos:", error);
    return json({ error: "Could not load the guest gallery." }, 500);
  }
}

export async function onRequestPost(context: {
  request: Request;
  env: Env;
}): Promise<Response> {
  let imageKey = "";

  try {
    const form = await context.request.formData();
    const photo = form.get("photo");
    if (!(photo instanceof File)) {
      return json({ error: "Choose a photo to upload." }, 400);
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(photo.type)) {
      return json({ error: "Upload a JPEG, PNG, or WebP image." }, 415);
    }
    if (photo.size <= 0 || photo.size > 15 * 1024 * 1024) {
      return json({ error: "The photo must be smaller than 15 MB." }, 413);
    }

    const id = crypto.randomUUID();
    imageKey = `aidit-athirah/${id}.jpg`;
    const guestName = String(form.get("guest_name") || "Tetamu").trim().slice(0, 120) || "Tetamu";
    const message = String(form.get("message") || "").trim().slice(0, 500) || null;

    // Read the body fully before writing to R2. Some dev runtimes stall when
    // piping a multipart stream straight into a local R2 binding.
    const bytes = await photo.arrayBuffer();
    if (bytes.byteLength === 0) {
      return json({ error: "The uploaded photo is empty." }, 400);
    }

    await context.env.PHOTOS.put(imageKey, bytes, {
      httpMetadata: { contentType: photo.type },
    });

    await context.env.DB.prepare(
      "INSERT INTO guest_photos (id, guest_name, message, image_key) VALUES (?, ?, ?, ?)",
    )
      .bind(id, guestName, message, imageKey)
      .run();

    return json({ id }, 201);
  } catch (error) {
    if (imageKey) {
      try {
        await context.env.PHOTOS.delete(imageKey);
      } catch (cleanupError) {
        console.error("Unable to clean up failed photo upload:", cleanupError);
      }
    }
    console.error("Unable to upload guest photo:", error);
    return json({ error: "Photo upload failed. Please try again." }, 500);
  }
}

type Env = {
  DB: any;
  PHOTOS: any;
};

export async function onRequestGet(context: {
  env: Env;
  params: { id: string };
}): Promise<Response> {
  try {
    const photo = await context.env.DB.prepare(
      "SELECT image_key FROM guest_photos WHERE id = ? LIMIT 1",
    )
      .bind(context.params.id)
      .first();

    if (!photo?.image_key) return new Response("Photo not found", { status: 404 });

    const object = await context.env.PHOTOS.get(photo.image_key);
    if (!object) return new Response("Photo file not found", { status: 404 });

    return new Response(object.body, {
      headers: {
        "Content-Type": object.httpMetadata?.contentType || "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
        ETag: object.httpEtag,
      },
    });
  } catch (error) {
    console.error("Unable to fetch guest photo:", error);
    return new Response("Could not fetch photo", { status: 500 });
  }
}

export async function onRequest(context) {
  if (context.request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const { content, userId, authorName, authorImage, imageData, fileName } = await context.request.json();
    
    let imageUrl = null;
    
    if (imageData && context.env.BUCKET) {
      const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      const key = `notes/${userId}/${Date.now()}_${fileName}`;
      
      await context.env.BUCKET.put(key, buffer);
      imageUrl = `https://pub-yourbucketid.r2.dev/${key}`;
    }

    const noteData = {
      noteId: `note_${Date.now()}_${userId}`,
      content,
      userId,
      authorName,
      authorImage,
      imageUrl,
      timestamp: Date.now(),
      likes: 0
    };

    const noteKey = `notes/${noteData.noteId}.json`;
    await context.env.BUCKET.put(noteKey, JSON.stringify(noteData));

    return new Response(JSON.stringify({ success: true, note: noteData }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

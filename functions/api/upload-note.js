export async function onRequest(context) {
  if (context.request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const { content, userId, authorName, authorImage, imageData, fileName, contentType } = await context.request.json();

    const noteData = {
      noteId: `note_${Date.now()}_${userId}`,
      content,
      userId,
      authorName,
      authorImage,
      imageUrl: imageData ? 'pending' : null,
      timestamp: Date.now(),
      likes: 0
    };

    // Guardar en Firebase como respaldo temporal
    const firebaseUrl = `https://beaboo-b21c7-default-rtdb.firebaseio.com/communityNotes.json`;
    
    await fetch(firebaseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(noteData)
    });

    return new Response(JSON.stringify({ success: true, note: noteData }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

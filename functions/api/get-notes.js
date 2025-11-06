export async function onRequest(context) {
  try {
    const firebaseUrl = `https://beaboo-b21c7-default-rtdb.firebaseio.com/communityNotes.json`;
    
    const response = await fetch(firebaseUrl);
    const data = await response.json();
    
    const notes = [];
    if (data) {
      Object.keys(data).forEach(key => {
        notes.push({ ...data[key], noteId: key });
      });
    }

    notes.sort((a, b) => b.timestamp - a.timestamp);

    return new Response(JSON.stringify({ notes: notes.slice(0, 50) }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

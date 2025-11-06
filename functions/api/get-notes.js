export async function onRequest(context) {
  try {
    const list = await context.env.BUCKET.list({ prefix: 'notes/' });
    const notes = [];

    for (const item of list.objects.slice(0, 50)) {
      if (item.key.endsWith('.json')) {
        const obj = await context.env.BUCKET.get(item.key);
        const text = await obj.text();
        notes.push(JSON.parse(text));
      }
    }

    notes.sort((a, b) => b.timestamp - a.timestamp);

    return new Response(JSON.stringify({ notes }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function onRequest(context) {
  return new Response(JSON.stringify({ 
    success: true, 
    message: 'API funcionando',
    env: {
      hasRegion: !!context.env.AWS_REGION,
      hasKey: !!context.env.AWS_ACCESS_KEY_ID,
      hasSecret: !!context.env.AWS_SECRET_ACCESS_KEY,
      hasBucket: !!context.env.AWS_S3_BUCKET
    }
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

import { S3Client, PutObjectCommand, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const s3Client = new S3Client({
      region: env.AWS_REGION,
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      },
    });

    try {
      if (path === '/upload-image' && request.method === 'POST') {
        const { imageData, fileName, userId, contentType, imageType } = await request.json();
        const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
        const key = `${imageType}/${userId}/${Date.now()}_${fileName}`;

        await s3Client.send(new PutObjectCommand({
          Bucket: env.AWS_S3_BUCKET,
          Key: key,
          Body: buffer,
          ContentType: contentType,
        }));

        const imageUrl = `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;
        return new Response(JSON.stringify({ imageUrl }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      if (path === '/upload-note' && request.method === 'POST') {
        const { content, userId, authorName, authorImage, imageData, fileName, contentType } = await request.json();
        let imageUrl = null;

        if (imageData) {
          const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
          const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
          const key = `notes/${userId}/${Date.now()}_${fileName}`;

          await s3Client.send(new PutObjectCommand({
            Bucket: env.AWS_S3_BUCKET,
            Key: key,
            Body: buffer,
            ContentType: contentType,
          }));

          imageUrl = `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;
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
        await s3Client.send(new PutObjectCommand({
          Bucket: env.AWS_S3_BUCKET,
          Key: noteKey,
          Body: JSON.stringify(noteData),
          ContentType: 'application/json',
        }));

        return new Response(JSON.stringify({ success: true, note: noteData }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      if (path === '/get-notes') {
        const listCommand = new ListObjectsV2Command({
          Bucket: env.AWS_S3_BUCKET,
          Prefix: 'notes/',
        });

        const listResponse = await s3Client.send(listCommand);
        const notes = [];

        if (listResponse.Contents) {
          for (const item of listResponse.Contents.slice(0, 50)) {
            if (item.Key.endsWith('.json')) {
              const getCommand = new GetObjectCommand({
                Bucket: env.AWS_S3_BUCKET,
                Key: item.Key,
              });
              const response = await s3Client.send(getCommand);
              const body = await response.Body.transformToString();
              notes.push(JSON.parse(body));
            }
          }
        }

        notes.sort((a, b) => b.timestamp - a.timestamp);
        return new Response(JSON.stringify({ notes }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      if (path === '/get-stories') {
        const userId = url.searchParams.get('userId');
        const prefix = userId ? `stories/${userId}/` : 'stories/';
        
        const listCommand = new ListObjectsV2Command({
          Bucket: env.AWS_S3_BUCKET,
          Prefix: prefix,
        });

        const listResponse = await s3Client.send(listCommand);
        const stories = [];

        if (listResponse.Contents) {
          for (const item of listResponse.Contents) {
            if (item.Key.endsWith('.json')) {
              const getCommand = new GetObjectCommand({
                Bucket: env.AWS_S3_BUCKET,
                Key: item.Key,
              });
              const response = await s3Client.send(getCommand);
              const body = await response.Body.transformToString();
              stories.push(JSON.parse(body));
            }
          }
        }

        return new Response(JSON.stringify({ stories }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      return new Response('Not Found', { status: 404, headers: corsHeaders });
    } catch (error) {
      console.error('Error:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};

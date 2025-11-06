import { uploadImage } from './upload-image.js';
import { uploadNote } from './upload-note.js';
import { getStories } from './get-stories.js';
import { getNotes } from './get-notes.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      let response;

      if (path === '/upload-image') {
        response = await uploadImage(request, env);
      } else if (path === '/upload-note') {
        response = await uploadNote(request, env);
      } else if (path === '/get-stories') {
        response = await getStories(request, env);
      } else if (path === '/get-notes') {
        response = await getNotes(request, env);
      } else if (path === '/like-note' || path === '/delete-note' || path === '/manage-following' || path === '/check-user-limits' || path === '/manage-notifications') {
        response = new Response(JSON.stringify({ success: true, message: 'Endpoint en desarrollo' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } else {
        response = new Response('Not Found', { status: 404 });
      }

      // Add CORS headers to response
      Object.keys(corsHeaders).forEach(key => {
        response.headers.set(key, corsHeaders[key]);
      });

      return response;
    } catch (error) {
      console.error('Error:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};

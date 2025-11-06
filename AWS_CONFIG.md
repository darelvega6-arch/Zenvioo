# Configuración de AWS S3 para Zenvioo

## Problema Actual
Las funciones de subida de imágenes están fallando porque las variables de entorno de AWS no están configuradas correctamente en Cloudflare Pages.

## Variables Requeridas en Cloudflare Pages

Debes configurar las siguientes variables de entorno en tu panel de Cloudflare Pages:

```
AWS_ACCESS_KEY_ID=tu_access_key_aqui
AWS_SECRET_ACCESS_KEY=tu_secret_key_aqui
AWS_REGION=us-east-1
AWS_S3_BUCKET=zenvioo-storage
```

## Cómo Configurar en Cloudflare Pages

1. Ve a tu dashboard de Cloudflare Pages
2. Selecciona tu proyecto "Zenvioo"
3. Ve a Settings > Environment Variables
4. Agrega cada variable con su valor correspondiente
5. Guarda los cambios
6. Redeploy tu aplicación

## Funciones que Usan AWS S3

- `/.netlify/functions/upload-image` - Subir imágenes de perfil
- `/.netlify/functions/upload-story` - Subir historias con portadas
- `/.netlify/functions/upload-note` - Subir notas con imágenes
- `/.netlify/functions/get-stories` - Obtener historias desde S3
- `/.netlify/functions/get-notes` - Obtener notas desde S3

## Verificar Configuración

Después de configurar las variables, prueba subiendo una imagen de perfil o creando una historia para verificar que funciona correctamente.

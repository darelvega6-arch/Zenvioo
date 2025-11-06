#!/bin/bash

echo "Desplegando funciones Lambda con AWS SAM..."

# Instalar dependencias
cd amplify/backend/function/uploadNote && npm install && cd ../../../..
cd amplify/backend/function/getNotes && npm install && cd ../../../..

# Desplegar con SAM
sam build
sam deploy --guided

echo "Despliegue completado. Copia la URL de ApiUrl del output."

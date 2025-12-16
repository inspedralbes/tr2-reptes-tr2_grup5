# ETAPA 1: Construcción (Node.js)
FROM node:20-alpine AS build-stage

WORKDIR /app

# Copiamos dependencias primero para optimizar cache
COPY frontend/package*.json ./
RUN npm install

# Copiamos el resto del código
COPY frontend/ ./

# Generamos el build de producción estático (genera .output/public con index.html)
# Nuxt `generate` produces the static output required by Nginx
RUN npm run generate

# ---

# ETAPA 2: Servidor (Nginx)
FROM nginx:alpine

# Limpiamos la carpeta por defecto de Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copiamos los archivos generados por Nuxt 3
# Nota: .output/public es la carpeta estándar de salida para Nuxt 3
COPY --from=build-stage /app/.output/public /usr/share/nginx/html

# REPARACIÓN DE PERMISOS: Esto evita el error 403 Forbidden
RUN chmod -R 755 /usr/share/nginx/html && \
    chown -R nginx:nginx /usr/share/nginx/html

# Copiamos la configuración de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
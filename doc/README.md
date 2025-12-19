# Documentació
Llistat d'alguns dels punts que han de quedar explicats en aquesta carpeta. Poden ser tots en aquest fitxer o en diversos fitxers enllaçats.

És obligatori modificar aquest document!!

## Documentació bàsica MÍNIMA
 * Objectius
 * Arquitectura bàsica
   * Tecnologies utilitzades
   * Interrelació entre els diversos components
 * Com crees l'entorn de desenvolupament
 * Com desplegues l'aplicació a producció
 * Llistat d'endpoints de l'API de backend (també podeu documentar-ho amb swagger)
    * Rutes
   * Exemples de JSON de peticó
   * Exemples de JSON de resposta i els seus codis d'estat 200? 404?
 * Aplicació Android
 * Altres elements importants.
 * ...


# 🚀 TR2-REPTES-TR2_GRUP5 - Development Environment

Este repositorio contiene la configuración necesaria para levantar un entorno completo de desarrollo utilizando **Docker** y **Docker Compose**. La arquitectura separa el cliente (Frontend) del servidor (Backend) para facilitar la escalabilidad y el trabajo en equipo.

---
## Para levantar el Docker

Para levantar este Docker en modo Dev hace falta poner este comando en el terminal:
docker compose -f docker-compose.dev.yml up --build

## 🛠️ Requisitos Previos

Para ejecutar este proyecto sin instalar Node.js o bases de datos localmente, solo necesitas:
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y en ejecución.
* Terminal de comandos (Git Bash, ZSH, PowerShell).

---

## ⚙️ Configuración del Entorno (`.env`)

* Docker utiliza un archivo de variables de entorno para gestionar puertos y secretos de forma segura. Antes de arrancar, crea un archivo llamado `.env` en la raíz del proyecto:


* Para crear el .env se debe copiar y pegar el archivo .env.example y cambiarle el nombre a .env simplemente

```env
# Configuración General
NODE_ENV=development

# Puertos de Acceso
PORT_FRONTEND=3000
PORT_BACKEND=1700
```

## 🚀 Despliegue de Producción - TR2 Grup 5

He configurado este entorno de producción utilizando **Docker** y **Nginx** para asegurar que nuestra aplicación sea rápida, segura y fácil de desplegar en cualquier servidor.

---

## 🏗️ Mi Arquitectura de Red

Para este proyecto, he diseñado una estructura de servicios aislados que se comunican a través de una red interna (`prod-network`):

* **Nginx (Puerto 80):** Actúa como mi puerta de entrada principal. Se encarga de servir los archivos estáticos de la aplicación (Frontend) y redirigir el tráfico.
* **Backend:** Mi API de Node.js corriendo en modo producción.
* **Frontend:** Una compilación optimizada de Nuxt que Nginx sirve directamente como HTML/JS estático.



---

## 🛠️ Cómo levantar el entorno

Si quieres desplegar la versión final de la plataforma, sigue estos pasos:

### 1. Variables de Entorno
Asegúrate de que mi archivo `.env` tenga los valores correctos para producción:
```env
NODE_ENV=production
PORT_NGINX=80
```
### 2. Comando
 Para levantar este entorno de producción, se debe usar el comando:
 docker compose -f docker-compose.prod.yml up --build -d

# Guía para levantar el entorno de desarrollo con Docker (para principiantes)

Esta guía explica, paso a paso y con lenguaje sencillo, cómo levantar el entorno de desarrollo del proyecto usando Docker. Está escrita para alguien sin experiencia técnica.

Índice
- Requisitos previos
- Preparar el proyecto (una sola vez)
- Qué hacen los scripts añadidos
- Pasos para levantar el entorno (comandos exactos)
- Comprobaciones básicas para verificar que todo funciona
- Problemas comunes y cómo resolverlos
- Comandos útiles y resumen

---

## 1) Requisitos previos

Antes de empezar necesitas instalar Docker. Docker es una herramienta que permite ejecutar aplicaciones en «contenedores» aislados.

- Windows / macOS: instala Docker Desktop desde https://www.docker.com/get-started
- Linux: instala Docker Engine desde la documentación oficial (puede necesitar `sudo`).

Además, necesitarás una terminal de comandos (Terminal en macOS/Linux, PowerShell o Git Bash en Windows).

---

## 2) Preparar el proyecto (una sola vez)

1. Abre la terminal y sitúate en la carpeta del proyecto.

```bash
cd /ruta/a/tr2-reptes-tr2_grup5
```

2. Crea el archivo `.env` si no existe. Si hay un `.env.example`, copia ese archivo:

```bash
cp .env.example .env  # si existe .env.example
```

3. Si no existe, crea `.env` con al menos estas variables (puedes usar un editor de texto):

```env
NODE_ENV=development
PORT_FRONTEND=3000
PORT_BACKEND=1700
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=enginy_db
DB_ROOT_PASSWORD=tu_root_password
```

Explicación rápida:
- PORT_FRONTEND / PORT_BACKEND: puertos a los que accederás desde tu navegador.
- DB_*: credenciales de la base de datos MySQL que usarán los contenedores.

---

## 3) Scripts añadidos al proyecto (qué hacen)

En la carpeta `scripts/` hay dos scripts útiles:

- `scripts/clean_db.sh` - Borra y recrea la carpeta `./backend/mysql_data`. Esta carpeta contiene los datos de MySQL cuando se usa amb Docker. Usar este script deixa la base de dades buida (com nova).

- `scripts/dev_up.sh` - Executa `scripts/clean_db.sh` i després executa `docker compose -f docker-compose.dev.yml up --build`. És el mètode recomanat per aixecar l'entorn "net".

També hi ha un script a `package.json`:

- `npm run dev:docker` - Executa `sh ./scripts/dev_up.sh`.

IMPORTANT: `clean_db.sh` elimina dades. No utilitzar si tens informació que vulguis conservar.

---

## 4) Pasos para levantar el entorno (comandos exactos)

Tienes dos opciones:

Opción A — Levantar sin borrar la base de datos (rápido):

```bash
docker compose -f docker-compose.dev.yml up --build
```

Opción B — Levantar borrando la base de datos (recomendado si quieres empezar desde cero):

```bash
./scripts/dev_up.sh
# o
npm run dev:docker
```

Qué hacen los comandos:
- `docker compose -f docker-compose.dev.yml up --build` construye las imágenes (si es necesario) y arranca los contenedores (frontend, backend, base de datos y adminer).
- `./scripts/dev_up.sh` primero borra los datos de MySQL (la carpeta `./backend/mysql_data`) y luego arranca los contenedores.

Tiempo estimado: el primer arranque puede tardar varios minutos (descarga de imágenes, instalación de dependencias). Después será más rápido.

---

## 5) Explicación de los archivos más importantes

- `docker-compose.dev.yml`: define los servicios que se ejecutan en desarrollo:
  - `frontend`: la aplicación Nuxt (interfaz de usuario)
  - `backend`: el servidor Node.js (API)
  - `database`: un contenedor MySQL
  - `adminer`: herramienta web para gestionar la base de datos (opcional)

  En desarrollo, la base de datos usa un enlace "bind-mount" `./backend/mysql_data:/var/lib/mysql` — es decir, los datos se guardan en la carpeta `backend/mysql_data` de tu ordenador.

- `scripts/clean_db.sh`: borra y recrea `./backend/mysql_data`.
- `scripts/dev_up.sh`: ejecuta la limpieza y luego `docker compose up --build`.
- `package.json` (raíz): contiene un script `dev:docker` que ejecuta el wrapper.

---

## 6) Comprobaciones básicas (cómo saber si todo funciona)

1. Ver qué contenedores están en ejecución:

```bash
docker ps
```

Deberías ver contenedores con nombres como `frontend`, `backend`, `dev-database`, `dev-adminer`.

2. Ver logs del backend (para ver errores en tiempo real):

```bash
docker compose -f docker-compose.dev.yml logs -f backend
```

3. Abrir el frontend en el navegador: `http://localhost:3000` (o el puerto que pusiste en `PORT_FRONTEND`).

4. Abrir Adminer para acceder a la base de datos: `http://localhost:8080`.

5. Parar el entorno (en otra terminal):

```bash
docker compose -f docker-compose.dev.yml down
```

---

## 7) Problemas comunes y cómo solucionarlos

- Docker no está corriendo o no tienes permisos:
  - Comprueba que Docker Desktop esté abierto (Windows/macOS) o que el servicio Docker esté activo en Linux.
  - En Linux puede hacer falta usar `sudo` o añadir tu usuario al grupo `docker`.

- Puerto en uso:
  - Si algún puerto (por ejemplo 3000 o 1700) está ocupado, cambia el valor en `.env` o cierra la aplicación que lo use.

- Errores de la base de datos:
  - Si MySQL no arranca o muestra corrupción, ejecuta `./scripts/clean_db.sh` y vuelve a levantar con `./scripts/dev_up.sh`.

- Ficheros de dependencias faltan en frontend/backend: el primer `docker compose up --build` instalará dependencias. Revisa los logs para ver qué falla y comparte el error si necesitas ayuda.

---

## 8) Comandos útiles (resumen rápido)

```bash
# Levantar dev (limpiando la BD)
./scripts/dev_up.sh

# Alternativa usando npm
npm run dev:docker

# Levantar sin limpiar
docker compose -f docker-compose.dev.yml up --build

# Parar
docker compose -f docker-compose.dev.yml down

# Ver contenedores
docker ps

# Ver logs del backend
docker compose -f docker-compose.dev.yml logs -f backend
```

---

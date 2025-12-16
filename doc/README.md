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

```env
# Configuración General
NODE_ENV=development

# Puertos de Acceso
PORT_FRONTEND=3000
PORT_BACKEND=1700

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
# transversals
Esquema mínim de carpetes pels projectes transversals

És obligatori seguir aquesta estructura tot i que la podeu ampliar.

## Atenció
Un cop comenceu heu de canviar aquesta explicació amb la corresponent al vostre projecte (utilitzant markdown)

# Aquest fitxer ha de contenir com a mínim:
 * Nom dels integrants
 * Nom del projecte
 * Petita descripció
 * Adreça del gestor de tasques (taiga, jira, trello...)
 * Adreça del prototip gràfic del projecte (Penpot, figma, moqups...)
 * URL de producció (quan la tingueu)
 * Estat: (explicació d'en quin punt està)



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

Docker utiliza un archivo de variables de entorno para gestionar puertos y secretos de forma segura. Antes de arrancar, crea un archivo llamado `.env` en la raíz del proyecto:

```env
# Configuración General
NODE_ENV=development

# Puertos de Acceso
PORT_FRONTEND=3000
PORT_BACKEND=1700



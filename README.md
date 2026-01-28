# 🎓 Enginy - Plataforma de Gestió de Tallers Educatius

> Una aplicació web completa per a la gestió intel·ligent de tallers, centres educatius i professorat. Desenvolupada amb tecnologies modernes i arquitectura de microserveis.

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)

---

## 📋 Descripció

**Enginy** és una plataforma que facilita la gestió de tallers educatius, permetent als centres escolars i professors organitzar, sol·licitar i assignar tallers de manera eficient. El sistema inclou funcionalitats d'autenticació, gestió de rols (Admin, Centre, Professor), calendari de tallers i un sistema complet de peticions.

### ✨ Característiques Principals

- 🔐 **Autenticació segura** amb JWT i bcrypt
- 👥 **Gestió de rols** (Admin, Centre, Professor)
- 📅 **Calendari de tallers** amb visualització interactiva
- 📝 **Sistema de peticions** i assignacions
- 🎨 **Interfície moderna** amb Nuxt 3 i TailwindCSS
- 🐳 **Desplegament fàcil** amb Docker Compose
- 🔄 **Hot-reload** en desenvolupament

---

## 🛠️ Stack Tecnològic

### Frontend
- **Framework:** Nuxt 3 (Vue 3)
- **Estils:** TailwindCSS
- **State Management:** Pinia
- **Icons:** Lucide Vue Next
- **Alerts:** SweetAlert2
- **Routing:** Vue Router

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Autenticació:** JWT + bcryptjs
- **Base de Dades:** MySQL 8.0
- **ORM:** MySQL2 (queries directes)

### DevOps
- **Containerització:** Docker & Docker Compose
- **Reverse Proxy:** Nginx (producció)
- **DB Admin:** Adminer
- **Environment:** dotenv

---

## 📁 Estructura de Documents

```
tr2-reptes-tr2_grup5/
├── 📂 backend/
│   ├── 📂 docker/
│   │   ├── Dockerfile
│   │   └── Dockerfile.mysql
│   ├── 📂 src/
│   │   ├── 📂 config/
│   │   │   └── db.js
│   │   ├── 📂 controllers/
│   │   │   ├── 📂 admin/
│   │   │   ├── 📂 centres/
│   │   │   └── authController.js
│   │   ├── 📂 middleware/
│   │   │   ├── auth.js
│   │   │   └── rbac.js
│   │   ├── 📂 models/
│   │   │   ├── AssignacioTaller.js
│   │   │   ├── Centre.js
│   │   │   ├── Peticio.js
│   │   │   ├── Professor.js
│   │   │   └── Taller.js
│   │   ├── 📂 routes/
│   │   │   ├── adminRoutes.js
│   │   │   ├── authRoutes.js
│   │   │   └── centreRoutes.js
│   │   ├── 📂 services/
│   │   └── index.js
│   ├── package.json
│   └── sync_db.js
│
├── 📂 frontend/
│   ├── 📂 src/
│   │   ├── 📂 assets/
│   │   ├── 📂 components/
│   │   │   ├── AdminNav.vue
│   │   │   ├── CentreNav.vue
│   │   │   └── ...
│   │   ├── 📂 composables/
│   │   ├── 📂 layouts/
│   │   ├── 📂 middleware/
│   │   ├── 📂 pages/
│   │   │   ├── 📂 admin/
│   │   │   │   ├── index.vue
│   │   │   │   ├── tallers.vue
│   │   │   │   └── usuaris.vue
│   │   │   ├── 📂 centres/
│   │   │   │   ├── index.vue
│   │   │   │   ├── peticions.vue
│   │   │   │   └── professorat.vue
│   │   │   ├── index.vue
│   │   │   └── login.vue
│   │   ├── 📂 stores/
│   │   │   └── auth.js
│   │   └── app.vue
│   ├── Dockerfile
│   ├── nuxt.config.ts
│   ├── package.json
│   └── tsconfig.json
│
├── 📂 database/
│   ├── init.sql
│   └── inserts.sql
│
├── 📂 docker/
│   ├── docker-compose.dev.yml
│   └── docker-compose.prod.yml
│
├── 📂 doc/
│
├── .env.example
├── .gitignore
├── LICENSE
├── package.json
└── README.md
```

---

## 📋 Requisits Previs

Abans de començar, assegura't de tenir instal·lat:

- **Docker Desktop** (v20.10+) - [Descarregar](https://www.docker.com/products/docker-desktop)
- **Docker Compose** (v2.0+) - Inclòs amb Docker Desktop
- **Node.js** (v18+) - Opcional, només si vols executar sense Docker
- **Git** - Per clonar el repositori

---

## 🚀 Com Aixecar el Projecte

### 1️⃣ Clonar el Repositori

```bash
git clone https://github.com/inspedralbes/tr2-reptes-tr2_grup5.git
cd tr2-reptes-tr2_grup5
```

### 2️⃣ Configurar Variables d'Entorn

Crea el fitxer `.env` a partir de l'exemple:

```bash
cp .env.example .env
```

Edita el fitxer `.env` amb els teus valors (opcional, els valors per defecte funcionen):

```env
# Base de Dades
DB_PORT=3306
DB_ROOT_PASSWORD=tr2grup5
DB_USER=tr2user
DB_PASSWORD=tr2password
DB_NAME=enginy_db

# Ports
PORT_FRONTEND=3000
PORT_BACKEND=1700
PORT_BACKEND_EXTERNAL=1701

# Seguretat
JWT_SECRET=supersecretkey123

# Entorn
VITE_NODE_ENV=development
NODE_ENV=production
```

### 3️⃣ Aixecar l'Entorn de Desenvolupament

Executa el següent comandament per iniciar tots els serveis:

```bash
npm run docker:dev
```

Aquest comandament farà:
- ✅ Construir les imatges Docker
- ✅ Inicialitzar la base de dades MySQL
- ✅ Executar els scripts SQL (`init.sql` i `inserts.sql`)
- ✅ Aixecar el backend amb hot-reload
- ✅ Aixecar el frontend amb hot-reload
- ✅ Iniciar Adminer per gestionar la BD

**Temps estimat:** 2-3 minuts la primera vegada (descarrega d'imatges i build)

### 4️⃣ Accedir a l'Aplicació

Un cop els contenidors estiguin en marxa, pots accedir a:

| Servei | URL | Descripció |
|--------|-----|------------|
| 🌐 **Frontend** | [http://localhost:3000](http://localhost:3000) | Aplicació web principal |
| 🔌 **Backend API** | [http://localhost:1701](http://localhost:1701) | API REST |
| 🗄️ **Adminer** | [http://localhost:8080](http://localhost:8080) | Gestor de base de dades |

#### Credencials d'Adminer:
- **Sistema:** MySQL
- **Servidor:** `database` (o `dev-database`)
- **Usuari:** `tr2user` (o `root`)
- **Contrasenya:** `tr2password` (o `tr2grup5` per root)
- **Base de dades:** `enginy_db`

---

## 💻 Ús de l'Aplicació

### Credencials de Prova

El sistema inclou dades de prova a `database/inserts.sql`:

#### 👨‍💼 Admin
```
Email: admin@enginy.cat
Password: admin123
```

#### 🏫 Centre
```
Email: centre1@escola.cat
Password: centre123
```

#### 👨‍🏫 Professor
```
Email: professor1@escola.cat
Password: prof123
```

### Flux d'Ús

1. **Login:** Accedeix amb un dels usuaris de prova
2. **Dashboard:** Veuràs el panell segons el teu rol
3. **Admin:** Pot crear tallers, gestionar usuaris i veure el calendari
4. **Centre:** Pot sol·licitar tallers i gestionar el seu professorat
5. **Professor:** Pot veure els tallers assignats

---

## 🔌 API Reference

### Autenticació

#### POST `/api/auth/login`
Autenticació d'usuaris

**Request Body:**
```json
{
  "email": "admin@enginy.cat",
  "password": "admin123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "nom": "Admin",
    "email": "admin@enginy.cat",
    "rol": "admin"
  }
}
```

---

### Tallers (Admin)

#### GET `/api/admin/tallers`
Obtenir tots els tallers

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": 1,
    "nom": "Robòtica Educativa",
    "descripcio": "Introducció a la robòtica",
    "data_execucio": "2026-02-15",
    "estat": "actiu"
  }
]
```

#### POST `/api/admin/tallers`
Crear un nou taller

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "nom": "Taller de Programació",
  "descripcio": "Aprèn a programar amb Python",
  "data_execucio": "2026-03-20"
}
```

---

### Peticions (Centre)

#### GET `/api/centres/peticions`
Obtenir peticions del centre

**Headers:**
```
Authorization: Bearer <token>
```

#### POST `/api/centres/peticions`
Crear una nova petició de taller

**Request Body:**
```json
{
  "taller_id": 1,
  "data_preferent": "2026-02-20",
  "observacions": "Preferiblement al matí"
}
```

---

## 🐳 Scripts Disponibles

Al fitxer `package.json` de l'arrel trobaràs:

```bash
# Desenvolupament local (només frontend, requereix backend actiu)
npm run dev

# Aixecar entorn de desenvolupament amb Docker (recomanat)
npm run docker:dev

# Aixecar entorn de producció amb Docker
npm run docker:prod
```

### Comandaments Docker Útils

```bash
# Aturar tots els contenidors
docker compose -f docker/docker-compose.dev.yml down

# Veure logs
docker compose -f docker/docker-compose.dev.yml logs -f

# Reconstruir imatges
docker compose -f docker/docker-compose.dev.yml up --build

# Netejar volums (ATENCIÓ: elimina dades de la BD)
docker compose -f docker/docker-compose.dev.yml down -v
```

---

## 🧪 Testing i Desenvolupament

### Hot Reload

Tant el frontend com el backend tenen hot-reload activat en mode desenvolupament:

- **Frontend:** Qualsevol canvi a `frontend/src/` es reflectirà automàticament
- **Backend:** Qualsevol canvi a `backend/src/` reiniciarà el servidor

### Estructura de la Base de Dades

La BD s'inicialitza automàticament amb:
- `database/init.sql`: Esquema de taules
- `database/inserts.sql`: Dades de prova

Per reinicialitzar la BD:
```bash
docker compose -f docker/docker-compose.dev.yml down -v
npm run docker:dev
```

---

## 📦 Desplegament a Producció

### Amb Docker (Recomanat)

```bash
# 1. Configurar .env per producció
cp .env.example .env
# Edita .env amb valors segurs (JWT_SECRET, contrasenyes, etc.)

# 2. Aixecar en mode producció
npm run docker:prod
```

L'entorn de producció inclou:
- ✅ Nginx com a reverse proxy
- ✅ Optimitzacions de build
- ✅ Contenidors en segon pla (`-d`)
- ✅ Restart automàtic

### Variables d'Entorn Importants per Producció

```env
NODE_ENV=production
JWT_SECRET=<genera-un-secret-segur-aqui>
DB_ROOT_PASSWORD=<contrasenya-segura>
DB_PASSWORD=<contrasenya-segura>
```

---

## 🤝 Autors

Aquest projecte ha estat desenvolupat per:

- Llorenç Carnicer 
- Biel Domínguez
- Iker Mata
- Iker López

## 📄 Llicència

Aquest projecte està sota la llicència **ISC**. Consulta el fitxer [LICENSE](LICENSE) per més detalls.

---

## 🐛 Resolució de Problemes

### El frontend no es connecta al backend
- Verifica que el backend estigui corrent: `docker ps`
- Comprova els logs: `docker logs <container-id>`
- Assegura't que els ports no estiguin ocupats

### Error "Access denied: No token provided"
- Fes login de nou per obtenir un token vàlid
- Verifica que el token s'estigui guardant a `localStorage`

### La base de dades no s'inicialitza
- Elimina els volums i torna a crear: `docker compose down -v && npm run docker:dev`
- Comprova que els fitxers SQL no tinguin errors de sintaxi

---

## 📞 Suport

Si tens problemes o preguntes:

1. Revisa la secció de [Resolució de Problemes](#-resolució-de-problemes)
2. Consulta els [Issues](https://github.com/inspedralbes/tr2-reptes-tr2_grup5/issues) del repositori
3. Crea un nou Issue si el problema persisteix

---

<div align="center">

**Fet amb ❤️ a l'Institut Pedralbes**

[⬆️ Tornar a dalt](#-enginy---plataforma-de-gestió-de-tallers-educatius)

</div>

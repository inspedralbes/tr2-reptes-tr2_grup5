<template>
  <div class="page">
    <h2 class="page-title">Usuaris/Centres</h2>

    <div class="header-row">
      <div class="tabs">
        <button
          :class="['tab', { active: mostrarCentres } ]"
          @click="() => (mostrarCentres = true)">
          Centres Educatius
        </button>
        <button
          :class="['tab', { active: !mostrarCentres } ]"
          @click="() => (mostrarCentres = false)">
          Usuaris del Sistema
        </button>
      </div>

      <div class="search-area">
        <input v-model="searchTerm" class="search" placeholder="Cercar centre..." />
      </div>
    </div>

    <div class="content">
      <div v-if="mostrarCentres" class="cards-grid">
        <div v-for="centre in filteredCentres" :key="centre.codi_centre" class="card">
          <div class="card-top">
            <div class="codi">{{ centre.codi_centre }}</div>
            <div class="status"> <!-- placeholder for status badge -->
              <span class="badge small">Amb peticions</span>
            </div>
          </div>
          <h4 class="card-title">{{ centre.nom_centre }}</h4>
          <div class="card-body">
            <div class="meta"><strong>{{ centre.contact_name ?? '—' }}</strong></div>
            <div class="meta">{{ centre.email_oficial ?? '—' }}</div>
            <div class="meta">{{ centre.municipi ?? '—' }}</div>
          </div>
        </div>
        <div v-if="filteredCentres.length === 0" class="empty">No s'han trobat centres</div>
      </div>

      <div v-else class="cards-grid users-grid">
        <div v-for="(user, idx) in filteredUsuarios" :key="user?.id ?? user?.email ?? idx" class="card user-card">
          <div class="card-top">
            <div class="codi">{{ user?.id ?? '' }}</div>
            <div class="status">
              <span class="badge small">{{ user?.nom_centre ?? 'Sense centre' }}</span>
            </div>
          </div>
          <h4 class="card-title">{{ user?.email ?? '—' }}</h4>
          <div class="card-body">
            <div class="meta">Rol: <strong>{{ user?.rol ?? '—' }}</strong></div>
            <div class="meta">Últim accés: {{ user?.ultim_acces || 'Mai' }}</div>
          </div>
        </div>
        <div v-if="filteredUsuarios.length === 0" class="empty">No s'han trobat usuaris</div>
      </div>
    </div>
  </div>
</template>

<script setup>
const header = useHeaderStore()
header.setHeaderAdmin()

const mostrarCentres = ref(true)

// backend base (dev)
const backendBase = ''

// obtener token via cookie
const tokenCookie = useCookie('authToken')
const token = tokenCookie.value

// fetch centres from backend and map to the minimal fields we need
const { data: centres, pending, error, refresh } = await useFetch(`${backendBase}/api/admin/centres`, {
  server: false,
  headers: token ? { Authorization: `Bearer ${token}` } : {}
})
const centresList = computed(() => {
  const arr = centres?.value ?? []
  const result = []
  for (let i = 0; i < arr.length; i++) {
    const c = arr[i]
    result.push({
      codi_centre: (c.codi_centre ?? c.codi) || c.code || null,
      nom_centre: (c.nom_centre ?? c.nom) || c.name || null,
      municipi: (c.municipi ?? c.municipi) || c.city || null,
      email_oficial: (c.email_oficial ?? c.email) || null
    })
  }
  return result
})

// usuarios: fetch and computed list (mirrors centresList pattern)
const { data: users, pending: pendingUsers, error: errorUsers } = await useFetch(`${backendBase}/api/admin/usuaris`, {
  server: false,
  headers: token ? { Authorization: `Bearer ${token}` } : {}
})

const usuariosList = computed(() => {
  const arr = users?.value ?? []
  const result = []
  for (let i = 0; i < arr.length; i++) {
    const u = arr[i]
    // ensure object shape and provide fallbacks
    if (!u || typeof u !== 'object') continue
    result.push({
      id: u.id ?? u.user_id ?? i,
      email: u.email ?? u.mail ?? u.username ?? '—',
      rol: u.rol ?? u.role ?? '—',
      ultim_acces: u.ultim_acces ?? u.last_access ?? null,
      nom_centre: u.nom_centre ?? null
    })
  }
  return result
})

const router = useRouter()
const goBack = () => router.back()

// search state
const searchTerm = ref('')

const filteredCentres = computed(() => {
  const list = centresList.value || []
  const q = (searchTerm.value || '').toLowerCase().trim()
  const out = []
  for (let i = 0; i < list.length; i++) {
    const c = list[i]
    if (!c) continue
    if (q) {
      const hay = ((c.nom_centre || '') + ' ' + (c.codi_centre || '')).toLowerCase()
      if (!hay.includes(q)) continue
    }
    out.push(c)
  }
  return out
})

const filteredUsuarios = computed(() => {
  const list = usuariosList.value || []
  const q = (searchTerm.value || '').toLowerCase().trim()
  const out = []
  for (let i = 0; i < list.length; i++) {
    const u = list[i]
    if (!u) continue
    if (q) {
      const hay = ((u.email || '') + ' ' + (u.nom_centre || '')).toLowerCase()
      if (!hay.includes(q)) continue
    }
    out.push(u)
  }
  return out
})

const toggleTable = () => {
  mostrarCentres.value = !mostrarCentres.value
}
</script>

<style scoped>
.page {
  padding: 20px 24px;
}

.page-title {
  margin: 0 0 18px 0;
  font-size: 22px;
  color: #203a63;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}

.tabs {
  display: flex;
  gap: 8px;
}

.tab {
  padding: 10px 16px;
  border-radius: 6px;
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
  color: #3b5ca8;
  font-weight: 600;
}

.tab.active {
  background: #ffffff;
  border-color: #d8e6ff;
  box-shadow: 0 2px 0 rgba(59,92,168,0.12) inset;
}

.search-area {
  display: flex;
  gap: 10px;
  align-items: center;
}

.search {
  padding: 10px 12px;
  border-radius: 6px;
  border: 1px solid #e6eef9;
  min-width: 320px;
}

.card {
  background: white;
  border-radius: 8px;
  padding: 14px;
  border: 1px solid #edf5ff;
  box-shadow: 0 2px 8px rgba(20,40,80,0.03);
  position: relative;
}

.card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 6px;
  border-top-left-radius: 8px;
  border-bottom-left-radius: 8px;
  background: linear-gradient(180deg, #2b63b6, #4a8fe6);
}

.content {
  margin-top: 8px;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 18px;
}

.card {
  background: white;
  border-radius: 8px;
  padding: 14px;
  border: 1px solid #edf5ff;
  box-shadow: 0 2px 8px rgba(20,40,80,0.03);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.codi {
  font-size: 11px;
  color: #7e8aa6;
}

.card-title {
  margin: 8px 0 6px 12px; /* spacing because of left stripe */
  font-size: 18px;
  color: #1e4f9a;
}

.card-body .meta {
  font-size: 13px;
  color: #55617a;
  margin-bottom: 6px;
}

.empty {
  color: #7b869a;
  padding: 24px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 12px 10px;
  text-align: left;
  border-bottom: 1px solid #f1f4f8;
}

th {
  color: #6d7a97;
  font-weight: 700;
  font-size: 13px;
}

.badge {
  background: #eef7ff;
  color: #2b63b6;
  padding: 4px 8px;
  border-radius: 16px;
  font-size: 12px;
}

.users-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 18px;
}

.user-card {
  min-height: 120px;
}

.badge.small {
  padding: 4px 8px;
  font-size: 11px;
}
</style>
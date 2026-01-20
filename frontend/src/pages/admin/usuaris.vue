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
        <div 
          v-for="centre in filteredCentres" 
          :key="centre.id" 
          class="card"
          :class="{ 'is-expanded': expandedId === centre.id }"
          @click="toggleExpand(centre.id)"
        >
          <div class="card-top">
            <div class="codi">{{ centre.codi_centre || 'SENSE CODI' }}</div>
            <div class="status">
              <span v-if="centre.tallers && centre.tallers.length > 0" class="badge small">
                {{ centre.tallers.length }} tallers
              </span>
              <span v-else class="badge small neutral">Sense tallers</span>
            </div>
          </div>
          <h4 class="card-title">{{ centre.nom_centre }}</h4>
          <div class="card-body">
            <div class="meta"><strong>{{ centre.municipi ?? '—' }}</strong></div>
            <div class="meta">{{ centre.email_oficial ?? '—' }}</div>
          </div>

          <div v-if="expandedId === centre.id" class="card-details" @click.stop>
            <div class="details-divider"></div>
            <p class="details-title">Tallers Assignats:</p>
            <ul v-if="centre.tallers && centre.tallers.length > 0" class="details-list">
              <li v-for="taller in centre.tallers" :key="taller.id">
                <span class="dot"></span> 
                <span class="taller-text">{{ taller.titol }}</span>
              </li>
            </ul>
            <p v-else class="no-tallers">No hi ha tallers assignats.</p>
          </div>
        </div>
        <div v-if="filteredCentres.length === 0" class="empty">No s'han trobat centres</div>
      </div>

      <div v-else class="cards-grid users-grid">
        <div v-for="(user, idx) in filteredUsuarios" :key="user.id || idx" class="card user-card">
          <div class="card-top">
            <div class="codi">ID: {{ user.id }}</div>
            <div class="status">
              <span class="badge small">{{ user.rol }}</span>
            </div>
          </div>
          <h4 class="card-title">{{ user.email }}</h4>
          <div class="card-body">
            <div class="meta">Centre: <strong>{{ user.nom_centre || '—' }}</strong></div>
            <div class="meta">Últim accés: {{ user.ultim_acces || 'Mai' }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const header = useHeaderStore()
header.setHeaderAdmin()

const mostrarCentres = ref(true)
const searchTerm = ref('')
const expandedId = ref(null) 

// Usamos el ID único de la base de datos para que solo se abra UNA tarjeta
const toggleExpand = (id) => {
  expandedId.value = expandedId.value === id ? null : id
}

const backendBase = 'http://localhost:1700'
const token = useCookie('authToken').value

// Fetch Centres
const { data: centres } = await useFetch(`${backendBase}/api/admin/centres`, {
  headers: token ? { Authorization: `Bearer ${token}` } : {}
})

const centresList = computed(() => {
  return (centres.value || []).map(c => ({
    id: c.id, // ID Único fundamental
    codi_centre: c.codi_centre,
    nom_centre: c.nom_centre,
    municipi: c.municipi,
    email_oficial: c.email_oficial,
    tallers: c.tallers || [] 
  }))
})

// Fetch Usuaris
const { data: users } = await useFetch(`${backendBase}/api/admin/usuaris`, {
  headers: token ? { Authorization: `Bearer ${token}` } : {}
})

const usuariosList = computed(() => {
  return (users.value || []).map(u => ({
    id: u.id,
    email: u.email,
    rol: u.rol,
    nom_centre: u.nom_centre,
    ultim_acces: u.ultim_acces
  }))
})

const filteredCentres = computed(() => {
  const q = searchTerm.value.toLowerCase().trim()
  return centresList.value.filter(c => 
    c.nom_centre.toLowerCase().includes(q) || 
    (c.codi_centre && c.codi_centre.toLowerCase().includes(q))
  )
})

const filteredUsuarios = computed(() => {
  const q = searchTerm.value.toLowerCase().trim()
  return usuariosList.value.filter(u => u.email.toLowerCase().includes(q))
})
</script>

<style scoped>
.page { padding: 20px 24px; }
.page-title { margin: 0 0 18px 0; font-size: 22px; color: #203a63; }
.header-row { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 18px; }
.tabs { display: flex; gap: 8px; }
.tab { padding: 10px 16px; border-radius: 6px; border: 1px solid transparent; background: transparent; cursor: pointer; color: #3b5ca8; font-weight: 600; }
.tab.active { background: #ffffff; border-color: #d8e6ff; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
.search { padding: 10px 12px; border-radius: 6px; border: 1px solid #e6eef9; min-width: 320px; }

.cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 18px; }

.card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #edf5ff;
  box-shadow: 0 2px 8px rgba(20,40,80,0.03);
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
  height: fit-content; /* Permite que la tarjeta crezca al expandirse */
}

.card::before {
  content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 6px; border-top-left-radius: 8px; border-bottom-left-radius: 8px; 
  background: linear-gradient(180deg, #2b63b6, #4a8fe6);
}

.card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.codi { font-size: 11px; color: #7e8aa6; font-weight: bold; }
.card-title { margin: 0 0 10px 0; font-size: 17px; color: #1e4f9a; font-weight: 700; }
.card-body .meta { font-size: 13px; color: #55617a; margin-bottom: 4px; }

.badge { background: #eef7ff; color: #2b63b6; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 700; }
.badge.neutral { background: #f5f5f5; color: #999; }

/* ESTILOS DESPLEGABLE */
.is-expanded { border-color: #2b63b6; background: #fafcfe; }

.card-details { margin-top: 15px; padding-top: 12px; width: 100%; }
.details-divider { height: 1px; background: #e2e8f0; margin-bottom: 12px; }
.details-title { font-size: 11px; font-weight: 800; text-transform: uppercase; color: #64748b; margin-bottom: 10px; }

.details-list { list-style: none; padding: 0; margin: 0; }
.details-list li {
  font-size: 13px; color: #1e293b; padding: 6px 0; display: flex; align-items: center; border-bottom: 1px solid #f1f5f9;
}
.details-list li:last-child { border-bottom: none; }

.dot { width: 6px; height: 6px; background: #2b63b6; border-radius: 50%; margin-right: 10px; flex-shrink: 0; }
.taller-text { font-weight: 500; }

.no-tallers { font-size: 12px; color: #94a3b8; font-style: italic; margin-top: 5px; }
.empty { grid-column: 1/-1; text-align: center; padding: 40px; color: #64748b; }
</style>
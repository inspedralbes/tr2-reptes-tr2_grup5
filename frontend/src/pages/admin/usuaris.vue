<template>
  <div class="page" :class="{ 'page-exit': isExiting }">
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
          @click="handleNavigation(centre.id)"
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
          <div class="card-hint">Veure detalls →</div>
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
const isExiting = ref(false) // Estado para la transición de salida

const token = useCookie('authToken').value

// EVENT LISTENER DE NAVEGACIÓN
const handleNavigation = async (id) => {
  // Efecto visual antes de cambiar
  isExiting.value = true
  
  // Pequeña espera para feedback visual
  await new Promise(resolve => setTimeout(resolve, 100))
  
  // Navegación programática a la página de detalle
  navigateTo(`/admin/itemDetail/${id}`)
}

// Fetch Centres
const { data: centres } = await useFetch('/api/admin/centres', {
  headers: token ? { Authorization: `Bearer ${token}` } : {}
})

const centresList = computed(() => {
  return (centres.value || []).map(c => ({
    id: c.id,
    codi_centre: c.codi_centre,
    nom_centre: c.nom_centre,
    municipi: c.municipi,
    email_oficial: c.email_oficial,
    tallers: c.tallers || [] 
  }))
})

// Fetch Usuaris
const { data: users } = await useFetch('/api/admin/usuaris', {
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
/* Transición de salida de la página */
.page { 
  padding: 20px 24px; 
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.page-exit { 
  opacity: 0.6; 
  transform: scale(0.995); 
}

.page-title { margin: 0 0 18px 0; font-size: 22px; color: #203a63; }
.header-row { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 18px; }
.tabs { display: flex; gap: 8px; }
.tab { padding: 10px 16px; border-radius: 6px; border: 1px solid transparent; background: transparent; cursor: pointer; color: #3b5ca8; font-weight: 600; }
.tab.active { background: #ffffff; border-color: #d8e6ff; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }

/* MANTENGO TU BUSCADOR EXACTAMENTE IGUAL */
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
  height: fit-content;
}

.card:hover {
  transform: translateY(-4px);
  border-color: #2b63b6;
  box-shadow: 0 8px 16px rgba(43, 99, 182, 0.1);
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

.card-hint { 
  margin-top: 12px; font-size: 11px; color: #2b63b6; font-weight: 700; 
  text-align: right; opacity: 0; transition: opacity 0.2s;
}
.card:hover .card-hint { opacity: 1; }

.empty { grid-column: 1/-1; text-align: center; padding: 40px; color: #64748b; }
</style>
<template>
  <div class="page" :class="classePageExit">
    <h2 class="page-title">Usuaris/Centres</h2>

    <div class="header-row">
      <div class="tabs">
        <button
          :class="classeTabCentres"
          @click="mostrarCentres = true"
        >
          Centres Educatius
        </button>
        <button
          :class="classeTabUsuaris"
          @click="mostrarCentres = false"
        >
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
          v-for="centre in centresFiltrats"
          :key="centre.id"
          class="card"
          @click="handleNavigation(centre.id)"
        >
          <div class="card-top">
            <div class="codi">{{ codiCentre(centre) }}</div>
            <div class="status">
              <span v-if="teTallers(centre)" class="badge small">
                {{ comptarTallers(centre) }} tallers
              </span>
              <span v-else class="badge small neutral">Sense tallers</span>
            </div>
          </div>
          <h4 class="card-title">{{ centre.nom_centre }}</h4>
          <div class="card-body">
            <div class="meta"><strong>{{ municipiCentre(centre) }}</strong></div>
            <div class="meta">{{ emailCentre(centre) }}</div>
          </div>
          <div class="card-hint">Veure detalls →</div>
        </div>
        <div v-if="centresFiltratsLength === 0" class="empty">No s'han trobat centres</div>
      </div>

      <div v-else class="cards-grid users-grid">
        <div v-for="(user, idx) in usuarisFiltrats" :key="clauUsuari(user, idx)" class="card user-card">
          <div class="card-top">
            <div class="codi">ID: {{ user.id }}</div>
            <div class="status">
              <span class="badge small">{{ user.rol }}</span>
            </div>
          </div>
          <h4 class="card-title">{{ user.email }}</h4>
          <div class="card-body">
            <div class="meta">Centre: <strong>{{ nomCentreUsuari(user) }}</strong></div>
            <div class="meta">Últim accés: {{ ultimAcces(user) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// ======================================
// Importacions i Composables (Rutes, Cookies, Stores)
// ======================================
const header = useHeaderStore();
header.setHeaderAdmin();

// ======================================
// Estat Reactiu i Refs (Variables i Formularis)
// ======================================
const mostrarCentres = ref(true);
const searchTerm = ref('');
const isExiting = ref(false);

const token = useCookie('authToken').value;

const respostaCentres = await useFetch('/api/admin/centres', {
  headers: token ? { Authorization: 'Bearer ' + token } : {}
});

const respostaUsuaris = await useFetch('/api/admin/usuaris', {
  headers: token ? { Authorization: 'Bearer ' + token } : {}
});

const centresList = computed(function () {
  let d = respostaCentres.data;
  if (!d || !d.value) return [];
  let arr = d.value;
  let resultat = [];
  for (let i = 0; i < arr.length; i++) {
    let c = arr[i];
    let ob = {};
    ob.id = c.id;
    ob.codi_centre = c.codi_centre;
    ob.nom_centre = c.nom_centre;
    ob.municipi = c.municipi;
    ob.email_oficial = c.email_oficial;
    if (c.tallers) {
      ob.tallers = c.tallers;
    } else {
      ob.tallers = [];
    }
    resultat.push(ob);
  }
  return resultat;
});

const usuarisList = computed(function () {
  let d = respostaUsuaris.data;
  if (!d || !d.value) return [];
  let arr = d.value;
  let resultat = [];
  for (let i = 0; i < arr.length; i++) {
    let u = arr[i];
    let ob = {};
    ob.id = u.id;
    ob.email = u.email;
    ob.rol = u.rol;
    ob.nom_centre = u.nom_centre;
    ob.ultim_acces = u.ultim_acces;
    resultat.push(ob);
  }
  return resultat;
});

const centresFiltrats = computed(function () {
  let q = searchTerm.value;
  if (q && q.toLowerCase) {
    q = q.toLowerCase().trim();
  } else {
    q = '';
  }
  let llista = centresList.value;
  let resultat = [];
  for (let i = 0; i < llista.length; i++) {
    let c = llista[i];
    let nom = c.nom_centre ? c.nom_centre.toLowerCase() : '';
    let codi = c.codi_centre ? c.codi_centre.toLowerCase() : '';
    if (nom.indexOf(q) >= 0 || codi.indexOf(q) >= 0) {
      resultat.push(c);
    }
  }
  return resultat;
});

const usuarisFiltrats = computed(function () {
  let q = searchTerm.value;
  if (q && q.toLowerCase) {
    q = q.toLowerCase().trim();
  } else {
    q = '';
  }
  let llista = usuarisList.value;
  let resultat = [];
  for (let i = 0; i < llista.length; i++) {
    let u = llista[i];
    let email = u.email ? u.email.toLowerCase() : '';
    if (email.indexOf(q) >= 0) {
      resultat.push(u);
    }
  }
  return resultat;
});

const centresFiltratsLength = computed(function () {
  return centresFiltrats.value.length;
});

const classePageExit = computed(function () {
  if (isExiting.value) {
    return 'page-exit';
  } else {
    return '';
  }
});

const classeTabCentres = computed(function () {
  if (mostrarCentres.value) {
    return 'tab active';
  } else {
    return 'tab';
  }
});

const classeTabUsuaris = computed(function () {
  if (!mostrarCentres.value) {
    return 'tab active';
  } else {
    return 'tab';
  }
});

// ======================================
// Lògica i Funcions (Handlers i Lifecycle)
// ======================================

// A) --- Navegar al detall del centre amb efecte visual ---
async function handleNavigation(id) {
  // 1. Activem l'efecte de sortida.
  isExiting.value = true;
  // 2. Esperem una mica per feedback visual.
  await new Promise(function (resolve) {
    setTimeout(resolve, 100);
  });
  // 3. Navegem al detall.
  navigateTo('/admin/itemDetail/' + id);
}

// A) --- Retornar el codi del centre o text per defecte ---
function codiCentre(centre) {
  if (centre.codi_centre) {
    return centre.codi_centre;
  } else {
    return 'SENSE CODI';
  }
}

// A) --- Comprovar si el centre té tallers ---
function teTallers(centre) {
  if (centre.tallers && centre.tallers.length > 0) {
    return true;
  } else {
    return false;
  }
}

// A) --- Comptar tallers del centre ---
function comptarTallers(centre) {
  if (centre.tallers) {
    return centre.tallers.length;
  } else {
    return 0;
  }
}

// A) --- Retornar municipi o guió ---
function municipiCentre(centre) {
  if (centre.municipi) {
    return centre.municipi;
  } else {
    return '—';
  }
}

// A) --- Retornar email o guió ---
function emailCentre(centre) {
  if (centre.email_oficial) {
    return centre.email_oficial;
  } else {
    return '—';
  }
}

// A) --- Retornar nom centre de l'usuari o guió ---
function nomCentreUsuari(user) {
  if (user.nom_centre) {
    return user.nom_centre;
  } else {
    return '—';
  }
}

// A) --- Retornar últim accés o 'Mai' ---
function ultimAcces(user) {
  if (user.ultim_acces) {
    return user.ultim_acces;
  } else {
    return 'Mai';
  }
}

// A) --- Clau única per a l'usuari al v-for ---
function clauUsuari(user, idx) {
  if (user && user.id) {
    return user.id;
  } else {
    return 'user-' + String(idx);
  }
}
</script>

<style scoped>
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

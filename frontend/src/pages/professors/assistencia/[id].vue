<script setup>
// ======================================
// Importem les dependències
// ======================================
import { ref, computed, watch, onMounted } from 'vue';
import { 
  ArrowLeft,
  User,
  Mail,
  MapPin,
  Clock,
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  Search,
  ExternalLink,
  ChevronRight
} from 'lucide-vue-next';

// ======================================
// Configuració i Serveis
// ======================================

// 1. Serveis de rutes i capçalera
const routeInstancia = useRoute();
const routerInstancia = useRouter();
const headerStore = useHeaderStore();
headerStore.setHeaderProfessors();

// 2. Cookie d'autenticació i ID de la URL
const tokenCookie = useCookie('authToken');
const tokenRef = tokenCookie.value;
const detallIdUrl = routeInstancia.params.id;

// ======================================
// Estat Reactiu del Component
// ======================================

const isCarregant = ref(true);
const textErrorC = ref(null);
const assistenciaList = ref([]);
const infoTaller = ref(null);
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;

// ======================================
// Propietats Computades (Anàlisi de dades)
// ======================================

// 1. Filtre d'alumnes per cerca (Bucle for clàssic)
const alumnesFiltrats = computed(function () {
  const queryRaw = searchQuery.value;
  let textBusca = '';
  if (queryRaw) {
    textBusca = queryRaw.toLowerCase().trim();
  }
  
  const llistaOriginal = assistenciaList.value;
  const resultatFiltrat = [];
  
  for (let i = 0; i < llistaOriginal.length; i++) {
    const s = llistaOriginal[i];
    let coincideix = false;
    
    if (textBusca === '') {
      coincideix = true;
    } else {
      let sNom = '';
      if (s.nom) { sNom = s.nom.toLowerCase(); }
      
      let sCognoms = '';
      if (s.cognoms) { sCognoms = s.cognoms.toLowerCase(); }
      
      let sEmail = '';
      if (s.email) { sEmail = s.email.toLowerCase(); }
      
      if (sNom.indexOf(textBusca) !== -1) {
        coincideix = true;
      } else if (sCognoms.indexOf(textBusca) !== -1) {
        coincideix = true;
      } else if (sEmail.indexOf(textBusca) !== -1) {
        coincideix = true;
      }
    }
    
    if (coincideix === true) {
      resultatFiltrat.push(s);
    }
  }
  return resultatFiltrat;
});

// 2. Estadístiques d'assistència (Bucle for clàssic)
const estadistiques = computed(function () {
  const llistaTotal = assistenciaList.value;
  let nPresents = 0;
  for (let j = 0; j < llistaTotal.length; j++) {
    if (llistaTotal[j].ha_assistit === true) {
      nPresents = nPresents + 1;
    }
  }
  
  let percent = 0;
  if (llistaTotal.length > 0) {
    percent = Math.round((nPresents / llistaTotal.length) * 100);
  }
  
  return {
    present: nPresents,
    total: llistaTotal.length,
    percent: percent
  };
});

// 3. Càlcul de pàgines i paginació manual (Bucle for)
const totalPages = computed(function () {
  const nTotal = alumnesFiltrats.value.length;
  let nPag = 1;
  if (nTotal > 0) {
    nPag = Math.ceil(nTotal / itemsPerPage);
  }
  return nPag;
});

const alumnesPaginats = computed(function () {
  const llistaTota = alumnesFiltrats.value;
  const inici = (currentPage.value - 1) * itemsPerPage;
  const fi = inici + itemsPerPage;
  
  const resultatPag = [];
  for (let k = 0; k < llistaTota.length; k++) {
    if (k >= inici) {
      if (k < fi) {
        resultatPag.push(llistaTota[k]);
      }
    }
  }
  return resultatPag;
});

// ======================================
// Vigilants (Watchers)
// ======================================

// 1. Si canvia la cerca, tornem directament a la pàgina 1
watch(searchQuery, function () {
  currentPage.value = 1;
});

// ======================================
// Declaracions de funcions
// ======================================

// A) --- Gestió d'estils visuals ---

function getProjectStyles(sectorNom) {
  if (!sectorNom) { return 'bg-white/40 text-[#022B3A] border-white/60'; }
  const sUpper = String(sectorNom).toUpperCase();
  
  if (sUpper.indexOf('A') !== -1 || sUpper.indexOf('MANUF') !== -1) { return 'bg-[#FFF0EB] text-[#FB6107] border-[#FB6107]/20'; }
  if (sUpper.indexOf('B') !== -1 || sUpper.indexOf('ENER') !== -1) { return 'bg-[#F0F7E9] text-[#7CB518] border-[#7CB518]/20'; }
  if (sUpper.indexOf('C') !== -1 || sUpper.indexOf('AGRO') !== -1) { return 'bg-[#FFF7E6] text-[#FBB02D] border-[#FBB02D]/20'; }
  
  return 'bg-white/40 text-[#022B3A] border-white/60';
}

function getAttendenceStyles(assistit) {
  if (assistit === true) {
    return 'bg-[#F0F7E9] text-[#7CB518] border-[#7CB518]/20 hover:scale-105 active:scale-95';
  }
  return 'bg-white text-[#E1E5F2] border-[#E1E5F2] hover:text-[#022B3A]/40 hover:border-[#BFDBF7]';
}

function getStudentIconStyles(assistit) {
  if (assistit === true) {
    return 'bg-[#1F7A8C] text-white border-[#1F7A8C]';
  }
  return 'bg-[#E1E5F2]/30 text-[#022B3A]/40 border-transparent';
}

// B) --- Càrrega i accions de l'API ---

async function carregarDadesApi() {
  isCarregant.value = true;
  textErrorC.value = null;
  
  try {
    const headersAPI = {};
    if (tokenRef) {
      headersAPI.Authorization = 'Bearer ' + tokenRef;
    }

    // 1. Carreguem la llista d'assistència del detall especificat
    const dadesAssistencia = await $fetch('/api/professor/assistencia/' + detallIdUrl, {
      headers: headersAPI
    });
    assistenciaList.value = dadesAssistencia || [];

    // 2. Carreguem informació del taller per al header
    const dadesTallersGeneral = await $fetch('/api/professor/tallers', {
      headers: headersAPI
    });
    
    if (Array.isArray(dadesTallersGeneral)) {
      let trobat = null;
      for (let m = 0; m < dadesTallersGeneral.length; m++) {
        const tall = dadesTallersGeneral[m];
        if (String(tall.detall_id) === String(detallIdUrl)) {
          trobat = tall;
          break;
        }
      }
      infoTaller.value = trobat;
    }
    
  } catch (errApi) {
    console.error('Error carregant dades d\'assistència:', errApi);
    textErrorC.value = "No s'han pogut carregar els alumnes d'aquest taller.";
  } finally {
    isCarregant.value = false;
  }
}

async function handleToggleAssistencia(alumneObj) {
  const estatAntic = alumneObj.ha_assistit;
  try {
    const headersPut = {};
    if (tokenRef) {
      headersPut.Authorization = 'Bearer ' + tokenRef;
    }

    // Actualització optimista
    alumneObj.ha_assistit = !estatAntic;
    
    await $fetch('/api/professor/assistencia/' + alumneObj.id, {
      method: 'PUT',
      headers: headersPut,
      body: { ha_assistit: alumneObj.ha_assistit }
    });
    
  } catch (errPut) {
    console.error('Error actualitzant assistència:', errPut);
    // Rollback en cas d'error
    alumneObj.ha_assistit = estatAntic; 
    const swalE = useSwal();
    swalE.fire({ title: 'Error', text: "Error al desar l'assistència.", icon: 'error' });
  }
}

// C) --- Navegació i Utilitats ---

function handleGoBack() {
  routerInstancia.push('/professors/assistencia');
}

function handleGoToPage(numP) {
  const maxP = totalPages.value;
  if (numP >= 1) {
    if (numP <= maxP) {
      currentPage.value = numP;
    }
  }
}

function inicialsAlumneUI(nomU, cognomsU) {
  let ini = '?';
  if (nomU) {
    if (cognomsU) {
      ini = nomU.charAt(0) + cognomsU.charAt(0);
    } else {
      ini = nomU.charAt(0);
    }
  }
  return ini.toUpperCase();
}

// ======================================
// Cicle de vida
// ======================================

onMounted(function () {
  if (detallIdUrl) {
    carregarDadesApi();
  } else {
    textErrorC.value = "Taller no identificat.";
    isCarregant.value = false;
  }
});
</script>

<template>
  <div class="animate-in fade-in slide-in-from-bottom-4 duration-500 p-8 space-y-8">
    
    <!-- 1. NAVEGACIÓ I CAPÇALERA -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div class="space-y-4">
        <button 
          @click="handleGoBack"
          class="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#022B3A]/40 hover:text-[#1F7A8C] transition-colors"
        >
          <ArrowLeft :size="14" class="group-hover:-translate-x-1 transition-transform" />
          Tornar a la llista
        </button>
        
        <div v-if="infoTaller">
          <h1 class="text-4xl md:text-5xl font-black text-[#022B3A] tracking-tighter leading-none mb-3">
            Passar <span class="text-[#1F7A8C]">Llista</span>
          </h1>
          <div class="flex items-center gap-3">
            <span :class="['px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border', getProjectStyles(infoTaller.sector)]">
               {{ infoTaller.sector || 'PROJECTE' }}
            </span>
            <span class="text-sm font-bold text-[#022B3A]/60 flex items-center gap-1.5">
               <ChevronRight :size="14" class="text-[#BFDBF7]" />
               {{ infoTaller.titol }}
            </span>
          </div>
        </div>
      </div>

      <!-- Càpsula d'estadístiques -->
      <div v-if="isCarregant === false && !textErrorC" class="bg-white border border-[#BFDBF7]/60 rounded-2xl p-4 flex items-center gap-6 shadow-sm">
         <div class="flex flex-col">
            <span class="text-[9px] font-black text-[#022B3A]/30 uppercase tracking-widest">Alumnes Presents</span>
            <div class="flex items-end gap-1">
               <span class="text-2xl font-black text-[#1F7A8C] leading-none">{{ estadistiques.present }}</span>
               <span class="text-xs font-bold text-[#022B3A]/20">/ {{ estadistiques.total }}</span>
            </div>
         </div>
         <div class="w-12 h-12 rounded-full border-4 border-[#E1E5F2] flex items-center justify-center relative">
            <svg class="absolute inset-0 -rotate-90" viewBox="0 0 36 36">
               <circle 
                 cx="18" cy="18" r="16" 
                 fill="none" 
                 class="stroke-[#1F7A8C]" 
                 stroke-width="4" 
                 stroke-dasharray="100" 
                 :stroke-dashoffset="100 - estadistiques.percent"
               />
            </svg>
            <span class="text-[10px] font-black text-[#1F7A8C]">{{ estadistiques.percent }}%</span>
         </div>
      </div>
    </div>

    <!-- 2. GESTIÓ D'ESTATS (CÀRREGA/ERROR) -->
    
    <div v-if="isCarregant === true" class="p-20 text-center text-[#022B3A]/40 font-bold uppercase tracking-widest text-xs">
       Carregant llistat d'alumnes...
    </div>

    <div v-else-if="textErrorC" class="bg-red-50 border border-red-100 p-8 rounded-2xl text-red-600 text-center italic">
       {{ textErrorC }}
    </div>

    <div v-else class="space-y-6">
      
      <!-- Barra de cerca i utilitats -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="relative flex-1 max-w-md group w-full">
          <Search :size="14" class="absolute left-4 top-1/2 -translate-y-1/2 text-[#022B3A]/20 group-focus-within:text-[#1F7A8C] transition-colors" />
          <input 
            type="text" 
            placeholder="Cercar alumne per nom o email..."
            v-model="searchQuery"
            class="w-full bg-white border border-[#BFDBF7]/60 rounded-xl pl-11 pr-4 py-3 text-xs font-bold focus:ring-4 focus:ring-[#1F7A8C]/5 outline-none transition-all placeholder:text-[#022B3A]/20"
          />
        </div>
        
        <div class="flex items-center gap-3 w-full sm:w-auto">
           <div class="bg-[#F0F7E9] text-[#7CB518] px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-[#7CB518]/10">
              <Clock :size="14" /> Sessió Activa
           </div>
        </div>
      </div>

      <!-- Taula d'Alumnes -->
      <div class="bg-white rounded-3xl border border-[#BFDBF7]/60 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-[#E1E5F2]/10 border-b border-[#BFDBF7]/20">
                <th class="p-6 pl-10 text-[10px] font-black text-[#022B3A]/40 uppercase tracking-[0.2em]">Alumne / ID</th>
                <th class="p-6 text-[10px] font-black text-[#022B3A]/40 uppercase tracking-[0.2em]">Dades de Contacte</th>
                <th class="p-6 text-center text-[10px] font-black text-[#022B3A]/40 uppercase tracking-[0.2em]">Estat Assistència</th>
                <th class="p-6 pr-10 text-right text-[10px] font-black text-[#022B3A]/40 uppercase tracking-[0.2em]">Accions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#BFDBF7]/10">
              <template v-if="alumnesPaginats.length > 0">
                <tr v-for="student in alumnesPaginats" :key="student.id" class="group hover:bg-[#E1E5F2]/5 transition-colors">
                  
                  <!-- Identitat de l'alumne -->
                  <td class="p-6 pl-10">
                    <div class="flex items-center gap-4">
                       <div :class="['w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs transition-colors border', getStudentIconStyles(student.ha_assistit)]">
                          {{ inicialsAlumneUI(student.nom, student.cognoms) }}
                       </div>
                       <div>
                          <p class="text-sm font-black text-[#022B3A] group-hover:text-[#1F7A8C] transition-colors">{{ student.nom }} {{ student.cognoms }}</p>
                          <p class="text-[10px] font-bold text-[#022B3A]/30 uppercase tracking-widest">ID-ST-{{ String(student.id).padStart(3,'0') }}</p>
                       </div>
                    </div>
                  </td>

                  <!-- Contacte -->
                  <td class="p-6">
                    <div class="flex items-center gap-2 text-[#022B3A]/60 bg-[#E1E5F2]/20 border border-[#BFDBF7]/20 px-3 py-1.5 rounded-lg w-fit">
                      <Mail :size="12" />
                      <span class="text-[11px] font-bold">{{ student.email }}</span>
                    </div>
                  </td>

                  <!-- Toggle d'Assistència -->
                  <td class="p-6 text-center">
                    <button 
                      @click="handleToggleAssistencia(student)"
                      :class="['inline-flex items-center gap-2 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border shadow-sm', getAttendenceStyles(student.ha_assistit)]"
                    >
                      <CheckCircle2 v-if="student.ha_assistit === true" :size="14" />
                      <XCircle v-else :size="14" class="opacity-20" />
                      <span v-if="student.ha_assistit === true">Assistit</span>
                      <span v-else>Falta</span>
                    </button>
                  </td>

                  <!-- Accions adicionals -->
                  <td class="p-6 pr-10 text-right">
                    <button class="p-2.5 rounded-xl bg-[#E1E5F2]/20 text-[#022B3A]/20 hover:bg-[#1F7A8C]/10 hover:text-[#1F7A8C] transition-all">
                       <ExternalLink :size="16" />
                    </button>
                  </td>

                </tr>
              </template>
              <tr v-else>
                 <td colspan="4" class="p-20 text-center text-[#022B3A]/40 font-bold uppercase tracking-widest text-[10px] italic">
                   No s'han trobat alumnes que coincideixin amb la cerca.
                 </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Paginació -->
        <div v-if="alumnesFiltrats.length > 0" class="px-8 py-4 border-t border-[#BFDBF7]/20 flex justify-between items-center">
          <span class="text-[10px] font-bold text-[#022B3A]/30 uppercase tracking-widest">Mostrant {{ alumnesPaginats.length }} de {{ alumnesFiltrats.length }} alumnes</span>
          <Pagination :current-page="currentPage" :total-pages="totalPages" @go-to-page="handleGoToPage" />
        </div>

        <!-- Resum del Taller (Peu de taula) -->
        <div class="p-8 bg-[#E1E5F2]/10 border-t border-[#BFDBF7]/20 flex flex-col md:flex-row items-center justify-between gap-6">
           <div class="flex items-center gap-10">
              <div v-if="infoTaller" class="flex items-center gap-3">
                 <div class="w-10 h-10 rounded-full bg-white border border-[#BFDBF7]/60 flex items-center justify-center text-[#1F7A8C]">
                    <MapPin :size="18" />
                 </div>
                 <div>
                    <p class="text-[9px] font-black text-[#022B3A]/30 uppercase tracking-widest">Ubicació Sessió</p>
                    <p class="text-xs font-black text-[#022B3A]">{{ infoTaller.ubicacio || infoTaller.municipi }}</p>
                 </div>
              </div>
              <div v-if="infoTaller" class="flex items-center gap-3">
                 <div class="w-10 h-10 rounded-full bg-white border border-[#BFDBF7]/60 flex items-center justify-center text-[#1F7A8C]">
                    <Clock :size="18" />
                 </div>
                 <div>
                    <p class="text-[9px] font-black text-[#022B3A]/30 uppercase tracking-widest">Horari Previst</p>
                    <p class="text-xs font-black text-[#022B3A]">{{ infoTaller.modalitat || 'Horari de taller' }}</p>
                 </div>
              </div>
           </div>

           <button 
             @click="handleGoBack"
             class="flex items-center gap-2 px-8 py-3.5 bg-[#022B3A] text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#1F7A8C] transition-all shadow-xl shadow-[#022B3A]/20"
           >
              <ClipboardCheck :size="16" />
              Finalitzar Control
           </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Estils gestionats globalment amb Tailwind */
</style>

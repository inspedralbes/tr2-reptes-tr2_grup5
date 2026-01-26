<script setup>
// ======================================
// Importem les dependències
// ======================================
import { ref, computed, watch } from 'vue';
import { 
  Search, 
  CheckCircle2, 
  BarChart3, 
  Save, 
  GraduationCap,
  ChevronRight,
  User,
  MessageSquare
} from 'lucide-vue-next';

// ======================================
// Configuració i Serveis
// ======================================

// 1. Configuració de la capçalera
const headerStore = useHeaderStore();
headerStore.setHeaderProfessors();

// 2. Control d'autenticació i rutes
const tokenCookie = useCookie('authToken');
const tokenRef = tokenCookie.value;

// 3. Petició a l'API per obtenir els tallers (sense desestructuració)
const headersAPI = {};
if (tokenRef) {
  headersAPI.Authorization = 'Bearer ' + tokenRef;
}

const resultatTallers = await useFetch('/api/professor/tallers', {
  headers: headersAPI,
  key: 'professor-tallers-evaluations'
});

// ======================================
// Estat Reactiu del Component
// ======================================

const searchQuery = ref('');
const selectedWorkshopId = ref(null);
const alumnesLlista = ref([]);
const isCarregantAlumnes = ref(false);
const savingStatus = ref({}); 

const itemsPerPage = 10;
const currentPageWorkshops = ref(1);
const currentPageStudents = ref(1);

// ======================================
// Propietats Computades (Anàlisi de dades)
// ======================================

// 1. Llista base de tallers (segura)
const tallersTots = computed(function () {
  let llista = [];
  if (resultatTallers.data) {
    if (resultatTallers.data.value) {
      llista = resultatTallers.data.value;
    }
  }
  return llista;
});

// 2. Filtre de tallers gestionables (Bucle for)
const tallersAssig = computed(function () {
  const llistaT = tallersTots.value;
  const resultatAssig = [];
  for (let i = 0; i < llistaT.length; i++) {
    const t = llistaT[i];
    if (t) {
      if (t.permissions) {
        if (t.permissions.canManageList === true) {
          resultatAssig.push(t);
        }
      }
    }
  }
  return resultatAssig;
});

// 3. Filtre final per cerca lateral i mapeig UI (Bucle for)
const tallersFiltrats = computed(function () {
  const qRaw = searchQuery.value;
  let textBusca = '';
  if (qRaw) {
    textBusca = qRaw.toLowerCase().trim();
  }
  
  const llistaB = tallersAssig.value;
  const resultatF = [];
  
  for (let j = 0; j < llistaB.length; j++) {
    const t = llistaB[j];
    let coincideix = false;
    
    if (textBusca === '') {
      coincideix = true;
    } else {
      let tTitol = '';
      if (t.titol) { tTitol = t.titol.toLowerCase(); }
      
      let tMuni = '';
      if (t.municipi) { tMuni = t.municipi.toLowerCase(); }
      
      if (tTitol.indexOf(textBusca) !== -1) {
        coincideix = true;
      } else if (tMuni.indexOf(textBusca) !== -1) {
        coincideix = true;
      }
    }
    
    if (coincideix === true) {
      // Mapegem manualment per a la interfície lateral
      const itemUI = {
        id: t.detall_id,
        title: t.titol || 'Taller',
        project: t.sector || 'PROJECTE',
        group: t.municipi || 'Grup General',
        trimestre: t.trimestre || '1r',
        evaluatedStudents: 0, 
        totalStudents: t.places_maximes || 12
      };
      resultatF.push(itemUI);
    }
  }
  return resultatF;
});

const tallerSeleccionat = computed(function () {
  const idBusca = selectedWorkshopId.value;
  const llistaF = tallersFiltrats.value;
  let trobat = null;
  for (let k = 0; k < llistaF.length; k++) {
    if (llistaF[k].id === idBusca) {
      trobat = llistaF[k];
      break;
    }
  }
  return trobat;
});

// 4. Paginació dels tallers (Bucle for)
const totalPagesWorkshops = computed(function () {
  const nTotal = tallersFiltrats.value.length;
  let nPag = 1;
  if (nTotal > 0) {
    nPag = Math.ceil(nTotal / itemsPerPage);
  }
  return nPag;
});

const tallersPaginats = computed(function () {
  const llistaTota = tallersFiltrats.value;
  const inici = (currentPageWorkshops.value - 1) * itemsPerPage;
  const fi = inici + itemsPerPage;
  
  const resPag = [];
  for (let m = 0; m < llistaTota.length; m++) {
    if (m >= inici) {
      if (m < fi) {
        resPag.push(llistaTota[m]);
      }
    }
  }
  return resPag;
});

// 5. Paginació dels alumnes del taller seleccionat (Bucle for)
const totalPagesAlumnes = computed(function () {
  const nTotal = alumnesLlista.value.length;
  let nPag = 1;
  if (nTotal > 0) {
    nPag = Math.ceil(nTotal / itemsPerPage);
  }
  return nPag;
});

const alumnesPaginats = computed(function () {
  const llistaTota = alumnesLlista.value;
  const inici = (currentPageStudents.value - 1) * itemsPerPage;
  const fi = inici + itemsPerPage;
  
  const resPag = [];
  for (let nIdx = 0; nIdx < llistaTota.length; nIdx++) {
    if (nIdx >= inici) {
      if (nIdx < fi) {
        resPag.push(llistaTota[nIdx]);
      }
    }
  }
  return resPag;
});

// 6. Estats de càrrega de tallers (sense desestructuració)
const isPendentTallers = computed(function () {
  let p = false;
  if (resultatTallers.pending) {
    if (resultatTallers.pending.value === true) { p = true; }
  }
  return p;
});

// ======================================
// Vigilants (Watchers)
// ======================================

// 1. Quan canviem de taller, carreguem els seus alumnes
watch(selectedWorkshopId, function (nouId) {
  if (nouId) {
    handleFetchAlumnes(nouId);
    currentPageStudents.value = 1;
  }
});

// 2. Quan cerquem tallers, tornem a la pàgina lateral 1
watch(searchQuery, function () {
  currentPageWorkshops.value = 1;
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

function getEvaluationStatusStyles(estat) {
  if (estat === 'done') {
    return 'bg-[#7CB518]/10 text-[#7CB518] border-[#7CB518]/20';
  }
  return 'bg-[#E1E5F2]/20 text-[#022B3A]/60 border-[#BFDBF7]/20';
}

function getStatusDotStyles(estat) {
  if (estat === 'done') {
    return 'bg-[#7CB518]';
  }
  return 'bg-[#FBB02D] animate-pulse';
}

function getSaveButtonStyles(estat) {
  if (estat === 'done') {
    return 'bg-[#7CB518] text-white border-[#7CB518]/20 shadow-[#7CB518]/20 hover:bg-[#689914]';
  }
  return 'bg-white text-[#BFDBF7] border-[#BFDBF7]/60 hover:text-[#1F7A8C] hover:border-[#1F7A8C]';
}

// B) --- Accions de l'API i dades ---

async function handleFetchAlumnes(detallIdTaller) {
  if (!detallIdTaller) { return; }
  isCarregantAlumnes.value = true;
  try {
    const headersF = {};
    if (tokenRef) {
      headersF.Authorization = 'Bearer ' + tokenRef;
    }
    
    // Obtenim la llista d'alumnes del taller
    const dadesRaw = await $fetch('/api/professor/tallers/' + detallIdTaller + '/alumnes', {
      headers: headersF
    });
    
    // Adaptem els camps manualment (Bucle for)
    const llistaAdaptada = [];
    if (Array.isArray(dadesRaw)) {
      for (let o = 0; o < dadesRaw.length; o++) {
        const sRaw = dadesRaw[o];
        
        let avStatus = 'pending';
        if (sRaw.ha_avaluat === true) { avStatus = 'done'; }
        else if (sRaw.comentarios) { avStatus = 'done'; }

        let sIni = '?';
        if (sRaw.nom) {
          if (sRaw.cognoms) { sIni = sRaw.nom[0] + sRaw.cognoms[0]; }
          else { sIni = sRaw.nom[0]; }
        }

        const objUI = {
          id: sRaw.id,
          name: String(sRaw.nom || '') + ' ' + String(sRaw.cognoms || ''),
          avatar: sIni.toUpperCase(),
          email: sRaw.email || '',
          status: avStatus,
          techScore: sRaw.nota_tecnica || 0,
          softScore: sRaw.nota_actitud || 0,
          comment: sRaw.comentarios || ''
        };
        llistaAdaptada.push(objUI);
      }
    }
    alumnesLlista.value = llistaAdaptada;
    
  } catch (errAl) {
    console.error("Error carregant alumnes per avaluació:", errAl);
    alumnesLlista.value = [];
  } finally {
    isCarregantAlumnes.value = false;
  }
}

function handleUpdateComment(idAlumne, textNou) {
  const llistaA = alumnesLlista.value;
  for (let p = 0; p < llistaA.length; p++) {
    if (llistaA[p].id === idAlumne) {
      llistaA[p].comment = textNou;
      break;
    }
  }
}

async function handleSaveEvaluation(idAlumneEva) {
  const wsId = selectedWorkshopId.value;
  if (!wsId) { return; }
  
  // Busquem l'alumne a la llista
  let alumneObj = null;
  for (let q = 0; q < alumnesLlista.value.length; q++) {
    if (alumnesLlista.value[q].id === idAlumneEva) {
      alumneObj = alumnesLlista.value[q];
      break;
    }
  }
  if (!alumneObj) { return; }

  savingStatus.value[idAlumneEva] = true;
  try {
    const headersS = {};
    if (tokenRef) {
      headersS.Authorization = 'Bearer ' + tokenRef;
    }

    await $fetch('/api/professor/tallers/' + wsId + '/alumnes/' + idAlumneEva + '/avaluacio', {
      method: 'PUT',
      headers: headersS,
      body: { 
        comentarios: alumneObj.comment 
      }
    });
    
    alumneObj.status = 'done';
    
  } catch (errSave) {
    console.error("Error guardant avaluació de l'alumne:", errSave);
    const swalErrorEva = useSwal();
    swalErrorEva.fire({ title: 'Error', text: "No s'ha pogut guardar l'avaluació de " + alumneObj.name, icon: 'error' });
  } finally {
    savingStatus.value[idAlumneEva] = false;
  }
}

// C) --- Navegació de pàgines ---

function handleGoToPageWorkshops(num) {
  const maxW = totalPagesWorkshops.value;
  if (num >= 1) {
    if (num <= maxW) {
      currentPageWorkshops.value = num;
    }
  }
}

function handleGoToPageStudents(num) {
  const maxS = totalPagesAlumnes.value;
  if (num >= 1) {
    if (num <= maxS) {
      currentPageStudents.value = num;
    }
  }
}
</script>

<template>
  <div class="animate-in fade-in slide-in-from-bottom-4 duration-500 h-[calc(100vh-160px)] flex flex-col">
    
    <!-- 1. CAPÇALERA -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 flex-shrink-0">
      <div>
        <h1 class="text-4xl md:text-5xl font-black text-[#022B3A] tracking-tighter leading-none mb-3">
          Avaluacions de <span class="text-[#1F7A8C]">Tallers</span>
        </h1>
        <p class="text-[#022B3A]/40 text-[10px] font-black uppercase tracking-[0.2em]">
          Qualifica les competències tècniques i actitudinals dels alumnes.
        </p>
      </div>
    </div>

    <!-- 2. CONTINGUT PRINCIPAL DIVIDIT -->
    <div class="flex-1 flex gap-8 overflow-hidden">
      
      <!-- COLUMNA ESQUERRA: LLISTAT DE TALLERS -->
      <aside class="w-1/3 flex flex-col gap-4 min-w-[340px]">
        
        <!-- Barra de cerca lateral -->
        <div class="bg-white p-1.5 rounded-2xl border border-[#BFDBF7]/60 shadow-sm flex items-center gap-2">
          <div class="relative flex-1 group">
              <Search :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-[#022B3A]/20 group-focus-within:text-[#1F7A8C] transition-colors" />
              <input 
                type="text" 
                v-model="searchQuery"
                placeholder="Cercar taller per títol o municipi..."
                class="w-full md:w-auto flex-1 bg-[#E1E5F2]/10 border border-transparent rounded-xl pl-9 pr-4 py-2.5 text-[11px] font-bold focus:bg-white focus:ring-2 focus:ring-[#1F7A8C]/20 outline-none transition-all placeholder:text-[#022B3A]/20 text-[#022B3A]"
              />
          </div>
        </div>

        <!-- Llista de targetes de tallers -->
        <div class="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
          <div v-if="isPendentTallers === true" class="p-8 text-center text-[#022B3A]/20 italic text-xs uppercase font-bold tracking-widest animate-pulse">
              Carregant tallers...
          </div>
          
          <template v-else-if="tallersFiltrats.length > 0">
            <div 
              v-for="workshop in tallersPaginats" 
              :key="workshop.id"
              @click="selectedWorkshopId = workshop.id"
              :class="['p-5 rounded-2xl border cursor-pointer transition-all duration-300 group relative overflow-hidden', { 'bg-white border-[#1F7A8C] shadow-lg shadow-[#1F7A8C]/10 scale-[1.02]': selectedWorkshopId === workshop.id, 'bg-white border-[#BFDBF7]/40 hover:border-[#1F7A8C]/50 hover:shadow-md': selectedWorkshopId !== workshop.id }]"
            >
              <!-- Indicador d'estat lateral -->
              <div :class="['absolute left-0 top-0 bottom-0 w-1.5 transition-colors', { 'bg-[#1F7A8C]': selectedWorkshopId === workshop.id, 'bg-transparent group-hover:bg-[#1F7A8C]/30': selectedWorkshopId !== workshop.id }]"></div>

              <div class="flex justify-between items-start mb-2 pl-2">
                <span :class="['px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border', getProjectStyles(workshop.project)]">
                    {{ workshop.project }}
                </span>
                <div v-if="workshop.evaluatedStudents === workshop.totalStudents" class="text-[#7CB518] bg-[#7CB518]/10 p-1 rounded-full">
                  <CheckCircle2 :size="12" />
                </div>
              </div>

              <div class="pl-2">
                <h3 :class="['text-base font-black mb-1 leading-tight', { 'text-[#1F7A8C]': selectedWorkshopId === workshop.id, 'text-[#022B3A]': selectedWorkshopId !== workshop.id }]">
                  {{ workshop.title }}
                </h3>
                <p class="text-[10px] text-[#022B3A]/40 font-bold uppercase tracking-wider mb-4">
                  {{ workshop.group }} · {{ workshop.trimestre }} Trimestre
                </p>
                
                <!-- Barra de progrés de l'avaluació -->
                <div class="flex items-center justify-between text-[9px] font-bold text-[#022B3A]/40 mb-1.5">
                   <span>Resum Avaluació</span>
                   <span class="text-[#022B3A]/20">Ref: {{ workshop.id }}</span>
                </div>
                <div class="h-1 w-full bg-[#E1E5F2] rounded-full overflow-hidden">
                   <div class="h-full bg-[#022B3A]/20 w-1/3"></div>
                </div>
              </div>
            </div>
          </template>
          
          <div v-else class="p-12 text-center border-2 border-dashed border-[#E1E5F2] rounded-3xl text-[#022B3A]/20 text-xs font-bold uppercase tracking-widest">
             No hi ha tallers per avaluar
          </div>
        </div>
        <div v-if="tallersFiltrats.length > 0" class="flex-shrink-0 pt-3 flex justify-center">
          <Pagination :current-page="currentPageWorkshops" :total-pages="totalPagesWorkshops" @go-to-page="handleGoToPageWorkshops" />
        </div>
      </aside>

      <!-- COLUMNA DRETA: FORMULARI D'AVALUACIÓ -->
      <main class="flex-1 bg-white rounded-3xl border border-[#BFDBF7]/60 shadow-sm overflow-hidden flex flex-col relative">
        
        <template v-if="tallerSeleccionat">
          <!-- Capçalera de Context -->
          <div class="p-8 border-b border-[#BFDBF7]/20 bg-[#E1E5F2]/5 flex justify-between items-center">
             <div class="flex items-center gap-5">
                <div class="w-12 h-12 rounded-2xl bg-[#022B3A] text-white flex items-center justify-center shadow-lg shadow-[#022B3A]/10">
                   <BarChart3 :size="24" />
                </div>
                <div>
                   <h2 class="text-xl font-black text-[#022B3A] leading-none mb-1.5">{{ tallerSeleccionat.title }}</h2>
                   <p class="text-[10px] font-bold text-[#022B3A]/40 uppercase tracking-widest flex items-center gap-2">
                       Avaluant alumnes inscrits <ChevronRight :size="10" /> {{ tallerSeleccionat.group }}
                   </p>
                </div>
             </div>
             <div class="bg-[#1F7A8C]/5 px-4 py-2 rounded-xl border border-[#1F7A8C]/10">
                <span class="text-[10px] font-black text-[#1F7A8C] uppercase tracking-[0.2em]">Sessió de Qualificació</span>
             </div>
          </div>

          <!-- Llistat d'Alumnes per avaluar -->
          <div class="flex-1 overflow-y-auto p-8 bg-[#F9FAFC] custom-scrollbar">
             
             <div v-if="isCarregantAlumnes === true" class="h-full flex items-center justify-center">
                <div class="text-center space-y-4">
                   <div class="w-12 h-12 border-4 border-[#1F7A8C]/20 border-t-[#1F7A8C] rounded-full animate-spin mx-auto"></div>
                   <p class="text-[10px] font-black text-[#022B3A]/40 uppercase tracking-widest">Recuperant llistat d'alumnes...</p>
                </div>
             </div>

             <div v-else-if="alumnesLlista.length > 0" class="grid grid-cols-1 gap-6">
                <div 
                  v-for="student in alumnesPaginats" 
                  :key="student.id"
                  :class="['bg-white rounded-2xl border transition-all duration-300 relative overflow-hidden shadow-sm', { 'border-[#7CB518]/30': student.status === 'done', 'border-[#BFDBF7]/40 hover:shadow-lg': student.status !== 'done' }]"
                >
                   <!-- Indicador d'èxit -->
                   <div v-if="student.status === 'done'" class="absolute -right-8 -top-8 w-16 h-16 bg-[#7CB518]/10 rounded-full flex items-center justify-center pt-8 pr-8 text-[#7CB518]">
                      <CheckCircle2 :size="14" />
                   </div>

                   <!-- Contingut de la targeta d'alumne -->
                   <div class="p-6 flex flex-col lg:flex-row lg:items-center gap-8">
                      
                      <!-- Identitat de l'alumne -->
                      <div class="flex items-center gap-5 min-w-[240px]">
                         <div :class="['w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm border shadow-inner transition-colors', getEvaluationStatusStyles(student.status)]">
                            {{ student.avatar }}
                         </div>
                         <div class="space-y-0.5">
                            <h4 class="text-base font-black text-[#022B3A]">{{ student.name }}</h4>
                            <div class="flex items-center gap-2">
                               <div :class="['w-2 h-2 rounded-full', getStatusDotStyles(student.status)]"></div>
                               <span class="text-[9px] font-black text-[#022B3A]/30 uppercase tracking-[0.15em]">
                                 <span v-if="student.status === 'done'">Avaluat</span>
                                 <span v-else>Pendent de qualificació</span>
                               </span>
                            </div>
                         </div>
                      </div>

                      <div class="hidden lg:block w-px h-12 bg-[#BFDBF7]/20"></div>

                      <!-- Detalls i accions -->
                      <div class="flex-1 flex flex-col md:flex-row md:items-center gap-8">
                         
                         <!-- Comentaris/Observacions -->
                         <div class="flex-1 relative group">
                            <label class="text-[9px] font-black text-[#022B3A]/40 uppercase tracking-widest mb-2 block">Observacions sobre l'alumne</label>
                            <div class="relative">
                                <MessageSquare :size="14" class="absolute left-4 top-1/2 -translate-y-1/2 text-[#022B3A]/20 transition-colors group-focus-within:text-[#1F7A8C]" />
                                <input 
                                  type="text" 
                                  placeholder="Escriu aquí les teves observacions o feedback..."
                                  :value="student.comment"
                                  @input="handleUpdateComment(student.id, $event.target.value)"
                                  class="w-full bg-[#E1E5F2]/20 border border-[#BFDBF7]/40 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-bold focus:bg-white focus:border-[#1F7A8C] focus:ring-8 focus:ring-[#1F7A8C]/5 outline-none transition-all placeholder:text-[#022B3A]/20 text-[#022B3A]"
                                />
                            </div>
                         </div>

                         <!-- Botó de desat individual -->
                         <div class="flex items-end md:items-center">
                            <button 
                              @click="handleSaveEvaluation(student.id)"
                              :disabled="savingStatus[student.id] === true"
                              :class="['px-6 py-3.5 rounded-2xl transition-all flex items-center gap-3 border shadow-sm font-black text-[10px] uppercase tracking-widest', getSaveButtonStyles(student.status)]"
                            >
                               <Save v-if="savingStatus[student.id] !== true" :size="16" />
                               <div v-else class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                               <span v-if="student.status === 'done'">Actualitzar</span>
                               <span v-else>Guardar</span>
                            </button>
                         </div>

                      </div>
                   </div>
                </div>
             </div>
             
             <div v-else class="h-full flex flex-col items-center justify-center text-center opacity-30">
                <User :size="48" :strokeWidth="1.5" />
                <p class="text-sm font-black uppercase mt-4 tracking-widest">No hi ha alumnes en aquest taller</p>
             </div>
          </div>

          <!-- Barra d'Atenció Final / Paginació -->
          <div v-if="isCarregantAlumnes === false && alumnesLlista.length > 0" class="p-6 bg-white border-t border-[#BFDBF7]/20 flex justify-between items-center flex-wrap gap-4">
             <Pagination :current-page="currentPageStudents" :total-pages="totalPagesAlumnes" @go-to-page="handleGoToPageStudents" />
             <div class="text-[9px] font-black text-[#022B3A]/30 uppercase tracking-[0.2em] flex items-center gap-4">
                Els canvis es guarden per alumne individualment
                <div class="h-4 w-px bg-[#BFDBF7]/40"></div>
                Total Alumnes: {{ alumnesLlista.length }}
             </div>
          </div>
        </template>

        <!-- ESTAT BUIT (CAP TALLER SELECCIONAT) -->
        <template v-else>
          <div class="absolute inset-0 flex flex-col items-center justify-center text-center p-12 bg-white">
             <div class="w-32 h-32 bg-[#E1E5F2]/40 rounded-[2.5rem] flex items-center justify-center mb-8 text-[#022B3A]/10 animate-pulse transition-transform hover:scale-105 duration-700">
                <GraduationCap :size="64" :strokeWidth="1" />
             </div>
             <h3 class="text-3xl font-black text-[#022B3A] mb-4 tracking-tight">Cap Taller Seleccionat</h3>
             <p class="text-[#022B3A]/40 text-sm font-medium max-w-sm leading-relaxed mb-8">
                Tria un taller del llistat lateral per començar a qualificar les competències tècniques i transversals de l'alumnat.
             </p>
             <div class="flex items-center gap-3 bg-[#E1E5F2]/20 px-5 py-2.5 rounded-2xl border border-[#E1E5F2]/40">
                <BarChart3 :size="16" class="text-[#1F7A8C]" />
                <span class="text-[10px] font-black text-[#022B3A]/40 uppercase tracking-widest">Mòdul d'Avaluació Docent</span>
             </div>
          </div>
        </template>

      </main>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #E1E5F2;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #BFDBF7;
}

/* Chrome, Safari, Edge, Opera */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>

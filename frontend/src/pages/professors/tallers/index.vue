<script setup>
// ======================================
// Importem les dependències
// ======================================
import { ref, computed, watch } from 'vue';
import { 
  Search, 
  LayoutGrid, 
  List, 
  Filter, 
  Users, 
  MapPin, 
  Clock, 
  School, 
  UserPlus, 
  ArrowLeft,
  Mail,
  MoreVertical,
  ClipboardList,
  X,
  Save,
  User,
  CheckCircle2,
  Calendar,
  Info,
  Trash2
} from 'lucide-vue-next';

// ======================================
// Configuració i Serveis
// ======================================

// 1. Configuració de la capçalera
const headerStore = useHeaderStore();
headerStore.setHeaderProfessors();

// 2. Instància del router per a la navegació
const router = useRouter();

// 3. Cookie d'autenticació
const tokenCookie = useCookie('authToken');
const tokenRef = tokenCookie.value;

// 4. Petició a l'API per obtenir els tallers (sense desestructuració)
const opcionsCapçalera = {};
if (tokenRef) {
  opcionsCapçalera.Authorization = 'Bearer ' + tokenRef;
}

const resultatTallers = await useFetch('/api/professor/tallers', {
  headers: opcionsCapçalera,
  key: 'professor-tallers-catalog'
});

// ======================================
// Estat Reactiu del Component
// ======================================

const searchQuery = ref('');
const viewMode = ref('grid'); 
const selectedWorkshopId = ref(null);
const currentPage = ref(1);
const itemsPerPage = 10;

const showAddModal = ref(false);
const newStudents = ref([]);
const studentsList = ref([]); 
const isSaving = ref(false);

// ======================================
// Propietats Computades (Anàlisi de dades)
// ======================================

// 1. Llista base de tallers (Sense desestructuració)
const tallersList = computed(function () {
  let llista = [];
  if (resultatTallers.data) {
    if (resultatTallers.data.value) {
      llista = resultatTallers.data.value;
    }
  }
  return llista;
});

// 2. Filtre de tallers assignats i gestionables (Bucle for clàssic)
const assignedTallers = computed(function () {
  const llistaT = tallersList.value;
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

// 3. Filtre final i mapeig per a la interfície (Bucle for clàssic)
const filteredWorkshops = computed(function () {
  const queryRaw = searchQuery.value;
  let textBusca = '';
  if (queryRaw) {
    textBusca = queryRaw.toLowerCase().trim();
  }
  
  const llistaAssigned = assignedTallers.value;
  const resultatFiltrat = [];
  
  for (let j = 0; j < llistaAssigned.length; j++) {
    const t = llistaAssigned[j];
    let coincideix = false;
    
    if (textBusca === '') {
      coincideix = true;
    } else {
      let tTitol = '';
      if (t.titol) { tTitol = t.titol.toLowerCase(); }
      
      let tCentre = '';
      if (t.nom_centre) { tCentre = t.nom_centre.toLowerCase(); }
      
      if (tTitol.indexOf(textBusca) !== -1) {
        coincideix = true;
      } else if (tCentre.indexOf(textBusca) !== -1) {
        coincideix = true;
      }
    }
    
    if (coincideix === true) {
      // Mapegem manualment a l'estructura requerida per la UI
      const trims = [];
      if (t.trimestre) {
        trims.push(t.trimestre);
      } else {
        trims.push('1r');
        trims.push('2n');
        trims.push('3r');
      }
      
      let dataText = 'Pendent';
      if (t.data_execucio) {
        const dObj = new Date(t.data_execucio);
        dataText = dObj.toLocaleDateString('es-ES');
      }
      
      let pMax = 12;
      if (t.num_participants) { pMax = t.num_participants; }
      else if (t.places_maximes) { pMax = t.places_maximes; }

      const itemUI = {
        id: t.detall_id,
        ref: 'REF-' + String(t.id),
        project: t.sector || 'PROJECTE',
        title: t.titol || 'Taller',
        description: t.descripcio || 'Sense descripció disponible.',
        sector: t.sector,
        places: pMax,
        trimestres: trims,
        center: t.nom_centre || 'Centre Educatiu',
        nextSession: dataText,
        studentsCount: 0 
      };
      resultatFiltrat.push(itemUI);
    }
  }
  return resultatFiltrat;
});

// 4. Taller seleccionat (Per a la vista de detall)
const selectedWorkshop = computed(function () {
  const idBusca = selectedWorkshopId.value;
  const llistaF = filteredWorkshops.value;
  let tallerTrobat = null;
  for (let k = 0; k < llistaF.length; k++) {
    if (llistaF[k].id === idBusca) {
      tallerTrobat = llistaF[k];
      break;
    }
  }
  return tallerTrobat;
});

// 5. Càlcul del total de pàgines per a la paginació
const totalPages = computed(function () {
  const totalItems = filteredWorkshops.value.length;
  let nPagines = 1;
  if (totalItems > 0) {
    nPagines = Math.ceil(totalItems / itemsPerPage);
  }
  return nPagines;
});

// 6. Tallers que es mostren a la pàgina actual (Sense .slice)
const paginatedWorkshops = computed(function () {
  const llistaTota = filteredWorkshops.value;
  const inici = (currentPage.value - 1) * itemsPerPage;
  const fi = inici + itemsPerPage;
  
  const resultatPagina = [];
  for (let m = 0; m < llistaTota.length; m++) {
    if (m >= inici) {
      if (m < fi) {
        resultatPagina.push(llistaTota[m]);
      }
    }
  }
  return resultatPagina;
});

// 7. Estat de càrrega i d'error del component
const pendent = computed(function () {
  let isPendent = false;
  if (resultatTallers.pending) {
    if (resultatTallers.pending.value === true) {
      isPendent = true;
    }
  }
  return isPendent;
});

const errorFetch = computed(function () {
  let isError = false;
  if (resultatTallers.error) {
    if (resultatTallers.error.value) {
      isError = true;
    }
  }
  return isError;
});

const textError = computed(function () {
  let msg = '';
  if (resultatTallers.error) {
    if (resultatTallers.error.value) {
      if (resultatTallers.error.value.message) {
        msg = resultatTallers.error.value.message;
      }
    }
  }
  return msg;
});

// ======================================
// Vigilants (Watchers)
// ======================================

// 1. Quan canviem la cerca, tornem a la pàgina número 1
watch(searchQuery, function () {
  currentPage.value = 1;
});

// ======================================
// Declaracions de funcions
// ======================================

// A) --- Gestió d'estils i formats visuals ---

function getProjectStyles(sectorText) {
  if (!sectorText) { return 'bg-white/40 text-[#022B3A] border-white/60'; }
  const sUpper = String(sectorText).toUpperCase();
  
  if (sUpper.indexOf('A') !== -1 || sUpper.indexOf('MANUF') !== -1) { return 'bg-[#FFF0EB] text-[#FB6107] border-[#FB6107]/20'; }
  if (sUpper.indexOf('B') !== -1 || sUpper.indexOf('ENER') !== -1) { return 'bg-[#F0F7E9] text-[#7CB518] border-[#7CB518]/20'; }
  if (sUpper.indexOf('C') !== -1 || sUpper.indexOf('AGRO') !== -1) { return 'bg-[#FFF7E6] text-[#FBB02D] border-[#FBB02D]/20'; }
  
  return 'bg-white/40 text-[#022B3A] border-white/60';
}

function getAttendenceStyles(estatAssistit) {
  if (estatAssistit === true) {
    return 'bg-[#F0F7E9] text-[#7CB518] border-[#7CB518]/20 hover:bg-[#7CB518] hover:text-white';
  }
  return 'bg-red-50 text-red-400 border-red-200 hover:bg-red-400 hover:text-white';
}

// B) --- Accions de la interfície i gestió d'alumnat ---

function handleBackToCatalog() {
  selectedWorkshopId.value = null;
  studentsList.value = [];
}

async function handleSelectWorkshop(idWorkshop) {
  selectedWorkshopId.value = idWorkshop;
  try {
    const headersAPI = {};
    if (tokenRef) {
      headersAPI.Authorization = 'Bearer ' + tokenRef;
    }
    
    // Obtenim la llista d'alumnes del servidor
    const dadesAlumnes = await $fetch('/api/professor/tallers/' + idWorkshop + '/alumnes', {
      headers: headersAPI
    });
    studentsList.value = dadesAlumnes || [];
  } catch (errAlumnes) {
    console.error("Error carregant alumnes del taller:", errAlumnes);
    studentsList.value = [];
  }
}

function openAddStudentsModal() {
  if (!selectedWorkshop.value) { return; }
  
  // Inicialitzem el formulari amb una sola fila per defecte
  const alumneNouInici = {
    id: Date.now(),
    nom: '', 
    cognoms: '', 
    email: ''
  };
  newStudents.value = [alumneNouInici];
  showAddModal.value = true;
}

function addNewStudentRow() {
  const tallerActualObj = selectedWorkshop.value;
  const nMaxim = tallerActualObj.places;
  const nActuals = studentsList.value.length;
  const nNous = newStudents.value.length;
  
  if ((nActuals + nNous) >= nMaxim) {
    const alertaSwal = useSwal();
    alertaSwal.fire({ title: 'Atenció', text: "S'ha arribat al límit de places del taller.", icon: 'warning' });
    return;
  }
  
  const filaNova = {
    id: Date.now(),
    nom: '', 
    cognoms: '', 
    email: ''
  };
  newStudents.value.push(filaNova);
}

function removeStudentRow(indexFila) {
  if (newStudents.value.length > 1) {
    newStudents.value.splice(indexFila, 1);
  }
}

async function handleSaveNewStudents() {
  if (!selectedWorkshopId.value) { return; }
  
  const llistaPendents = newStudents.value;
  const alumnesValidsPelPost = [];
  
  // Filtrem només els que tenen el nom omplert (Bucle for)
  for (let n = 0; n < llistaPendents.length; n++) {
    const sPend = llistaPendents[n];
    if (sPend.nom) {
      if (sPend.nom.trim() !== '') {
        alumnesValidsPelPost.push(sPend);
      }
    }
  }
    
  if (alumnesValidsPelPost.length === 0) {
    const swalAtencio = useSwal();
    swalAtencio.fire({ title: 'Atenció', text: "Si us plau, ompli almenys el nom d'un alumne.", icon: 'warning' });
    return;
  }

  isSaving.value = true;
  try {
    const headersGuardat = {};
    if (tokenRef) {
      headersGuardat.Authorization = 'Bearer ' + tokenRef;
    }

    await $fetch('/api/professor/tallers/' + selectedWorkshopId.value + '/alumnes', {
      method: 'POST',
      headers: headersGuardat,
      body: { alumnes: alumnesValidsPelPost }
    });
    
    showAddModal.value = false;
    // Refresquem la llista d'alumnes del taller un cop desat
    handleSelectWorkshop(selectedWorkshopId.value);
    
  } catch (errDesar) {
    console.error("Error guardant nous alumnes:", errDesar);
    let msgErrorD = "No s'han pogut registrar els alumnes. Revisa els límits de places.";
    if (errDesar.data) {
      if (errDesar.data.message) {
        msgErrorD = errDesar.data.message;
      }
    }
    const swalErrorD = useSwal();
    swalErrorD.fire({ title: 'Error', text: msgErrorD, icon: 'error' });
  } finally {
    isSaving.value = false;
  }
}

async function handleDeleteStudent(idAlumne) {
  const swalConfirmarD = useSwal();
  const resultatConfirm = await swalConfirmarD.fire({ 
    title: 'Confirmar', 
    text: "Estàs segur que vols eliminar aquest alumne de la llista?", 
    icon: 'question', 
    showCancelButton: true, 
    confirmButtonText: 'Sí' 
  });
  
  if (resultatConfirm.isConfirmed === false) {
    return;
  }

  try {
    const headersEliminar = {};
    if (tokenRef) {
      headersEliminar.Authorization = 'Bearer ' + tokenRef;
    }

    await $fetch('/api/professor/tallers/' + selectedWorkshopId.value + '/alumnes/' + idAlumne, {
      method: 'DELETE',
      headers: headersEliminar
    });
    
    // Refresquem la llista localment
    handleSelectWorkshop(selectedWorkshopId.value);
    
  } catch (errEliminar) {
    console.error("Error eliminant l'alumne:", errEliminar);
    const swalErrorEliminar = useSwal();
    swalErrorEliminar.fire({ title: 'Error', text: "No s'ha pogut eliminar l'alumne.", icon: 'error' });
  }
}

// C) --- Navegació entre pàgines ---

function goToPage(pNum) {
  const maxP = totalPages.value;
  if (pNum >= 1) {
    if (pNum <= maxP) {
      currentPage.value = pNum;
    }
  }
}

// D) --- Utilitats de format per al Template ---

function inicialsAlumneUI(nomU, cognomsU) {
  let iniU = '?';
  if (nomU) {
    if (cognomsU) {
      iniU = nomU.charAt(0) + cognomsU.charAt(0);
    } else {
      iniU = nomU.charAt(0);
    }
  }
  return iniU.toUpperCase();
}

function percentatgeCapacitat(numActual, numTotal) {
  if (!numTotal) { return '0%'; }
  const percent = (numActual / numTotal) * 100;
  return String(percent) + '%';
}
</script>

<template>
  <div class="animate-in fade-in slide-in-from-bottom-4 duration-500">
    
    <!-- ====================================== -->
    <!-- 1. Estats Globals de Càrrega i Error   -->
    <!-- ====================================== -->
    
    <div v-if="pendent === true" class="p-20 text-center text-[#022B3A]/40 font-bold uppercase tracking-widest text-xs">
        Carregant catàleg...
    </div>

    <div v-else-if="errorFetch === true" class="bg-red-50 border border-red-100 p-8 rounded-2xl text-red-600 text-center italic">
        Error al carregar les dades: {{ textError }}
    </div>

    <div v-else>
        <!-- ====================================== -->
        <!-- 2. VISTA DE DETALL (LLISTA D'ALUMNES)  -->
        <!-- ====================================== -->
        <section v-if="selectedWorkshopId && selectedWorkshop" class="relative">
            <!-- Capçalera de navegació de detall -->
            <header class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
              <div>
                <button 
                  @click="handleBackToCatalog"
                  class="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#022B3A]/40 hover:text-[#1F7A8C] transition-colors mb-3"
                >
                  <ArrowLeft :size="14" class="group-hover:-translate-x-1 transition-transform" />
                  Tornar al catàleg
                </button>
                <h1 class="text-4xl font-black text-[#022B3A] tracking-tight leading-none">
                  {{ selectedWorkshop.title }}
                </h1>
                <div class="flex items-center gap-3 mt-2">
                    <span :class="['px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border', getProjectStyles(selectedWorkshop.project)]">
                        {{ selectedWorkshop.project }}
                    </span>
                    <span class="text-[#022B3A]/40 text-xs font-medium flex items-center gap-1">
                        <School :size="12" /> {{ selectedWorkshop.center }}
                    </span>
                </div>
              </div>
              
              <button 
                @click="openAddStudentsModal"
                class="flex items-center gap-2 px-6 py-3 bg-[#022B3A] text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#1F7A8C] transition-all shadow-xl shadow-[#022B3A]/10 group"
              >
                <UserPlus :size="16" class="text-[#1F7A8C] group-hover:text-white transition-colors" />
                Afegir Alumnes
              </button>
            </header>

            <!-- Taula d'alumnes -->
            <div class="bg-white rounded-2xl border border-[#BFDBF7]/60 shadow-sm overflow-hidden">
              <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                  <thead>
                    <tr class="bg-[#E1E5F2]/20 border-b border-[#BFDBF7]/20">
                      <th class="p-6 pl-8 text-[9px] font-black text-[#022B3A]/40 uppercase tracking-[0.2em]">Nom Complet</th>
                      <th class="p-6 text-[9px] font-black text-[#022B3A]/40 uppercase tracking-[0.2em]">Contacte</th>
                      <th class="p-6 text-[9px] font-black text-[#022B3A]/40 uppercase tracking-[0.2em] text-center">Assistència</th>
                      <th class="p-6 pr-8 text-right text-[9px] font-black text-[#022B3A]/40 uppercase tracking-[0.2em]">Accions</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-[#BFDBF7]/10">
                    <template v-if="studentsList.length > 0">
                        <tr v-for="student in studentsList" :key="student.id" class="hover:bg-[#E1E5F2]/5 transition-colors group">
                            <td class="p-5 pl-8">
                                <div class="flex items-center gap-3">
                                    <div class="w-8 h-8 rounded-lg bg-[#1F7A8C]/10 text-[#1F7A8C] flex items-center justify-center font-black text-xs border border-[#1F7A8C]/20 tracking-widest group-hover:bg-[#1F7A8C] group-hover:text-white transition-colors">
                                        {{ inicialsAlumneUI(student.nom, student.cognoms) }}
                                    </div>
                                    <div>
                                        <p class="text-sm font-bold text-[#022B3A]">{{ student.nom }} {{ student.cognoms }}</p>
                                        <p class="text-[10px] text-[#022B3A]/40 font-medium">ID: ST-{{ String(student.id).padStart(3,'0') }}</p>
                                    </div>
                                </div>
                            </td>
                            <td class="p-5">
                              <div class="flex items-center gap-2 text-[#022B3A]/60 bg-white border border-[#BFDBF7]/40 px-3 py-1.5 rounded-lg w-fit">
                                <Mail :size="12" />
                                <span class="text-[11px] font-medium">{{ student.email }}</span>
                              </div>
                            </td>
                            <td class="p-5 text-center">
                              <button :class="['inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all', getAttendenceStyles(student.ha_assistit)]">
                                <CheckCircle2 v-if="student.ha_assistit === true" :size="10" />
                                <X v-else :size="10" />
                                <span v-if="student.ha_assistit === true">Present</span>
                                <span v-else>Absent</span>
                              </button>
                            </td>
                            <td class="p-5 pr-8 text-right">
                              <button 
                                @click="handleDeleteStudent(student.id)"
                                class="p-2 text-[#022B3A]/20 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                title="Eliminar alumne"
                              >
                                <Trash2 :size="16" />
                              </button>
                            </td>
                        </tr>
                    </template>
                    <tr v-else>
                        <td colspan="4" class="p-10 text-center text-[#022B3A]/40 text-sm italic">
                            No hi ha alumnes registrats en aquest taller.
                        </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div v-if="selectedWorkshop" class="p-4 bg-[#E1E5F2]/10 border-t border-[#BFDBF7]/20 flex justify-between items-center px-8">
                 <span class="text-[10px] font-bold text-[#022B3A]/30 uppercase tracking-widest">Capacitat: {{ studentsList.length }} / {{ selectedWorkshop.places }}</span>
                 <div class="h-1.5 w-32 bg-[#BFDBF7]/20 rounded-full overflow-hidden">
                    <div class="h-full bg-[#1F7A8C]" :style="{ width: percentatgeCapacitat(studentsList.length, selectedWorkshop.places) }"></div>
                 </div>
              </div>
            </div>

            <!-- MODAL: REGISTRE D'ALUMNES (PAS 2.1) -->
            <div v-if="showAddModal === true" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
                 <div class="absolute inset-0 bg-[#022B3A]/60 backdrop-blur-sm animate-in fade-in duration-200" @click="showAddModal = false"></div>
                 <div class="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-300 flex flex-col max-h-[85vh]">
                    <div class="p-8 border-b border-[#BFDBF7]/20 flex justify-between items-start bg-white">
                       <div>
                          <h2 class="text-2xl font-black text-[#022B3A] tracking-tight">Registrar Nous Alumnes</h2>
                          <p class="text-[#022B3A]/40 text-[11px] font-bold uppercase tracking-wider mt-1">
                             {{ selectedWorkshop.title }} — {{ selectedWorkshop.project }}
                          </p>
                       </div>
                       <button @click="showAddModal = false" class="p-2 text-[#022B3A]/20 hover:text-[#022B3A] hover:bg-[#E1E5F2]/20 rounded-lg transition-all">
                          <X :size="20" />
                       </button>
                    </div>
                    <div class="p-8 bg-[#F9FAFC] overflow-y-auto flex-1 space-y-4">
                       <div class="flex items-center justify-between mb-4 p-4 bg-[#1F7A8C]/5 border border-[#1F7A8C]/10 rounded-xl text-[#1F7A8C]">
                          <div class="flex items-center gap-2">
                             <Info :size="16" />
                             <span class="text-[11px] font-bold">Places restants: {{ selectedWorkshop.places - studentsList.length }}</span>
                          </div>
                          <button @click="addNewStudentRow" class="text-[10px] font-black uppercase tracking-widest bg-white px-4 py-2 rounded-lg border border-[#1F7A8C]/30 hover:bg-[#1F7A8C] hover:text-white transition-all">
                             + Afegir Fila
                          </button>
                       </div>
                       <div v-for="(student, index) in newStudents" :key="student.id" class="flex flex-col md:flex-row gap-4 items-center bg-white p-5 rounded-xl border border-[#BFDBF7]/40 shadow-sm group hover:border-[#1F7A8C]/30 transition-all relative">
                              <div class="hidden md:flex w-8 h-8 rounded-lg bg-[#E1E5F2]/20 text-[#022B3A]/30 items-center justify-center text-[10px] font-black border border-[#BFDBF7]/20 flex-shrink-0 group-hover:bg-[#1F7A8C]/10 group-hover:text-[#1F7A8C] transition-colors">{{ index + 1 }}</div>
                              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                                  <div class="space-y-1">
                                      <label class="text-[8px] font-black text-[#022B3A]/30 uppercase tracking-widest ml-1">Nom</label>
                                      <div class="relative">
                                          <User :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-[#022B3A]/20" />
                                          <input type="text" v-model="student.nom" class="w-full bg-[#E1E5F2]/5 border border-[#BFDBF7]/60 rounded-lg pl-9 pr-3 py-2.5 text-sm font-bold text-[#022B3A] focus:bg-white focus:ring-2 focus:ring-[#1F7A8C]/20 focus:border-[#1F7A8C] outline-none transition-all" placeholder="Nom" />
                                      </div>
                                  </div>
                                  <div class="space-y-1">
                                      <label class="text-[8px] font-black text-[#022B3A]/30 uppercase tracking-widest ml-1">Cognoms</label>
                                      <input type="text" v-model="student.cognoms" class="w-full bg-[#E1E5F2]/5 border border-[#BFDBF7]/60 rounded-lg px-4 py-2.5 text-sm font-bold text-[#022B3A] focus:bg-white focus:ring-2 focus:ring-[#1F7A8C]/20 focus:border-[#1F7A8C] outline-none transition-all" placeholder="Cognoms" />
                                  </div>
                                  <div class="space-y-1">
                                      <label class="text-[8px] font-black text-[#022B3A]/30 uppercase tracking-widest ml-1">Email</label>
                                      <div class="relative">
                                          <Mail :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-[#022B3A]/20" />
                                          <input type="email" v-model="student.email" class="w-full bg-[#E1E5F2]/5 border border-[#BFDBF7]/60 rounded-lg pl-9 pr-3 py-2.5 text-sm font-bold text-[#022B3A] focus:bg-white focus:ring-2 focus:ring-[#1F7A8C]/20 focus:border-[#1F7A8C] outline-none transition-all" placeholder="alumne@centre.cat" />
                                      </div>
                                  </div>
                              </div>
                              <button v-if="newStudents.length > 1" @click="removeStudentRow(index)" class="absolute -right-2 -top-2 md:relative md:right-0 md:top-0 p-2 text-red-400 hover:text-red-600 bg-white md:bg-transparent rounded-full shadow-sm md:shadow-none border border-red-100 md:border-none transition-colors">
                                 <X :size="16" />
                              </button>
                       </div>
                    </div>
                    <div class="p-6 bg-white border-t border-[#BFDBF7]/20 flex justify-end gap-3 flex-shrink-0">
                       <button @click="showAddModal = false" :disabled="isSaving" class="px-8 py-3 rounded-xl text-[10px] font-black text-[#022B3A]/40 uppercase tracking-widest hover:text-[#022B3A] hover:bg-[#E1E5F2]/20 transition-all disabled:opacity-50">Cancel·lar</button>
                       <button @click="handleSaveNewStudents" :disabled="isSaving" class="px-8 py-3 bg-[#1F7A8C] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#022B3A] shadow-lg shadow-[#1F7A8C]/20 transition-all flex items-center gap-2 disabled:bg-[#022B3A]/30">
                          <template v-if="isSaving === false">
                             <Save :size="16" />Guardar Registres
                          </template>
                          <template v-else>
                             <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                             Guardant...
                          </template>
                       </button>
                    </div>
                 </div>
              </div>
        </section>

        <!-- ====================================== -->
        <!-- 3. VISTA DE CATÀLEG (GRAELLA DE TALLERS) -->
        <!-- ====================================== -->
        <div v-else class="space-y-8">
          
          <div class="mb-8">
            <h1 class="text-4xl md:text-5xl font-black text-[#022B3A] tracking-tighter leading-none mb-3">
              Afegir <span class="text-[#1F7A8C]">Alumnes</span>
            </h1>
            <p class="text-[#022B3A]/40 text-[10px] font-black uppercase tracking-[0.2em]">
              Gestió d'alumnat assignat als tallers del curs.
            </p>
          </div>

          <!-- Barra de cerca i controls de vista -->
          <div class="bg-white p-2 rounded-xl border border-[#BFDBF7]/60 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="relative flex-1 max-w-md group w-full ml-1">
              <Search :size="14" class="absolute left-4 top-1/2 -translate-y-1/2 text-[#022B3A]/20 group-focus-within:text-[#1F7A8C] transition-colors" />
              <input type="text" placeholder="Cercar per títol o centre..." v-model="searchQuery" class="w-full bg-[#E1E5F2]/10 border border-transparent rounded-lg pl-11 pr-4 py-2.5 text-[11px] font-bold focus:bg-white focus:border-[#BFDBF7] focus:ring-4 focus:ring-[#1F7A8C]/5 outline-none transition-all placeholder:text-[#022B3A]/20" />
            </div>
            <div class="flex items-center gap-2 bg-[#E1E5F2]/30 p-1 rounded-lg border border-[#BFDBF7]/20 w-full sm:w-auto justify-center sm:justify-end">
              <div class="flex items-center gap-1 pr-2 border-r border-[#BFDBF7]/30">
                <button 
                  @click="viewMode = 'grid'" 
                  :class="['p-2 rounded-lg shadow-sm border transition-all', { 'text-[#1F7A8C] bg-white border-[#BFDBF7]/40 shadow-sm': viewMode === 'grid', 'text-[#022B3A]/20 border-transparent hover:text-[#022B3A]': viewMode !== 'grid' }]"
                >
                  <LayoutGrid :size="14" />
                </button>
                <button 
                  @click="viewMode = 'list'" 
                  :class="['p-2 rounded-lg shadow-sm border transition-all', { 'text-[#1F7A8C] bg-white border-[#BFDBF7]/40 shadow-sm': viewMode === 'list', 'text-[#022B3A]/20 border-transparent hover:text-[#022B3A]': viewMode !== 'list' }]"
                >
                  <List :size="14" />
                </button>
              </div>
            </div>
          </div>

          <!-- Llistat de tallers filtrats -->
          <div v-if="filteredWorkshops.length > 0" :class="viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'flex flex-col gap-3'">
            <template v-for="workshop in paginatedWorkshops" :key="workshop.id">
              
              <!-- Targeta en vista llista -->
              <div v-if="viewMode === 'list'" class="bg-white rounded-xl border border-[#E1E5F2] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-8 hover:shadow-lg transition-all hover:border-[#BFDBF7] group">
                 <div class="flex items-center gap-4 flex-1 min-w-0">
                    <div :class="['w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center font-black text-[9px] uppercase border tracking-widest', getProjectStyles(workshop.project)]">
                        {{ workshop.project }}
                    </div>
                    <div class="min-w-0">
                        <div class="flex items-center gap-3 mb-0.5">
                            <h3 class="text-base font-black text-[#022B3A] truncate">{{ workshop.title }}</h3>
                            <span class="hidden sm:inline-block px-2 py-0.5 bg-[#F4F7FB] border border-[#E1E5F2] rounded text-[9px] font-black text-[#022B3A]/50 uppercase tracking-widest">{{ workshop.center }}</span>
                        </div>
                        <p class="text-[11px] font-medium text-[#8E9AAF] truncate">{{ workshop.description }}</p>
                    </div>
                 </div>
                 <div class="hidden lg:flex items-center gap-8 flex-shrink-0">
                    <div class="flex flex-col items-end min-w-[60px]">
                        <span class="text-[9px] font-black text-[#B8C0CC] uppercase tracking-widest">Alumnes</span>
                        <span class="text-xs font-bold text-[#022B3A]">{{ workshop.studentsCount }} / {{ workshop.places }}</span>
                    </div>
                    <div class="flex flex-col items-end min-w-[80px]">
                        <span class="text-[9px] font-black text-[#B8C0CC] uppercase tracking-widest">Data</span>
                        <span class="text-xs font-bold text-[#022B3A]">{{ workshop.nextSession }}</span>
                    </div>
                 </div>
                 <div class="flex items-center justify-end gap-3 md:border-l md:border-[#F1F4F9] md:pl-6">
                    <span class="hidden md:block text-[9px] font-black text-[#B8C0CC] tracking-widest uppercase mr-2">{{ workshop.ref }}</span>
                    <button @click="handleSelectWorkshop(workshop.id)" class="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all shadow-md bg-[#1F7A8C] text-white hover:bg-[#022B3A] shadow-[#1F7A8C]/20 hover:scale-105">
                        <ClipboardList :size="14" :strokeWidth="2" />LLISTAT
                    </button>
                 </div>
              </div>

              <!-- Targeta en vista graella -->
              <div v-else class="bg-white rounded-2xl border border-[#E1E5F2] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full overflow-hidden group">
                <div class="p-6 pb-4 flex justify-between items-center">
                    <span :class="['px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.1em] border', getProjectStyles(workshop.project)]">{{ workshop.project }}</span>
                    <div class="flex items-center gap-2">
                        <div class="w-1.5 h-1.5 rounded-full bg-[#7CB518] animate-pulse"></div>
                        <span class="text-[9px] font-black text-[#022B3A]/40 uppercase tracking-widest">En Curs</span>
                    </div>
                </div>
                <div class="px-6 flex-1">
                    <h3 class="text-xl font-black text-[#022B3A] mb-2 leading-tight group-hover:text-[#1F7A8C] transition-colors">{{ workshop.title }}</h3>
                    <p class="text-[#022B3A]/50 text-xs font-medium leading-relaxed mb-6 line-clamp-2">{{ workshop.description }}</p>
                    <div class="space-y-3 mb-6">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-2 text-[#022B3A]/30">
                                <School :size="14" /><span class="text-[9px] font-black uppercase tracking-widest">Centre Assignat</span>
                            </div>
                            <span class="text-[11px] font-bold text-[#022B3A]">{{ workshop.center }}</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-2 text-[#022B3A]/30">
                                <Calendar :size="14" /><span class="text-[9px] font-black uppercase tracking-widest">Data Taller</span>
                            </div>
                            <span class="text-[11px] font-bold text-[#022B3A]">{{ workshop.nextSession }}</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-2 text-[#022B3A]/30">
                                <Users :size="14" /><span class="text-[9px] font-black uppercase tracking-widest">Alumnes</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <div class="w-16 h-1.5 bg-[#E1E5F2] rounded-full overflow-hidden">
                                    <div class="h-full bg-[#1F7A8C]" :style="{ width: percentatgeCapacitat(workshop.studentsCount, workshop.places) }"></div>
                                </div>
                                <span class="text-[11px] font-bold text-[#022B3A]">{{ workshop.studentsCount }}/{{ workshop.places }}</span>
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-wrap gap-2 mb-6">
                        <span v-for="tNum in workshop.trimestres" :key="tNum" class="px-2 py-1 bg-[#E1E5F2]/20 border border-[#BFDBF7]/30 rounded-md text-[9px] font-bold text-[#022B3A]/60 uppercase">
                            {{ tNum }} Trimestre
                        </span>
                    </div>
                </div>
                <div class="px-6 py-4 bg-[#F9FAFC] border-t border-[#F1F4F9] flex items-center justify-between mt-auto">
                    <span class="text-[10px] font-black text-[#B8C0CC] tracking-widest uppercase">{{ workshop.ref }}</span>
                    <button @click="handleSelectWorkshop(workshop.id)" class="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all shadow-lg bg-[#1F7A8C] text-white shadow-[#1F7A8C]/20 hover:bg-[#166070] hover:scale-105">
                        <ClipboardList :size="14" :strokeWidth="2" />LLISTAT
                    </button>
                </div>
              </div>
            </template>
            <div class="mt-8 flex justify-center col-span-full">
              <Pagination :current-page="currentPage" :total-pages="totalPages" @go-to-page="goToPage" />
            </div>
          </div>
          <div v-else class="p-20 text-center text-[#022B3A]/40 font-bold uppercase tracking-widest text-xs italic border-2 border-dashed border-[#E1E5F2] rounded-3xl">
              No s'han trobat tallers assignats.
          </div>
        </div>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;  
  overflow: hidden;
  line-clamp: 2;
}
</style>

<template>
  <!-- 1. Contenidor principal de la pàgina -->
  <div class="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
    
    <!-- 2. Secció de la capçalera -->
    <!-- 1. Títol i descripció de la secció de validació -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div>
        <h1 class="text-4xl md:text-5xl font-black text-[#022B3A] tracking-tighter leading-none mb-3">
          Validació de <span class="text-[#1F7A8C]">Registres</span>
        </h1>
        <p class="text-[#022B3A]/40 text-[10px] font-black uppercase tracking-[0.2em]">
          Gestiona les sol·licituds d'alta de nous centres educatius a la plataforma.
        </p>
      </div>
    </div>

    <!-- 3. Targetes d'indicadors clau (KPI) -->
    <!-- 1. Graella de targetes amb les mètriques -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
       <!-- Targeta de sol·licituds pendents -->
       <div class="bg-white p-6 rounded-2xl border border-[#BFDBF7] shadow-sm flex items-center gap-5">
          <div class="w-12 h-12 rounded-xl bg-[#fb6107]/10 text-[#fb6107] flex items-center justify-center">
             <Clock :size="24" />
          </div>
          <div>
             <p class="text-3xl font-black text-[#022B3A] leading-none">{{ totalPendents }}</p>
             <p class="text-[10px] font-bold text-[#022B3A]/40 uppercase tracking-widest mt-1">Pendents de validar</p>
          </div>
       </div>
       
       <!-- Targeta de sol·licituds acceptades -->
       <div class="bg-white p-6 rounded-2xl border border-[#BFDBF7] shadow-sm flex items-center gap-5">
          <div class="w-12 h-12 rounded-xl bg-[#1F7A8C]/10 text-[#1F7A8C] flex items-center justify-center">
             <Check :size="24" :strokeWidth="3" />
          </div>
          <div>
             <p class="text-3xl font-black text-[#022B3A] leading-none">{{ totalAcceptats }}</p>
             <p class="text-[10px] font-bold text-[#022B3A]/40 uppercase tracking-widest mt-1">Acceptats Total</p>
          </div>
       </div>

       <!-- Targeta del total de sol·licituds -->
       <div class="bg-white p-6 rounded-2xl border border-[#BFDBF7] shadow-sm flex items-center gap-5">
          <div class="w-12 h-12 rounded-xl bg-[#022B3A]/5 text-[#022B3A]/40 flex items-center justify-center">
             <FileText :size="24" />
          </div>
          <div>
             <p class="text-3xl font-black text-[#022B3A] leading-none">{{ totalPeticions }}</p>
             <p class="text-[10px] font-bold text-[#022B3A]/40 uppercase tracking-widest mt-1">Total Sol·licituds</p>
          </div>
       </div>
    </div>

    <!-- 4. Barra de controls (Cerca i modes de vista) -->
    <!-- 1. Contenidor blanc que agrupa els controls -->
    <div class="bg-white p-2 rounded-xl border border-[#BFDBF7]/60 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
      <!-- Quadre de cerca -->
      <div class="relative flex-1 max-w-lg group w-full ml-1">
        <Search :size="14" class="absolute left-4 top-1/2 -translate-y-1/2 text-[#022B3A]/20 group-focus-within:text-[#1F7A8C] transition-colors" />
        <input 
          type="text" 
          placeholder="Cerca per nom, codi, email o coordinador..."
          v-model="searchQuery"
          class="w-full bg-[#E1E5F2]/10 border border-transparent rounded-lg pl-11 pr-4 py-2.5 text-[11px] font-bold focus:bg-white focus:border-[#BFDBF7] focus:ring-4 focus:ring-[#1F7A8C]/5 outline-none transition-all placeholder:text-[#022B3A]/20 text-[#022B3A]"
        />
      </div>

      <!-- Botons de canvi de vista -->
      <div class="flex items-center gap-2 bg-[#E1E5F2]/30 p-1 rounded-lg border border-[#BFDBF7]/20 w-full sm:w-auto justify-center sm:justify-end">
        <div class="flex items-center gap-1 pr-2 border-r border-[#BFDBF7]/30">
          <!-- Botó Vista de Graella -->
          <button 
            @click="viewMode = 'grid'"
            class="p-2 rounded-md shadow-sm border transition-all"
            :class="{
              'text-[#1F7A8C] bg-white border-[#BFDBF7]/40 shadow-sm': viewMode === 'grid',
              'text-[#022B3A]/20 border-transparent hover:text-[#022B3A]': viewMode !== 'grid'
            }"
          >
            <LayoutGrid :size="14" />
          </button>
          <!-- Botó Vista de Llista -->
          <button 
            @click="viewMode = 'list'"
            class="p-2 rounded-md shadow-sm border transition-all"
            :class="{
              'text-[#1F7A8C] bg-white border-[#BFDBF7]/40 shadow-sm': viewMode === 'list',
              'text-[#022B3A]/20 border-transparent hover:text-[#022B3A]': viewMode !== 'list'
            }"
          >
            <List :size="14" />
          </button>
        </div>
      </div>
    </div>

    <!-- 5. Contingut de les sol·licituds -->
    <!-- 1. Contenidor amb disposició dinàmica segons el mode de vista -->
    <div 
      :class="{
        'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6': viewMode === 'grid',
        'flex flex-col gap-3': viewMode !== 'grid'
      }"
    >
      <!-- Bucle per a cada sol·licitud paginada -->
      <template v-for="req in paginatedRequests" :key="req.id">
        
        <!-- VISTA DE GRAELLA -->
        <!-- 1. Targeta individual en mode graella -->
        <div 
          v-if="viewMode === 'grid'"
          class="bg-white rounded-2xl border border-[#E1E5F2] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-400 group flex flex-col h-full overflow-hidden relative"
        >
          <!-- Línia decorativa d'estat superior -->
          <div class="absolute top-0 left-0 right-0 h-1 bg-[#fb6107]"></div>

          <!-- Capçalera de la targeta (Codi i Data) -->
          <div class="p-6 pb-4 flex justify-between items-start">
            <span class="px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-[0.1em] border bg-[#F4F7FB] text-[#022B3A]/60 border-[#E1E5F2]">
              {{ req.code }}
            </span>
            <div class="flex items-center gap-1.5 text-[#022B3A]/40">
              <Clock :size="12" />
              <span class="text-[9px] font-bold uppercase tracking-widest">{{ req.date }}</span>
            </div>
          </div>

          <!-- Informació central del centre -->
          <div class="px-6 pb-6 flex-1">
            <h3 class="text-xl font-black text-[#022B3A] mb-2 leading-tight group-hover:text-[#1F7A8C] transition-colors">
              {{ req.centerName }}
            </h3>
            
            <!-- Etiqueta de Nou Registre si escau -->
            <div v-if="req.isFirstTime" class="inline-flex items-center gap-2 bg-[#fb6107]/10 px-3 py-1.5 rounded-lg border border-[#fb6107]/20 mb-6">
                 <Building2 :size="12" class="text-[#fb6107]" />
                 <span class="text-[9px] font-black text-[#fb6107] uppercase tracking-widest">Nou Registre</span>
            </div>

            <!-- Detalls de contacte i coordinador -->
            <div class="space-y-4">
              <div class="flex items-center justify-between border-b border-[#F1F4F9] pb-2">
                <div class="flex items-center gap-2 text-[#B8C0CC]">
                  <User :size="14" />
                  <span class="text-[9px] font-black uppercase tracking-widest">COORDINADOR</span>
                </div>
                <span class="text-[11px] font-bold text-[#022B3A]">{{ req.coordinator }}</span>
              </div>
              <div class="flex items-center justify-between border-b border-[#F1F4F9] pb-2">
                <div class="flex items-center gap-2 text-[#B8C0CC]">
                  <Mail :size="14" />
                  <span class="text-[9px] font-black uppercase tracking-widest">EMAIL</span>
                </div>
                <span class="text-[11px] font-bold text-[#022B3A] lowercase">{{ req.email }}</span>
              </div>
              <div class="flex items-center justify-between border-b border-[#F1F4F9] pb-2">
                <div class="flex items-center gap-2 text-[#B8C0CC]">
                  <Phone :size="14" />
                  <span class="text-[9px] font-black uppercase tracking-widest">TELÈFON</span>
                </div>
                <span class="text-[11px] font-bold text-[#022B3A]">{{ req.phone }}</span>
              </div>
            </div>
          </div>

          <!-- Accions de la targeta (Validar/Rebutjar) -->
          <div class="px-6 py-4 bg-[#F9FAFC] border-t border-[#F1F4F9] flex items-center gap-3 mt-auto">
            <button 
              @click="handleAccept(req.id)"
              class="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-md bg-[#1F7A8C] text-white hover:bg-[#022B3A] shadow-[#1F7A8C]/20 hover:scale-[1.02]"
            >
              <Check :size="14" :strokeWidth="3" /> Validar
            </button>
            <button 
              @click="handleReject(req.id)"
              class="px-4 py-3 bg-white border border-[#FFECEC] text-[#FF4D4D] rounded-xl shadow-sm hover:bg-[#FF4D4D] hover:text-white transition-all flex items-center justify-center active:scale-95 group"
              title="Rebutjar"
            >
              <X :size="16" :strokeWidth="3" />
            </button>
          </div>
        </div>

        <!-- VISTA DE LLISTA -->
        <!-- 1. Fila individual en mode llista -->
        <div 
          v-else
          class="bg-white rounded-xl border border-[#E1E5F2] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-8 hover:shadow-lg transition-all hover:border-[#BFDBF7] group relative overflow-hidden"
        >
          <!-- Línia lateral decorativa -->
          <div class="absolute left-0 top-0 bottom-0 w-1 bg-[#fb6107]"></div>
          
          <!-- Informació principal i de contacte -->
          <div class="flex items-center gap-4 flex-1 min-w-0 pl-4">
            <div class="w-10 h-10 rounded-lg bg-[#fb6107]/10 text-[#fb6107] flex items-center justify-center font-black text-[10px] uppercase border border-[#fb6107]/20 shrink-0">
                <Building2 :size="16" />
            </div>
            <div class="min-w-0">
                <h3 class="text-base font-black text-[#022B3A] truncate">{{ req.centerName }}</h3>
                <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-medium text-[#8E9AAF] mt-0.5">
                   <span class="flex items-center gap-1"><User :size="12" /> {{ req.coordinator }}</span>
                   <span class="flex items-center gap-1"><Mail :size="12" /> {{ req.email }}</span>
                   <span class="flex items-center gap-1"><Phone :size="12" /> {{ req.phone }}</span>
                </div>
            </div>
          </div>

          <!-- Detalls secundaris (Codi i Data) -->
          <div class="hidden lg:flex items-center gap-8 flex-shrink-0">
            <div class="flex flex-col items-end min-w-[80px]">
              <span class="text-[9px] font-black text-[#B8C0CC] uppercase tracking-widest">Codi</span>
              <span class="text-xs font-bold text-[#022B3A]">{{ req.code }}</span>
            </div>
            <div class="flex flex-col items-end min-w-[100px]">
              <span class="text-[9px] font-black text-[#B8C0CC] uppercase tracking-widest">Sol·licitud</span>
              <span class="text-xs font-bold text-[#022B3A]">{{ req.date }}</span>
            </div>
          </div>

          <!-- Botons d'acció en llista -->
          <div class="flex items-center justify-end gap-3 md:border-l md:border-[#F1F4F9] md:pl-6">
            <button 
              @click="handleAccept(req.id)"
              class="flex items-center justify-center gap-2 px-4 py-2 bg-[#F0F7E9] text-[#7CB518] border border-[#7CB518]/20 rounded-lg hover:bg-[#7CB518] hover:text-white transition-all text-[10px] font-black uppercase tracking-widest"
            >
              <Check :size="14" :strokeWidth="3" /> Acceptar
            </button>
            <button 
              @click="handleReject(req.id)"
              class="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-[#FFECEC] text-[#FF4D4D] rounded-lg shadow-sm hover:bg-[#FF4D4D] hover:text-white transition-all text-[10px] font-black uppercase tracking-widest"
            >
              <X :size="14" :strokeWidth="3" /> Rebutjar
            </button>
          </div>
        </div>

      </template>

      <!-- Estat buit -->
      <!-- 1. Missatge que es mostra quan no hi ha sol·licituds pendents -->
      <div v-if="filteredRequests.length === 0" class="col-span-full p-16 text-center border-2 border-dashed border-[#BFDBF7] rounded-3xl bg-[#E1E5F2]/10 flex flex-col items-center justify-center">
         <div class="w-16 h-16 bg-[#BFDBF7]/30 rounded-full flex items-center justify-center mb-4 text-[#022B3A]/30">
            <ShieldAlert :size="32" />
         </div>
         <h3 class="text-lg font-black text-[#022B3A]">Tot al dia</h3>
         <p class="text-[#022B3A]/40 font-medium text-sm">No hi ha sol·licituds de registre pendents de validar.</p>
      </div>
    </div>

    <!-- 6. Paginació -->
    <!-- 1. Control de navegació per pàgines -->
    <div class="mt-8 flex justify-center">
      <Pagination :current-page="currentPage" :total-pages="totalPages" @go-to-page="goToPage" />
    </div>
  </div>
</template>


<script setup>
// ======================================
// Importem les dependències
// ======================================
import { ref, computed, onMounted, watch } from 'vue';
import { 
  ShieldAlert, 
  Clock, 
  Check, 
  FileText, 
  Search, 
  LayoutGrid, 
  List, 
  Building2, 
  User, 
  Mail, 
  Phone, 
  X 
} from 'lucide-vue-next';

// ======================================
// Definició de l'Esquema
// ======================================

// 1. Estat reactiu de la llista de sol·licituds
const solicitudes = ref([]);

// 2. Estat del carregador
const loading = ref(true);

// 3. Cadena de text per a la cerca
const searchQuery = ref('');

// 4. Mode de visualització (graella o llista)
const viewMode = ref('grid');

// 5. Pàgina actual pel paginador
const currentPage = ref(1);

// 6. Elements per pàgina
const itemsPerPage = 10;

// 7. Obtenim la cookie d'autenticació
const tokenCookie = useCookie('authToken');
const token = tokenCookie.value;

// 8. Instància del router
const router = useRouter();

// ======================================
// Declaracions de funcions
// ======================================

// A) --- Vigilant de la cerca per resetejar la pàgina ---
watch(searchQuery, function () {
  // 1. Si la cerca canvia, tornem a la primera pàgina
  currentPage.value = 1;
});

// B) --- Càlcul de les sol·licituds filtrades ---
const filteredRequests = computed(function () {
  // 1. Obtenim la cadena de cerca i la normalitzem
  const cadenaCerca = searchQuery.value;
  const cadenaBaixa = cadenaCerca.toLowerCase();
  const query = cadenaBaixa.trim();
  
  // 2. Filtrem primer les que estan en estat pendent
  const llistaTotes = solicitudes.value;
  const llistaPendents = [];
  for (let i = 0; i < llistaTotes.length; i++) {
    const s = llistaTotes[i];
    const estat = s.estat;
    let estatBaix = '';
    if (estat) {
      estatBaix = estat.toLowerCase();
    }
    if (estatBaix === 'pendent') {
      llistaPendents.push(s);
    }
  }

  // 3. Apliquem el filtre de cerca sobre les pendents
  const resultatsFiltrats = [];
  for (let j = 0; j < llistaPendents.length; j++) {
    const solicitud = llistaPendents[j];
    
    // Obtenim les propietats per comparar
    const nomCentreManual = solicitud.nom_centre_manual;
    const nomCentreReal = solicitud.nom_centre;
    let nomOriginal = '';
    if (nomCentreManual) {
      nomOriginal = nomCentreManual;
    } else {
      nomOriginal = nomCentreReal;
    }
    if (nomOriginal === null || nomOriginal === undefined) {
      nomOriginal = '';
    }
    const nom = nomOriginal.toLowerCase();
    
    let codiOriginal = solicitud.codi_centre;
    if (codiOriginal === null || codiOriginal === undefined) {
      codiOriginal = '';
    }
    const codi = codiOriginal.toLowerCase();
    
    let coordinadorOriginal = solicitud.nom_coordinador;
    if (coordinadorOriginal === null || coordinadorOriginal === undefined) {
      coordinadorOriginal = '';
    }
    const coordinador = coordinadorOriginal.toLowerCase();
    
    let emailOriginal = solicitud.email_coordinador;
    if (emailOriginal === null || emailOriginal === undefined) {
      emailOriginal = '';
    }
    const email = emailOriginal.toLowerCase();

    // Comprovem si coincideix amb la cerca
    let coincideix = false;
    if (nom.includes(query)) {
      coincideix = true;
    } else if (codi.includes(query)) {
      coincideix = true;
    } else if (coordinador.includes(query)) {
      coincideix = true;
    } else if (email.includes(query)) {
      coincideix = true;
    }

    if (coincideix === true) {
      // 4. Mapegem l'objecte al format de la interfície
      let primeraVegada = false;
      if (solicitud.es_primera_vegada) {
        primeraVegada = true;
      }
      
      const itemInterficie = {
        id: solicitud.id,
        code: solicitud.codi_centre,
        date: formatDate(solicitud.data_creacio),
        centerName: nomOriginal,
        isFirstTime: primeraVegada,
        coordinator: solicitud.nom_coordinador,
        email: solicitud.email_coordinador,
        phone: solicitud.telefon
      };
      
      // Corregim valors nuls per defecte
      if (!itemInterficie.code) {
        itemInterficie.code = 'SENSE CODI';
      }
      if (!itemInterficie.centerName) {
        itemInterficie.centerName = 'Centre Sense Nom';
      }
      if (!itemInterficie.coordinator) {
        itemInterficie.coordinator = 'No assignat';
      }
      if (!itemInterficie.email) {
        itemInterficie.email = 'N/A';
      }
      if (!itemInterficie.phone) {
        itemInterficie.phone = 'N/A';
      }
      
      resultatsFiltrats.push(itemInterficie);
    }
  }

  return resultatsFiltrats;
});

// C) --- Càlcul de les sol·licituds paginades ---
const paginatedRequests = computed(function () {
  // 1. Obtenim la llista filtrada
  const llistaFiltrada = filteredRequests.value;
  
  // 2. Calculem l'índex d'inici i final
  const inici = (currentPage.value - 1) * itemsPerPage;
  const final = inici + itemsPerPage;
  
  // 3. Creem la subllista mitjançant un bucle
  const resultatPaginat = [];
  for (let k = inici; k < final; k++) {
    if (k < llistaFiltrada.length) {
      const item = llistaFiltrada[k];
      resultatPaginat.push(item);
    }
  }
  
  return resultatPaginat;
});

// D) --- Càlcul del total de pàgines ---
const totalPages = computed(function () {
  // 1. Obtenim la longitud de la llista filtrada
  const totalElements = filteredRequests.value.length;
  
  // 2. Calculem les pàgines necessàries
  const pagines = Math.ceil(totalElements / itemsPerPage);
  
  // 3. Retornem com a mínim 1 pàgina
  if (pagines < 1) {
    return 1;
  } else {
    return pagines;
  }
});

// E) --- Navegació a una pàgina específica ---
function goToPage(p) {
  // 1. Verifiquem que la pàgina estigui dins del rang
  const maxim = totalPages.value;
  if (p >= 1) {
    if (p <= maxim) {
      // 2. Establim la nova pàgina
      currentPage.value = p;
    }
  }
}

// F) --- Funció per obtenir les dades de l'API ---
async function fetchSolicitudes() {
  // 1. Activem l'estat de càrrega
  loading.value = true;
  
  try {
    // 2. Verifiquem si tenim token d'accés
    if (!token) {
      router.push('/login');
      return;
    }
    
    // 3. Realitzem la crida a l'API
    const resposta = await $fetch('/api/solicituds-registre', {
      headers: { Authorization: 'Bearer ' + token }
    });

    // 4. Assignem els resultats a la variable reactiva
    if (Array.isArray(resposta)) {
      solicitudes.value = resposta;
    } else {
      if (resposta) {
        if (resposta.data) {
          solicitudes.value = resposta.data;
        }
      }
    }
  } catch (errorPeticio) {
    // 5. Gestionem l'error si n'hi ha
    console.error('Error carregant sol·licituds de registre:', errorPeticio);
  } finally {
    // 6. Desactivem l'estat de càrrega
    loading.value = false;
  }
}

// G) --- Manejador per acceptar una sol·licitud ---
async function handleAccept(id) {
  // 1. Demanem confirmació a l'usuari
  const confirmacio = await useSwal().fire({ 
    title: 'Confirmar', 
    text: 'Vols validar aquest registre? Se li enviarà una notificació al centre.', 
    icon: 'question', 
    showCancelButton: true, 
    confirmButtonText: 'Sí' 
  });
  
  // 2. Si l'usuari confirma, actualitzem l'estat
  if (confirmacio.isConfirmed === true) {
    await updateEstado(id, 'acceptada');
  }
}

// H) --- Manejador per rebutjar una sol·licitud ---
async function handleReject(id) {
  // 1. Demanem confirmació a l'usuari
  const confirmacio = await useSwal().fire({ 
    title: 'Confirmar', 
    text: 'Segur que vols rebutjar aquesta sol·licitud?', 
    icon: 'question', 
    showCancelButton: true, 
    confirmButtonText: 'Sí' 
  });
  
  // 2. Si l'usuari confirma, actualitzem l'estat
  if (confirmacio.isConfirmed === true) {
    await updateEstado(id, 'rebutjada');
  }
}

// I) --- Càlcul del total de peticions ---
const totalPeticions = computed(function () {
  // 1. Obtenim la longitud de la llista original
  const longitud = solicitudes.value.length;
  return longitud;
});

// J) --- Càlcul del total de pendents ---
const totalPendents = computed(function () {
  // 1. Definim el comptador
  let comptador = 0;
  const llistaRes = solicitudes.value;
  
  // 2. Iterem la llista
  for (let m = 0; m < llistaRes.length; m++) {
    const s = llistaRes[m];
    const estat = s.estat;
    let estatBaix = '';
    if (estat) {
      estatBaix = estat.toLowerCase();
    }
    if (estatBaix === 'pendent') {
      comptador = comptador + 1;
    }
  }
  
  return comptador;
});

// K) --- Càlcul del total d'acceptats ---
const totalAcceptats = computed(function () {
  // 1. Definim el comptador
  let comptadorAcceptat = 0;
  const llistaRes = solicitudes.value;
  
  // 2. Iterem la llista
  for (let n = 0; n < llistaRes.length; n++) {
    const s = llistaRes[n];
    const estat = s.estat;
    let estatBaix = '';
    if (estat) {
      estatBaix = estat.toLowerCase();
    }
    if (estatBaix === 'acceptada') {
      comptadorAcceptat = comptadorAcceptat + 1;
    }
  }
  
  return comptadorAcceptat;
});

// L) --- Funció interna per actualitzar l'estat en base de dades ---
async function updateEstado(id, estado) {
  try {
    // 1. Enviem la petició PUT al servidor
    await $fetch('/api/solicituds-registre/' + id, {
      method: 'PUT',
      headers: { Authorization: 'Bearer ' + token },
      body: { estat: estado }
    });
    
    // 2. Refresquem la llista local
    await fetchSolicitudes();
    
    // 3. Mostrem missatge d'èxit
    let textMissatge = '';
    if (estado === 'acceptada') {
      textMissatge = 'Sol·licitud acceptada correctament.';
    } else {
      textMissatge = 'Sol·licitud rebutjada.';
    }
    
    useSwal().fire({ 
      title: 'Fet', 
      text: textMissatge, 
      icon: 'success' 
    });
  } catch (errorUpdate) {
    // 4. Gestionem l'error de la petició
    console.error('Error actualitzant estat:', errorUpdate);
    useSwal().fire({ 
      title: 'Error', 
      text: 'Error al processar la sol·licitud.', 
      icon: 'error' 
    });
  }
}

// J) --- Funció per formatar dates ---
function formatDate(dateString) {
  // 1. Gestionem el valor buit
  if (!dateString) {
    return 'Avui';
  }
  
  // 2. Creem l'objecte Date
  const d = new Date(dateString);
  
  // 3. Validem que la data sigui correcta
  const temps = d.getTime();
  if (isNaN(temps)) {
    return dateString;
  }
  
  // 4. Retornem la data en format català
  const dataFormatada = d.toLocaleDateString('ca-ES', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });
  return dataFormatada;
}

// K) --- Ganxo per quan es monta el component ---
onMounted(function () {
  // 1. Obtenim la store de la capçalera
  const header = useHeaderStore();
  
  // 2. Establim la capçalera d'administrador
  header.setHeaderAdmin();
  
  // 3. Carreguem les dades inicials
  fetchSolicitudes();
});
</script>

<style scoped>
/* Tailwind handles the core design */
.duration-400 { transition-duration: 400ms; }
</style>

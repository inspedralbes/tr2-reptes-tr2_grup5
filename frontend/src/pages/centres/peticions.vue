<template>
  <div>
    
    <!-- VIEW 1: SELECTION GRID -->
    <div class="animate-in fade-in slide-in-from-left-4 duration-500 pb-24 relative">
       
       <!-- 1. Header -->
       <div class="mb-8">
          <h1 class="text-4xl md:text-5xl font-black text-[#022B3A] tracking-tighter leading-none mb-3">
            Sol·licitud de <span class="text-[#1F7A8C]">Tallers</span>
          </h1>
          <p class="text-[#022B3A]/40 text-[10px] font-black uppercase tracking-[0.2em]">
            Selecciona els tallers que t'interessen per al teu centre.
          </p>
       </div>

      <!-- 2. Search & Filter Bar -->
      <div class="bg-white p-2 rounded-xl border border-[#BFDBF7]/60 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm relative z-20">
        <div class="relative flex-1 max-w-md group w-full ml-1">
          <Search :size="14" class="absolute left-4 top-1/2 -translate-y-1/2 text-[#022B3A]/20 group-focus-within:text-[#1F7A8C] transition-colors" />
          <input 
            type="text" 
            placeholder="Cerca per títol, sector o projecte..."
            v-model="searchQuery"
            class="w-full bg-[#E1E5F2]/10 border border-transparent rounded-lg pl-11 pr-4 py-2.5 text-[11px] font-bold focus:bg-white focus:border-[#BFDBF7] focus:ring-4 focus:ring-[#1F7A8C]/5 outline-none transition-all placeholder:text-[#022B3A]/20"
          />
        </div>

        <div class="flex items-center gap-2 bg-[#E1E5F2]/30 p-1 rounded-lg border border-[#BFDBF7]/20 w-full sm:w-auto justify-center sm:justify-end">
          <div class="flex items-center gap-1 pr-2 border-r border-[#BFDBF7]/30">
            <button 
              @click="viewMode = 'grid'"
              :class="[
                'p-2 rounded-md shadow-sm border transition-all',
                viewMode === 'grid' ? 'text-[#1F7A8C] bg-white border-[#BFDBF7]/40 shadow-sm' : 'text-[#022B3A]/20 border-transparent hover:text-[#022B3A]'
              ]"
            >
              <LayoutGrid :size="14" />
            </button>
            <button 
              @click="viewMode = 'list'"
              :class="[
                'p-2 rounded-md shadow-sm border transition-all',
                viewMode === 'list' ? 'text-[#1F7A8C] bg-white border-[#BFDBF7]/40 shadow-sm' : 'text-[#022B3A]/20 border-transparent hover:text-[#022B3A]'
              ]"
            >
              <List :size="14" />
            </button>
          </div>
        </div>
      </div>

      <!-- CLOSED PERIOD WARNING BANNER (Placed below search as requested) -->
      <div v-if="!isRegistrationOpen" class="flex items-center gap-3 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl shadow-sm animate-in slide-in-from-top-2 duration-500 mb-8">
         <div class="bg-red-100 p-2 rounded-full text-red-500">
            <Ban :size="18" :strokeWidth="2.5" />
         </div>
         <div>
            <h4 class="text-sm font-black text-red-600 uppercase tracking-wide">Període d'inscripció tancat</h4>
            <p class="text-[11px] font-bold text-red-400 mt-0.5">{{ periodDates }}</p>
         </div>
      </div>

      <!-- OPEN PERIOD BANNER -->
      <div v-if="isRegistrationOpen" class="flex items-center gap-3 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-xl shadow-sm animate-in slide-in-from-top-2 duration-500 mb-8">
         <div class="bg-green-100 p-2 rounded-full text-green-500">
            <Check :size="18" :strokeWidth="2.5" />
         </div>
         <div>
            <h4 class="text-sm font-black text-green-600 uppercase tracking-wide">Període d'inscripció obert</h4>
            <p class="text-[11px] font-bold text-green-400 mt-0.5">{{ periodDates }}</p>
         </div>
      </div>

      <!-- 3. Workshops Container -->
      <div :class="viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'flex flex-col gap-3'">
        <template v-for="workshop in paginatedWorkshops" :key="workshop.id">
          
          <!-- LIST VIEW -->
          <div 
            v-if="viewMode === 'list'"
            :class="[
              'bg-white rounded-xl border p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-8 transition-all group',
              addedWorkshops.includes(workshop.id) ? 'border-[#1F7A8C] ring-1 ring-[#1F7A8C] shadow-[#1F7A8C]/5' : 'border-[#E1E5F2] hover:border-[#BFDBF7] hover:shadow-lg',
              !isRegistrationOpen ? 'opacity-75 grayscale-[0.5]' : ''
            ]"
          >
            <!-- Content -->
            <div class="flex items-center gap-4 flex-1 min-w-0">
                <div :class="['w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center font-black text-[9px] uppercase border tracking-widest', getProjectStyles(workshop.project)]">
                  {{ workshop.project.split(' ')[1] }}
                </div>
                <div class="min-w-0">
                  <h3 class="text-base font-black text-[#022B3A] truncate">{{ workshop.title }}</h3>
                  <p class="text-[11px] font-medium text-[#8E9AAF] truncate">{{ workshop.description }}</p>
                </div>
            </div>
            
            <div class="flex items-center justify-end gap-4 md:border-l md:border-[#F1F4F9] md:pl-6">
               <button 
                @click="toggleWorkshop(workshop.id)"
                :disabled="!isRegistrationOpen"
                :class="[
                  'flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all shadow-md',
                  !isRegistrationOpen 
                    ? 'bg-white border border-red-100 text-red-400 shadow-none cursor-not-allowed'
                    : addedWorkshops.includes(workshop.id) 
                      ? 'bg-[#022B3A] text-white shadow-[#022B3A]/20 hover:scale-105' 
                      : 'bg-[#1F7A8C] text-white shadow-[#1F7A8C]/20 hover:bg-[#166070] hover:scale-105'
                ]"
              >
                <template v-if="!isRegistrationOpen">
                   <Ban :size="12" :strokeWidth="3" /> Tancat
                </template>
                <template v-else-if="addedWorkshops.includes(workshop.id)">
                   <Check :size="12" :strokeWidth="3" /> SELECCIONAT
                </template>
                <template v-else>
                   <Plus :size="12" :strokeWidth="3" /> AFEGIR
                </template>
              </button>
            </div>
          </div>

          <!-- GRID VIEW CARD (Matches Style Requested) -->
          <div 
            v-else
            :class="[
              'bg-white rounded-2xl border shadow-sm transition-all duration-300 flex flex-col h-full overflow-hidden group',
              addedWorkshops.includes(workshop.id) ? 'border-[#1F7A8C] ring-1 ring-[#1F7A8C] shadow-[#1F7A8C]/10' : 'border-[#E1E5F2] hover:shadow-xl hover:-translate-y-1',
              !isRegistrationOpen ? 'opacity-75 grayscale-[0.5]' : ''
            ]"
          >
            <!-- Header Badges -->
            <div class="p-6 pb-4 flex justify-between items-center">
              <span :class="['px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.1em] border', getProjectStyles(workshop.project)]">
                {{ workshop.project }}
              </span>
              <div class="bg-[#F4F7FB] px-3 py-1.5 rounded-md border border-[#E1E5F2]/60 flex items-center gap-2">
                <span class="text-[9px] font-black text-[#022B3A]/50 uppercase tracking-widest">{{ workshop.sector }}</span>
              </div>
            </div>

            <!-- Title & Desc -->
            <div class="px-6 flex-1">
              <h3 class="text-[20px] font-black text-[#022B3A] mb-2 leading-tight tracking-tight">
                {{ workshop.title }}
              </h3>
              <p class="text-[#8E9AAF] text-[12px] leading-relaxed font-medium mb-6 line-clamp-2">
                {{ workshop.description }}
              </p>
              
              <!-- Metadata Rows (Style 2) -->
              <div class="space-y-3 mb-6">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2.5 text-[#B8C0CC]">
                    <Users :size="16" :strokeWidth="1.5" />
                    <span class="text-[9px] font-black uppercase tracking-widest">Places</span>
                  </div>
                  <span class="text-[12px] font-black text-[#022B3A]">{{ workshop.places }} alumnes</span>
                </div>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2.5 text-[#B8C0CC]">
                    <CalendarDays :size="16" :strokeWidth="1.5" />
                    <span class="text-[9px] font-black uppercase tracking-widest">Trimestres</span>
                  </div>
                  <span class="text-[12px] font-black text-[#022B3A]">{{ workshop.trimestres.join(', ') }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2.5 text-[#B8C0CC]">
                    <Calendar :size="16" :strokeWidth="1.5" />
                    <span class="text-[9px] font-black uppercase tracking-widest">Data</span>
                  </div>
                  <span class="text-[12px] font-black text-[#022B3A]">{{ formatDate(workshop.raw.data_execucio) }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2.5 text-[#B8C0CC]">
                    <MapPin :size="16" :strokeWidth="1.5" />
                    <span class="text-[9px] font-black uppercase tracking-widest">Adreça</span>
                  </div>
                  <span class="text-[12px] font-black text-[#022B3A] truncate max-w-[150px] text-right">Campus ENGINY - Edif. B</span>
                </div>
              </div>
            </div>
            
            <!-- Footer Button -->
            <div class="px-6 py-4 bg-[#F9FAFC] border-t border-[#F1F4F9] flex items-center justify-between mt-auto">
              <span class="text-[10px] font-black text-[#B8C0CC] tracking-widest uppercase">
                REF-{{ workshop.index.toString().padStart(3, '0') }}
              </span>
              
              <button 
                @click="toggleWorkshop(workshop.id)"
                :disabled="!isRegistrationOpen"
                :class="[
                  'flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all shadow-lg hover:scale-105',
                  !isRegistrationOpen 
                    ? 'bg-white border border-red-100 text-red-400 shadow-none cursor-not-allowed'
                    : addedWorkshops.includes(workshop.id) 
                      ? 'bg-[#022B3A] text-white shadow-[#022B3A]/20' 
                      : 'bg-[#1F7A8C] text-white shadow-[#1F7A8C]/20 hover:bg-[#166070]'
                ]"
              >
                <template v-if="!isRegistrationOpen">
                   <Ban :size="14" :strokeWidth="3" /> Tancat
                </template>
                <template v-else-if="addedWorkshops.includes(workshop.id)">
                   <Check :size="14" :strokeWidth="3" /> SELECCIONAT
                </template>
                <template v-else>
                   <Plus :size="14" :strokeWidth="3" /> AFEGIR
                </template>
              </button>
            </div>
          </div>

        </template>
        <div class="mt-8 flex justify-center col-span-full">
          <Pagination :current-page="currentPage" :total-pages="totalPages" @go-to-page="goToPage" />
        </div>
      </div>

      <!-- Fixed Bottom Bar -->
      <div v-if="addedWorkshops.length > 0 && isRegistrationOpen" class="fixed bottom-0 right-0 left-0 md:left-[280px] bg-white border-t border-[#BFDBF7] shadow-[0_-10px_40px_rgba(0,0,0,0.05)] p-6 z-40 animate-in slide-in-from-bottom-10 duration-300">
        <div class="flex items-center justify-between px-8 md:px-12">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-[#1F7A8C] rounded-full flex items-center justify-center text-white font-black shadow-lg shadow-[#1F7A8C]/30">
              {{ addedWorkshops.length }}
            </div>
            <p class="text-sm font-black text-[#022B3A]">taller(s) seleccionats</p>
          </div>
          
          <button 
            @click="showModalDetalls = true"
            class="flex items-center gap-3 px-8 py-3.5 bg-[#022B3A] text-white font-black text-[11px] uppercase tracking-[0.15em] rounded-xl hover:bg-[#1F7A8C] transition-colors shadow-xl shadow-[#022B3A]/20"
          >
            Continuar Sol·licitud
            <ArrowRight :size="16" />
          </button>
        </div>
      </div>
    </div>

    <!-- Modal: Completar sol·licitud (popup, estils com FormCrearTaller/FormCrearUsuari) -->
    <div 
      v-if="showModalDetalls" 
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#022B3A]/40 backdrop-blur-sm"
      @click.self="showModalDetalls = false"
    >
      <div class="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[#BFDBF7] bg-[#E1E5F2] shadow-2xl animate-in zoom-in-95 duration-300">
        
        <!-- Capçalera del modal (igual que altres formularis) -->
        <div class="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white/80 border-b border-[#BFDBF7]/60 backdrop-blur-sm">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-[#1F7A8C]/10 flex items-center justify-center text-[#1F7A8C]">
              <FileText :size="18" />
            </div>
            <div>
              <h2 class="text-lg font-black text-[#022B3A] tracking-tight">Completar sol·licitud</h2>
              <p class="text-[10px] font-bold text-[#022B3A]/50 uppercase tracking-widest">Detalls dels tallers seleccionats</p>
            </div>
          </div>
          <button type="button" @click="showModalDetalls = false" class="p-2 rounded-lg text-[#022B3A]/40 hover:text-[#022B3A] hover:bg-white border border-transparent hover:border-[#BFDBF7] transition-all" aria-label="Tancar">
            <X :size="20" />
          </button>
        </div>

        <div class="p-6 space-y-10">
          <div v-for="(workshop, idx) in selectedWorkshopDetails" :key="workshop.id" class="bg-white rounded-2xl border border-[#BFDBF7] shadow-md shadow-[#022B3A]/5 p-6 md:p-8">
            <!-- Títol secció (estil FormCrearTaller) -->
            <div class="space-y-4">
              <h3 class="text-base font-black text-[#022B3A] tracking-tight flex items-center gap-2">
                <FileText :size="16" class="text-[#1F7A8C]" />
                {{ workshop.title }}
                <span :class="['px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border', getProjectStyles(workshop.project)]">{{ workshop.project }}</span>
              </h3>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-1.5">
                  <label class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1 block">Trimestre(s) d'execució</label>
                  <div class="w-full bg-white border border-[#BFDBF7]/60 rounded-xl px-4 py-3 text-sm text-[#022B3A] flex items-center gap-2 shadow-sm">
                    <CalendarDays :size="16" class="text-[#022B3A]/50 shrink-0" />
                    <span>{{ (workshop.trimestres && workshop.trimestres.length) ? workshop.trimestres.join(', ') : '—' }}</span>
                    <span class="text-[9px] font-medium text-[#022B3A]/50 normal-case">(definit pel taller)</span>
                  </div>
                </div>

                <div class="space-y-1.5">
                  <label class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1 block">Num. Participants (max 4) *</label>
                  <input 
                    type="number" min="1" max="4"
                    v-model="getFormModel(workshop.id).num_participants"
                    class="w-full bg-white border border-[#BFDBF7]/60 rounded-xl px-4 py-3 text-sm text-[#022B3A] focus:ring-4 focus:ring-[#1F7A8C]/10 focus:border-[#1F7A8C] outline-none shadow-sm"
                    @input="validateField(workshop.id, 'num_participants')"
                  />
                  <p v-if="fieldErrors[workshop.id]?.num_participants" class="text-sm text-red-600 font-bold mt-1">{{ fieldErrors[workshop.id].num_participants }}</p>
                </div>

                <div class="md:col-span-2 space-y-1.5">
                  <label class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1 block">Preferència Referent</label>
                  <label class="flex items-center gap-3 cursor-pointer group select-none p-4 bg-white border border-[#BFDBF7]/60 rounded-xl hover:border-[#1F7A8C] transition-all">
                    <input type="checkbox" v-model="getFormModel(workshop.id).es_preferencia_referent" class="peer sr-only" />
                    <div class="w-5 h-5 border-2 border-[#BFDBF7] rounded-md peer-checked:bg-[#1F7A8C] peer-checked:border-[#1F7A8C] transition-all bg-white group-hover:border-[#1F7A8C]"></div>
                    <span class="text-xs font-medium text-[#022B3A]">Marca si voleu un docent concret com a referent.</span>
                  </label>
                </div>

                <div class="md:col-span-2 space-y-1.5">
                  <label class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1 block">Docent Responsable *</label>
                  <div class="relative">
                    <select 
                      v-model="getFormModel(workshop.id).docent_nom" 
                      class="w-full bg-white border border-[#BFDBF7]/60 rounded-xl px-4 py-3 text-sm text-[#022B3A] focus:ring-4 focus:ring-[#1F7A8C]/10 focus:border-[#1F7A8C] outline-none appearance-none cursor-pointer shadow-sm"
                      @change="handleDocentChange(workshop.id)"
                    >
                      <option value="" disabled>Selecciona un docent</option>
                      <option v-for="d in docents" :key="d" :value="d">{{ d }}</option>
                      <option value="NEW_TEACHER" class="text-[#1F7A8C] font-black">+ Crear nou docent...</option>
                    </select>
                    <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#022B3A]/40"><ArrowRight :size="12" class="rotate-90" /></div>
                  </div>
                  <p v-if="fieldErrors[workshop.id]?.docent_nom" class="text-sm text-red-600 mt-1">{{ fieldErrors[workshop.id].docent_nom }}</p>

                  <transition enter-active-class="transition duration-300 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-200 ease-in" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
                    <div v-if="showAddTeacherInline[workshop.id]" class="mt-3 p-4 bg-white border border-[#BFDBF7]/60 rounded-xl space-y-4 shadow-sm">
                      <div class="flex items-center gap-2"><UserPlus :size="16" class="text-[#1F7A8C]" /><span class="text-[10px] font-black text-[#022B3A] uppercase tracking-widest">Creació Ràpida de Docent</span></div>
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input v-model="newTeacher.nom" type="text" placeholder="Nom" class="w-full bg-white border border-[#BFDBF7]/60 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-[#1F7A8C]/10 focus:border-[#1F7A8C] outline-none" />
                        <input v-model="newTeacher.cognoms" type="text" placeholder="Cognoms" class="w-full bg-white border border-[#BFDBF7]/60 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-[#1F7A8C]/10 focus:border-[#1F7A8C] outline-none" />
                        <div class="md:col-span-2"><input v-model="newTeacher.email" type="email" placeholder="Email (xtec.cat / escola.cat)" class="w-full bg-white border border-[#BFDBF7]/60 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-[#1F7A8C]/10 focus:border-[#1F7A8C] outline-none" /></div>
                      </div>
                      <div class="flex justify-end">
                        <button type="button" @click="handleCreateTeacherQuick(workshop.id)" :disabled="creatingTeacher" class="px-6 py-2.5 bg-[#1F7A8C] text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-md hover:bg-[#022B3A] transition-all disabled:opacity-50"> {{ creatingTeacher ? 'CREANT...' : 'CREAR I SELECCIONAR' }} </button>
                      </div>
                    </div>
                  </transition>
                </div>

                <div class="space-y-1.5">
                  <label class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1 block">Prioritat (1-10) *</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="10" 
                    v-model="getFormModel(workshop.id).prioritat" 
                    class="w-full max-w-[140px] bg-white border border-[#BFDBF7]/60 rounded-xl px-4 py-3 text-sm text-[#022B3A] focus:ring-4 focus:ring-[#1F7A8C]/10 focus:border-[#1F7A8C] outline-none shadow-sm" 
                    @input="validateField(workshop.id, 'prioritat')"
                  />
                  <p v-if="fieldErrors[workshop.id]?.prioritat" class="text-sm text-red-600 font-bold mt-1">{{ fieldErrors[workshop.id].prioritat }}</p>
                  <p v-else class="text-[9px] font-bold text-[#022B3A]/40 uppercase tracking-wider ml-1">1: Màxima — 10: Mínima</p>
                </div>

                <div class="space-y-1.5">
                  <label class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1 block">Observacions</label>
                  <textarea rows="3" v-model="getFormModel(workshop.id).descripcio" placeholder="Detalls específics..." class="w-full bg-white border border-[#BFDBF7]/60 rounded-xl px-4 py-3 text-sm text-[#022B3A] focus:ring-4 focus:ring-[#1F7A8C]/10 focus:border-[#1F7A8C] outline-none resize-none placeholder:text-[#022B3A]/20 shadow-sm"></textarea>
                </div>
              </div>
            </div>
          </div>

          <!-- Peu del modal (estil FormCrearTaller/FormCrearUsuari) -->
          <div class="w-full h-px bg-[#BFDBF7]/40"></div>
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div class="flex items-center gap-2 text-[10px] font-bold text-[#022B3A]/40 italic">
              <Info :size="14" /> Revisa les dades abans d'enviar la sol·licitud
            </div>
            <div class="flex gap-3">
              <button type="button" @click="showModalDetalls = false" class="px-6 py-3 rounded-xl border border-[#BFDBF7]/60 bg-white text-[#022B3A]/40 hover:text-[#022B3A] hover:shadow-lg transition-all text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                Cancel·lar
              </button>
              <button type="button" @click="handleSubmit" :disabled="submitting" class="px-10 py-3 bg-[#1F7A8C] text-white rounded-xl shadow-lg shadow-[#1F7A8C]/20 hover:bg-[#022B3A] hover:shadow-2xl transition-all text-[11px] font-black uppercase tracking-[0.15em] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                <Save :size="14" /> {{ submitting ? 'Enviant...' : 'Confirmar sol·licitud' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { 
  MapPin, 
  Search, 
  LayoutGrid, 
  List, 
  Filter, 
  Ban, 
  Check, 
  Plus, 
  Users, 
  Calendar,
  ArrowRight, 
  FileText, 
  UserPlus, 
  Info, 
  Save,
  CalendarDays,
  X
} from 'lucide-vue-next';

// ======================================
// CONFIG & STATE
// ======================================
const tokenCookie = useCookie('authToken');
const centre = ref(null);
const tallers = ref([]);
const professors = ref([]);
const selectedTallers = ref([]); // Stores full objects

// UI State matching template
const showModalDetalls = ref(false);
const viewMode = ref('grid');
const searchQuery = ref('');
const submitting = ref(false);

// Form data for submission
const form = ref({
  tallers: []
});

const fieldErrors = ref({});
const showAddTeacherInline = ref({}); // { workshopId: bool }
const newTeacher = ref({ nom: '', cognoms: '', email: '' });
const creatingTeacher = ref(false);

function handleDocentChange(workshopId) {
  const workshopForm = form.value.tallers.find(t => t.taller_id === workshopId);
  if (!workshopForm) return;

  if (workshopForm.docent_nom === 'NEW_TEACHER') {
    // Tancar altres si n'hi ha
    Object.keys(showAddTeacherInline.value).forEach(k => {
      if (k !== workshopId.toString()) showAddTeacherInline.value[k] = false;
    });
    
    showAddTeacherInline.value[workshopId] = true;
    newTeacher.value = { nom: '', cognoms: '', email: '' }; // Reset form
  } else {
    showAddTeacherInline.value[workshopId] = false;
    validateField(workshopId, 'docent_nom');
  }
}

function toggleQuickTeacherForm(workshopId) {
  Object.keys(showAddTeacherInline.value).forEach(k => {
    if (k !== workshopId.toString()) showAddTeacherInline.value[k] = false;
  });
  showAddTeacherInline.value[workshopId] = !showAddTeacherInline.value[workshopId];
}

async function handleCreateTeacherQuick(workshopId) {
  const { nom, cognoms, email } = newTeacher.value;
  
  if (!nom.trim() || !cognoms.trim() || !email.trim()) {
    useSwal().fire({ title: 'Camps buits', text: 'Si us plau, omple totes les dades del docent.', icon: 'warning' });
    return;
  }

  creatingTeacher.value = true;
  try {
    const token = tokenCookie.value;
    await $fetch('/api/centre/professors', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token },
      body: { nom, cognoms, email }
    });

    // Actualitzar llista de professors
    await fetchData(); 

    // Seleccionar el nou professor automàticament
    const workshopForm = form.value.tallers.find(t => t.taller_id === workshopId);
    if (workshopForm) {
      workshopForm.docent_nom = `${nom} ${cognoms}`;
      validateField(workshopId, 'docent_nom');
    }

    showAddTeacherInline.value[workshopId] = false;
    useSwal().fire({ title: 'Fet!', text: 'Docent creat i seleccionat.', icon: 'success', timer: 1500, showConfirmButton: false });

  } catch (err) {
    console.error(err);
    useSwal().fire({ title: 'Error', text: err.data?.message || 'No s\'ha pogut crear el docent.', icon: 'error' });
  } finally {
    creatingTeacher.value = false;
  }
}

function validateField(workshopId, key) {
  if (!fieldErrors.value[workshopId]) {
    fieldErrors.value[workshopId] = {};
  }
  
  const workshopForm = form.value.tallers.find(t => t.taller_id === workshopId);
  if (!workshopForm) return;

  if (key === 'num_participants') {
    const val = Number(workshopForm.num_participants);
    if (!val || isNaN(val) || val < 1) {
      fieldErrors.value[workshopId].num_participants = 'Introduïu el nombre d\'alumnes (mínim 1).';
    } else if (val > 4) {
      fieldErrors.value[workshopId].num_participants = 'El màxim permès és de 4 participants.';
    } else {
      delete fieldErrors.value[workshopId].num_participants;
    }
  }

  if (key === 'prioritat') {
    const val = Number(workshopForm.prioritat);
    if (!val || isNaN(val) || val < 1) {
      fieldErrors.value[workshopId].prioritat = 'La prioritat ha d\'estar entre 1 i 10.';
    } else if (val > 10) {
      fieldErrors.value[workshopId].prioritat = 'El màxim permès és 10.';
    } else {
      delete fieldErrors.value[workshopId].prioritat;
    }
  }

  if (key === 'docent_nom') {
    if (!workshopForm.docent_nom) {
      fieldErrors.value[workshopId].docent_nom = 'Heu de seleccionar un docent.';
    } else {
      delete fieldErrors.value[workshopId].docent_nom;
    }
  }

  // Netejar objecte si no hi ha errors
  if (Object.keys(fieldErrors.value[workshopId]).length === 0) {
    delete fieldErrors.value[workshopId];
  }
}

function validateAll() {
  let isValid = true;
  form.value.tallers.forEach(workshopForm => {
    validateField(workshopForm.taller_id, 'num_participants');
    validateField(workshopForm.taller_id, 'prioritat');
    validateField(workshopForm.taller_id, 'docent_nom');
    
    if (fieldErrors.value[workshopForm.taller_id]) {
      isValid = false;
    }
  });
  return isValid;
}

// ======================================
// COMPUTED PROPERTIES
// ======================================

// Helper for dates
const parseLocal = (dateStr) => {
  if (!dateStr) return null;
  const parts = dateStr.split('-');
  return new Date(parts[0], parts[1] - 1, parts[2]); 
};

const isRegistrationOpen = computed(() => {
  if (!centre.value?.config) return false;
  const now = new Date();
  const start = parseLocal(centre.value.config.enrollment_start);
  const end = parseLocal(centre.value.config.enrollment_end);
  if (!start || !end) return false;
  end.setHours(23, 59, 59, 999);
  return now >= start && now <= end;
});

const isEnrollmentOpen = isRegistrationOpen; // Alias for compatibility if needed

const periodDates = computed(() => {
  if (!centre.value?.config) return 'Dates no disponibles';
  const start = formatDate(centre.value.config.enrollment_start);
  const end = formatDate(centre.value.config.enrollment_end);
  return `${start} - ${end}`;
});

// Mapped workshops for UI
const filteredWorkshops = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  let list = tallers.value || [];
  
  // Filter
  if (query) {
    list = list.filter(t => 
      (t.titol || '').toLowerCase().includes(query) || 
      (t.sector || '').toLowerCase().includes(query) ||
      (t.modalitat || '').toLowerCase().includes(query)
    );
  }

  // Map to UI High Fidelity structure
  return list.map((t, idx) => ({
    id: t.id,
    index: idx + 1,
    title: t.titol,
    description: t.descripcio || 'Sense descripció disponible',
    project: `Projecte ${t.modalitat}`, // "Projecte A"
    sector: t.sector,
    places: t.places_maximes,
    trimestres: parseTrimestres(t.trimestres_disponibles),
    raw: t // Keep original data
  }));
});

const currentPage = ref(1);
const itemsPerPage = 10;
watch(searchQuery, () => { currentPage.value = 1; });
const totalPages = computed(() => Math.max(1, Math.ceil((filteredWorkshops.value || []).length / itemsPerPage)));
const paginatedWorkshops = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return (filteredWorkshops.value || []).slice(start, start + itemsPerPage);
});
function goToPage(p) { if (p >= 1 && p <= totalPages.value) currentPage.value = p; }

const addedWorkshops = computed(() => {
  return selectedTallers.value.map(t => t.id);
});

// For Step 2: Form Details
// We map the selected tallers to the form structure if not already there, 
// or preserve existing form state if jumping back and forth.
const selectedWorkshopDetails = computed(() => {
  return selectedTallers.value.map(t => {
    const styled = filteredWorkshops.value.find(fw => fw.id === t.id);
    return {
      ...t,
      title: t.titol,
      project: `Projecte ${t.modalitat || '?'}`,
      trimestres: parseTrimestres(t.trimestres_disponibles),
    };
  });
});

const docents = computed(() => {
  return professors.value.map(p => `${p.nom} ${p.cognoms}`);
});

// ======================================
// METHODS
// ======================================

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('es-ES');
}

function parseTrimestres(val) {
  if (Array.isArray(val)) return val;
  if (!val) return [];
  return String(val).split(',').map(s => s.trim());
}

function getProjectStyles(projectString) {
  const p = (projectString || '').toUpperCase();
  if (p.includes('A') || p.includes('MANUF')) return 'bg-[#FFF0EB] text-[#FB6107] border-[#FB6107]/20';
  if (p.includes('B') || p.includes('ENER')) return 'bg-[#F0F7E9] text-[#7CB518] border-[#7CB518]/20';
  if (p.includes('C') || p.includes('AGRO')) return 'bg-[#FFF7E6] text-[#FBB02D] border-[#FBB02D]/20';
  return 'bg-white/40 text-[#022B3A] border-white/60';
}

function toggleWorkshop(id) {
  if (!isRegistrationOpen.value) {
    useSwal().fire({ title: 'Atenció', text: "El període d'inscripció està tancat.", icon: 'warning' });
    return;
  }
  
  const existingIdx = selectedTallers.value.findIndex(t => t.id === id);
  if (existingIdx > -1) {
    // Remove
    selectedTallers.value.splice(existingIdx, 1);
    // Also remove from form state
    const formIdx = form.value.tallers.findIndex(ft => ft.taller_id === id);
    if (formIdx > -1) form.value.tallers.splice(formIdx, 1);
  } else {
    // Add
    const original = tallers.value.find(t => t.id === id);
    if (original) {
      selectedTallers.value.push(original);
      // Trimestre fix: ve del taller (primer valor de trimestres_disponibles)
      const trs = parseTrimestres(original.trimestres_disponibles);
      const trimestreAssignat = (trs && trs.length > 0) ? trs[0] : '1r';
      // Init form entry
      form.value.tallers.push({
        taller_id: original.id,
        trimestre: trimestreAssignat,
        num_participants: 1,
        docent_nom: '',
        docent_email: '',
        prioritat: 1,
        es_preferencia_referent: false,
        descripcio: '',
        _title: original.titol
      });
    }
  }
}

// Ensure form data matches mapped objects in Step 2 loop
// The template iterates `selectedWorkshopDetails` but inputs bind to `?`
// We need to link the UI loop to the `form.tallers` state.
// Since the template uses `v-for="workshop in selectedWorkshopDetails"`, 
// we should probably iterate `form.tallers` and look up display info, OR 
// use a computed that merges both.
// Let's create a helper to get the specific form model for a workshop ID.
const getFormModel = (workshopId) => {
  return form.value.tallers.find(t => t.taller_id === workshopId);
};

// However, the template you provided has input bindings like `v-model="t.trimestre"` 
// inside a loop `v-for="(t, index) in form.tallers"`. 
// WAIT, the NEW template uses `v-for="workshop in selectedWorkshopDetails"`.
// I need to update the NEW template bindings to point to the `form` state object corresponding to that workshop.
// I will keep the loop as is but I will map the `selectedWorkshopDetails` to INCLUDE the form model directly so v-model works.

// We'll update `selectedWorkshopDetails` to wrap the form model.
// ACTUALLY, checking the template:
// It has inputs without v-model in some places (value="1").
// I need to bind these inputs to my `form.tallers` state.

async function handleSubmit() {
  if (!validateAll()) {
    useSwal().fire({
      title: 'Dades incompletes',
      text: 'Si us plau, revisa els errors en els detalls dels tallers seleccionats.',
      icon: 'error'
    });
    return;
  }

  const confirmResult = await useSwal().fire({ title: 'Confirmar', text: 'Segur que vols confirmar la sol·licitud?', icon: 'question', showCancelButton: true, confirmButtonText: 'Sí' });
  if (!confirmResult.isConfirmed) return;

  submitting.value = true;
  try {
    const token = tokenCookie.value;
    // Map form names to emails
    form.value.tallers.forEach(item => {
      const prof = professors.value.find(p => `${p.nom} ${p.cognoms}` === item.docent_nom);
      if (prof) item.docent_email = prof.email;
    });

    await $fetch('/api/centre/peticions', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token },
      body: form.value
    });

    // Reset de l'estat sense recarregar la pàgina
    selectedTallers.value = [];
    form.value.tallers = [];
    showModalDetalls.value = false;
    fieldErrors.value = {};
    
    useSwal().fire({ title: 'Fet', text: 'Sol·licitud enviada correctament!', icon: 'success' });
    
    // Actualitzam dades (places lliures, etc)
    fetchData();
  } catch (err) {
    console.error(err);
    const msg = err.data?.message || err.message || 'Error desconegut';
    useSwal().fire({ title: 'Error', text: 'Error enviant la sol·licitud: ' + msg, icon: 'error' });
  } finally {
    submitting.value = false;
  }
}

// FETCH DATA
async function fetchData() {
  try {
    const token = tokenCookie.value;
    const headers = { 'Authorization': 'Bearer ' + token };
    const [resTallers, resProfs, resProfile] = await Promise.all([
      $fetch('/api/centre/tallers', { headers }),
      $fetch('/api/centre/professors', { headers }),
      $fetch('/api/centre/perfil', { headers })
    ]);
    
    tallers.value = resTallers || [];
    professors.value = resProfs || [];
    centre.value = resProfile || {};
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

onMounted(fetchData);
</script>

<style scoped>
/* Tailwind handles most styles. Custom overrides if needed. */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>

<template>
  <!-- 1. Contenidor principal de la paginació -->
  <div v-if="totalPages > 1" class="flex items-center justify-center gap-3">
    
    <!-- 2. Botó per anar a la pàgina anterior -->
    <button
      :disabled="currentPage <= 1"
      @click="emit('go-to-page', currentPage - 1)"
      class="w-10 h-10 flex items-center justify-center rounded-xl border transition-all shadow-sm"
      :class="{
        'bg-[#F1F4F9] text-[#94A3B8] border-[#E2E8F0] cursor-not-allowed opacity-70': currentPage <= 1,
        'bg-white border-[#BFDBF7]/60 text-[#022B3A]/40 hover:bg-[#E1E5F2]/20 hover:text-[#022B3A] hover:border-[#022B3A]/20': currentPage > 1
      }"
    >
      <ChevronLeft :size="16" :strokeWidth="2.5" />
    </button>

    <!-- 3. Llista de números de pàgina -->
    <div class="flex items-center gap-2">
      <button
        v-for="page in totalPages"
        :key="page"
        @click="emit('go-to-page', page)"
        class="w-10 h-10 flex items-center justify-center rounded-xl text-[12px] font-black transition-all border shadow-sm"
        :class="{
          'bg-[#1F7A8C] text-white border-[#1F7A8C] shadow-lg shadow-[#1F7A8C]/20': currentPage === page,
          'bg-white border-[#BFDBF7]/60 text-[#022B3A]/40 hover:bg-[#E1E5F2]/20 hover:text-[#022B3A] hover:border-[#022B3A]/20': currentPage !== page
        }"
      >
        {{ page }}
      </button>
    </div>

    <!-- 4. Botó per anar a la pàgina següent -->
    <button
      :disabled="currentPage >= totalPages"
      @click="emit('go-to-page', currentPage + 1)"
      class="w-10 h-10 flex items-center justify-center rounded-xl border transition-all shadow-sm"
      :class="{
        'bg-[#F1F4F9] text-[#94A3B8] border-[#E2E8F0] cursor-not-allowed opacity-70': currentPage >= totalPages,
        'bg-white border-[#BFDBF7]/60 text-[#022B3A]/40 hover:bg-[#E1E5F2]/20 hover:text-[#022B3A] hover:border-[#022B3A]/20': currentPage < totalPages
      }"
    >
      <ChevronRight :size="16" :strokeWidth="2.5" />
    </button>
  </div>
</template>

<script setup>
// ======================================
// Importem les dependències
// ======================================
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';

// ======================================
// Definició de l'Esquema
// ======================================

// 1. Propietats que rep el component
const props = defineProps({
  currentPage: { type: Number, required: true },
  totalPages: { type: Number, required: true }
});

// 2. Esdeveniments que emet el component
const emit = defineEmits(['go-to-page']);

// ======================================
// Declaracions de funcions
// ======================================
// (Aquest component no requereix funcions internes complexes)
</script>

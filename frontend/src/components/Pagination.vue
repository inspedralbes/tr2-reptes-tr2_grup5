<template>
  <div v-if="totalPages > 1" class="flex items-center justify-center gap-3">
    <button
      :disabled="currentPage <= 1"
      @click="emit('go-to-page', currentPage - 1)"
      :class="[
        'w-10 h-10 flex items-center justify-center rounded-xl border transition-all shadow-sm',
        currentPage <= 1
          ? 'bg-[#F1F4F9] text-[#94A3B8] border-[#E2E8F0] cursor-not-allowed opacity-70'
          : 'bg-white border-[#BFDBF7]/60 text-[#022B3A]/40 hover:bg-[#E1E5F2]/20 hover:text-[#022B3A] hover:border-[#022B3A]/20'
      ]"
    >
      <ChevronLeft :size="16" :strokeWidth="2.5" />
    </button>
    <div class="flex items-center gap-2">
      <button
        v-for="page in totalPages"
        :key="page"
        @click="emit('go-to-page', page)"
        :class="[
          'w-10 h-10 flex items-center justify-center rounded-xl text-[12px] font-black transition-all border shadow-sm',
          currentPage === page
            ? 'bg-[#1F7A8C] text-white border-[#1F7A8C] shadow-lg shadow-[#1F7A8C]/20'
            : 'bg-white border-[#BFDBF7]/60 text-[#022B3A]/40 hover:bg-[#E1E5F2]/20 hover:text-[#022B3A] hover:border-[#022B3A]/20'
        ]"
      >
        {{ page }}
      </button>
    </div>
    <button
      :disabled="currentPage >= totalPages"
      @click="emit('go-to-page', currentPage + 1)"
      :class="[
        'w-10 h-10 flex items-center justify-center rounded-xl border transition-all shadow-sm',
        currentPage >= totalPages
          ? 'bg-[#F1F4F9] text-[#94A3B8] border-[#E2E8F0] cursor-not-allowed opacity-70'
          : 'bg-white border-[#BFDBF7]/60 text-[#022B3A]/40 hover:bg-[#E1E5F2]/20 hover:text-[#022B3A] hover:border-[#022B3A]/20'
      ]"
    >
      <ChevronRight :size="16" :strokeWidth="2.5" />
    </button>
  </div>
</template>

<script setup>
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';

defineProps({
  currentPage: { type: Number, required: true },
  totalPages: { type: Number, required: true }
});

const emit = defineEmits(['go-to-page']);
</script>

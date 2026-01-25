<template>
  <section class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
    
    <!-- Loading -->
    <div v-if="pendent" class="flex flex-col items-center justify-center py-20">
      <div class="w-10 h-10 border-4 border-[#E1E5F2] border-t-[#1F7A8C] rounded-full animate-spin mb-4"></div>
      <p class="text-[#022B3A]/60 text-sm font-bold">Carregant logs d'auditoria...</p>
    </div>

    <!-- Error -->
    <div v-else-if="errorFetch" class="flex flex-col items-center justify-center py-20">
      <p class="text-red-600 font-bold">Error carregant els logs: {{ textError }}</p>
    </div>

    <template v-else>


      <!-- Control Bar -->
      <div class="bg-white p-2 rounded-xl border border-[#BFDBF7]/60 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="relative flex-1 max-w-lg group w-full ml-1">
          <Search :size="14" class="absolute left-4 top-1/2 -translate-y-1/2 text-[#022B3A]/20 group-focus-within:text-[#1F7A8C] transition-colors" />
          <input 
            type="text" 
            placeholder="Cerca per usuari, taula o acció..."
            v-model="searchQuery"
            class="w-full bg-[#E1E5F2]/10 border border-transparent rounded-lg pl-11 pr-4 py-2.5 text-[11px] font-bold focus:bg-white focus:border-[#BFDBF7] focus:ring-4 focus:ring-[#1F7A8C]/5 outline-none transition-all placeholder:text-[#022B3A]/20 text-[#022B3A]"
          />
        </div>
      </div>

      <!-- Audit Table -->
      <div class="bg-white rounded-2xl border border-[#BFDBF7]/60 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-[#E1E5F2]/10 border-b border-[#BFDBF7]/20">
                <th class="p-5 pl-8 text-[10px] font-black text-[#022B3A]/40 uppercase tracking-[0.2em]">Data</th>
                <th class="p-5 text-[10px] font-black text-[#022B3A]/40 uppercase tracking-[0.2em]">Acció</th>
                <th class="p-5 text-[10px] font-black text-[#022B3A]/40 uppercase tracking-[0.2em]">Taula</th>
                <th class="p-5 text-[10px] font-black text-[#022B3A]/40 uppercase tracking-[0.2em]">Usuari</th>
                <th class="p-5 text-[10px] font-black text-[#022B3A]/40 uppercase tracking-[0.2em]">Valor Anterior</th>
                <th class="p-5 pr-8 text-[10px] font-black text-[#022B3A]/40 uppercase tracking-[0.2em]">Valor Nou</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#BFDBF7]/10">
              <tr v-for="log in filteredLogs" :key="log.id" class="hover:bg-[#E1E5F2]/5 transition-colors group">
                <td class="p-5 pl-8 whitespace-nowrap">
                  <div class="flex items-center gap-2">
                    <History :size="14" class="text-[#022B3A]/20" />
                    <span class="text-xs font-bold text-[#022B3A]">{{ formatDate(log.data_registre) }}</span>
                  </div>
                </td>
                <td class="p-5">
                  <span :class="['px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border', getActionStyle(log.accio)]">
                    {{ log.accio }}
                  </span>
                </td>
                <td class="p-5">
                  <span class="text-xs font-bold text-[#022B3A]/60 bg-[#022B3A]/5 px-2 py-1 rounded uppercase tracking-wide">
                    {{ taulaLog(log) }}
                  </span>
                </td>
                <td class="p-5">
                  <span class="text-xs font-bold text-[#1F7A8C]">{{ usuariLog(log) }}</span>
                </td>
                <td class="p-5 max-w-[200px]">
                  <div v-if="log.valor_anterior" class="flex items-start gap-2 text-[#022B3A]/40">
                    <div class="min-w-0 break-words text-[11px] font-medium leading-snug" :title="log.valor_anterior">
                      {{ truncate(log.valor_anterior, 80) }}
                    </div>
                  </div>
                  <span v-else class="text-[10px] font-bold text-[#022B3A]/20 uppercase tracking-widest">-</span>
                </td>
                <td class="p-5 pr-8 max-w-[250px]">
                  <div class="flex items-start gap-2">
                    <ArrowRight v-if="log.valor_anterior" :size="14" class="text-[#022B3A]/20 mt-0.5 shrink-0" />
                    <span class="text-[11px] font-bold text-[#022B3A] break-words leading-snug" :title="log.valor_nou">
                      {{ truncate(log.valor_nou, 80) }}
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div v-if="filteredLogs.length === 0" class="p-12 text-center text-[#022B3A]/40">
          <p class="text-sm font-bold">{{ hiHaLogs ? "No s'han trobat registres." : "No hi ha logs d'auditoria." }}</p>
        </div>
      </div>
    </template>

  </section>
</template>

<script setup>
import { Search, History, ArrowRight } from 'lucide-vue-next';

const token = useCookie('authToken');

const respostaFetch = await useFetch('/api/admin/logs', {
  headers: { Authorization: 'Bearer ' + token.value },
  initialCache: false
});

const searchQuery = ref('');

const llistaLogs = computed(function () {
  const d = respostaFetch.data;
  if (d && d.value) return d.value;
  return [];
});

const pendent = computed(function () {
  return !!respostaFetch.pending?.value;
});

const errorFetch = computed(function () {
  return !!(respostaFetch.error && respostaFetch.error.value);
});

const textError = computed(function () {
  const e = respostaFetch.error?.value;
  return (e && e.message) ? e.message : '';
});

const hiHaLogs = computed(function () {
  const l = llistaLogs.value;
  return !!(l && l.length > 0);
});

const filteredLogs = computed(function () {
  const q = (searchQuery.value || '').toLowerCase().trim();
  const list = llistaLogs.value || [];
  if (!q) return list;
  return list.filter(function (log) {
    const u = (usuariLog(log) || '').toLowerCase();
    const t = (taulaLog(log) || '').toLowerCase();
    const a = (log.accio || '').toLowerCase();
    return u.includes(q) || t.includes(q) || a.includes(q);
  });
});

function getActionStyle(action) {
  const a = (action || '').toUpperCase();
  switch (a) {
    case 'DELETE': return 'bg-red-50 text-red-600 border-red-100';
    case 'UPDATE': return 'bg-[#BFDBF7]/20 text-[#1F7A8C] border-[#BFDBF7]/40';
    case 'CREATE': return 'bg-[#7cb518]/10 text-[#7cb518] border-[#7cb518]/20';
    case 'LOGIN': return 'bg-[#E1E5F2] text-[#022B3A]/60 border-[#BFDBF7]/20';
    case 'EXPORT': return 'bg-amber-50 text-amber-600 border-amber-100';
    default: return 'bg-gray-50 text-gray-500 border-gray-100';
  }
}

function formatDate(valor) {
  if (!valor) return '—';
  const d = new Date(valor);
  return d.toLocaleString('ca-CA', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function taulaLog(log) {
  return log.taula_afectada || '—';
}

function usuariLog(log) {
  return log.usuari_email || '—';
}

function truncate(text, max) {
  if (!text) return '—';
  const str = String(text);
  return str.length <= max ? str : str.slice(0, max) + '...';
}
</script>

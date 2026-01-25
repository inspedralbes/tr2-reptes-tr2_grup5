<template>
  <div class="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
    


    <!-- HEADER -->
    <div class="mb-8">
      <h1 class="text-4xl md:text-5xl font-black text-[#022B3A] tracking-tighter leading-none mb-3">
        Anàlisi d'<span class="text-[#1F7A8C]">Estadístiques</span>
      </h1>
      <p class="text-[#022B3A]/40 text-[10px] font-black uppercase tracking-[0.2em]">
        Seguiment del rendiment i impacte del projecte.
      </p>
    </div>

    <!-- 1. WELCOME BANNER -->
    <div class="bg-[#022B3A] rounded-3xl p-12 relative overflow-hidden flex flex-col justify-center min-h-[220px] shadow-2xl shadow-[#022B3A]/20 group border border-white/5">
      <!-- High-fidelity background effects -->
      <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-[#1F7A8C]/20 rounded-full -mr-32 -mt-32 blur-[100px] group-hover:bg-[#1F7A8C]/30 transition-all duration-1000"></div>
      <div class="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-16 -mb-16 blur-[60px]"></div>
      
      <div class="relative z-10">
        <div class="flex items-center gap-2 mb-4">
           <div class="w-2.5 h-2.5 bg-[#7cb518] rounded-full animate-pulse shadow-[0_0_12px_rgba(124,181,24,0.8)]"></div>
           <span class="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Curs 2025-2026 en temps real</span>
        </div>
        <h2 class="text-5xl font-black text-white mb-4 tracking-tight leading-none">
          Hola, {{ header.userName }}
        </h2>
        <p class="text-white/50 text-sm font-medium max-w-2xl leading-relaxed">
          Aquest panell realitza un seguiment exhaustiu del projecte ENGINY. Analitza l'impacte als centres educatius, 
          el creixement de la demanda de tallers i assegura el compliment dels objectius establerts.
        </p>
      </div>
    </div>

    <!-- 2. TOP KPI CARDS -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div v-for="(kpi, i) in kpiData" :key="i" class="bg-white p-8 rounded-3xl border border-[#E1E5F2]/60 shadow-sm hover:shadow-xl transition-all duration-500 group relative overflow-hidden">
        <div class="absolute top-0 right-0 w-32 h-32 bg-[#E1E5F2]/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
        <div class="flex justify-between items-start mb-8 relative z-10">
          <div class="p-3 bg-[#022B3A]/5 text-[#022B3A] rounded-2xl group-hover:bg-[#022B3A] group-hover:text-white transition-all duration-300">
            <component :is="kpi.icon" :size="24" :strokeWidth="1.5" />
          </div>
          <span v-if="kpi.tag" class="text-[9px] font-black text-[#022B3A] bg-[#E1E5F2] px-3 py-1.5 rounded-full uppercase tracking-widest">{{ kpi.tag }}</span>
          <div v-if="kpi.alert" class="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
        </div>
        <p class="text-5xl font-black text-[#022B3A] tracking-tighter leading-none mb-3 relative z-10 group-hover:translate-x-1 transition-transform">{{ kpi.value }}</p>
        <p class="text-[10px] font-black text-[#022B3A]/30 uppercase tracking-[0.2em] relative z-10">{{ kpi.label }}</p>
      </div>
    </div>

    <!-- 3. MAIN INSIGHTS -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
      
      <!-- Center Ranking -->
      <div class="bg-white rounded-3xl border border-[#E1E5F2]/60 shadow-sm overflow-hidden flex flex-col min-h-[450px] group/card hover:shadow-2xl transition-all duration-500">
        <div class="p-10 border-b border-[#E1E5F2]/40 flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="p-2.5 bg-brandAmber/10 rounded-xl text-brandAmber">
              <Trophy :size="20" />
            </div>
            <h3 class="text-sm font-black text-[#022B3A] uppercase tracking-[0.2em]">Rànquing de Centres</h3>
          </div>
          <span class="text-[9px] font-bold text-[#022B3A]/30 uppercase tracking-widest">Per % d'Assistència</span>
        </div>
        <div class="p-8 flex-1">
          <div class="flex justify-between text-[9px] font-black text-[#022B3A]/20 uppercase tracking-[0.2em] mb-6 px-3">
             <span>Pos. / Centre Educatiu</span>
             <span>Assistència confirmada</span>
          </div>
          <div class="space-y-5">
            <div v-for="(center, idx) in centerRanking" :key="idx" class="flex items-center justify-between p-5 hover:bg-[#E1E5F2]/20 rounded-2xl transition-all duration-300 group/row border border-transparent hover:border-[#E1E5F2]">
                <div class="flex items-center gap-6">
                   <div :class="['w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs transition-all duration-500 shadow-sm group-hover/row:scale-110', getRankBadgeStyle(idx)]">
                      {{ idx + 1 }}
                   </div>
                   <div>
                      <p class="text-base font-black text-[#022B3A] tracking-tight group-hover/row:text-[#1F7A8C] transition-colors">{{ center.name }}</p>
                      <p class="text-[10px] font-bold text-[#022B3A]/40 mt-1 uppercase tracking-widest">{{ center.workshops }} tallers completats</p>
                   </div>
                </div>
                <div class="text-right">
                   <span class="text-sm font-black text-[#022B3A]">{{ center.attendance }}%</span>
                   <div class="w-24 h-1.5 bg-[#E1E5F2]/40 rounded-full mt-2 ml-auto overflow-hidden border border-[#E1E5F2]/20">
                      <div class="h-full bg-gradient-to-r from-[#022B3A] to-[#1F7A8C] rounded-full group-hover/row:brightness-110 transition-all duration-1000" :style="{ width: `${center.attendance}%` }"></div>
                   </div>
                </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column -->
      <div class="flex flex-col gap-10">
        
        <!-- Top Demand -->
        <div class="bg-white rounded-3xl border border-[#E1E5F2]/60 shadow-sm p-10 group/demand hover:shadow-2xl transition-all duration-500">
          <div class="flex items-center justify-between mb-10">
            <div class="flex items-center gap-4">
              <div class="p-2.5 bg-[#1F7A8C]/10 rounded-xl text-[#1F7A8C]">
                <TrendingUp :size="20" />
              </div>
              <h3 class="text-sm font-black text-[#022B3A] uppercase tracking-[0.2em]">Tallers amb més demanda</h3>
            </div>
          </div>
          <div class="space-y-5">
            <div v-for="(workshop, idx) in topWorkshops" :key="idx" class="p-6 bg-[#E1E5F2]/10 border border-[#E1E5F2]/40 rounded-2xl flex items-center justify-between hover:bg-white hover:border-[#1F7A8C]/30 hover:shadow-xl hover:shadow-[#1F7A8C]/5 transition-all duration-500 group/item">
              <div class="flex items-center gap-5">
                 <div class="w-8 h-8 rounded-lg bg-[#022B3A] text-white flex items-center justify-center font-black text-[10px]">#{{ idx + 1 }}</div>
                 <div>
                   <h4 class="text-xs font-black text-[#022B3A] uppercase tracking-[0.15em] mb-1 group-hover/item:text-[#1F7A8C] transition-colors">{{ workshop.title }}</h4>
                   <p class="text-[10px] font-bold text-[#022B3A]/30 uppercase tracking-widest">{{ workshop.requests }} Sol·licituds aquest any</p>
                 </div>
              </div>
              <div class="flex items-center gap-1.5 text-[11px] font-black text-[#7cb518] bg-[#7cb518]/10 px-3 py-1.5 rounded-xl">
                 <ArrowUpRight :size="12" :strokeWidth="3" /> {{ workshop.growth }}
              </div>
            </div>
          </div>
        </div>

        <!-- 4-Grid Stats -->
        <div class="grid grid-cols-2 gap-6">
          <div v-for="(item, i) in detailGridData" :key="i" class="bg-white p-8 rounded-3xl border border-[#E1E5F2]/60 shadow-sm flex flex-col justify-between h-[160px] group/detail hover:shadow-xl transition-all duration-500">
            <div class="flex justify-between items-start mb-auto">
               <div :class="['p-2.5 rounded-xl transition-all duration-300 group-hover/detail:scale-110', item.colorClass]">
                 <component :is="item.icon" :size="20" :strokeWidth="2" />
               </div>
               <div v-if="item.isChart" class="w-6 h-6 rounded-full border-2 border-current/20 border-t-current animate-spin-slow"></div>
            </div>
            <div>
              <p class="text-[9px] font-black text-[#022B3A]/30 uppercase tracking-[0.2em] mb-2">{{ item.label }}</p>
              <p :class="['font-black leading-tight uppercase tracking-tight group-hover/detail:translate-x-1 transition-transform', item.valueSize || 'text-xl']">{{ item.value }}</p>
            </div>
          </div>
        </div>

      </div>

    </div>


  </div>
</template>

<script setup>
import { 
  Building2, 
  Users, 
  UserCheck, 
  ClipboardList, 
  Trophy, 
  TrendingUp, 
  ArrowUpRight, 
  Briefcase, 
  Layers, 
  Calendar, 
  PieChart 
} from 'lucide-vue-next';

// ======================================
// Importacions i Composables (Rutes, Cookies, Stores)
// ======================================
const token = useCookie('authToken');

// ======================================
// Estat Reactiu i Refs (Variables i Formularis)
// ======================================
const header = ref({
  userName: 'Administrador' 
});
const { data: rawStats, pending: pendent } = await useFetch('/api/admin/stats/dashboard', {
  headers: { Authorization: 'Bearer ' + token.value },
  key: 'admin-stats-dashboard'
});

const statsData = computed(() => {
  const d = rawStats.value?.data;
  return {
    totalCenters: d?.centres?.solicitants || 0,
    totalStudents: d?.centres?.totalAlumnes || 0,
    avgStudentsPerWorkshop: d?.centres?.mediaAlumnes || 0,
    pendingRequests: d?.tallers?.abandonats || 0,
    leadingSector: formatText(d?.tallers?.sectorTop),
    topModality: formatModalitat(d?.tallers?.modalitatTop),
    activeQuarter: d?.tallers?.trimestreTop || 'N/A',
    goalCompletion: '82.4%' // Placeholder static value if not in API
  };
});

const kpiData = computed(() => [
  { label: 'Centres Participats', value: statsData.value.totalCenters, icon: Building2, tag: '+4 aquest mes' },
  { label: 'Alumnes Impactats', value: statsData.value.totalStudents, icon: Users, tag: '84% Actius' },
  { label: 'Alumnes per taller', value: statsData.value.avgStudentsPerWorkshop, icon: UserCheck },
  { label: 'Peticions Pendents', value: statsData.value.pendingRequests, icon: ClipboardList, alert: true }
]);

const detailGridData = computed(() => [
  { label: 'Sector Líder', value: statsData.value.leadingSector, icon: Briefcase, colorClass: 'bg-[#022B3A]/5 text-[#022B3A]', valueSize: 'text-lg' },
  { label: 'Modalitat Top', value: statsData.value.topModality, icon: Layers, colorClass: 'bg-[#1F7A8C]/5 text-[#1F7A8C]' },
  { label: 'Pico d\'Activitat', value: statsData.value.activeQuarter, icon: Calendar, colorClass: 'bg-brandAmber/10 text-brandAmber' },
  { label: 'Compliment', value: statsData.value.goalCompletion, icon: PieChart, colorClass: 'bg-[#7cb518]/10 text-[#7cb518]', isChart: true }
]);

const centerRanking = computed(() => {
  const ranking = rawStats.value?.data?.centres?.ranking || [];
  return ranking.map(c => ({
    name: c.nom_centre,
    workshops: c.total_tallers,
    attendance: c.percentatge_asistencia,
    planned: c.total_alumnes_planificats,
    real: c.alumnes_reals
  }));
});

const topWorkshops = computed(() => {
  const workshops = rawStats.value?.data?.tallers?.mesSolicitats || [];
  return workshops.map(w => ({
    title: w.titol,
    requests: w.total_peticions,
    growth: '+' + (Math.floor(Math.random() * 10) + 1) + '%',
    sector: w.sector
  }));
});

// ======================================
// Lògica i Funcions (Handlers i Lifecycle)
// ======================================

function getRankBadgeStyle(idx) {
  if (idx === 0) return 'bg-brandAmber text-white ring-4 ring-brandAmber/10';
  if (idx === 1) return 'bg-slate-400 text-white ring-4 ring-slate-400/10';
  if (idx === 2) return 'bg-orange-700 text-white ring-4 ring-orange-700/10';
  return 'bg-[#E1E5F2] text-[#022B3A]/40';
}

function formatText(text) {
  if (!text) return 'N/A';
  let t = String(text);
  t = t.replace(/Ã¨/g, 'è');
  t = t.replace(/Ã/g, 'à');
  t = t.replace(/Â²/g, '²');
  return t;
}

function formatModalitat(mod) {
  if (mod === 'B') return 'Híbrida';
  if (mod === 'P') return 'Presencial';
  if (mod === 'V') return 'Virtual';
  if (mod && mod !== 'N/A') return mod;
  return 'N/A';
}
</script>

<style scoped>
.animate-spin-slow {
  animation: spin 3s linear infinite;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>

<template>
  <div class="min-h-screen bg-white font-sans flex flex-col scroll-smooth">
    
    <!-- 1. NAVBAR -->
    <nav class="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 py-5 px-6 md:px-12">
      <div class="max-w-[1400px] mx-auto flex items-center justify-between">
        <div class="flex items-center gap-3">
          <img src="/logo_v_black.png" alt="ENGINY" class="h-14 w-auto object-contain" />
        </div>
        <div class="flex items-center gap-6">
          <button 
            @click="handleNavigate('login')"
            class="text-sm font-medium text-[#022B3A]/70 hover:text-[#2563EB] transition-colors hidden md:block"
          >
            Accés a la plataforma
          </button>
          <button 
            @click="handleNavigate('register')"
            class="bg-[#022B3A] text-white px-5 py-2 rounded-full text-xs font-bold hover:bg-[#2563EB] transition-all"
          >
            Registrar-se
          </button>
        </div>
      </div>
    </nav>

    <!-- 2. HERO SECTION -->
    <section class="pt-24 pb-0 px-4 md:px-6 flex justify-center bg-white">
      <div class="w-full max-w-[1400px] min-h-[85vh] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#E1E5F2] via-[#F0F9FF] to-white rounded-t-[60px] relative overflow-hidden flex flex-col items-center justify-center py-20 px-6 text-center">
         
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1/2 bg-[#1F7A8C]/5 blur-[120px] rounded-full pointer-events-none"></div>

        <div class="relative z-10 max-w-6xl mx-auto mt-auto mb-auto">
           
          <h1 class="text-6xl md:text-8xl lg:text-[7rem] font-bold tracking-tighter text-[#022B3A] mb-2 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100 leading-[0.9]">
            Transformant el Futur
          </h1>
          <h1 class="text-6xl md:text-8xl lg:text-[7rem] font-bold tracking-tighter text-[#94A3B8] mb-12 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200 leading-[0.9]">
            Professional des de les Aules
          </h1>
           
          <p class="text-xl md:text-2xl text-[#022B3A]/60 font-medium max-w-3xl mx-auto mb-16 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            ENGINY connecta els instituts de Barcelona amb entorns d'aprenentatge real, fomentant vocacions tècniques a través de la pràctica i la innovació.
          </p>

          <div class="flex justify-center animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
            <button 
              @click="handleNavigate('login')"
              class="bg-[#022B3A] text-white text-lg font-bold px-10 py-5 rounded-full shadow-2xl shadow-[#022B3A]/20 hover:bg-[#1F7A8C] hover:scale-105 transition-all flex items-center gap-3"
            >
              Accés Centres
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- 3. MISSION & VALUES -->
    <section class="py-24 bg-white">
      <div class="max-w-[1400px] mx-auto px-6 md:px-12">
        
        <div class="text-center mb-20">
          <h2 class="text-5xl md:text-7xl font-black text-[#022B3A] tracking-tighter leading-tight mb-4">
            Impulsant el <br/>
            <span class="text-[#1F7A8C]">Talent Jove</span>
          </h2>
        </div>

        <div class="grid md:grid-cols-3 gap-6">
           
          <div class="bg-[#E1E5F2]/30 border border-[#BFDBF7]/20 p-10 rounded-[40px] h-[500px] flex flex-col items-start relative group hover:-translate-y-2 transition-transform duration-300">
            <div class="w-14 h-14 rounded-full bg-[#022B3A] flex items-center justify-center text-white mb-auto shadow-lg shadow-[#022B3A]/20">
              <CheckCircle2 :size="24" :strokeWidth="2.5" />
            </div>
            <div class="mt-auto">
              <h3 class="text-4xl font-black text-[#022B3A] mb-4 leading-[0.9] tracking-tight">
                Orientació<br/>Professional
              </h3>
              <p class="text-[#022B3A]/60 text-sm font-medium leading-relaxed mb-8 max-w-xs">
                Connectem l'alumnat amb entorns professionals reals per despertar vocacions autèntiques.
              </p>
            </div>
          </div>

          <div class="bg-[#E1E5F2]/30 border border-[#BFDBF7]/20 p-10 rounded-[40px] h-[500px] flex flex-col items-start relative group hover:-translate-y-2 transition-transform duration-300">
            <div class="w-14 h-14 rounded-full bg-[#022B3A] flex items-center justify-center text-white mb-auto shadow-lg shadow-[#022B3A]/20">
              <Wrench :size="24" :strokeWidth="2.5" />
            </div>
            <div class="mt-auto">
              <h3 class="text-4xl font-black text-[#022B3A] mb-4 leading-[0.9] tracking-tight">
                Aprenentatge<br/>Pràctic
              </h3>
              <p class="text-[#022B3A]/60 text-sm font-medium leading-relaxed mb-8 max-w-xs">
                Apostem pel "learning by doing", portant l'experiència educativa fora de l'aula convencional.
              </p>
            </div>
          </div>

          <div class="bg-[#E1E5F2]/30 border border-[#BFDBF7]/20 p-10 rounded-[40px] h-[500px] flex flex-col items-start relative group hover:-translate-y-2 transition-transform duration-300">
            <div class="w-14 h-14 rounded-full bg-[#022B3A] flex items-center justify-center text-white mb-auto shadow-lg shadow-[#022B3A]/20">
              <Users :size="24" :strokeWidth="2.5" />
            </div>
            <div class="mt-auto">
              <h3 class="text-4xl font-black text-[#022B3A] mb-4 leading-[0.9] tracking-tight">
                Xarxa de<br/>Col·laboració
              </h3>
              <p class="text-[#022B3A]/60 text-sm font-medium leading-relaxed mb-8 max-w-xs">
                Unim esforços entre centres educatius, experts i el Consorci per crear oportunitats úniques.
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>

    <!-- 4. SECTORS STRATEGIC (MARQUEE) -->
    <section id="sectors" class="py-24 bg-[#022B3A] overflow-hidden relative">
      <div class="max-w-[1400px] mx-auto px-6 md:px-12 mb-16 text-center relative z-10">
        <h2 class="text-3xl md:text-5xl font-black text-white tracking-tight mb-2">Sectors Estratègics</h2>
        <p class="text-white/40 font-bold text-xs uppercase tracking-widest">
          Àrees de coneixement clau per al futur de Barcelona
        </p>
      </div>

      <div class="w-full inline-flex flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]">
        <div class="flex items-center justify-center md:justify-start animate-scroll gap-6 pl-6">
          <div 
            v-for="(sector, idx) in [...sectors, ...sectors]" 
            :key="idx" 
            class="w-[350px] flex-shrink-0 bg-white p-8 rounded-[30px] border border-transparent hover:border-[#1F7A8C] hover:shadow-2xl transition-all duration-300 group flex flex-col h-[280px] mx-4"
          >
            <div class="flex items-start justify-between mb-4">
              <div class="p-3 bg-[#E1E5F2]/30 rounded-2xl text-[#1F7A8C] group-hover:bg-[#1F7A8C] group-hover:text-white transition-colors">
                <component :is="sector.icon" :size="28" :strokeWidth="1.5" />
              </div>
            </div>
            <div class="mt-auto">
              <h3 class="text-2xl font-black text-[#022B3A] mb-3 leading-tight tracking-tight">{{ sector.name }}</h3>
              <p class="text-[#022B3A]/60 text-sm font-medium leading-relaxed">
                {{ sector.desc }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 5. HOW IT WORKS -->
    <section class="py-24 bg-[#F8FAFC] border-y border-[#BFDBF7]/20">
      <div class="max-w-5xl mx-auto px-6 md:px-12">
        
        <div class="text-center mb-20">
          <h2 class="text-4xl md:text-5xl font-black text-[#022B3A] tracking-tighter mb-4">Com funciona?</h2>
          <p class="text-[#022B3A]/40 font-bold text-xs uppercase tracking-widest">El teu camí cap a la innovació en 6 passos</p>
        </div>

        <div class="flex flex-col gap-16 relative">
           
          <div 
            v-for="(step, idx) in steps" 
            :key="idx" 
            :class="['relative z-10 w-full md:w-[45%] group', idx % 2 === 0 ? 'md:mr-auto' : 'md:ml-auto']"
          >
             
            <div class="flex flex-col md:flex-row items-center gap-6 bg-white p-6 rounded-2xl border border-[#BFDBF7]/60 shadow-sm hover:shadow-xl hover:border-[#BFDBF7] hover:-translate-y-1 transition-all duration-300 relative z-10">
              <div :class="['w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 border shadow-sm group-hover:scale-110 transition-transform', step.color]">
                <component :is="step.icon" :size="24" :strokeWidth="2" />
              </div>

              <div class="text-center md:text-left flex-1">
                <div class="flex items-center justify-center md:justify-start gap-3 mb-1">
                  <span class="w-6 h-6 rounded-lg bg-[#022B3A] text-white text-[10px] font-black flex items-center justify-center shadow-md border border-white/20">
                    {{ idx + 1 }}
                  </span>
                  <h3 class="text-lg font-black text-[#022B3A] uppercase tracking-tight">{{ step.title }}</h3>
                </div>
                <p class="text-sm font-medium text-[#022B3A]/60 leading-relaxed">{{ step.desc }}</p>
              </div>
            </div>

            <div 
              v-if="idx < steps.length - 1"
              :class="['hidden md:block absolute top-1/2 w-[200px] h-[150px] z-0 pointer-events-none opacity-60', idx % 2 === 0 ? '-right-[55%] translate-y-4' : '-left-[55%] translate-y-4']"
            >
              <svg v-if="idx % 2 === 0" viewBox="0 0 200 150" fill="none" class="w-full h-full text-[#022B3A]">
                <path d="M 10,10 C 100,10 100,140 190,140" stroke="currentColor" stroke-width="2" stroke-dasharray="8 6" stroke-linecap="round" fill="none" />
                <path d="M 180,130 L 190,140 L 180,150" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <svg v-else viewBox="0 0 200 150" fill="none" class="w-full h-full text-[#022B3A]">
                <path d="M 190,10 C 100,10 100,140 10,140" stroke="currentColor" stroke-width="2" stroke-dasharray="8 6" stroke-linecap="round" fill="none" />
                <path d="M 20,130 L 10,140 L 20,150" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>

          </div>
        </div>

      </div>
    </section>

    <!-- 6. FAQ -->
    <section class="py-24 px-6 md:px-12 bg-white relative overflow-hidden">
      <div class="max-w-3xl mx-auto relative z-10">
         
        <div class="space-y-6">
          <div class="mb-10 text-center">
            <h2 class="text-4xl font-black text-[#022B3A] tracking-tight mb-4">Preguntes Freqüents</h2>
            <div class="w-16 h-1.5 bg-[#3B82F6] rounded-full mx-auto"></div>
          </div>

          <div class="space-y-4">
            <div 
              v-for="(item, idx) in faqs" 
              :key="idx" 
              class="bg-white rounded-2xl border border-gray-100 shadow-sm transition-all duration-300"
            >
              <button 
                @click="toggleFaq(idx)"
                class="w-full px-6 py-6 text-left flex items-start gap-5 focus:outline-none hover:bg-gray-50/50 rounded-2xl transition-colors group"
              >
                <div :class="['mt-0.5 w-6 h-6 flex items-center justify-center rounded-full border transition-colors', openFaq === idx ? 'bg-[#022B3A] text-white border-[#022B3A]' : 'bg-white text-[#022B3A]/40 border-gray-200 group-hover:border-[#1F7A8C] group-hover:text-[#1F7A8C]']">
                  <Minus v-if="openFaq === idx" :size="14" :strokeWidth="3" />
                  <Plus v-else :size="14" :strokeWidth="3" />
                </div>
                <div class="flex-1">
                  <span :class="['font-bold text-lg transition-colors', openFaq === idx ? 'text-[#022B3A]' : 'text-[#022B3A]/70']">
                    {{ item.q }}
                  </span>
                  <div :class="['grid transition-all duration-300 ease-in-out', openFaq === idx ? 'grid-rows-[1fr] opacity-100 pt-4' : 'grid-rows-[0fr] opacity-0']">
                    <div class="overflow-hidden">
                      <p class="text-[#022B3A]/60 text-sm leading-relaxed">{{ item.a }}</p>
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>

    <!-- 7. FOOTER -->
    <footer class="bg-white border-t border-gray-200 py-16 px-6 mt-auto">
      <div class="max-w-[1400px] mx-auto">
        <div class="grid md:grid-cols-4 gap-12 mb-12">
          <div class="col-span-1 md:col-span-2">
            <div class="flex flex-col gap-4 mb-6">
              <img src="/logo_v_black.png" alt="ENGINY" class="h-16 w-auto object-contain self-start" />
              <div class="flex flex-col">
                <span class="text-[10px] font-bold text-[#022B3A]/40 uppercase tracking-widest">Plataforma Educativa</span>
              </div>
            </div>
            <p class="text-[#022B3A]/50 text-sm max-w-sm leading-relaxed mb-6">
              Projecte impulsat pel Consorci d'Educació de Barcelona per connectar la formació professional amb el teixit productiu de la ciutat.
            </p>
            <div class="flex gap-4">
              <div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[#022B3A]/40 hover:bg-[#3B82F6] hover:text-white transition-colors cursor-pointer"><Globe :size="14" /></div>
            </div>
          </div>
          
          <div>
            <h4 class="font-black text-[#022B3A] text-xs uppercase tracking-widest mb-6">Plataforma</h4>
            <ul class="space-y-4 text-sm font-medium text-[#022B3A]/60">
              <li><button @click="handleNavigate('login')" class="hover:text-[#3B82F6] transition-colors">Accés a la plataforma</button></li>
              <li><button @click="handleNavigate('register')" class="hover:text-[#3B82F6] transition-colors">Registrar-se</button></li>
            </ul>
          </div>

          <div>
            <h4 class="font-black text-[#022B3A] text-xs uppercase tracking-widest mb-6">Projecte creat per</h4>
            <ul class="space-y-4 text-sm font-medium text-[#022B3A]/60">
              <li>Iker Mata</li>
              <li>Biel Domínguez</li>
              <li>Llorenç Carnisser</li>
              <li>Iker Lopez</li>
            </ul>
          </div>
        </div>

        <div class="border-t border-gray-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-4 opacity-60">
            <span class="text-[10px] font-black text-[#022B3A] uppercase tracking-widest">Consorci d'Educació de Barcelona</span>
          </div>
          <p class="text-[10px] font-bold text-[#022B3A]/30 uppercase tracking-widest">© 2025 ENGINY PLATFORM</p>
        </div>
      </div>
    </footer>

  </div>
</template>

<script setup>
import { 
  CheckCircle2, 
  Zap, 
  Layout, 
  Users, 
  ClipboardList, 
  UserPlus, 
  Building2, 
  Globe,
  Search,
  Factory,
  ShoppingBag,
  Truck,
  Coffee,
  Wifi,
  Landmark,
  Home,
  Plus,
  Minus,
  Wrench,
  Leaf,
  Briefcase
} from 'lucide-vue-next';

definePageMeta({
  layout: false
});

const openFaq = ref(null);

const sectors = [
  { name: 'Agroalimentari', desc: 'Innovació en la producció i transformació d\'aliments sostenibles.', icon: Leaf },
  { name: 'Manufacturer', desc: 'Tecnologia aplicada a la producció industrial i processos de fabricació.', icon: Factory },
  { name: 'Energia i Aigua', desc: 'Gestió eficient de recursos naturals i energies renovables.', icon: Zap },
  { name: 'Construcció', desc: 'Edificació eficient, obra civil i rehabilitació sostenible.', icon: Building2 },
  { name: 'Comerç i Turisme', desc: 'Serveis de venda al detall i creació d\'experiències turístiques.', icon: ShoppingBag },
  { name: 'Transport', desc: 'Logística avançada i mobilitat intel·ligent de mercaderies.', icon: Truck },
  { name: 'Hoteleria', desc: 'Excel·lència en la gestió d\'allotjaments i serveis de restauració.', icon: Coffee },
  { name: 'Informació i Comunicació', desc: 'Desenvolupament de software, xarxes i telecomunicacions.', icon: Wifi },
  { name: 'Financer', desc: 'Serveis bancaris, assegurances i gestió d\'inversions.', icon: Landmark },
  { name: 'Immobiliari', desc: 'Gestió, promoció i comercialització d\'actius immobiliaris.', icon: Home },
  { name: 'Professional', desc: 'Consultoria tècnica, serveis jurídics i assessorament expert.', icon: Briefcase },
];

const steps = [
  { title: 'Registre', desc: 'Crea el compte de centre i professorat per accedir al panell.', icon: Building2, color: 'text-[#022B3A] bg-[#022B3A]/10 border-[#022B3A]/20' },
  { title: 'Exploració', desc: 'Navega pel catàleg filtrant per sectors i modalitats.', icon: Search, color: 'text-[#1F7A8C] bg-[#1F7A8C]/10 border-[#1F7A8C]/20' },
  { title: 'Sol·licitud', desc: 'Selecciona fins a 4 alumnes per taller.', icon: UserPlus, color: 'text-[#fb6107] bg-[#fb6107]/10 border-[#fb6107]/20' },
  { title: 'Prioritats', desc: 'Indica l\'ordre de preferència dels tallers.', icon: ClipboardList, color: 'text-[#fbb02d] bg-[#fbb02d]/10 border-[#fbb02d]/20' },
  { title: 'Assignació', desc: 'El sistema distribueix les places automàticament.', icon: Zap, color: 'text-[#7cb518] bg-[#7cb518]/10 border-[#7cb518]/20' },
  { title: 'Seguiment', desc: 'Gestiona l\'assistència i les avaluacions en temps real.', icon: Layout, color: 'text-[#022B3A] bg-[#022B3A]/10 border-[#022B3A]/20' }
];

const faqs = [
  { q: "Quants alumnes puc inscriure per taller?", a: "Per garantir la qualitat de l'experiència pràctica i l'atenció personalitzada, el límit està establert en 4 alumnes per centre i taller." },
  { q: "Com funciona la selecció de professors referents?", a: "Cada centre ha de designar almenys un professor referent que acompanyarà els alumnes. En la Modalitat C, es requereix la coordinació de dos referents." },
  { q: "Què passa si no obtenim plaça en la primera opció?", a: "El sistema d'assignació intel·ligent té en compte les segones i terceres opcions per assegurar que el màxim nombre de centres participi en el programa." },
  { q: "És necessari tenir experiència prèvia en el sector?", a: "No, els tallers estan dissenyats per ser introductoris i pràctics. Els alumnes aprendran les bases necessàries durant les sessions amb els experts." },
  { q: "Com es gestiona el transport dels alumnes?", a: "El transport és responsabilitat de cada centre educatiu. No obstant, intentem agrupar els tallers per zones geogràfiques per facilitar la logística." }
];

function toggleFaq(index) {
  openFaq.value = openFaq.value === index ? null : index;
}

function handleNavigate(tab) {
  if (tab === 'login') navigateTo('/login');
  else if (tab === 'register') navigateTo('/register');
}
</script>

<style scoped>
@keyframes scroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(calc(-350px * 11 - 2rem * 11)); }
}
.animate-scroll {
  animation: scroll 40s linear infinite;
}
.animate-scroll:hover {
  animation-play-state: paused;
}
</style>

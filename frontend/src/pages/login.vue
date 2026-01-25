<template>
  <main class="min-h-screen bg-[#E1E5F2] flex flex-col items-center justify-center p-6 font-sans relative">
    
    <!-- Botó superior esquerra: INICI (executa goBack) -->
    <button 
      @click="goBack"
      type="button"
      class="absolute top-8 left-8 flex items-center gap-2 text-[#022B3A]/40 hover:text-[#1F7A8C] transition-all group z-20"
    >
      <div class="p-2 rounded-lg bg-white/50 group-hover:bg-white border border-transparent group-hover:border-[#BFDBF7]/60 transition-all shadow-sm">
        <Home :size="18" />
      </div>
      <span class="text-[10px] font-black uppercase tracking-widest">Inici</span>
    </button>

    <!-- Contenidor principal centrat -->
    <div class="w-full max-w-[340px] animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <!-- Capçalera: títol i subtítol -->
      <header class="mb-12 flex flex-col items-center text-center">
        <h1 class="text-5xl font-light text-[#022B3A] tracking-tighter">
          Entra a <span class="font-extrabold text-[#1F7A8C]">ENGINY</span>
        </h1>
        <p class="text-[10px] font-black text-[#022B3A]/40 uppercase tracking-[0.5em] mt-4">
          Plataforma de Gestió Educativa
        </p>
      </header>

      <!-- Formulari -->
      <form @submit.prevent="handleLogin" class="space-y-6">
        
        <!-- Camp: Usuari (vinculat a form.email) -->
        <div class="space-y-2">
          <label for="email" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1 block">
            Usuari
          </label>
          <div class="relative group">
            <User 
              :size="16" 
              class="absolute left-4 top-1/2 -translate-y-1/2 text-[#022B3A]/20 group-focus-within:text-[#1F7A8C] transition-colors" 
            />
            <input 
              id="email"
              v-model="form.email"
              type="email"
              class="w-full bg-white border border-[#BFDBF7]/60 rounded-xl pl-11 pr-4 py-4 text-sm text-[#022B3A] focus:ring-4 focus:ring-[#1F7A8C]/10 focus:border-[#1F7A8C] outline-none transition-all placeholder:text-[#022B3A]/20 shadow-sm"
              placeholder="exemple@correu.com"
              required
            />
          </div>
        </div>

        <!-- Camp: Contrasenya (vinculat a form.password) -->
        <div class="space-y-2">
          <label for="password" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1 block">
            Contrasenya
          </label>
          <div class="relative group">
            <Lock 
              :size="16" 
              class="absolute left-4 top-1/2 -translate-y-1/2 text-[#022B3A]/20 group-focus-within:text-[#1F7A8C] transition-colors" 
            />
            <input 
              id="password"
              v-model="form.password"
              type="password"
              class="w-full bg-white border border-[#BFDBF7]/60 rounded-xl pl-11 pr-4 py-4 text-sm text-[#022B3A] focus:ring-4 focus:ring-[#1F7A8C]/10 focus:border-[#1F7A8C] outline-none transition-all placeholder:text-[#022B3A]/20 shadow-sm"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <!-- Missatge d'error (lògica del Codi A) -->
        <p v-if="errorMessage" class="text-sm text-red-600 mt-1">{{ errorMessage }}</p>

        <!-- Botó submit: textBoto ("Carregant..." o "Entrar al Panell") segons loading -->
        <button 
          type="submit"
          :disabled="loading"
          class="w-full bg-[#1F7A8C] text-white font-black text-[11px] uppercase tracking-[0.2em] py-4 rounded-xl hover:bg-[#022B3A] hover:shadow-2xl hover:shadow-[#022B3A]/20 transition-all active:scale-[0.98] mt-4 shadow-lg shadow-[#1F7A8C]/10 h-[56px] flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {{ textBoto }}
        </button>
      </form>

      <!-- Divisor -->
      <div class="relative flex items-center justify-center my-10" role="separator">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-[#022B3A]/10"></div>
        </div>
        <span class="relative px-4 bg-[#E1E5F2] text-[#022B3A]/30 text-[10px] font-black uppercase tracking-widest">
          o
        </span>
      </div>

      <!-- Botó secundari: Nou Registre → /register -->
      <div class="space-y-3">
        <NuxtLink 
          to="/register"
          class="w-full flex items-center justify-center gap-3 py-4 bg-white/50 border border-[#BFDBF7]/60 text-[#022B3A] text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white transition-all active:scale-[0.98] group block"
        >
          <UserPlus 
            :size="14" 
            class="text-[#1F7A8C] group-hover:scale-110 transition-transform" 
          />
          Nou Registre
        </NuxtLink>
      </div>

    </div>

  </main>
</template>

<script setup>
import { Home, User, Lock, UserPlus } from 'lucide-vue-next';

// ======================================
// Metadades i layout
// ======================================
definePageMeta({
  layout: false
});

// ======================================
// Estat Reactiu i Refs (Variables i Formularis)
// ======================================
const form = ref({
  email: '',
  password: ''
});
const loading = ref(false);
const errorMessage = ref('');

const textBoto = computed(function () {
  if (loading.value) {
    return 'Carregant...';
  }
  return 'Entrar al Panell';
});

// ======================================
// Lògica i Funcions (Handlers i Lifecycle)
// ======================================

// A) --- Gestionar l'enviament del formulari de login ---
const handleLogin = async function () {
  // 1. Activem l'estat de càrrega i netegem el missatge d'error.
  loading.value = true;
  errorMessage.value = '';

  // 2. Fem la petició a l'API de login.
  try {
    const cosPeticio = {};
    cosPeticio.email = form.value.email;
    cosPeticio.password = form.value.password;

    const resposta = await $fetch('/api/auth/login', {
      method: 'POST',
      body: cosPeticio
    });

    // 3. Si la resposta conté un token, guardem-lo a la cookie authToken.
    if (resposta.token) {
      const tokenCookie = useCookie('authToken', {
        maxAge: 60 * 60 * 24,
        secure: false
      });
      tokenCookie.value = resposta.token;
    }

    // 4. Construïm i mostrem el missatge de benvinguda amb el rol.
    let missatgeBenvinguda = 'Benvingut/da, el teu rol és: ';
    if (resposta.user && resposta.user.rol) {
      missatgeBenvinguda = missatgeBenvinguda + resposta.user.rol;
    } else {
      missatgeBenvinguda = missatgeBenvinguda + 'desconegut';
    }
    // 5. Determinem la ruta de destinació segons el rol de l'usuari.
    let rutaDesti = '/';
    if (resposta.user && resposta.user.rol === 'ADMIN') {
      rutaDesti = '/admin';
    } else if (resposta.user && resposta.user.rol === 'CENTRE') {
      rutaDesti = '/centres';
    } else if (resposta.user && resposta.user.rol === 'PROFESSOR') {
      rutaDesti = '/professors';
    }
    useSwal().fire({ title: 'Benvingut/da', text: missatgeBenvinguda, icon: 'success' }).then(() => { navigateTo(rutaDesti); });
  } catch (err) {
    // 6. En cas d'error, extreure el missatge i assignar-lo a errorMessage.
    console.error('Error en login:', err);
    let missatgeError = 'Error en connectar amb el servidor';
    if (err && err.data) {
      if (err.data.message) {
        missatgeError = err.data.message;
      }
    }
    errorMessage.value = missatgeError;
  } finally {
    // 7. Desactivem l'estat de càrrega.
    loading.value = false;
  }
};

// A) --- Anar a la pàgina d’inici (botó Inici) ---
function goBack() {
  navigateTo('/');
}
</script>

<style scoped>
/* Fons #E1E5F2 i colors de marca a les classes Tailwind. */
</style>

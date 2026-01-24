<template>
  <div class="login-container">
    <h1>Iniciar Sessió</h1>
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="email">Correu electrònic:</label>
        <input
          v-model="form.email"
          type="email"
          id="email"
          placeholder="exemple@correu.com"
          required
        />
      </div>

      <div class="form-group">
        <label for="password">Contrasenya:</label>
        <input
          v-model="form.password"
          type="password"
          id="password"
          placeholder="********"
          required
        />
      </div>

      <div class="actions">
        <button type="submit" :disabled="loading">
          {{ textBoto }}
        </button>

        <NuxtLink to="/register" class="btn-secondary">Registra't</NuxtLink>

        <button type="button" class="btn-secondary" @click="goBack">
          Tornar enrere
        </button>
      </div>

      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </form>
  </div>
</template>

<script setup>
// ======================================
// Importacions i Composables (Rutes, Cookies, Stores)
// ======================================
definePageMeta({
  layout: false
});

// ======================================
// Estat Reactiu i Refs (Variables i Formularis)
// ======================================
const router = useRouter();
const form = ref({
  email: '',
  password: ''
});
const loading = ref(false);
const errorMessage = ref('');

const textBoto = computed(function () {
  if (loading.value) {
    return 'Connectant...';
  } else {
    return 'Entrar';
  }
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
    alert(missatgeBenvinguda);

    // 5. Determinem la ruta de destinació segons el rol de l'usuari.
    let rutaDesti = '/';
    if (resposta.user && resposta.user.rol === 'ADMIN') {
      rutaDesti = '/admin';
    } else if (resposta.user && resposta.user.rol === 'CENTRE') {
      rutaDesti = '/centres';
    } else if (resposta.user && resposta.user.rol === 'PROFESSOR') {
      rutaDesti = '/professors';
    }
    navigateTo(rutaDesti);
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

// A) --- Tornar enrere a la pàgina anterior ---
const goBack = function () {
  // 1. Cridem el mètode back del router.
  router.back();
};
</script>

<style scoped>
.login-container {
  max-width: 460px;
  margin: 3rem auto;
  padding: 22px 20px 20px 26px;
  border-radius: 10px;
  background: #fff;
  border: 1px solid #e9f2ff;
  box-shadow: 0 6px 20px rgba(15, 30, 70, 0.06);
  position: relative;
}

.login-container::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 8px;
  border-top-left-radius: 10px;
  border-bottom-left-radius: 10px;
  background: linear-gradient(180deg, #2b63b6, #4a8fe6);
}

.login-container h1 {
  margin: 0 0 16px 12px;
  color: #1e4f9a;
}

.form-group {
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
}

label {
  margin-bottom: 6px;
  color: #55617a;
  font-weight: 600;
}

input[type="email"],
input[type="password"] {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #e6eef9;
  background: #fbfdff;
}

.actions {
  display: flex;
  gap: 10px;
  margin-top: 1rem;
  align-items: center;
}

button[type="submit"] {
  background: #2b63b6;
  color: white;
  border: none;
  padding: 10px 14px;
  border-radius: 8px;
  cursor: pointer;
}

.btn-secondary {
  background: transparent;
  color: #55617a;
  border: 1px solid #e6eef9;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
}

.btn-secondary:hover {
  background: #f6f9ff;
}

.error {
  color: #d33;
  margin-top: 1rem;
  font-size: 0.95rem;
}
</style>

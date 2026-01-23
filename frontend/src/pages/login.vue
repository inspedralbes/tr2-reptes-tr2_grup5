<template>
<div class="login-container">
    <h1>Iniciar Sesión hola</h1>
    <form @submit.prevent="handleLogin">
    <div class="form-group">
        <label for="email">Email:</label>
        <input 
        v-model="form.email" 
        type="email" 
        id="email" 
        placeholder="ejemplo@correo.com" 
        required 
        />
    </div>

    <div class="form-group">
        <label for="password">Contraseña:</label>
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
        {{ loading ? 'Conectando...' : 'Entrar' }}
        </button>
        
        <NuxtLink to="/register" class="btn-secondary">Registra't</NuxtLink>

        <button type="button" class="btn-secondary" @click="goBack">
        Volver atrás
        </button>
    </div>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </form>
</div>
</template>

<script setup>
definePageMeta({
  layout: false
})
const router = useRouter();

const form = ref({
email: '',
password: ''
});

const loading = ref(false);
const errorMessage = ref('');
const handleLogin = async () => {
loading.value = true;
errorMessage.value = '';

try {
    const response = await $fetch('/api/auth/login', {
    method: 'POST',
    body: form.value
    });

    if (response.token) {
      // Configuració de la cookie segura
      const tokenCookie = useCookie('authToken', {
        maxAge: 60 * 60 * 24, // 1 dia
        secure: false, // En desenvolupament (http) millor false, en prod true
      });
      tokenCookie.value = response.token;
    }

    alert(`Bienvenido, tu rol es: ${response.user.rol}`);
    
    // Mapeig de rols a la seva ruta corresponent (pluralitzada)
    const roleRoutes = {
      'ADMIN': '/admin',
      'CENTRE': '/centres',
      'PROFESSOR': '/professors'
    };

    const targetRoute = roleRoutes[response.user.rol] || '/';
    navigateTo(targetRoute);

    
} catch (err) {
    console.error("Error en login:", err);
    errorMessage.value = err.data?.message || 'Error al conectar con el servidor';
} finally {
    loading.value = false;
}
};

const goBack = () => {
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
    box-shadow: 0 6px 20px rgba(15,30,70,0.06);
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

label { margin-bottom: 6px; color: #55617a; font-weight:600 }

input[type="email"], input[type="password"] {
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

.btn-secondary:hover { background:#f6f9ff }

.error { color: #d33; margin-top: 1rem; font-size: 0.95rem }
</style>
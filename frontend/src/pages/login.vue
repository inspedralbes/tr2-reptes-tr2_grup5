<template>
<div class="login-container">
    <h1>Iniciar Sesión</h1>
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
        
        <button type="button" class="btn-secondary" @click="goBack">
        Volver atrás
        </button>
    </div>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </form>
</div>
</template>

<script setup>
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
    const response = await $fetch('http://localhost:1700/api/login', {
    method: 'POST',
    body: form.value
    });
    const role = response.user?.rol?.toLowerCase();
    if (role === 'admin') {
    await navigateTo('/admin/dashboard');
    } else if (role === 'profe' || role === 'profesor') {
    await navigateTo('/profesor/mis-clases');
    } else if (role === 'alumno') {
    await navigateTo('/alumno/home');
    } else {
    await navigateTo('/dashboard');
    }

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
max-width: 400px;
margin: 2rem auto;
padding: 2rem;
border: 1px solid #eee;
border-radius: 8px;
}

.form-group {
margin-bottom: 1rem;
display: flex;
flex-direction: column;
}

.actions {
display: flex;
gap: 10px;
margin-top: 1rem;
}

.btn-secondary {
background-color: #ccc;
color: #333;
border: none;
padding: 10px;
cursor: pointer;
}

.btn-secondary:hover {
background-color: #bbb;
}

.error {
color: red;
margin-top: 1rem;
font-size: 0.9rem;
}
</style>
<template>
  <div class="register-container">
    <h1>Crear Compte</h1>
    <form @submit.prevent="handleRegister">
      <div class="form-group">
        <label for="email">Email:</label>
        <input 
          v-model="form.email" 
          type="email" 
          id="email" 
          placeholder="nou.usuari@exemple.cat" 
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

      <div class="form-group">
        <label for="confirmPassword">Confirmar Contrasenya:</label>
        <input 
          v-model="form.confirmPassword" 
          type="password" 
          id="confirmPassword" 
          placeholder="********" 
          required 
        />
      </div>

      <div class="form-group">
        <label for="rol">Rol:</label>
        <select v-model="form.rol" id="rol">
          <option value="CENTRE">Centre</option>
          <option value="PROFESSOR">Professor</option>
          <option value="ALUMNE">Alumne</option>
          <option value="ADMIN">Administrador</option>
        </select>
      </div>

      <div class="actions">
        <button type="submit" :disabled="loading">
          {{ loading ? 'Registrant...' : 'Registrar-se' }}
        </button>
        
        <button type="button" class="btn-secondary" @click="goBack">
          Cancel·lar
        </button>
      </div>

      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      <p v-if="successMessage" class="success">{{ successMessage }}</p>
    </form>
  </div>
</template>

<script setup>
const router = useRouter();

const form = ref({
  email: '',
  password: '',
  confirmPassword: '',
  rol: 'CENTRE'
});

const loading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

const handleRegister = async () => {
  loading.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  if (form.value.password !== form.value.confirmPassword) {
    errorMessage.value = "Les contrasenyes no coincideixen.";
    loading.value = false;
    return;
  }

  try {
    const response = await $fetch('http://localhost:1700/api/auth/register', {
      method: 'POST',
      body: {
        email: form.value.email,
        password: form.value.password,
        rol: form.value.rol
      }
    });

    successMessage.value = "Usuari registrat correctament! Redirigint al login...";
    setTimeout(() => {
      router.push('/login');
    }, 2000);
    
  } catch (err) {
    errorMessage.value = err.data?.message || 'Error al registrar usuari.';
  } finally {
    loading.value = false;
  }
};

const goBack = () => {
  router.back();
};
</script>

<style scoped>
.register-container {
  max-width: 400px;
  margin: 2rem auto;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
}

input, select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.actions {
  display: flex;
  gap: 10px;
  margin-top: 1rem;
}

button {
  padding: 0.5rem 1rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background-color: #ccc;
}

.btn-secondary {
  background-color: #6c757d;
}

.error {
  color: red;
  margin-top: 1rem;
}

.success {
  color: green;
  margin-top: 1rem;
}
</style>
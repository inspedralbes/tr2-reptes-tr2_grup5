<template>
  <div class="page">
    <h2>Afegir Professor</h2>
    <form @submit.prevent="submitForm" class="form-container">
      <div class="form-group">
        <label for="nom">Nom:</label>
        <input type="text" id="nom" v-model="form.nom" required />
      </div>

      <div class="form-group">
        <label for="centre">Nom del centre corresponent:</label>
        <input type="text" id="centre" v-model="form.centre" required />
      </div>

      <div class="form-group">
        <label for="email">Email:</label>
        <input type="email" id="email" v-model="form.email" required />
      </div>

      <div class="form-group">
        <label for="password">Contrasenya:</label>
        <input type="password" id="password" v-model="form.password" required />
      </div>

      <button type="submit">Guardar</button>
    </form>
  </div>
</template>

<script setup>
// ======================================
// Importacions i Composables (Rutes, Cookies, Stores)
// ======================================
const header = useHeaderStore();
header.setHeaderCentres();

// ======================================
// Estat Reactiu i Refs (Variables i Formularis)
// ======================================
const form = ref({
  nom: '',
  centre: '',
  email: '',
  password: ''
});

// ======================================
// Lògica i Funcions (Handlers i Lifecycle)
// ======================================

// A) --- Enviar el formulari (pendent de connectar al backend) ---
function submitForm() {
  console.log('Dades del formulari:', form.value);
}
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 50px;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 300px;
  text-align: left;
}

.form-group {
  display: flex;
  flex-direction: column;
}

label {
  margin-bottom: 5px;
  font-weight: bold;
}

input {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  margin-top: 10px;
  padding: 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
}
</style>
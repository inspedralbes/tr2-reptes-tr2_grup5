<template>
  <div class="page">
    <h2>Crear Centre</h2>

    <form @submit.prevent="submitForm">
      <div>
        <label for="nom">Nom</label>
        <input type="text" id="nom" v-model="centre.nom" required />
      </div>

      <div>
        <label for="correu">Correu</label>
        <input type="email" id="correu" v-model="centre.correu" required />
      </div>

      <div>
        <label for="ubicacio">Ubicació</label>
        <input type="text" id="ubicacio" v-model="centre.ubicacio" required />
      </div>

      <div>
        <label>Primera vegada?</label>
        <div>
          <label>
            <input type="radio" value="sí" v-model="centre.primeraVegada" required />
            Sí
          </label>
          <label>
            <input type="radio" value="no" v-model="centre.primeraVegada" />
            No
          </label>
        </div>
      </div>

      <button type="submit">Crear Centre</button>
    </form>
  </div>
</template>

<script setup>
const centre = reactive({
  nom: '',
  correu: '',
  ubicacio: '',
  primeraVegada: ''  // aquí guardamos "sí" o "no"
})

const submitForm = () => {
  if (!centre.primeraVegada) {
    alert('Si us plau, indica si és la primera vegada!')
    return
  }

  console.log('Dades del centre:', { ...centre })
  alert('Centre creat! Revisa la consola.')
}
</script>

<style scoped>
.page {
  max-width: 600px;
  margin: 0 auto;
  padding: 1rem;
}

form div {
  margin-bottom: 1rem;
}

label {
  display: block;
  font-weight: bold;
  margin-bottom: 0.25rem;
}

input[type="text"],
input[type="email"] {
  width: 100%;
  padding: 0.5rem;
  box-sizing: border-box;
}

button {
  padding: 0.5rem 1rem;
  font-weight: bold;
  cursor: pointer;
}

input[type="radio"] {
  margin-right: 0.25rem;
  margin-left: 0.5rem;
}
</style>

<template>
  <div class="page">
    <h2>Crear Taller</h2>

    <form @submit.prevent="submitForm">
      <div>
        <label>Títol</label>
        <input type="text" v-model="taller.titol" required />
      </div>

      <div>
        <label>Descripció</label>
        <textarea v-model="taller.descripcio" rows="4"></textarea>
      </div>

      <div>
        <label>Àmbit</label>
        <input type="text" v-model="taller.ambit" />
      </div>

      <div>
        <label>Modalitat</label>
        <select v-model="taller.modalitat" required>
          <option value="">Selecciona</option>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
        </select>
      </div>

      <div>
        <label>Places mínimes</label>
        <input type="number" v-model.number="taller.places_min" min="0" />
      </div>

      <div>
        <label>Places màximes</label>
        <input type="number" v-model.number="taller.places_max" min="0" />
      </div>

      <div>
        <label>Adreça de realització</label>
        <input type="text" v-model="taller.adreca_realitzacio" />
      </div>

      <div>
        <label>Seleccionar Imatge</label>
        <input type="file" @change="handleFileChange" accept="image/*" />
        <p v-if="taller.imatge_url" style="margin-top: 5px; font-size: 0.9rem; color: #555;">
          <strong>Ruta a guardar:</strong> {{ taller.imatge_url }}
        </p>
      </div>

      <button type="submit">Crear Taller</button>
    </form>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

const taller = reactive({
  titol: '',
  descripcio: '',
  ambit: '',
  modalitat: '',
  places_min: 0,
  places_max: 0,
  adreca_realitzacio: '',
  imatge_url: '' 
})

const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (file) {

    taller.imatge_url = `/images/tallers/${file.name}`
  }
}

const submitForm = async () => {
  if (!taller.titol || !taller.modalitat) {
    useSwal().fire({ title: 'Atenció', text: 'El títol i la modalitat són obligatoris', icon: 'warning' })
    return
  }

  try {
    const response = await $fetch('/api/admin/tallers', {
      method: 'POST',
      body: taller
    })

    console.log('Insertado correctamente:', response)
    useSwal().fire({ title: 'Fet', text: 'Taller creat correctament amb la ruta de la imatge!', icon: 'success' })

    Object.assign(taller, {
      titol: '', descripcio: '', ambit: '', modalitat: '',
      places_min: 0, places_max: 0, adreca_realitzacio: '', imatge_url: ''
    })
  } catch (error) {
    console.error('Error al insertar:', error)
    useSwal().fire({ title: 'Error', text: 'Error: ' + (error.data?.message || error.message), icon: 'error' })
  }
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

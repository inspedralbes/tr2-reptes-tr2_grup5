<template>
  <div class="page">
    <h2>Crear Taller</h2>

    <form @submit.prevent="submitForm" enctype="multipart/form-data">
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
        <label>Imatge</label>
        <input type="file" @change="handleFileChange" accept="image/*" />
      </div>

      <button type="submit">Crear Taller</button>
    </form>
  </div>
</template>

<script setup>
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

let imatgeFile = null

const handleFileChange = (event) => {
  imatgeFile = event.target.files[0]
}

const submitForm = async () => {
  if (!taller.titol || !taller.modalitat) {
    alert('El títol i la modalitat són obligatoris')
    return
  }

  // Subida de imagen: aquí debes subir la imagen a tu servidor o storage y obtener la URL
  if (imatgeFile) {
    // Ejemplo: taller.imatge_url = await uploadImage(imatgeFile)
    taller.imatge_url = 'https://ruta-de-la-imagen.com/' + imatgeFile.name
  }

  // POST al backend
  const response = await $fetch('http://localhost:1700/api/tallers', {
    method: 'POST',
    body: { ...taller }
  })

  console.log('Taller creado:', response)
  alert('Taller creat correctament!')
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

input, textarea, select {
  width: 100%;
  padding: 0.5rem;
  box-sizing: border-box;
}

button {
  padding: 0.5rem 1rem;
  font-weight: bold;
  cursor: pointer;
}
</style>

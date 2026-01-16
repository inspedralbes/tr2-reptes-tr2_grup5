<template>
  <div class="assignacions-page">
    <h2>Assignacions del Centre</h2>

    <div v-if="loading" class="muted">Carregant assignacions...</div>
    <div v-if="error" class="error">{{ error }}</div>

    <div v-if="!loading && !error">
      <button @click="load" class="btn">Refrescar</button>

      <table v-if="assignacions.length" class="table">
        <thead>
          <tr>
            <th>Taller</th>
            <th>Grup / Assignació</th>
            <th>Places reservades</th>
            <th>Inici</th>
            <th>Fi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="a in assignacions" :key="a.id || a.assignacio_taller_id">
            <td>{{ a.taller?.titol || a.titol || a.taller_titol || 'N/D' }}</td>
            <td>{{ a.grup_nom || a.nom_grup || a.assignacio_taller_id || 'N/D' }}</td>
            <td>{{ a.participants || a.num_participants || a.places_reservades || 'N/D' }}</td>
            <td>{{ a.data_inici || a.inici || 'N/D' }}</td>
            <td>{{ a.data_fi || a.fi || 'N/D' }}</td>
          </tr>
        </tbody>
      </table>

      <div v-else class="muted">No hi ha assignacions per aquest centre.</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const assignacions = ref([])
const loading = ref(false)
const error = ref(null)

const load = async () => {
  loading.value = true
  error.value = null
  try {
    const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:1700'
    const res = await fetch(`${API_BASE}/api/centres/assignacions`)
    if (!res.ok) {
      const txt = await res.text()
      throw new Error(`${res.status} ${res.statusText} - ${txt}`)
    }
    assignacions.value = await res.json()
  } catch (err) {
    error.value = 'Error carregant assignacions: ' + (err.message || err)
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.assignacions-page { padding: 1rem; }
.table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
.table th, .table td { border: 1px solid #ddd; padding: 0.5rem; text-align: left; }
.btn { margin-bottom: 0.5rem; }
.muted { color: #666; }
.error { color: #b00; }
</style>

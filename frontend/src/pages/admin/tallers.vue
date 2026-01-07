<template>
  <div class="page">
    <div class="header-actions">
      <h2>Catàleg de Tallers</h2>
      <NuxtLink to="/admin/tallers/FormTallers">
        <button class="btn-primary">Crear Taller</button>
      </NuxtLink>
    </div>

    <div v-if="pending" class="loading">Carregant tallers...</div>
    <div v-else-if="error" class="error">Error carregant els tallers: {{ error.message }}</div>
    
    <div v-else class="table-container">
      <table v-if="tallers && tallers.length > 0">
        <thead>
          <tr>
            <th>ID</th>
            <th>Títol</th>
            <th>Sector</th>
            <th>Modalitat</th>
            <th>Places</th>
            <th>Estat</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="taller in tallers" :key="taller.id">
            <td>#{{ taller.id }}</td>
            <td><strong>{{ taller.titol }}</strong></td>
            <td>{{ taller.sector }}</td>
            <td>
              <span class="badge">{{ taller.modalitat }}</span>
            </td>
            <td>{{ taller.places_maximes }}</td>
            <td>
              <span :class="taller.actiu ? 'status-active' : 'status-archived'">
                {{ taller.actiu ? 'Actiu' : 'Arxivat' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else class="no-data">No hi ha tallers disponibles actualment.</p>
    </div>
  </div>
</template>

<script setup>
const header = useHeaderStore()
header.setHeaderAdmin()

// Fem la petició al backend per obtenir els tallers (només des del client per evitar errors de Docker SSR)
const { data: tallers, pending, error, refresh } = await useFetch('http://localhost:1700/api/admin/tallers', {
  server: false
})
</script>

<style scoped>
.page {
  padding: 20px;
}
.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.btn-primary {
  background-color: #007bff;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  text-decoration: none;
}
.table-container {
  overflow-x: auto;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}
table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}
th, td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #eee;
}
th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #333;
}
tr:hover {
  background-color: #f1f1f1;
}
.badge {
  background-color: #e9ecef;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: bold;
  font-size: 0.9em;
}
.status-active {
  color: #28a745;
  font-weight: bold;
}
.status-archived {
  color: #6c757d;
  font-style: italic;
}
.loading, .error, .no-data {
  text-align: center;
  padding: 20px;
  color: #666;
}
.error {
  color: #dc3545;
}
</style>

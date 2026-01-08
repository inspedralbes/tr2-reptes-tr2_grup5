<template>
  <div class="page">
    <h2>Gestión de Datos</h2>

    <div class="actions">
      <NuxtLink to="/admin/centres/FormCentres">
        <button class="btn-create">Crear centre</button>
      </NuxtLink>

      <button @click="toggleTable" class="btn-toggle">
        Ver {{ mostrarCentres ? 'Usuarios' : 'Centros' }}
      </button>

      <button @click="goBack" class="btn-secondary">Volver</button>
    </div>

    <hr />

    <div v-if="mostrarCentres" class="table-container">
      <h3>Llistat de Centres</h3>
      <table>
        <thead>
          <tr>
            <th>Codi</th>
            <th>Nom</th>
            <th>Municipi</th>
            <th>Email Oficial</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="centre in centres" :key="centre.codi_centre">
            <td>{{ centre.codi_centre }}</td>
            <td>{{ centre.nom_centre }}</td>
            <td>{{ centre.municipi }}</td>
            <td>{{ centre.email_oficial }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="table-container">
      <h3>Llistat d'Usuaris</h3>
      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Rol</th>
            <th>Últim Accés</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in usuarios" :key="user.email">
            <td>{{ user.email }}</td>
            <td><span class="badge">{{ user.rol }}</span></td>
            <td>{{ user.ultim_acces || 'Mai' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
const header = useHeaderStore()
header.setHeaderAdmin()

const mostrarCentres = ref(true)

const { data: centres, pending, error, refresh } = await useFetch('/api/admin/centres')

const toggleTable = () => {
  mostrarCentres.value = !mostrarCentres.value
}
</script>

<style scoped>
.actions {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

th {
  background-color: #f4f4f4;
}

.badge {
  background: #e0e0e0;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.8em;
}

.btn-toggle {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 8px 16px;
  cursor: pointer;
}

.btn-create {
  padding: 8px 16px;
  cursor: pointer;
}
</style>
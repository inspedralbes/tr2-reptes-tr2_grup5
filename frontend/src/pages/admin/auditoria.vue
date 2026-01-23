<template>
  <div class="page">
    <div class="header-actions">
      <h2>Auditoria del Sistema</h2>
    </div>

    <div v-if="pending" class="loading-state">
      <div class="spinner"></div>
      <p>Carregant logs d'auditoria...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p>Error carregant els logs: {{ error.message }}</p>
    </div>

    <div v-else class="content">
      <div v-if="logs && logs.length > 0" class="table-wrapper">
        <table class="logs-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Acció</th>
              <th>Taula</th>
              <th>Usuari</th>
              <th>Valor anterior</th>
              <th>Valor nou</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in logs" :key="log.id">
              <td>{{ formatDate(log.data_registre) }}</td>
              <td><span class="badge-accio">{{ log.accio }}</span></td>
              <td>{{ log.taula_afectada || '—' }}</td>
              <td>{{ log.usuari_email || '—' }}</td>
              <td class="cell-text" :title="log.valor_anterior">{{ truncate(log.valor_anterior, 80) }}</td>
              <td class="cell-text" :title="log.valor_nou">{{ truncate(log.valor_nou, 80) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="empty-msg">No hi ha logs d'auditoria.</p>
    </div>
  </div>
</template>

<script setup>
const token = useCookie('authToken');

const { data: logs, pending, error } = await useFetch('http://localhost:1700/api/admin/logs', {
  headers: { Authorization: `Bearer ${token.value}` },
  initialCache: false
});

function formatDate (valor) {
  if (!valor) return '—';
  const d = new Date(valor);
  return d.toLocaleString('ca-CA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function truncate (text, max) {
  if (!text) return '—';
  const str = String(text);
  if (str.length <= max) return str;
  return str.slice(0, max) + '...';
}
</script>

<style scoped>
.page {
  padding: 20px;
  background: #f0f2f5;
  min-height: 100vh;
}
.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.header-actions h2 {
  margin: 0;
  color: #1e293b;
}
.btn-primary {
  background-color: #007bff;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.loading-state,
.error-state {
  text-align: center;
  padding: 50px;
  color: #64748b;
}
.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.table-wrapper {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  overflow: auto;
}
.logs-table {
  width: 100%;
  border-collapse: collapse;
}
.logs-table th {
  text-align: left;
  padding: 12px 16px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #64748b;
  border-bottom: 2px solid #e2e8f0;
}
.logs-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.9rem;
  color: #334155;
}
.logs-table tbody tr:hover {
  background: #f8fafc;
}
.badge-accio {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  background: #e0f2fe;
  color: #0369a1;
}
.cell-text {
  max-width: 240px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.empty-msg {
  padding: 40px;
  text-align: center;
  color: #64748b;
}
</style>
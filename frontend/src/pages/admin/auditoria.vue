<template>
  <div class="page">
    <div class="header-actions">
      <h2>Auditoria del Sistema</h2>
      <button class="btn-primary">Exportar PDF/CSV</button>
    </div>
    <div class="content">
      <p>Registre d'activitat i auditoria...</p>
    </div>
  </div>
</template>

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
}
</style>

<template>
  <div class="page">
    <div class="header-actions">
      <h2>Estadístiques</h2>
      <div class="buttons">
        <button class="btn-secondary">Configuració Enquesta</button>
        <button class="btn-primary">Exportar PDF/CSV</button>
      </div>
    </div>
    <div class="content">
      <p>Gràfics i estadístiques del sistema...</p>
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
.buttons {
  display: flex;
  gap: 10px;
}
.btn-primary {
  background-color: #007bff;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.btn-secondary {
  background-color: #6c757d;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
</style>

<template>
  <div class="page">
    <div class="header-actions">
      <h2>Llista d'Alumnes del Taller</h2>
      <button class="back-link" @click="navigateTo('/professors/tallers')">
        ← Tornar als tallers
      </button>
    </div>

    <div v-if="pending" class="loading">Carregant alumnes...</div>
    <div v-else-if="error" class="error">Error carregant els alumnes: {{ error.message }}</div>

    <div v-else class="content-container">
      <div v-if="limitInfo" class="limit-info">
        <p>Places ocupades: <strong>{{ alumnes.length }}</strong> de <strong>{{ limitInfo.max }}</strong></p>
        <div class="progress-bar">
          <div class="progress" :style="{ width: (alumnes.length / limitInfo.max * 100) + '%' }"></div>
        </div>
      </div>

      <div class="add-student-form" v-if="!isFull">
        <div class="form-group">
          <input 
            v-model="newStudentName" 
            type="text" 
            placeholder="Nom i Cognoms de l'alumne"
            @keyup.enter="addStudent"
          />
          <button @click="addStudent" :disabled="!newStudentName" class="btn-add">
            Afegir Alumne
          </button>
        </div>
      </div>
      <div v-else class="limit-reached">
        <p>Has assolit el nombre màxim d'alumnes per aquest taller.</p>
      </div>

      <div class="students-list">
        <div v-if="alumnes.length === 0" class="no-students">
          No hi ha alumnes afegits encara.
        </div>
        <div v-else v-for="alumne in alumnes" :key="alumne.id" class="student-item">
          <span class="student-name">{{ alumne.nom_alumne }}</span>
          <button class="btn-delete" @click="deleteStudent(alumne.id)" title="Eliminar alumne">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute();
const token = useCookie('authToken');
const header = useHeaderStore();
header.setHeaderProfessors();

const tallerId = route.params.id;
const newStudentName = ref('');
const limitInfo = ref({ max: 0 }); // Iniciarem amb 0 fins que carreguem dades si cal o podem passar-ho per state

// Fetch alumnes
const { data: alumnes, pending, error, refresh } = await useFetch(`http://localhost:1700/api/professors/tallers/${tallerId}/alumnes`, {
  server: false,
  headers: {
    Authorization: token.value ? `Bearer ${token.value}` : ''
  }
});

// Com que no tenim un endpoint per agafar info del taller specific, podem fer un fetch als tallers i filtrar (una mica ineficient pero serveix per ara)
// O idealment, l'endpoint de alumnes podria retornar tb la info del taller.
// Per simplificar, assumeixo que l'usuari ve de la llista i podriem passar dades, pero millor fer un fetch independent si es pot.
// En aquest cas, farem un fetch als tallers assignats i buscarem aquest per saber el limit.
const { data: tallers } = await useFetch('http://localhost:1700/api/professors/tallers', {
  server: false,
  headers: {
    Authorization: token.value ? `Bearer ${token.value}` : ''
  }
});

watch(tallers, (newTallers) => {
  if (newTallers) {
    const currentTaller = newTallers.find(t => t.detall_id == tallerId);
    if (currentTaller) {
      limitInfo.value.max = currentTaller.num_participants;
      console.log("Limit taller:", limitInfo.value.max);
    }
  }
}, { immediate: true });


const isFull = computed(() => {
  return alumnes.value && limitInfo.value.max > 0 && alumnes.value.length >= limitInfo.value.max;
});


const addStudent = async () => {
  if (!newStudentName.value) return;

  try {
    await $fetch(`http://localhost:1700/api/professors/tallers/${tallerId}/alumnes`, {
      method: 'POST',
      headers: {
        Authorization: token.value ? `Bearer ${token.value}` : ''
      },
      body: { nom_alumne: newStudentName.value }
    });
    newStudentName.value = '';
    refresh();
  } catch (e) {
    alert(e.data?.message || 'Error afegint alumne');
  }
};

const deleteStudent = async (studentId) => {
  if (!confirm('Estàs segur que vols eliminar aquest alumne?')) return;
  
  try {
    await $fetch(`http://localhost:1700/api/professors/tallers/${tallerId}/alumnes/${studentId}`, {
      method: 'DELETE',
      headers: {
        Authorization: token.value ? `Bearer ${token.value}` : ''
      }
    });
    refresh();
  } catch (e) {
    alert('Error eliminant alumne');
  }
};
</script>

<style scoped>
.page {
  padding: 30px;
  max-width: 800px;
  margin: 0 auto;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.header-actions h2 {
  font-size: 1.8rem;
  color: #1a202c;
  margin: 0;
}

.back-link {
  background: none;
  border: none;
  color: #3b82f6;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
}

.limit-info {
  background: #f8fafc;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #e2e8f0;
}

.progress-bar {
  height: 8px;
  background-color: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 8px;
}

.progress {
  height: 100%;
  background-color: #3b82f6;
  transition: width 0.3s ease;
}

.add-student-form {
  margin-bottom: 30px;
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  border: 1px solid #e2e8f0;
}

.form-group {
  display: flex;
  gap: 10px;
}

.form-group input {
  flex-grow: 1;
  padding: 10px 15px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 1rem;
}

.btn-add {
  padding: 10px 20px;
  background-color: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-add:hover {
  background-color: #059669;
}

.btn-add:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.limit-reached {
  background-color: #fff1f2;
  color: #e11d48;
  padding: 15px;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 20px;
  font-weight: 500;
}

.students-list {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  overflow: hidden;
}

.student-item {
  padding: 15px 20px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.student-item:last-child {
  border-bottom: none;
}

.student-name {
  font-size: 1.1rem;
  color: #334155;
}

.btn-delete {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
  transition: color 0.2s;
}

.btn-delete:hover {
  color: #ef4444;
  background-color: #fef2f2;
}

.no-students {
  padding: 40px;
  text-align: center;
  color: #64748b;
  font-style: italic;
}

.loading, .error {
  text-align: center;
  padding: 40px;
}
</style>

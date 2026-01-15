<template>
  <div class="page">
    <div class="form-container">
      <h2>Crear Nou Taller</h2>
      <p class="subtitle">Defineix l'oferta formativa per al proper curs</p>

      <form @submit.prevent="submitForm" class="taller-form">
        
        <!-- SECCIÓ 1: IDENTIFICACIÓ -->
        <div class="section">
          <h3>Identificació i Contingut</h3>
          
          <div class="form-group">
            <label for="titol">Títol del Taller *</label>
            <input 
              type="text" 
              id="titol" 
              v-model="form.titol" 
              placeholder="Ex: Introducció a la Robòtica"
              required 
            />
          </div>

          <div class="form-group">
            <label for="descripcio">Descripció Pedagògica</label>
            <textarea 
              id="descripcio" 
              v-model="form.descripcio" 
              rows="4" 
              placeholder="Detalla els objectius i continguts..."
            ></textarea>
          </div>

          <div class="form-group">
            <label for="sector">Sector Professional *</label>
            <select id="sector" v-model="form.sector" required>
              <option value="" disabled>Selecciona un sector</option>
              <option v-for="sector in sectors" :key="sector" :value="sector">
                {{ sector }}
              </option>
            </select>
          </div>
        </div>

        <!-- SECCIÓ 2: LOGÍSTICA I MODALITAT -->
        <div class="section">
          <h3>Modalitat i Logística</h3>

          <div class="form-group">
            <label>Modalitat *</label>
            <div class="radio-group">
              <label class="radio-card" :class="{ active: form.modalitat === 'A' }">
                <input type="radio" value="A" v-model="form.modalitat" />
                <span>Modalitat A</span>
              </label>
              <label class="radio-card" :class="{ active: form.modalitat === 'B' }">
                <input type="radio" value="B" v-model="form.modalitat" />
                <span>Modalitat B</span>
              </label>
              <label class="radio-card" :class="{ active: form.modalitat === 'C' }">
                <input type="radio" value="C" v-model="form.modalitat" />
                <span>Modalitat C</span>
              </label>
            </div>
            
            <!-- Càlcul automàtic de durada -->
            <div v-if="form.modalitat" class="info-box">
              <p><strong>Durada estimada:</strong> {{ duradaCalculada }}</p>
            </div>
          </div>

          <div class="row">
            <div class="form-group half">
              <label>Places Màximes</label>
              <input type="number" v-model.number="form.places_maximes" min="1" />
            </div>
            
            <div class="form-group half">
              <label>Trimestres Disponibles *</label>
              <div class="checkbox-group">
                <label><input type="checkbox" value="1r" v-model="form.trimestres" /> 1r Trimestre</label>
                <label><input type="checkbox" value="2n" v-model="form.trimestres" /> 2n Trimestre</label>
                <label><input type="checkbox" value="3r" v-model="form.trimestres" /> 3r Trimestre</label>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>Ubicació / Entitat</label>
            <input type="text" v-model="form.ubicacio" placeholder="Ex: Biciclot" />
          </div>

          <div class="form-group">
            <label>Adreça de l'Activitat</label>
            <input type="text" v-model="form.adreca" placeholder="Carrer, número, ciutat..." />
          </div>
        </div>

        <div class="actions">
          <button type="submit" class="btn-submit" :disabled="loading">
            {{ loading ? 'Creant Taller...' : 'Crear Taller' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Custom Sweet Alert Overlay -->
    <div v-if="showSuccessModal" class="modal-overlay">
      <div class="modal-content">
        <div class="success-icon">✓</div>
        <h3>Taller Creat!</h3>
        <p>El taller s'ha afegit correctament al catàleg.</p>
        <button @click="closeModal" class="btn-modal">D'acord</button>
      </div>
    </div>
  </div>
</template>

<script>
import { useHeaderStore } from '@/stores/header'
import { defineComponent, reactive, ref, computed } from 'vue'

export default defineComponent({
  name: 'FormTallers',
  setup() {
    const header = useHeaderStore()
    header.setHeaderAdmin()

    // --- STATE ---
    const loading = ref(false)
    const showSuccessModal = ref(false)
    
    const sectors = [
      "Agroalimentari", "Manufacturer", "Energia i Aigua", "Construcció",
      "Comerç i Turisme", "Transport", "Hoteleria", "Informació i Comunicació",
      "Financer", "Immobiliari", "Professional"
    ]

    const form = reactive({
      titol: '',
      descripcio: '',
      sector: '',
      modalitat: '',
      places_maximes: 12,
      trimestres: [],
      ubicacio: '',
      adreca: ''
    })

    // --- COMPUTED ---
    const duradaCalculada = computed(() => {
      if (['A', 'B'].includes(form.modalitat)) return "20 hores (10 sessions de 2 hores)"
      if (form.modalitat === 'C') return "30 hores (10 sessions de 3 hores)"
      return "Selecciona una modalitat"
    })

    // --- METHODS ---
    const submitForm = async () => {
      // Validacions Frontend
      if (!form.titol || !form.sector || !form.modalitat) {
        alert("Si us plau, omple tots els camps obligatoris (*)")
        return
      }
      if (form.trimestres.length === 0) {
        alert("Has de seleccionar almenys un trimestre.")
        return
      }
      if (form.places_maximes < 1) {
        alert("Les places màximes han de ser com a mínim 1.")
        return
      }

      loading.value = true
      
      try {
        const payload = {
          ...form,
          trimestres_disponibles: form.trimestres.join(', ')
        }

        await $fetch('/api/admin/tallers', {
          method: 'POST',
          headers: {
            'Authorization': localStorage.getItem('authToken')
          },
          body: payload
        })

        showSuccessModal.value = true
        
        // Reset form
        Object.assign(form, {
          titol: '', descripcio: '', sector: '', modalitat: '',
          places_maximes: 12, trimestres: [], ubicacio: '', adreca: ''
        })
      } catch (err) {
        alert("Error al crear el taller: " + (err.response?._data?.message || err.message))
      } finally {
        loading.value = false
      }
    }

    const closeModal = () => {
      showSuccessModal.value = false
      navigateTo('/admin/tallers')
    }

    // Retornem tot el que necessita el template
    return {
      loading,
      showSuccessModal,
      sectors,
      form,
      duradaCalculada,
      submitForm,
      closeModal
    }
  }
})
</script>

<style scoped>
.page {
  padding: 40px;
  background-color: #f4f6f9;
  min-height: 100vh;
}

.form-container {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
}

h2 { color: #333; margin-bottom: 5px; }
.subtitle { color: #666; margin-bottom: 30px; }

.section {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

h3 {
  font-size: 1.1rem;
  color: #007bff;
  margin-bottom: 20px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-group { margin-bottom: 20px; }
.label { display: block; font-weight: 600; margin-bottom: 8px; color: #444; }
.row { display: flex; gap: 20px; }
.half { flex: 1; }

input[type="text"], input[type="number"], select, textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

input:focus, select:focus, textarea:focus {
  border-color: #007bff;
  outline: none;
}

.radio-group {
  display: flex;
  gap: 10px;
}

.radio-card {
  flex: 1;
  border: 1px solid #ddd;
  padding: 15px;
  border-radius: 8px;
  cursor: pointer;
  text-align: center;
  transition: all 0.3s;
}

.radio-card.active {
  background-color: #e7f1ff;
  border-color: #007bff;
  color: #0056b3;
  font-weight: bold;
}

.radio-card input { display: none; }

.checkbox-group {
  display: flex;
  gap: 15px;
  padding-top: 10px;
}

.info-box {
  background: #fff3cd;
  color: #856404;
  padding: 10px;
  border-radius: 6px;
  margin-top: 10px;
  font-size: 0.9rem;
}

.btn-submit {
  width: 100%;
  padding: 15px;
  background: linear-gradient(135deg, #007bff, #0056b3);
  color: white;
  border: none;
  font-size: 1.1rem;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s;
}

.btn-submit:hover { transform: translateY(-2px); }
.btn-submit:disabled { background: #ccc; cursor: not-allowed; }

/* Modal Styles */
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
}
.modal-content {
  background: white;
  padding: 40px;
  border-radius: 15px;
  text-align: center;
  width: 350px;
  animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.success-icon {
  width: 60px; height: 60px;
  background: #28a745; color: white;
  border-radius: 50%;
  font-size: 30px;
  line-height: 60px;
  margin: 0 auto 20px;
}
.btn-modal {
  margin-top: 20px;
  padding: 10px 30px;
  background: #28a745; color: white;
  border: none; border-radius: 20px; cursor: pointer;
}
@keyframes popIn {
  from { transform: scale(0.5); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
</style>

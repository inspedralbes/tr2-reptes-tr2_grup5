<template>
	<div class="page">
		<h2>Sol·licituds de Centres</h2>

		<div v-if="loading">Carregant sol·licituds...</div>
		<div v-else>
			<ul class="list">
				<li v-for="s in solicitudes" :key="s.id" @click="selectSolicitud(s)" :class="s.estat">
					<strong>{{ s.nom_centre }}</strong>
					<div class="meta">{{ s.email_coordinador }} · {{ s.telefon || '—' }}</div>
					<div class="status">{{ s.estat }}</div>
				</li>
			</ul>

			<div v-if="selected" class="detail">
				<h3>Detall: {{ selected.nom_centre }}</h3>
				<p><strong>Codi:</strong> {{ selected.codi_centre }}</p>
				<p><strong>Nom:</strong> {{ selected.nom_centre }}</p>
				<p><strong>Email coordinador:</strong> {{ selected.email_coordinador }}</p>
				<p><strong>Telèfon:</strong> {{ selected.telefon || '—' }}</p>
				<p><strong>Adreça:</strong> {{ selected.adreca || '—' }}</p>
				<p><strong>Primera vegada:</strong> {{ selected.es_primera_vegada ? 'Sí' : 'No' }}</p>
				<p><strong>Data creació:</strong> {{ selected.data_creacio || selected.created_at || '—' }}</p>
				<p><strong>Estat:</strong> {{ selected.estat }}</p>

				<div class="actions">
					<button @click="updateEstado(selected.id, 'acceptada')" :disabled="actionLoading">Acceptar</button>
					<button @click="updateEstado(selected.id, 'rebutjada')" :disabled="actionLoading">Rebutjar</button>
					<button @click="closeDetail">Tancar</button>
				</div>
				<p v-if="actionMessage" class="msg">{{ actionMessage }}</p>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const backendBase = 'http://localhost:1700'

const solicitudes = ref([])
const loading = ref(true)
const selected = ref(null)
const actionLoading = ref(false)
const actionMessage = ref('')

const fetchSolicitudes = async () => {
	loading.value = true
	try {
		const res = await $fetch(`${backendBase}/api/admin/solicituds/centres`)
		// normalize response to array
		if (Array.isArray(res)) {
			solicitudes.value = res
		} else if (res && typeof res === 'object') {
			// common shapes: { data: [...] } or keyed object
			if (Array.isArray(res.data)) solicitudes.value = res.data
			else solicitudes.value = Object.values(res)
		} else {
			solicitudes.value = []
		}
	} catch (err) {
		console.error('Error fetching solicitudes', err)
		solicitudes.value = []
	} finally {
		loading.value = false
	}
}

const selectSolicitud = (s) => {
	try {
		selected.value = JSON.parse(JSON.stringify(s))
	} catch (e) {
		selected.value = s
	}
	actionMessage.value = ''
}

const closeDetail = () => { selected.value = null }

const updateEstado = async (id, estado) => {
	if (!confirm(`Estàs segur que vols marcar la sol·licitud com ${estado}?`)) return
	actionLoading.value = true
	actionMessage.value = ''
	try {
		const res = await $fetch(`${backendBase}/api/admin/solicituds/centres/${id}`, {
			method: 'PUT',
			body: { estat: estado }
		})
		actionMessage.value = res?.message || 'Actualitzat'
		// refresh list
		await fetchSolicitudes()
		// update selected item from list
		const found = solicitudes.value.find(x => x.id === id) || null
		selected.value = found ? JSON.parse(JSON.stringify(found)) : null
	} catch (err) {
		console.error('Error updating estado', err)
		actionMessage.value = err?.data?.message || 'Error actualitzant'
	} finally {
		actionLoading.value = false
	}
}

onMounted(fetchSolicitudes)
</script>

<style scoped>
.list { list-style:none; padding:0 }
.list li { padding:10px; border-bottom:1px solid #eee; cursor:pointer; display:flex; justify-content:space-between }
.list li.pendent { background:#fff }
.list li.acceptada { background:#e6ffea }
.list li.rebutjada { background:#ffecec }
.meta { color:#666; font-size:0.9em }
.status { font-weight:bold }
.detail { margin-top:1rem; padding:1rem; border:1px solid #ddd; background:#fafafa }
.actions { margin-top:1rem; display:flex; gap:8px }
.msg { margin-top:0.5rem; color:green }
</style>

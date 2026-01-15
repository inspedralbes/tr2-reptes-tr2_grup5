<template>
	<div class="page">
		<h2>Sol·licituds de Centres <small v-if="pendingCount">({{ pendingCount }} pendents)</small></h2>

		<div v-if="loading">Carregant sol·licituds...</div>
		<div v-else>
			<div>
				<div v-if="pendingSolicitudes.length === 0" class="empty-message">No hay solicitudes pendientes</div>
				<ul v-else class="list">
					<li v-for="s in pendingSolicitudes" :key="s.id" @click="selectSolicitud(s)" :class="['item', s.estat]">
						<div class="item-left">
							<div class="avatar">{{ (s.nom_centre_manual || s.nom_centre || '').charAt(0) || '?' }}</div>
							<div class="info">
								<strong class="name">{{ s.nom_centre_manual ? s.nom_centre_manual : s.nom_centre }}</strong>
								<div class="meta">{{ s.email_coordinador }} · {{ s.telefon || '—' }}</div>
							</div>
						</div>
						<div class="item-right">
							<div class="centre-name">{{ s.centre_display || s.nom_centre }}</div>
							<div class="status-badge">{{ s.estat }}</div>
							<div class="row-actions">
								<button class="btn-accept" @click.stop="updateEstado(s.id, 'acceptada')" :disabled="actionLoading" title="Acceptar">Acceptar</button>
								<button class="btn-reject" @click.stop="updateEstado(s.id, 'rebutjada')" :disabled="actionLoading" title="Rebutjar">Rebutjar</button>
							</div>
						</div>
					</li>
				</ul>
			</div>

			<div v-if="selected" class="detail">
				<h3>Detall: {{ selected.nom_centre }}</h3>
				<div class="detail-row"><div class="detail-label">Codi</div><div class="detail-tag">{{ selected.codi_centre || '—' }}</div></div>
				<div class="detail-row"><div class="detail-label">Nom</div><div class="detail-tag">{{ selected.nom_centre }}</div></div>
				<div class="detail-row"><div class="detail-label">Email coordinador</div><div class="detail-tag">{{ selected.email_coordinador }}</div></div>
				<div class="detail-row"><div class="detail-label">Telèfon</div><div class="detail-tag">{{ selected.telefon || '—' }}</div></div>
				<div class="detail-row"><div class="detail-label">Adreça</div><div class="detail-tag">{{ selected.adreca || '—' }}</div></div>
				<div class="detail-row"><div class="detail-label">Primera vegada</div><div class="detail-tag">{{ selected.es_primera_vegada ? 'Sí' : 'No' }}</div></div>
				<div class="detail-row"><div class="detail-label">Data enviament</div><div class="detail-tag">{{ selected.data_enviament_formatted || selected.data_creacio || '—' }}</div></div>
				<div class="detail-row"><div class="detail-label">Estat</div><div class="detail-tag status-badge">{{ selected.estat }}</div></div>
				<p v-if="actionMessage" class="msg">{{ actionMessage }}</p>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'



const solicitudes = ref([])
const loading = ref(true)
const selected = ref(null)
const actionLoading = ref(false)
const actionMessage = ref('')

// Derived lists
const pendingSolicitudes = computed(() => solicitudes.value.filter(s => (s.estat || '').toString().toLowerCase() === 'pendent'))
const pendingCount = computed(() => pendingSolicitudes.value.length)

const fetchSolicitudes = async () => {
	loading.value = true
	try {
		const token = (typeof localStorage !== 'undefined') ? localStorage.getItem('authToken') : ''
		if (!token) {
			console.warn('No auth token found - redirecting to login')
			loading.value = false
			// redirect to login page so user can obtain a token
			navigateTo('/login')
			return
		}
		const res = await $fetch(`/api/solicituds-registre`, {
			headers: { Authorization: `Bearer ${token}` }
		})
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
		// si el servidor devuelve 401/403, redirigimos al login
		if (err?.response?.status === 401 || err?.response?.status === 403) {
			actionMessage.value = 'Accés denegat. Si us plau, inicia sessió amb un usuari amb permisos d\'administrador.'
			navigateTo('/login')
		}
		solicitudes.value = []
	} finally {
		loading.value = false
	}
}

const selectSolicitud = (s) => {
	// If the same solicitud is clicked twice, close the detail (toggle)
	if (selected.value && (selected.value.id === s.id)) {
		selected.value = null
		actionMessage.value = ''
		return
	}

	try {
		const copy = JSON.parse(JSON.stringify(s))
		// format date for display
		copy.data_enviament_formatted = copy.data_enviament ? new Date(copy.data_enviament).toLocaleString() : (copy.data_creacio || '—')
		selected.value = copy
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
		const token = (typeof localStorage !== 'undefined') ? localStorage.getItem('authToken') : ''
		const res = await $fetch(`/api/solicituds-registre/${id}`, {
			method: 'PUT',
			headers: { Authorization: token ? `Bearer ${token}` : '' },
			body: { estat: estado }
		})
		actionMessage.value = res?.message || 'Actualitzat'
			// refresh list
			await fetchSolicitudes()
			// if the user had this solicitud open, close it (it was accepted/rejected and should not remain)
			if (selected.value && selected.value.id === id) {
				selected.value = null
			} else {
				// otherwise update selected item from refreshed list (if exists)
				const found = solicitudes.value.find(x => x.id === id) || null
				selected.value = found ? JSON.parse(JSON.stringify(found)) : null
			}
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
.list { list-style:none; padding:0; margin:0 }
.list .item {
	display:flex;
	align-items:center;
	justify-content:space-between;
	padding:14px 16px;
	border-radius:8px;
	background: #fff;
	margin-bottom:12px;
	box-shadow: 0 1px 0 rgba(15,30,70,0.04);
	border: 1px solid #eef4fb;
	cursor:pointer;
}

.item-left { display:flex; align-items:center; gap:12px }
.avatar {
	width:40px; height:40px; border-radius:50%;
	display:flex; align-items:center; justify-content:center;
	background: linear-gradient(180deg,#e9f2ff,#cfe6ff);
	color:#134a8a; font-weight:700;
}
.info .name { color:#203a63; display:block }
.meta { color:#7a869a; font-size:0.9em }

.item-right { display:flex; align-items:center; gap:16px }
.centre-name { color:#55617a; font-size:0.95em }
.status-badge { background:#e9f8ee; color:#1f8a4a; padding:6px 10px; border-radius:12px; font-weight:600 }
.row-actions { display:flex; gap:8px; align-items:center }
.btn-accept { background:#2ecc71; color:white; border:none; padding:6px 10px; border-radius:6px; cursor:pointer }
.btn-reject { background:#ff6b6b; color:white; border:none; padding:6px 10px; border-radius:6px; cursor:pointer }
.row-actions .btn-icon { background:transparent; border:none; color:#d33; cursor:pointer; font-size:18px }

.item.acceptada { border-left:4px solid #2ecc71 }
.item.pendent { border-left:4px solid #f1c40f }
.item.rebutjada { border-left:4px solid #e74c3c }

.detail { margin-top:1rem; padding:1rem; border:1px solid #dde6f7; background:#fbfdff }
.actions { margin-top:1rem; display:flex; gap:8px }
.msg { margin-top:0.5rem; color:green }

.detail-row { display:flex; align-items:center; gap:12px; margin:8px 0 }
.detail-label { width:160px; color:#6d7a97; font-weight:700 }
.detail-tag { background:#eef7ff; color:#2b63b6; padding:6px 10px; border-radius:12px; font-weight:600 }
</style>

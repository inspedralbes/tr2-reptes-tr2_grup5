<template>
	<div class="page">
		<h1>Sol·licitud de registre de Centre</h1>

		<form @submit.prevent="submitForm" class="form">
			<label>Codi centre
				<input v-model="form.codi_centre" type="text" maxlength="50" required />
			</label>

			<label>Nom del centre
				<input v-model="form.nom_centre" type="text" maxlength="255" required />
			</label>

			<label>Contrasenya (per al compte del centre)
				<input v-model="form.password" type="password" minlength="6" required />
			</label>

			<label>Adreça
				<input v-model="form.adreca" type="text" maxlength="255" />
			</label>

            <label>Email oficial
				<input v-model="form.email_oficial" type="email" maxlength="255" required />
            </label>

			<label>Municipi
				<input v-model="form.municipi" type="text" maxlength="100" />
			</label>

			<label>Telèfon
				<input v-model="form.telefon" type="text" maxlength="20" />
			</label>
            <h1>Informació del coordinador</h1>
			<label>Nom coordinador
				<input v-model="form.nom_coordinador" type="text" maxlength="255" />
			</label>

			<label>Email coordinador
				<input v-model="form.email_coordinador" type="email" maxlength="255" required />
			</label>

			<label>
				<input v-model="form.es_primera_vegada" type="checkbox" /> Primera vegada?
			</label>

			<div class="actions">
				<button type="submit" :disabled="loading">{{ loading ? 'Enviant...' : 'Enviar sol·licitud' }}</button>
				<button type="button" @click="resetForm">Netejar</button>
			</div>

			<p v-if="message" class="message">{{ message }}</p>
			<p v-if="error" class="error">{{ error }}</p>
		</form>
	</div>
</template>

<script setup>
import { ref } from 'vue'

const backendBase = 'http://localhost:1700'

const form = ref({
	codi_centre: '',
	nom_centre: '',
	password: '',
	adreca: '',
	municipi: '',
	telefon: '',
	nom_coordinador: '',
	email_coordinador: '',
	es_primera_vegada: false,
	estat: 'pendent',
	data_creacio: null
})

const loading = ref(false)
const message = ref('')
const error = ref('')

const resetForm = () => {
	form.value = {
		codi_centre: '', nom_centre: '', password: '', adreca: '', municipi: '', telefon: '', nom_coordinador: '', email_coordinador: '', es_primera_vegada: false, estat: 'pendent'
	}
	message.value = ''
	error.value = ''
}

const submitForm = async () => {
	error.value = ''
	message.value = ''

	if (!form.value.codi_centre || !form.value.nom_centre || !form.value.password || !form.value.email_coordinador) {
		error.value = 'Si us plau, omple els camps obligatoris (codi, nom, password, email).'
		return
	}

	loading.value = true
	try {
		form.value.data_creacio = new Date().toISOString()
		const payload = { ...form.value }
		const res = await $fetch(`${backendBase}/api/solicituds/centres`, {
			method: 'POST',
			body: payload
		})

		message.value = res?.message || 'Sol·licitud enviada correctament.'
		resetForm()
	} catch (err) {
		console.error('Error enviant sol·licitud:', err)
		error.value = err?.data?.message || err?.message || 'Error en enviar la sol·licitud'
	} finally {
		loading.value = false
	}
}
</script>

<style scoped>
.page { max-width: 700px; margin: 2rem auto; padding: 1rem }
label { display: block; margin-bottom: 0.75rem }
input[type="text"], input[type="email"], input[type="password"] { width: 100%; padding: .5rem; box-sizing: border-box }
.actions { margin-top: 1rem; display:flex; gap:8px }
.message { color: green; margin-top: .5rem }
.error { color: tomato; margin-top: .5rem }
</style>
<template>
	<div class="page">
		<h1>Sol·licitud de registre de Centre</h1>

		<form @submit.prevent="submitForm" class="form">
			<label>Codi centre
				<input v-model="form.codi_centre" type="text" maxlength="50" required />
			</label>

			<label>Nom del centre
				<select v-model="form.nom_centre" required>
					<option value="" disabled>-- Selecciona un centre --</option>
					<option>Institut Pedralbes</option>
					<option>Institut Tecnològic de Barcelona</option>
					<option>Institut TIC de Barcelona</option>
					<option>Altres</option>
				</select>
			</label>

			<!-- Si el usuario elige 'Altres' mostrar campo para introducir nombre manual -->
			<label v-if="form.nom_centre === 'Altres'">Nom del centre (manual)
				<input v-model="form.nom_centre_manual" type="text" maxlength="255" required />
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

const form = ref({
	codi_centre: '',
	nom_centre: '',
	nom_centre_manual: '',
	password: '',
	adreca: '',
	municipi: '',
	telefon: '',
	nom_coordinador: '',
	email_coordinador: '',
	email_oficial: '',
	es_primera_vegada: false,
	estat: 'pendent'
})

const loading = ref(false)
const message = ref('')
const error = ref('')

const resetForm = () => {
	form.value = {
		codi_centre: '', nom_centre: '', nom_centre_manual: '', password: '', adreca: '', municipi: '', telefon: '', nom_coordinador: '', email_coordinador: '', email_centre: '', es_primera_vegada: false, estat: 'pendent'
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
			// map frontend fields to backend model fields (match DB columns)
			const payload = {
				codi_centre: form.value.codi_centre,
				nom_centre: form.value.nom_centre,
				// if nom_centre is 'Altres' frontend could allow nom_centre_manual, leave null otherwise
				nom_centre_manual: form.value.nom_centre_manual || null,
				password: form.value.password,
				adreca: form.value.adreca,
				municipi: form.value.municipi,
				telefon: form.value.telefon,
				email_centre: form.value.email_oficial || null,
				nom_coordinador: form.value.nom_coordinador,
				email_coordinador: form.value.email_coordinador,
				es_primera_vegada: !!form.value.es_primera_vegada
				// nota: 'estat' y 'data_enviament' los gestiona la BD (valores por defecto)
			}

			// Use relative path so Nuxt dev server can proxy / avoids CORS issues
			const res = await $fetch('http://localhost:1700/api/solicituds-registre', {
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
.page {
	max-width: 760px;
	margin: 2.4rem auto;
	padding: 22px 20px 20px 26px;
	border-radius: 10px;
	background: #fff;
	border: 1px solid #e9f2ff;
	box-shadow: 0 6px 20px rgba(15,30,70,0.06);
	position: relative;
}

.page::before {
	content: '';
	position: absolute;
	left: 0;
	top: 0;
	bottom: 0;
	width: 8px;
	border-top-left-radius: 10px;
	border-bottom-left-radius: 10px;
	background: linear-gradient(180deg, #2b63b6, #4a8fe6);
}

h1 { margin: 0 0 14px 12px; color: #1e4f9a }

form.form { display:block }

label { display: block; margin-bottom: 0.75rem; color:#55617a; font-weight:600 }

input[type="text"], input[type="email"], input[type="password"], select {
	width: 100%;
	padding: 10px 12px;
	box-sizing: border-box;
	border-radius: 8px;
	border: 1px solid #e6eef9;
	background: #fbfdff;
	margin-top: 6px;
}

input[type="checkbox"] { transform: translateY(2px) }

.actions { margin-top: 1.2rem; display:flex; gap:10px }

button[type="submit"] {
	background: #2b63b6;
	color: white;
	border: none;
	padding: 10px 14px;
	border-radius: 8px;
	cursor: pointer;
}

.actions button[type="button"] {
	background: transparent;
	color: #55617a;
	border: 1px solid #e6eef9;
	padding: 10px 12px;
	border-radius: 8px;
	cursor: pointer;
}

.message { color: #2b8a4a; margin-top: .6rem }
.error { color: #d33; margin-top: .6rem }

/* Responsive */
@media (max-width: 640px) {
	.page { margin: 1.2rem; padding: 16px }
	.page::before { width:6px }
}
</style>
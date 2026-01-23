<template>
    <div>
        <h1>Logs</h1>
    </div>
    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Usuari</th>
                <th>Acció</th>
                <th>Taula</th>
                <th>Valor anterior</th>
                <th>Valor nou</th>
                <th>Data Registre</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="log in logs" :key="log.id">
                <td>{{ log.id }}</td>
                <td>{{ log.usuari_email }}</td>
                <td>{{ log.accio }}</td>
                <td>{{ log.taula_afectada }}</td>
                <td>{{ log.valor_anterior }}</td>
                <td>{{ log.valor_nou }}</td>
                <td>{{ log.data_registre }}</td>
            </tr>
        </tbody>
    </table>
</template>

<script setup>

const tokenCookie = useCookie('authToken');
const { data: logs, pending, error, refresh } = await useFetch('http://localhost:1700/api/admin/logs', {
    server: false,
    headers: {
        Authorization: tokenCookie.value ? `Bearer ${tokenCookie.value}` : ''
    }
    
})
</script>
<style scoped>

table {
    width: 100%;
    border-collapse: collapse;
}

th, td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
}

th {
    background-color: #f2f2f2;
}
</style>
export default defineNuxtRouteMiddleware((to, from) => {
    // Si estem en server-side rendering, no tenim accés a localStorage
    // PERO ara fem servir cookies, així que PODEM validar al servidor!

    // useCookie funciona tant a client com a servidor
    const tokenCookie = useCookie('authToken');
    const token = tokenCookie.value;

    // 1. Rutes públiques que no requereixen autenticació
    const publicRoutes = ['/login', '/register', '/'];
    if (publicRoutes.includes(to.path)) {
        return;
    }

    // 2. Si no hi ha token i la ruta no és pública, cap a l’index (benvinguda)
    if (!token) {
        return navigateTo('/');
    }

    // 3. Descodifiquem el token per saber el rol
    try {
        const payloadBase64 = token.split('.')[1];
        const payloadJson = atob(payloadBase64);
        const user = JSON.parse(payloadJson);

        // 4. Comprovació de rols (RBAC)
        // Definim quines rutes comencen per quin prefix i quin rol requereixen
        // Si no es compleix, redirigim a la pàgina d'inici (/)

        if (to.path.startsWith('/admin') && user.rol !== 'ADMIN') {
            return navigateTo('/');
        }

        if (to.path.startsWith('/centres') && user.rol !== 'CENTRE') {
            return navigateTo('/');
        }

        if (to.path.startsWith('/professors') && user.rol !== 'PROFESSOR') {
            return navigateTo('/');
        }

        if (to.path.startsWith('/alumnes') && user.rol !== 'ALUMNE') {
            return navigateTo('/');
        }

        // Si l'usuari no té cap rol vàlid, o intenta accedir a una ruta protegida sense el rol,
        // les condicions anteriors l'hauran enviat a '/', que és el comportament desitjat.

    } catch (e) {
        console.error('Token invàlid', e);
        const tokenCookie = useCookie('authToken');
        tokenCookie.value = null; // Esborrem cookie
        return navigateTo('/login');
    }
});

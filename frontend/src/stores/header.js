import { defineStore } from 'pinia'

// Store per al títol, visibilitat i botons del capçal.
export const useHeaderStore = defineStore('header', {
  state: function () {
    return {
      title: '',
      showHeader: true,
      buttons: [], // Elements amb { label, route }
      userName: 'Usuari',
      userRole: '—'
    };
  },
  actions: {
    // A) --- Obtenir perfil de l'usuari ---
    async fetchUserProfile() {
      try {
        const token = useCookie('authToken').value;
        if (!token) return;

        const data = await $fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (data && data.name) {
          this.userName = data.name;
          this.userRole = data.rol;
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    },
    // A) --- Configurar el capçal amb títol, visibilitat i botons ---
    setHeader(options) {
      // 1. Títol: si es passa, s'assigna; si no, cadena buida.
      if (options.title !== undefined && options.title !== null) {
        this.title = options.title;
      } else {
        this.title = '';
      }
      // 2. showHeader: si es passa, s'usa; si no, true per defecte.
      if (options.showHeader !== undefined) {
        this.showHeader = options.showHeader;
      } else {
        this.showHeader = true;
      }
      // 3. Botons: si es passa un array, s'usa; si no, array buit.
      if (options.buttons !== undefined && options.buttons !== null && Array.isArray(options.buttons)) {
        this.buttons = options.buttons;
      } else {
        this.buttons = [];
      }
    },
    setHeaderAdmin() {
      this.setHeader({
        title: 'Administració CEB',
        buttons: [
          { label: 'Catàleg', route: '/admin/tallers' },
          { label: 'Calendari', route: '/admin/calendari' },
          { label: 'Peticions', route: '/admin/peticions' },
          { label: 'Assignacions', route: '/admin/assignacions' },
          { label: 'Usuaris/Centres', route: '/admin/usuaris' },
          { label: 'Estadístiques', route: '/admin/estadistiques' },
          { label: 'Auditoria', route: '/admin/auditoria' },
          { label: 'Sortir', route: '/login' }
        ]
      });
    },
    setHeaderCentres() {
      this.setHeader({
        title: 'Gestió de Centre',
        buttons: [
          { label: 'Inscripció', route: '/centres/peticions' },
          { label: 'Assignacions', route: '/centres/assignacions' },
          { label: 'Professorat', route: '/centres/professorat' },
          { label: 'Sortir', route: '/login' }
        ]
      });
    },
    setHeaderProfessors() {
      this.setHeader({
        title: 'Panell Professor',
        buttons: [
          { label: 'Panell de Control', route: '/professors/tallers' },
          { label: 'Assistència', route: '/professors/assistencia' },
          { label: 'Avaluacions', route: '/professors/avaluacions' },
          { label: 'Sortir', route: '/login' }
        ]
      });
    },
    setHeaderAlumnes() {
      this.setHeader({
        title: 'Portal Alumne',
        buttons: [
          { label: 'Enquesta', route: '/alumnes/enquesta' },
          { label: 'Informació', route: '/alumnes/info' },
          { label: 'Sortir', route: '/login' }
        ]
      });
    },
    resetHeader() {
      this.title = '';
      this.buttons = [];
    }
  }
});

import { defineStore } from 'pinia'

export const useHeaderStore = defineStore('header', {
  state: () => ({
    title: '',
    showHeader: true,
    buttons: [] // { label, route }
  }),
  actions: {
    setHeader(options) {
      this.title = options.title || ''
      this.showHeader = options.showHeader !== undefined ? options.showHeader : true
      this.buttons = options.buttons || []
    },
    setHeaderAdmin() {
      this.setHeader({
        title: 'Administració CEB',
        buttons: [
          { label: 'Catàleg', route: '/admin/tallers' },
          { label: 'Assignacions', route: '/admin/assignacions' },
          { label: 'Usuaris/Centres', route: '/admin/usuaris' },
          { label: 'Estadístiques', route: '/admin/estadistiques' },
          { label: 'Auditoria', route: '/admin/auditoria' },
          { label: 'Sortir', route: '/' }
        ]
      })
    },
    setHeaderCentres() {
      this.setHeader({
        title: 'Gestió de Centre',
        buttons: [
          { label: 'Inscripció', route: '/centres/peticions' },
          { label: 'Assignacions', route: '/centres/assignacions' },
          { label: 'Professorat', route: '/centres/professorat' },
          { label: 'Sortir', route: '/' }
        ]
      })
    },
    setHeaderProfessors() {
      this.setHeader({
        title: 'Panell Professor',
        buttons: [
          { label: 'Assistència', route: '/professors/assistencia' },
          { label: 'Avaluacions', route: '/professors/avaluacions' },
          { label: 'Els meus Tallers', route: '/professors/tallers' },
          { label: 'Sortir', route: '/' }
        ]
      })
    },
    resetHeader() {
      this.title = ''
      this.buttons = []
    }
  }
})

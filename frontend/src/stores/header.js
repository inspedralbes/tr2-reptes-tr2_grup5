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
        title: 'Panell d\'Admin',
        buttons: [
          { label: 'Tallers', route: '/admin/tallers' },
          { label: 'Centres', route: '/admin/centres' },
          { label: 'Sol·licituds', route: '/admin/sollicituds' },
          { label: 'Sortir', route: '/' }
        ]
      })
    },
    setHeaderCentres() {
      this.setHeader({
        title: 'Centres',
        buttons: [
          { label: 'Tallers', route: '/centres/tallers' },
          { label: 'Professorat', route: '/centres/profesorat' },
          { label: 'Sortir', route: '/' }
        ]
      })
    },
    setHeaderProfes() {
      this.setHeader({
        title: 'Profes',
        buttons: [
          { label: 'Tallers', route: '/profes/tallers' },
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

import Swal from 'sweetalert2'

/**
 * Mixin preconfigurat amb l'estil de la pàgina (#022B3A, #1F7A8C, #BFDBF7, #E1E5F2, Inter).
 * Ús: const swal = useSwal(); await swal.fire({ title: '...', text: '...' });
 * Per confirm: showCancelButton: true; comprovar result.isConfirmed
 */
const themeSwal = Swal.mixin({
  confirmButtonColor: '#1F7A8C',
  cancelButtonColor: '#64748b',
  confirmButtonText: "D'acord",
  cancelButtonText: 'Cancel·lar',
  width: 'min(420px, 90vw)',
  customClass: {
    popup: 'swal-app-theme',
    title: 'swal-app-title',
    htmlContainer: 'swal-app-html',
    confirmButton: 'swal-app-confirm',
    cancelButton: 'swal-app-cancel',
    actions: 'swal-app-actions',
    icon: 'swal-app-icon'
  },
  buttonsStyling: true
})

export function useSwal () {
  return themeSwal
}

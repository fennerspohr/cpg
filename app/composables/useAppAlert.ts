// Composable global para mostrar avisos no estilo do app, em vez do
// alert()/confirm() nativo do navegador (que no Electron empacotado
// para Windows causa um bug conhecido de perda de foco do teclado).

interface AlertState {
  visible: boolean
  message: string
  type: 'success' | 'error' | 'info'
}

const state = reactive<AlertState>({
  visible: false,
  message: '',
  type: 'info',
})

export function useAppAlert() {
  function notify(message: string, type: AlertState['type'] = 'info') {
    state.message = message
    state.type = type
    state.visible = true
  }

  function close() {
    state.visible = false
  }

  return {
    state,
    notify,
    success: (message: string) => notify(message, 'success'),
    error: (message: string) => notify(message, 'error'),
    info: (message: string) => notify(message, 'info'),
    close,
  }
}

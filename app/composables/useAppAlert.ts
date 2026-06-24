// Composable global para mostrar avisos no estilo do app, em vez do
// alert()/confirm() nativo do navegador (que no Electron empacotado
// para Windows causa um bug conhecido de perda de foco do teclado).

interface AlertState {
  visible: boolean
  message: string
  type: 'success' | 'error' | 'info' | 'confirm'
  onClose: (() => void) | null
  onCancel: (() => void) | null
}

const state = reactive<AlertState>({
  visible: false,
  message: '',
  type: 'info',
  onClose: null,
  onCancel: null,
})

export function useAppAlert() {
  function notify(
    message: string,
    type: AlertState['type'] = 'info',
    onClose?: () => void,
    onCancel?: () => void,
  ) {
    state.message = message
    state.type = type
    state.onClose = onClose ?? null
    state.onCancel = onCancel ?? null
    state.visible = true
  }

  function close() {
    state.visible = false
    const cb = state.onClose
    state.onClose = null
    state.onCancel = null
    cb?.()
  }

  function cancel() {
    state.visible = false
    const cb = state.onCancel
    state.onClose = null
    state.onCancel = null
    cb?.()
  }

  return {
    state,
    notify,
    success: (message: string, onClose?: () => void) => notify(message, 'success', onClose),
    error:   (message: string, onClose?: () => void) => notify(message, 'error',   onClose),
    info:    (message: string, onClose?: () => void) => notify(message, 'info',    onClose),
    confirm: (message: string, onConfirm: () => void, onCancel?: () => void) =>
      notify(message, 'confirm', onConfirm, onCancel),
    close,
    cancel,
  }
}

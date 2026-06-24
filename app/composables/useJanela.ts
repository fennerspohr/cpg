// Ponte para o electronAPI exposto pelo preload.
// Fora do Electron (browser/dev), api() retorna null e todas as funções são no-ops seguros.

interface ElectronAPI {
  openWindow:   (type: string, params?: Record<string, unknown>) => void
  minimizeWindow: () => void
  notifyRefresh:  () => void
  onRefresh:    (cb: () => void) => () => void
  navigateMain: (path: string) => void
  onNavigate:   (cb: (path: string) => void) => () => void
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}

function api(): ElectronAPI | null {
  if (typeof window === 'undefined') return null
  return window.electronAPI ?? null
}

export function useJanela() {
  function temElectron(): boolean {
    return api() !== null
  }

  // Abre uma janela filha. Retorna true se conseguiu (Electron), false caso contrário.
  function abrir(type: string, params?: Record<string, unknown>): boolean {
    const a = api()
    if (!a) return false
    a.openWindow(type, params)
    return true
  }

  function minimizar() {
    api()?.minimizeWindow()
  }

  function fechar() {
    if (api()) window.close()
  }

  // Avisa a janela principal que os dados mudaram (ex.: após salvar ou excluir).
  function notificarRefresh() {
    api()?.notifyRefresh()
  }

  // Registra um callback para receber pedidos de refresh de outras janelas.
  function aoReceberRefresh(cb: () => void) {
    return api()?.onRefresh(cb)
  }

  // Navega a janela principal para um caminho — usado de dentro de janelas filhas.
  function navegarNaJanelaPrincipal(path: string) {
    api()?.navigateMain(path)
  }

  // Registra um callback para receber pedidos de navegação vindos de janelas filhas.
  function aoReceberNavegacao(cb: (path: string) => void) {
    return api()?.onNavigate(cb)
  }

  return {
    temElectron,
    abrir,
    minimizar,
    fechar,
    notificarRefresh,
    aoReceberRefresh,
    navegarNaJanelaPrincipal,
    aoReceberNavegacao,
  }
}

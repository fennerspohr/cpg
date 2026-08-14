const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

export function useFormatarData() {
  function formatarData(data: string | null | undefined): string | null {
    if (!data) return null
    const partes = data.substring(0, 10).split('-')
    if (partes.length !== 3) return null
    const [ano, mes, dia] = partes
    return `${dia} ${MESES[parseInt(mes) - 1]} ${ano}`
  }

  function anoVida(nasc?: string | null, morte?: string | null): string {
    const n = nasc?.substring(0, 4)
    const m = morte?.substring(0, 4)
    if (!n) return '?'
    return m ? `${n} – ${m}` : `${n} –`
  }

  return { formatarData, anoVida }
}

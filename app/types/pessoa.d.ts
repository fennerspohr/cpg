declare global {
  interface Pessoa {
    id: number
    nome: string
    sobrenome: string
    sexo: string | null
    datanasc: string | null
    datamorte: string | null
    databatismo: string | null
    localnasc: number | null
    localbatismo: number | null
    localmorte: number | null
    obs: string | null
  }
}

export {}

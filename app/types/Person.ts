
export interface Person {
  id: number;
  sobrenome: string;
  nome: string;
  data_de_nascimento: string | null;
  sexo: 'M' | 'F';
}
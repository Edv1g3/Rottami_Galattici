export interface Tecnico {
  id: string;
  nome: string;
  cognome: string;
  specializzazione: 'CHECK_ROUTINE' | 'SOSTITUZIONE_COMPONENTE' | 'RIPARAZIONE_DANNEGGIAMENTO' | 'RISOLUZIONE_ANOMALIA' | 'ALTRA';
  disponibile: boolean;
  password: string;
}
import { Navicella } from "./navicella.model";

export interface Lavorazione {
  id: string;
  navicella: Navicella & Record<string, any>;
  stato: 'IN_DEFINIZIONE' | 'PERIZIA' | 'IN_ATTESA' | 'IN_RIPARAZIONE' | 'PRONTO' ;
  priorita: 'ROUTINE' | 'URGENTE' | 'CODICE_ROSSO';
  dataAttracco?: Date;
  tecnicoId?: string;
  inizioLavoro?: Date;
  tipoRiparazione?: 'CHECK_ROUTINE' | 'SOSTITUZIONE_COMPONENTE' | 'RIPARAZIONE_DANNEGGIAMENTO' | 'RISOLUZIONE_ANOMALIA' | 'ALTRA';
  note?: string;
  tempoTotaleLavoro?: string;
  pezziRichiesti?: {nome: string, quantita: number}[] ;
}
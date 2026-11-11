export interface Pezzo {
  codice: string;
  descrizione: string;
  quantitaGiacenza: number;
  prezzoUnitario: number;
  richiesta?: boolean;
}
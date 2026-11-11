export type ClasseNavicella = 'Navi da guerra' | 'Navi da viaggio' | 'Veicoli bassa quota' | 'Veicoli marini' | '';

export interface Navicella {
  matricola: string;      
  modello: string;       
  nomeNave: string;          
  classe: ClasseNavicella;
  pilota: string;
}
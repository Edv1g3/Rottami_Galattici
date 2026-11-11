/*Gestione dei pezzi di ricambio*/

import { Injectable } from '@angular/core';
import { Pezzo } from '../model/pezzo.model';

@Injectable({
  providedIn: 'root'
})
export class MagazzinoService {
  private magazzino: Pezzo[] = [
    { codice: 'PZ001', descrizione: 'Motore Ioni', quantitaGiacenza: 5, prezzoUnitario: 1000, },
    { codice: 'PZ002', descrizione: 'Scudo Energetico', quantitaGiacenza: 3, prezzoUnitario: 500 },
    { codice: 'PZ003', descrizione: 'Laser Pulsato', quantitaGiacenza: 10, prezzoUnitario: 200 },
    { codice: 'PZ004', descrizione: 'Sistema di Navigazione', quantitaGiacenza: 2, prezzoUnitario: 1500, richiesta: true  },
    { codice: 'PZ005', descrizione: 'Serbatoio Combustibile', quantitaGiacenza: 7, prezzoUnitario: 800 }
  ];

  constructor() { }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getMagazzino(): Promise<Pezzo[]> {
    await this.delay(300);
    return this.magazzino;
  }

  async isPezzoDisponibile(codice: string, quantita: number = 1): Promise<boolean> {
    const pezzo = await this.getPezzoByCodice(codice);
    return pezzo !== undefined && pezzo.quantitaGiacenza >= quantita;
  }

  async getPezzoByCodice(codice: string): Promise<Pezzo | undefined> {
    await this.delay(150);
    return this.magazzino.find(pezzo => pezzo.codice === codice);
  }

  async prelevarePezzo(codice: string, quantita: number = 1): Promise<boolean> {
    const pezzo = await this.getPezzoByCodice(codice);
    if (pezzo && pezzo.quantitaGiacenza >= quantita) {
      pezzo.quantitaGiacenza -= quantita;

      if (pezzo.quantitaGiacenza <= 2) {
        pezzo.richiesta = true;
      }
      
      return true;
    }
    return false;
  }

  async rifornirePezzo(codice: string, quantita: number = 1): Promise<boolean> {
    const pezzo = await this.getPezzoByCodice(codice);
    await this.delay(10000); // Simula un ritardo per l'operazione di rifornimento
    if (pezzo) {
      pezzo.quantitaGiacenza += quantita;
      if (pezzo.quantitaGiacenza > 2) {
        if (pezzo.richiesta) {
          pezzo.richiesta = false;
        }
      }
      return true;
    }
    else {
      return false;
    }
  }

  async modificaPezzo(codice: string, nuovaDescrizione: string | undefined, nuovoPrezzo: number | undefined): Promise<boolean> {
    const pezzo = await this.getPezzoByCodice(codice);
    if (pezzo) {
      if (nuovaDescrizione !== undefined) {
        pezzo.descrizione = nuovaDescrizione;
      }
      if (nuovoPrezzo !== undefined) {
        pezzo.prezzoUnitario = nuovoPrezzo;
      }
      return true;
    }
    return false;
  }

  async rimuoverePezzo(codice: string): Promise<boolean> {
    await this.delay(150);
    const index = this.magazzino.findIndex(pezzo => pezzo.codice === codice);
    if (index !== -1) {
      this.magazzino.splice(index, 1);
      return true;
    }
    return false;
  }

  async getPezzziDisponibili(): Promise<{codice: string; nome: string}[]> {
    await this.delay(150);
    return this.magazzino
      .filter(pezzo => pezzo.quantitaGiacenza > 0)
      .map(pezzo => ({ codice: pezzo.codice, nome: pezzo.descrizione }));
  }
}
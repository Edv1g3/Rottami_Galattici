/*gestione dei tecnici */

import { Injectable } from "@angular/core";
import { Tecnico } from "../model/tecnico.model";
import { Lavorazione } from "../model/lavorazione.model";

@Injectable({
  providedIn: 'root'
})
export class GestorePersonaleService {
  private tecnici: Tecnico[] = [
    { id: 'T001', nome: 'Julian', cognome: 'Bashir', specializzazione: 'CHECK_ROUTINE', disponibile: true, password: '123' },
    { id: 'T002', nome: 'Leon', cognome: 'Sulu', specializzazione: 'SOSTITUZIONE_COMPONENTE', disponibile: false, password: '123' }
  ];

  constructor() { }

  async getTecnici(): Promise<Tecnico[]> {
    await this.delay(300);
    return this.tecnici;
  }

  async getTecnicoById(id: string): Promise<Tecnico | undefined> {
    await this.delay(300);
    return this.tecnici.find(tecnico => tecnico.id === id);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async IsTecnicoDisponibile(id: string): Promise<boolean> {
    const tecnico = await this.getTecnicoById(id);
    return tecnico ? tecnico.disponibile : false;
  }
}
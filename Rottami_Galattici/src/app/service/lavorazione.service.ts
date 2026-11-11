/*gestisco le operazioni di lavorazione sulle navicelle*/

import { Navicella } from '../model/navicella.model';
import { Lavorazione } from '../model/lavorazione.model';
import { MagazzinoService } from './magazzino.service';

import { Injectable, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LavorazioneService implements OnDestroy {
    private lavorazioniInCorso: Lavorazione[] = [
        { id:'N001', navicella: { matricola: 'NX-74205', modello: 'Defiant', nomeNave: 'USS Defiant', classe: 'Navi da guerra', pilota: 'James T. Kirk'}, stato: 'IN_RIPARAZIONE', priorita: 'ROUTINE', tipoRiparazione: 'CHECK_ROUTINE', dataAttracco: new Date(), tecnicoId: 'T001',pezziRichiesti: [{nome: 'P001', quantita: 2}, {nome: 'P002', quantita: 1}], note: 'Check routine necessario, verificare il sistema di navigazione.' },
        { id:'N002', navicella: { matricola: 'NX-1701', modello: 'Constitution', nomeNave:'USS Enterprise', classe: 'Navi da viaggio', pilota: 'Jean-Luc Picard'}, stato: 'IN_DEFINIZIONE', priorita: 'URGENTE', tipoRiparazione: 'RIPARAZIONE_DANNEGGIAMENTO', dataAttracco: new Date() },
        { id:'N003', navicella: { matricola: 'NX-2000', modello: 'Intrepid', nomeNave: 'USS Voyager', classe: 'Veicoli bassa quota', pilota: 'Kathryn Janeway'}, stato: 'PERIZIA', priorita: 'CODICE_ROSSO', tipoRiparazione: 'RISOLUZIONE_ANOMALIA', dataAttracco: new Date(), tecnicoId: 'T001',  },
        { id:'N004', navicella: { matricola: 'NX-3000', modello:'Discovery', nomeNave: 'USS Discovery', classe: 'Veicoli marini', pilota:'Michael Burnham'}, stato: 'PRONTO', priorita: 'ROUTINE', dataAttracco: new Date(), tecnicoId: 'T002', inizioLavoro: new Date(), tempoTotaleLavoro: "2:00:00", pezziRichiesti: [{nome: 'P006', quantita: 1}] }
    ];

    private delay(ms: number): Promise<void> {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    constructor(private magazzinoService: MagazzinoService) {}

    async getLavorazioniInCorso(): Promise<Lavorazione[]> {
        await this.delay(600);
        return this.lavorazioniInCorso;
    }

    async getLavorazioneById(id: string): Promise<Lavorazione | undefined> {
        await this.delay(300);
        return this.lavorazioniInCorso.find(lavorazione => lavorazione.id === id);
    }

    async creaNuovaLavorazione (Navicella: Navicella): Promise<string> {
        await this.delay(300);
        let id = 'N' + (this.lavorazioniInCorso.length + 1).toString().padStart(3, '0');
        let lavorazione: Lavorazione = {
            id: id,
            navicella: Navicella,
            stato: 'IN_DEFINIZIONE',
            priorita: 'ROUTINE',
            dataAttracco: new Date(),
            pezziRichiesti: [{nome: '', quantita: 0}]
        };
        this.lavorazioniInCorso.push(lavorazione);
        return id !== undefined && id !== null ? id : '';
    }

    async modificaLavorazione(lavorazioneId: string, lavorazioneAggiornata: Partial<Lavorazione>): Promise<boolean> {
        await this.delay(300);
        const lavorazione = await this.getLavorazioneById(lavorazioneId);
        if (lavorazione) {
            const pezziRichiesti = lavorazione.pezziRichiesti ?? [{nome: '', quantita: 0}];

            if (lavorazioneAggiornata.stato !== undefined &&
                lavorazioneAggiornata.stato !== null &&
                lavorazioneAggiornata.stato === 'IN_RIPARAZIONE' &&
                lavorazione.stato === 'IN_ATTESA') {
                // Controllo se tutti i pezzi richiesti sono disponibili in magazzino
                for (const pezzo of pezziRichiesti) {
                    const isDisponibile = await this.magazzinoService.isPezzoDisponibile(pezzo.nome, pezzo.quantita);
                    if (!isDisponibile) {
                        // Se anche un solo pezzo non è disponibile, non posso cambiare lo stato a "IN_RIPARAZIONE"
                        return false;
                    }
                }
                // Se tutti i pezzi sono disponibili, li prelevo dal magazzino
                for (const pezzo of pezziRichiesti) {
                    await this.magazzinoService.prelevarePezzo(pezzo.nome, pezzo.quantita);
                }
            }

            if (lavorazioneAggiornata.stato !== undefined && lavorazioneAggiornata.stato !== null && lavorazioneAggiornata.stato === 'IN_DEFINIZIONE') {
                // Se sono i attesa e ho tutte le info della navicella e del tecnico posso passare alla perizia 
                if (lavorazioneAggiornata.navicella?.classe && lavorazioneAggiornata.navicella?.pilota && lavorazioneAggiornata.navicella?.nomeNave && lavorazioneAggiornata.navicella?.matricola && lavorazioneAggiornata.navicella?.classe && lavorazioneAggiornata.tecnicoId) {
                    lavorazioneAggiornata.stato = 'PERIZIA';
                }
            }

            Object.assign(lavorazione, lavorazioneAggiornata);
            return true;
        }
        return false;
    }

    async inviaPerizia(lavorazioneId: string, lavorazioneAggiornata: Partial<Lavorazione>): Promise<boolean> {
        lavorazioneAggiornata.stato = 'IN_ATTESA';
        return await this.modificaLavorazione(lavorazioneId, lavorazioneAggiornata);
    }

    async rimuoviLavorazione(lavorazioneId: string): Promise<boolean> {
        await this.delay(300);
        const index = this.lavorazioniInCorso.findIndex(n => n.id === lavorazioneId);
        if (index !== -1) {
            this.lavorazioniInCorso.splice(index, 1);
            return true;
        }
        return false;
    }

    async getLavorazioniByTecnicoId(tecnicoId: string): Promise<Lavorazione[]> {
        await this.delay(300);
        const trovate = this.lavorazioniInCorso.filter(lavorazione => lavorazione.tecnicoId && lavorazione.tecnicoId === tecnicoId);
        return trovate;
    }

    private timerRiparazioni: {lavorazioneId: string; timerSub: Subscription | null; startTime: number, accumulatedTime: number, isRunning: boolean, formattedTime: string}[] = [];

    // Lista di funzioni callback per avvisare i componenti attivi quando il tempo cambia
    private listeners: Set<() => void> = new Set();

    public start(lavorazioneId: string): void {
        let timer = this.timerRiparazioni.find(t => t.lavorazioneId === lavorazioneId);
        if (!timer) {
            this.timerRiparazioni.push({
                lavorazioneId,
                timerSub: null,
                startTime: 0,
                accumulatedTime: 0,
                isRunning: false,
                formattedTime: '00:00:00'
            });
            timer = this.timerRiparazioni.find(t => t.lavorazioneId === lavorazioneId)!;
        }

        let lavorazione = this.lavorazioniInCorso.find(l => l.id === lavorazioneId);
        if (lavorazione && lavorazione.inizioLavoro === undefined) {
            lavorazione.inizioLavoro = new Date();
        }

        if (timer.isRunning) return;

        timer.isRunning = true;
        timer.startTime = Date.now() - timer.accumulatedTime;

        timer.timerSub = interval(100).pipe(
        map(() => {
            const elapsed = Date.now() - timer.startTime;
            timer.accumulatedTime = elapsed;
            return this.formatTime(elapsed);
        })
        ).subscribe(time => {
        timer.formattedTime = time;
        // Avvisa tutti i componenti attualmente visibili che il tempo è aggiornato
        this.listeners.forEach(callback => callback());
        });
    }

    public pause(lavorazioneId: string): void {
        const timer = this.timerRiparazioni.find(t => t.lavorazioneId === lavorazioneId);
        if (!timer || !timer.isRunning) return;

        timer.isRunning = false;
        this.stopSubscription(lavorazioneId);
        this.listeners.forEach(callback => callback());
    }

    public reset(lavorazioneId: string): void {
        const timer = this.timerRiparazioni.find(t => t.lavorazioneId === lavorazioneId);
        if (!timer) return;

        this.pause(lavorazioneId);
        // Segno il tempo totale e modifico la lavorazione per poterlo salvare POI elimino il timer
        const lavorazione = this.lavorazioniInCorso.find(l => l.id === lavorazioneId);
        if (lavorazione) {
            lavorazione.tempoTotaleLavoro = timer.formattedTime;
            lavorazione.stato = 'PRONTO';
        }   
        this.timerRiparazioni.filter(t => t.lavorazioneId !== lavorazioneId).pop();
        this.listeners.forEach(callback => callback());
    }

    // Permette a un componente di registrarsi per ricevere gli aggiornamenti grafici
    public registerListener(callback: () => void): void {
        this.listeners.add(callback);
    }

    // Rimuove il componente dalla lista quando viene distrutto
    public unregisterListener(callback: () => void): void {
        this.listeners.delete(callback);
    }

    public getFormattedTime(lavorazioneId: string): string {
        const timer = this.timerRiparazioni.find(t => t.lavorazioneId === lavorazioneId);
        return timer ? timer.formattedTime : '00:00:00';
    }

    private formatTime(ms: number): string {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        const pad = (num: number) => String(num).padStart(2, '0');
        return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }

    private stopSubscription(lavorazioneId: string): void {
        const timer = this.timerRiparazioni.find(t => t.lavorazioneId === lavorazioneId);
        if (timer && timer.timerSub) {
            timer.timerSub.unsubscribe();
            timer.timerSub = null;
        }
    }

    ngOnDestroy(): void {
        for (const timer of this.timerRiparazioni) {
            if (timer.timerSub) {
                timer.timerSub.unsubscribe();
            }
        }
    }

    isRunning(lavorazioneId: string): boolean {
        const timer = this.timerRiparazioni.find(t => t.lavorazioneId === lavorazioneId);
        return timer ? timer.isRunning : false;
    }
}
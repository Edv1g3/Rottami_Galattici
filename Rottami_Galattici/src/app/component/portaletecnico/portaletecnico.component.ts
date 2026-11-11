import { Component, OnDestroy, OnInit } from "@angular/core";
import { GestorePersonaleService } from "../../service/gestorepersonale.service";
import { LavorazioneService } from "../../service/lavorazione.service";
import { FormsModule } from "@angular/forms";
import { ChangeDetectorRef } from "@angular/core";
import { Lavorazione} from "../../model/lavorazione.model";
import { MagazzinoService } from "../../service/magazzino.service";
import { NgClass } from "@angular/common";

interface PezzoSelezionato {
    nome: string;
    quantita: number;
}

@Component({
    selector: "app-portaletecnico",
    templateUrl: "./portaletecnico.component.html",
    styleUrls: ["./portaletecnico.component.css"],
    imports: [FormsModule, NgClass],
})
export class PortaletecnicoComponent implements OnDestroy, OnInit {
    constructor(private ref: ChangeDetectorRef, private gestorePersonale: GestorePersonaleService, private lavorazioneService: LavorazioneService, private magazzinoService: MagazzinoService) {
    }

    private updateCallback = () => {
        this.ref.detectChanges();
        this.lavorando = this.lavorazioneService.isRunning(this.selectedLavorazione!.id);
        this.tempoTrascorso = this.lavorazioneService.getFormattedTime(this.selectedLavorazione!.id);
    };

    ngOnInit(): void {
        this.lavorazioneService.registerListener(this.updateCallback);
        this.ref.detectChanges();
    }
    ngOnDestroy(): void {
        this.lavorazioneService.unregisterListener(this.updateCallback);
    }

    username: string="";
    password: string="";
    log:boolean=false;
    pezziDisponibili: {codice: string; nome: string}[] = [];
    lavorando: boolean = false;
    tempoTrascorso: string ="";



    start(lavorazioneId: string): void {
        this.lavorazioneService.start(lavorazioneId);
        this.ref.detectChanges();
    }

    pause(lavorazioneId: string): void {
        this.lavorazioneService.pause(lavorazioneId);
    }

    reset(lavorazioneId: string): void {
        this.pause(lavorazioneId);
        this.lavorazioneService.reset(lavorazioneId);
    }

    async login() {
        const tecnico = await this.gestorePersonale.getTecnicoById(this.username);
        if (tecnico && tecnico.password === String(this.password)) {
            this.log = true;
            this.lavorazionipersonale = await this.lavorazioneService.getLavorazioniByTecnicoId(this.username);
            // Voglio ordinare le lavorazioni: vorrei avere prima quelle con priorità "CODICE_ROSSO", poi "URGENTE", poi "ROUTINE", 
            // e all'interno di ciascun gruppo voglio ordinare per dataAttracco crescente (le più vecchie prima)
            this.lavorazionipersonale.sort((a, b) => {          //sort ordina e noi gli passiamo una function express che definisce come
                const prioritaOrder = { 'CODICE_ROSSO': 1, 'URGENTE': 2, 'ROUTINE': 3 };
                if (prioritaOrder[a.priorita] !== prioritaOrder[b.priorita]) {
                    return prioritaOrder[a.priorita] - prioritaOrder[b.priorita];
                }
                if (a.dataAttracco && b.dataAttracco) {
                    return a.dataAttracco.getTime() - b.dataAttracco.getTime();
                }
                return 0;
            });
            this.ref.detectChanges();
        }
    }

    lavorazionipersonale: Lavorazione[] = [];

    selectedLavorazione: Lavorazione & Record<string, any> | null = null; 
    protected readonly objectKeys = Object.keys;
    
    async apriLavorazione(lavorazione: Lavorazione) {
        this.selectedLavorazione = lavorazione;

        if (this.selectedLavorazione && !this.selectedLavorazione.pezziRichiesti) {
            this.selectedLavorazione.pezziRichiesti = [];
        }
        if (this.selectedLavorazione.stato === 'PERIZIA') {
            this.pezziDisponibili = await this.magazzinoService.getPezzziDisponibili();
            this.ref.detectChanges();
        }
    }

    async aggiornaNote(){
        if (this.selectedLavorazione) {
            await this.lavorazioneService.modificaLavorazione(this.selectedLavorazione.id, { note: this.selectedLavorazione.note });
            this.ref.detectChanges();
        }
    }

    async inviaPerizia(){
        await this.lavorazioneService.inviaPerizia(this.selectedLavorazione!.id, this.selectedLavorazione!);
        this.selectedLavorazione = null;
        this.ref.detectChanges();
    }

    onPezzoChange(nomePezzo: string, event: Event) {
        if (!this.selectedLavorazione) return;
        
        const checkbox = event.target as HTMLInputElement;
        
        if (checkbox.checked) {
            // Aggiunge l'oggetto usando la chiave 'nome' richiesta dal modello
            this.selectedLavorazione.pezziRichiesti?.push({ nome: nomePezzo, quantita: 1 });
        } else {
            // Rimuove l'oggetto se viene deselezionato
            this.selectedLavorazione.pezziRichiesti = this.selectedLavorazione.pezziRichiesti?.filter(
                (p: PezzoSelezionato) => p.nome !== nomePezzo
            );
        }
    }

    isPezzoSelezionato(nomePezzo: string): boolean {
        if (!this.selectedLavorazione || !this.selectedLavorazione.pezziRichiesti) return false;
        return this.selectedLavorazione.pezziRichiesti.some((p: PezzoSelezionato) => p.nome === nomePezzo);
    }

    getPezzoRiferimento(nomePezzo: string): PezzoSelezionato | undefined {
        if (!this.selectedLavorazione || !this.selectedLavorazione.pezziRichiesti) return undefined;
        return this.selectedLavorazione.pezziRichiesti.find((p: PezzoSelezionato) => p.nome === nomePezzo);
    }
}
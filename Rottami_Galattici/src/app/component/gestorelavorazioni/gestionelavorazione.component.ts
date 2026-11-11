import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from "@angular/core";
import { LavorazioneService } from "../../service/lavorazione.service";
import { Navicella } from "../../model/navicella.model";
import { FormsModule } from "@angular/forms";
import { Lavorazione } from "../../model/lavorazione.model";
import { DatePipe } from "@angular/common";
import { GestorePersonaleService } from "../../service/gestorepersonale.service";
import { NgClass } from "@angular/common";

@Component({
  selector: "app-gestionelavorazione",
  templateUrl: "./gestionelavorazione.component.html",
  styleUrls: ["./gestionelavorazione.component.css"],
  imports: [FormsModule, DatePipe, NgClass],
})
export class GestionelavorazioneComponent implements OnInit, OnDestroy {
  constructor(private cdr: ChangeDetectorRef, private zone: NgZone, private lavorazioneService: LavorazioneService, private gestorePersonaleService: GestorePersonaleService) {}

  nuovaNavicella(): Navicella {
    return {
      matricola: "",
      modello: "",
      nomeNave: "",
      classe: "",
      pilota: ""
    } as Navicella;
  }

  nuovaLavorazione(): Lavorazione {
    return {
      id: "",
      navicella: this.nuovaNavicella(),
      stato: 'IN_ATTESA',
      priorita: 'ROUTINE',
      dataAttracco: new Date(),
      pezziRichiesti: [{nome: '', quantita: 0}]
    } as Lavorazione;
  }

  lavorazioneDettaglio: Lavorazione = this.nuovaLavorazione();
  Navicellavuota: Navicella = this.nuovaNavicella();
  lavorazioni: Lavorazione[] = [];
  aggiungi: boolean = false;
  modifica: string | null = null;
  filtro: string = "";
  risultati: string[] = [];
  caricamento: boolean = false;
  tecnici: string[] = [];

  private timer: any=null;

  filtraLavorazioni(valoreOpzionale?: string) {
     if (this.timer) {
      clearTimeout(this.timer);
    }

    const testoInput = valoreOpzionale !== undefined ? valoreOpzionale : this.filtro;
    const query = (testoInput || "").trim().toLowerCase();

    if (query === "") {
      this.risultati = [];
      this.caricamento = false;
      this.cdr.detectChanges();
      return;
    }

    this.caricamento = true;
    this.timer = setTimeout(() => {

      this.risultati = this.lavorazioni
        .filter((lavorazione) => {
          const navicella = lavorazione.navicella;
          if (!navicella) {
            return false;
          }
          const id = String(lavorazione.id ?? "").toLowerCase();
          const matricola = String(navicella.matricola ?? "").toLowerCase();
          const modello = String(navicella.modello ?? "").toLowerCase();
          const nomeNave = String(navicella.nomeNave ?? "").toLowerCase();
          const pilota = String(navicella.pilota ?? "").toLowerCase();
          return (
            id.includes(query) ||
            matricola.includes(query) ||
            modello.includes(query) ||
            nomeNave.includes(query) ||
            pilota.includes(query)
          );
        })
        .map((lavorazione) => lavorazione.id);
        this.caricamento = false;
        this.cdr.detectChanges();
    }, 500);
  }

  async visualizzaLavorazioni() {
    try {
      this.lavorazioni = await this.lavorazioneService.getLavorazioniInCorso();
      this.cdr.detectChanges();
      
    } catch (error) {
      console.error("Errore durante il recupero delle lavorazioni:", error);
    }
  }

  ngOnInit(): void {
    this.visualizzaLavorazioni();
  }

    
  ngOnDestroy(): void {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }

  async eliminaLavorazione(lavorazioneId: string) {
    try {
      if (lavorazioneId === this.modifica) {
        this.modifica = null;
      }
      if(!confirm("Sei sicuro di voler eliminare la lavorazione " + lavorazioneId + "?")) {
        return;
      }
      await this.lavorazioneService.rimuoviLavorazione(lavorazioneId);
      this.visualizzaLavorazioni();
    } catch (error) {
      console.error("Errore durante la rimozione della lavorazione:", error);
    }
  }

  setAggiungi() {
    if (this.modifica) {
      this.modifica = null;
    }
    this.aggiungi = !this.aggiungi;
    
    this.Navicellavuota = this.nuovaNavicella();
    this.lavorazioneDettaglio = this.nuovaLavorazione();
  }

  async aggiungiLavorazione() {
    try {
      let id = await this.lavorazioneService.creaNuovaLavorazione(this.Navicellavuota);
      console.log("Aggiunta nuova lavorazione:", this.Navicellavuota);
      this.aggiungi = false;
      await this.setModifica(id);
      this.Navicellavuota = this.nuovaNavicella();
      this.visualizzaLavorazioni();
    }
    catch (error) {
      console.error("Errore durante l'aggiunta della lavorazione.");
    }
  }

  async setModifica(navicellaId: string) {
    if (this.aggiungi || (this.modifica && this.modifica !== navicellaId)) {
      this.aggiungi = false;
      this.modifica = null;
    }
    
    this.Navicellavuota = this.nuovaNavicella();
    this.lavorazioneDettaglio = this.nuovaLavorazione();
    if (this.modifica === navicellaId) {
      this.modifica = null;
      return;
    }
    this.modifica = navicellaId;

    try {
      let lavorazione = await this.lavorazioneService.getLavorazioneById(navicellaId);
      if (!lavorazione) {
        console.error("Lavorazione non trovata per l'ID:", navicellaId);
        return;
      }

      this.lavorazioneDettaglio = { ...lavorazione }; // Copia profonda dell'oggetto
      this.tecnici = await this.gestorePersonaleService.getTecnici().then(tecnici => tecnici.map(tecnico => tecnico.id));
      this.cdr.detectChanges(); 
      console.log("Dati caricati nel componente:", this.lavorazioneDettaglio);

    } catch (error) {
      console.error("Errore durante il recupero della navicella:", error);
    }
    console.log("Modifica lavorazione:", this.lavorazioneDettaglio);
  }

  modificaLavorazione(navicellaId: string) {
   if (!this.lavorazioneDettaglio) {
     return;
   }

   this.lavorazioneDettaglio.id = navicellaId;
   this.lavorazioneService.modificaLavorazione(navicellaId, this.lavorazioneDettaglio).then((success) => {
      if (success) {
        this.modifica = null;
        this.lavorazioneDettaglio = this.nuovaLavorazione();
        this.visualizzaLavorazioni();
      } else {
        console.error("Errore durante la modifica della lavorazione.");
      }
    });
  }
}
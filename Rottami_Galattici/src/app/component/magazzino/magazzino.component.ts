import { Component } from "@angular/core";
import { MagazzinoService } from "../../service/magazzino.service";
import { Pezzo } from "../../model/pezzo.model";
import { OnInit, ChangeDetectorRef } from "@angular/core";
import { CommonModule  } from "@angular/common";
import { FormsModule } from "@angular/forms";

@Component({
    selector: "app-magazzino",
    templateUrl: "./magazzino.component.html",
    styleUrls: ["./magazzino.component.css"],
    imports: [CommonModule, FormsModule]
})
export class MagazzinoComponent implements OnInit {
    constructor(private magazzinoService: MagazzinoService, private ref: ChangeDetectorRef) {}

    pezzi: Pezzo[] = [];
    pezzoSelezionato: Pezzo | null = null;
    quantitaDaOrdinare: number = 1;

    async selezionaPezzo(pezzo: Pezzo) {
        this.quantitaDaOrdinare = 1;
        if (this.pezzoSelezionato === pezzo) {
            this.pezzoSelezionato = null;
        } else {
            this.pezzoSelezionato = pezzo;
        }
    }

    async ngOnInit() {
        this.pezzi = await this.magazzinoService.getMagazzino();
        this.ref.detectChanges();
    }

    async ordinaPezzo(pezzo: Pezzo, quantita: number) {
        await this.magazzinoService.rifornirePezzo(pezzo.codice, quantita);
        this.pezzi = await this.magazzinoService.getMagazzino();
        this.pezzoSelezionato = null;
        this.ref.detectChanges();
    }

}
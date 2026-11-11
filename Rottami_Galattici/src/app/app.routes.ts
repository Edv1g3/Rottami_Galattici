import { Routes } from '@angular/router';
import { GestionelavorazioneComponent } from './component/gestorelavorazioni/gestionelavorazione.component';
import { HomeComponent } from './component/home/home.component';
import { PortaletecnicoComponent } from './component/portaletecnico/portaletecnico.component';
import { MagazzinoComponent } from './component/magazzino/magazzino.component';

export const routes: Routes = [
    {path: '', component: HomeComponent},
    {path: 'gestionelavorazioni', component: GestionelavorazioneComponent},
    {path: 'portaletecnico', component: PortaletecnicoComponent},
    {path: 'magazzino', component: MagazzinoComponent}
];

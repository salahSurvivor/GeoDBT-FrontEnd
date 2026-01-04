import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { FlotteVehicules } from './shared/components/flotte/flotte-vehicules/flotte-vehicules';
import { Dashboard } from './shared/components/dashboard/dashboard';
import { AuthGuard } from './core/guards/auth-guard';
import { ProfileComponent } from './shared/components/profile/profile.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  //#region auth
  { path: 'login', component: Login },
  { path: 'register', component: Register },

  //#region dash
  { path: 'dashboard', component: Dashboard, canActivate: [AuthGuard] },

  //#startregion module flotte
  { path: 'flotte-vehicule', component: FlotteVehicules, canActivate: [AuthGuard] },
  //#endregion module flotte
  
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard]}
];

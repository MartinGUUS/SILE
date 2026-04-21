import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { MobileDashboardComponent } from './dashboard/mobile/mobile.component';
import { DesktopDashboardComponent } from './dashboard/desktop/desktop.component';
import { authGuard } from './auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard/mobile', component: MobileDashboardComponent, canActivate: [authGuard] },
  { path: 'dashboard/desktop', component: DesktopDashboardComponent, canActivate: [authGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];

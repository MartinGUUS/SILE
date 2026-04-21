import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h1 class="auth-title">Iniciar Sesión</h1>
          <p class="auth-subtitle">Ingresa tus credenciales para acceder a SILE</p>
        </div>

        <div *ngIf="errorMessage()" class="alert-error">
          {{ errorMessage() }}
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="correo" class="form-label">Correo Electrónico</label>
            <input 
              type="email" 
              id="correo" 
              class="form-input" 
              placeholder="tu@correo.com" 
              formControlName="correo"
            >
          </div>

          <div class="form-group">
            <label for="contrasena" class="form-label">Contraseña</label>
            <input 
              type="password" 
              id="contrasena" 
              class="form-input" 
              placeholder="••••••••" 
              formControlName="contrasena"
            >
          </div>

          <button 
            type="submit" 
            class="auth-button" 
            [disabled]="loginForm.invalid || isLoading()"
          >
            {{ isLoading() ? 'Iniciando sesión...' : 'Ingresar' }}
          </button>
        </form>

        <div class="auth-footer">
          ¿No tienes una cuenta? <a routerLink="/register" class="auth-link">Regístrate</a>
        </div>
      </div>
    </div>
  `,
  styles: ``
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup;
  
  // Utilizando Signals para asegurar update asíncrono
  isLoading = signal(false);
  errorMessage = signal('');

  constructor() {
    this.loginForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set('');

      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          if (response && response.token) {
            this.authService.saveSession(response);
            // Redirigir dinámicamente dependiendo del tamaño de pantalla
            if (window.innerWidth < 768) {
              this.router.navigate(['/dashboard/mobile']);
            } else {
              this.router.navigate(['/dashboard/desktop']);
            }
          } else {
            this.errorMessage.set('Respuesta inesperada del servidor.');
          }
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error al iniciar sesión', error);
          this.errorMessage.set('Credenciales incorrectas o error en el servidor.');
          this.isLoading.set(false);
        }
      });
    }
  }
}

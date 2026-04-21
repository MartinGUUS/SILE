import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h1 class="auth-title">Crear Cuenta</h1>
          <p class="auth-subtitle">Regístrate para usar SILE. Tu cuenta pasará a revisión.</p>
        </div>

        <div *ngIf="errorMessage()" class="alert-error">
          {{ errorMessage() }}
        </div>
        
        <div *ngIf="successMessage()" class="alert-success">
          {{ successMessage() }}
        </div>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" *ngIf="!isSuccess()">
          <div style="display: flex; gap: 1rem;">
            <div class="form-group" style="flex: 1;">
              <label for="nombre" class="form-label">Nombre</label>
              <input 
                type="text" 
                id="nombre" 
                class="form-input" 
                placeholder="Nombre" 
                formControlName="nombre"
              >
            </div>
            
            <div class="form-group" style="flex: 1;">
              <label for="apellido" class="form-label">Apellido</label>
              <input 
                type="text" 
                id="apellido" 
                class="form-input" 
                placeholder="Apellido" 
                formControlName="apellido"
              >
            </div>
          </div>

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
            [disabled]="registerForm.invalid || isLoading()"
          >
            {{ isLoading() ? 'Creando cuenta...' : 'Registrarse' }}
          </button>
        </form>

        <div class="auth-footer" style="margin-top: 1.5rem;">
          <button *ngIf="isSuccess()" class="auth-button" style="margin-bottom: 1rem;" routerLink="/login">
            Ir a Iniciar Sesión
          </button>
          ¿Ya tienes una cuenta? <a routerLink="/login" class="auth-link">Inicia sesión</a>
        </div>
      </div>
    </div>
  `,
  styles: ``
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm: FormGroup;
  
  // Utilizando Signals para asegurar que los cambios se reflejen en la UI sin importar el uso de Zone.js
  isLoading = signal(false);
  isSuccess = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  constructor() {
    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required]],
      apellido: ['', [Validators.required]],
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set('');
      this.successMessage.set('');

      const userData = {
        ...this.registerForm.value,
        estado: "2",
        fkRol: 3
      };

      this.authService.register(userData).subscribe({
        next: (response) => {
          this.successMessage.set('Registro exitoso. Tu cuenta ha sido creada como inactiva (estado 2). Contacta al administrador para ser activada.');
          this.isSuccess.set(true);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error en registro', error);
          if (error.status === 409) {
            this.errorMessage.set('Ya existe un usuario con ese correo.');
          } else {
            this.errorMessage.set('Hubo un problema al crear la cuenta. Intenta nuevamente.');
          }
          this.isLoading.set(false);
        }
      });
    }
  }
}

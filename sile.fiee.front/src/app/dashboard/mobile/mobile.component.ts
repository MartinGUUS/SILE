import { Component, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';
import { DecodeHintType, BarcodeFormat } from '@zxing/library';

@Component({
  selector: 'app-mobile-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mobile-container">
      <header class="mobile-header">
        <h2>Panel de Escaneo</h2>
        <button class="logout-btn" (click)="logout()">Salir</button>
      </header>

      <main class="mobile-main">
        <div class="scanner-card" *ngIf="!isScanning()">
          <div class="scanner-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 7V4h3"></path>
              <path d="M4 17v3h3"></path>
              <path d="M20 7V4h-3"></path>
              <path d="M20 17v3h-3"></path>
              <rect x="5" y="11" width="1" height="2"></rect>
              <rect x="8" y="9" width="2" height="6"></rect>
              <rect x="12" y="10" width="1" height="4"></rect>
              <rect x="15" y="9" width="1" height="6"></rect>
              <rect x="18" y="11" width="1" height="2"></rect>
            </svg>
          </div>
          <h3>Escáner de Activos</h3>
          <p>Apunta la cámara al código del dispositivo.</p>
          <button class="scan-btn" (click)="startScanning()">Activar Cámara</button>
        </div>

        <div class="scanner-active-container" [style.display]="isScanning() ? 'block' : 'none'">
          <video id="video-preview" playsinline style="width: 100%; object-fit: cover; border-radius: 8px; background: #000; min-height: 250px;"></video>
          <div style="font-size: 0.75rem; color: #666; margin-top: 0.5rem; text-align: center;">
            {{ debugMessage() }}
          </div>
          
          <div class="scan-result" *ngIf="scanResult()">
            <h4>Resultado:</h4>
            <p class="scanned-text">{{ scanResult() }}</p>
            <button class="scan-btn secondary" (click)="startScanning()" style="margin-top: 1rem">Escanear otro</button>
          </div>

          <button *ngIf="isScanning() && !scanResult()" class="logout-btn" style="width: 100%; text-align: center; margin-top: 1rem; padding: 1rem; background: var(--gray-100); border-radius: 8px;" (click)="stopScanning()">Cancelar</button>
        </div>
      </main>

      <nav class="mobile-nav">
        <a href="javascript:void(0)" class="nav-item active">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          <span>Inicio</span>
        </a>
      </nav>
    </div>
  `,
  styles: `
    .mobile-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
      background-color: var(--bg-color);
    }

    .mobile-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      background-color: #fff;
      border-bottom: 1px solid var(--border-color);
    }

    .mobile-header h2 { font-size: 1.25rem; font-weight: 600; color: var(--gray-900); margin: 0; }
    .logout-btn { background: none; border: none; color: var(--gray-500); font-weight: 500; cursor: pointer; }

    .mobile-main {
      flex: 1;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      overflow-y: auto;
    }

    .scanner-card {
      background-color: #fff;
      border-radius: 16px;
      padding: 2.5rem 1.5rem;
      width: 100%;
      text-align: center;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
      border: 1px solid var(--border-color);
    }

    .scanner-icon {
      background-color: var(--gray-100);
      width: 96px;
      height: 96px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
      color: var(--gray-800);
    }

    .scanner-card h3 { font-size: 1.25rem; color: var(--gray-900); margin-bottom: 0.5rem; }
    .scanner-card p { color: var(--gray-500); font-size: 0.875rem; margin-bottom: 2rem; }

    .scan-btn {
      width: 100%;
      padding: 1rem;
      background-color: var(--gray-900);
      color: #fff;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
    }
    
    .scan-btn.secondary {
      background-color: var(--gray-200);
      color: var(--gray-900);
    }

    .scanner-active-container {
      width: 100%;
      max-width: 500px;
      background: #fff;
      padding: 1rem;
      border-radius: 12px;
      margin-top: 1rem;
    }

    .scan-result {
      margin-top: 1.5rem;
      padding: 1rem;
      background-color: #f0fdf4;
      border-left: 4px solid #22c55e;
      border-radius: 4px;
      text-align: center;
    }

    .scanned-text {
      font-size: 1.25rem;
      font-weight: 700;
      color: #166534;
      word-break: break-all;
    }

    .mobile-nav {
      display: flex;
      background-color: #fff;
      border-top: 1px solid var(--border-color);
      padding: 0.75rem;
      justify-content: space-around;
    }

    .nav-item { display: flex; flex-direction: column; align-items: center; color: var(--gray-400); text-decoration: none; gap: 0.25rem; }
    .nav-item.active { color: var(--gray-900); }
    .nav-item span { font-size: 0.75rem; font-weight: 500; }
  `
})
export class MobileDashboardComponent implements OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);

  isScanning = signal(false);
  scanResult = signal<string>('');
  debugMessage = signal<string>('Esperando activación...');
  
  private codeReader = new BrowserMultiFormatReader();
  private controls: IScannerControls | null = null;

  startScanning() {
    this.isScanning.set(true);
    this.scanResult.set('');
    this.debugMessage.set('Iniciando sensores...');
    
    setTimeout(async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(d => d.kind === 'videoinput');
        let selectedDeviceId: string | undefined = undefined;

        if (videoDevices.length > 0) {
          selectedDeviceId = videoDevices[videoDevices.length - 1].deviceId;
          const backCamera = videoDevices.find(d => 
            d.label.toLowerCase().includes('back') || 
            d.label.toLowerCase().includes('environment') || 
            d.label.toLowerCase().includes('traser')
          );
          if (backCamera) {
            selectedDeviceId = backCamera.deviceId;
          }
        }

        const constraints: MediaStreamConstraints = {
          video: {
            deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
            facingMode: selectedDeviceId ? undefined : "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        };

        this.codeReader.decodeFromConstraints(constraints, 'video-preview', (result, error) => {
          if (result) {
            this.scanResult.set(result.getText());
            this.debugMessage.set('¡Lectura exitosa!');
            
            // Feedback vibración si está en móvil
            if (navigator.vibrate) { navigator.vibrate(200); }
            
            // Pausar auto-escaneo al encontrar un código para poder leerlo
            if (this.controls) {
                this.controls.stop();
            }
          }
          if (error && !this.scanResult()) {
             // Muestra retroalimentación visual de que la cámara sigue viva evaluando fotogramas
             // El Math.random nos da un indicador de que sigue ejecutándose (los números bailarán)
             this.debugMessage.set(`Buscando código en la lente... [${Math.floor(Math.random() * 99)}]`);
          }
        }).then(controls => {
          this.controls = controls;
        }).catch(err => {
          console.error("Error descodificando dispositivo:", err);
          this.debugMessage.set('Error en lente: ' + err.message);
        });

      } catch (err: any) {
        console.error("Error explorando dispositivos ZXing:", err);
        this.debugMessage.set('Ataque a la cámara bloqueado: ' + err.message);
      }
    }, 250);
  }

  stopScanning() {
    if (this.controls) {
      this.controls.stop();
      this.controls = null;
    }
    this.isScanning.set(false);
    this.debugMessage.set('Detenido.');
  }

  ngOnDestroy() {
    this.stopScanning();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

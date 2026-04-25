import { Component, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';
import { DecodeHintType, BarcodeFormat } from '@zxing/library';
import { FormsModule } from '@angular/forms';
import { CatalogoService } from '../../services/catalogo.service';
import { UploadService } from '../../services/upload.service';

@Component({
  selector: 'app-mobile-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

        <div class="action-card" *ngIf="!isScanning() && !showCreateForm">
          <div class="scanner-icon" style="background: #e0f2fe; color: #0284c7;">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
          </div>
          <h3>Nuevo Producto</h3>
          <p>Registra un activo manualmente y sube fotos.</p>
          <button class="scan-btn secondary" (click)="openCreateForm()">Agregar nuevo producto</button>
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

        <!-- Formulario Crear Activo -->
        <div class="mobile-form-container" *ngIf="showCreateForm">
          <div class="form-header">
            <h3>Registrar Activo</h3>
            <button class="close-btn" (click)="closeCreateForm()">✕</button>
          </div>
          
          <div class="form-group">
            <label>No. Activo</label>
            <input type="text" [(ngModel)]="newActivo.idActivo" placeholder="Ej: ACT-10003">
          </div>
          <div class="form-group">
            <label>Nombre</label>
            <input type="text" [(ngModel)]="newActivo.nombre">
          </div>
          <div class="form-group">
            <label>Descripción</label>
            <input type="text" [(ngModel)]="newActivo.descripcion">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Precio</label>
              <input type="number" [(ngModel)]="newActivo.precio">
            </div>
            <div class="form-group">
              <label>Existencias</label>
              <input type="number" [(ngModel)]="newActivo.existencias">
            </div>
          </div>
          <div class="form-group">
            <label>Garantía</label>
            <input type="text" [(ngModel)]="newActivo.garantia">
          </div>
          <div class="form-group">
            <label>No. Serie</label>
            <input type="text" [(ngModel)]="newActivo.nSerie">
          </div>
          
          <!-- Selects de foráneas -->
          <div class="form-group">
            <label>Marca</label>
            <select [(ngModel)]="newActivo.fkMarca">
              <option *ngFor="let m of listMarcas" [value]="m.idMarca">{{ m.nombre }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Proveedor</label>
            <select [(ngModel)]="newActivo.fkProvedor">
              <option *ngFor="let p of listProveedores" [value]="p.idProvedor">{{ p.nombre }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Línea</label>
            <select [(ngModel)]="newActivo.fkLinea">
              <option *ngFor="let l of listLineas" [value]="l.idLinea">{{ l.nombre }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Presentación</label>
            <select [(ngModel)]="newActivo.fkPresentacion">
              <option *ngFor="let pr of listPresentacion" [value]="pr.idPresentacion">{{ pr.nombre }}</option>
            </select>
          </div>

          <!-- Asignación -->
          <div class="form-group full-width" style="border-top: 1px dashed var(--border-color); padding-top: 1rem; margin-top: 0.5rem;">
            <h3 style="margin: 0 0 1rem 0; font-size: 1rem; color: var(--gray-800);">Asignación</h3>
          </div>
          <div class="form-group">
            <label>Área</label>
            <select [(ngModel)]="newActivo.fkArea">
              <option *ngFor="let a of listAreas" [value]="a.idArea">{{ a.nombre }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Resguardante</label>
            <select [(ngModel)]="newActivo.fkResguardante">
              <option *ngFor="let r of listResguardantes" [value]="r.idResguardante">{{ r.nombres }} {{ r.apellidos }}</option>
            </select>
          </div>
          <div class="form-group full-width" style="border-top: 1px dashed var(--border-color); padding-top: 1rem; margin-top: 0.5rem;"></div>
          <div class="form-group photo-section">
            <label>Fotografía del Activo</label>
            <div class="photo-buttons">
              <label class="photo-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                Tomar Foto
                <input type="file" accept="image/*" capture="environment" (change)="onFileSelected($event)" style="display: none;">
              </label>
              <label class="photo-btn outline">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                Importar
                <input type="file" accept="image/*" (change)="onFileSelected($event)" style="display: none;">
              </label>
            </div>
            <div *ngIf="selectedFile" class="file-status">
              ✓ Archivo: {{ selectedFile.name }}
            </div>
          </div>

          <button class="scan-btn" (click)="saveNuevoActivo()" [disabled]="isSaving" style="margin-top: 1.5rem;">
            {{ isSaving ? 'Guardando...' : 'Guardar Producto' }}
          </button>
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

    .action-card { background-color: #fff; border-radius: 16px; padding: 2rem 1.5rem; width: 100%; text-align: center; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); border: 1px solid var(--border-color); margin-top: 1rem; }
    .action-card h3 { font-size: 1.25rem; color: var(--gray-900); margin-bottom: 0.5rem; }
    .action-card p { color: var(--gray-500); font-size: 0.875rem; margin-bottom: 1.5rem; }

    .mobile-form-container { width: 100%; background: #fff; border-radius: 16px; padding: 1.5rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border: 1px solid var(--border-color); }
    .form-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem; }
    .form-header h3 { margin: 0; font-size: 1.25rem; color: var(--gray-900); }
    .close-btn { background: #fef2f2; color: #dc2626; border: none; width: 32px; height: 32px; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-weight: bold; cursor: pointer; }
    .form-group { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 1rem; }
    .form-group label { font-size: 0.875rem; font-weight: 500; color: var(--gray-700); }
    .form-group input, .form-group select { padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 8px; font-size: 0.875rem; background: var(--gray-50); outline: none; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    
    .photo-section { background: var(--gray-50); padding: 1rem; border-radius: 8px; border: 1px dashed var(--border-color); }
    .photo-buttons { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
    .photo-btn { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; background: var(--gray-900); color: #fff; padding: 0.75rem; border-radius: 8px; font-size: 0.8rem; font-weight: 500; cursor: pointer; text-align: center; }
    .photo-btn.outline { background: #fff; color: var(--gray-900); border: 1px solid var(--border-color); }
    .file-status { margin-top: 0.75rem; font-size: 0.8rem; color: #059669; font-weight: 500; text-align: center; }
  `
})
export class MobileDashboardComponent implements OnDestroy {
  private authService = inject(AuthService);
  private catalogoService = inject(CatalogoService);
  private uploadService = inject(UploadService);
  private router = inject(Router);

  isScanning = signal(false);
  scanResult = signal<string>('');
  debugMessage = signal<string>('Esperando activación...');
  
  // Variables form
  showCreateForm = false;
  newActivo: any = {};
  selectedFile: File | null = null;
  isSaving = false;
  miId: number | null = null;

  listMarcas: any[] = [];
  listProveedores: any[] = [];
  listLineas: any[] = [];
  listPresentacion: any[] = [];
  listAreas: any[] = [];
  listResguardantes: any[] = [];

  private codeReader = new BrowserMultiFormatReader();
  private controls: IScannerControls | null = null;

  ngOnInit() {
    this.miId = this.authService.getIdUsuario();
  }

  openCreateForm() {
    this.newActivo = {
      idActivo: '', nombre: '', descripcion: '', precio: 0, existencias: 0, 
      garantia: '', nSerie: '', fkMarca: '', fkProvedor: '', fkLinea: '', fkPresentacion: '',
      fkArea: '', fkResguardante: ''
    };
    this.selectedFile = null;
    this.showCreateForm = true;
    this.loadCatalogosParaActivos();
  }

  closeCreateForm() {
    this.showCreateForm = false;
  }

  loadCatalogosParaActivos() {
    this.catalogoService.getAll('marcas').subscribe(d => this.listMarcas = d);
    this.catalogoService.getAll('provedores').subscribe(d => this.listProveedores = d);
    this.catalogoService.getAll('lineas').subscribe(d => this.listLineas = d);
    this.catalogoService.getAll('presentacion').subscribe(d => this.listPresentacion = d);
    this.catalogoService.getAll('areas').subscribe(d => this.listAreas = d);
    this.catalogoService.getAll('resguardantes').subscribe(d => this.listResguardantes = d);
  }

  onFileSelected(event: any) {
    if (event.target.files && event.target.files[0]) {
      this.selectedFile = event.target.files[0];
    }
  }

  saveNuevoActivo() {
    if (!this.newActivo.idActivo || !this.newActivo.nombre) return;
    this.isSaving = true;

    this.newActivo.creadoPor = this.miId;
    this.newActivo.ultimoActualizadoPor = this.miId;
    this.newActivo.estado = "1";

    this.catalogoService.create('activos', this.newActivo).subscribe({
      next: (activoCreado) => {
        const idActivo = activoCreado.idActivo || this.newActivo.idActivo;

        // Función para crear la asignación
        const crearAsignacion = () => {
          if (this.newActivo.fkArea && this.newActivo.fkResguardante) {
            const asignacionData = {
              fkActivo: idActivo,
              fkArea: this.newActivo.fkArea,
              fkResguardante: this.newActivo.fkResguardante,
              creadoPor: this.miId,
              ultimoActualizadoPor: this.miId,
              estado: "1"
            };
            this.catalogoService.create('asignaciones', asignacionData).subscribe({
              next: () => this.finalizeSave(),
              error: (e) => {
                console.error('Error al guardar asignación:', e);
                this.finalizeSave();
              }
            });
          } else {
            this.finalizeSave();
          }
        };

        if (this.selectedFile) {
          this.uploadService.uploadFoto(this.selectedFile).subscribe({
            next: (res) => {
              const fotoData = {
                fkActivo: idActivo,
                foto: res.filename,
                creadoPor: this.miId,
                ultimoActualizadoPor: this.miId
              };
              this.catalogoService.create('fotos', fotoData).subscribe({
                next: () => crearAsignacion(),
                error: (e) => {
                  console.error('Error al guardar registro de foto:', e);
                  crearAsignacion();
                }
              });
            },
            error: (err) => {
              console.error('Error subiendo foto:', err);
              crearAsignacion();
            }
          });
        } else {
          crearAsignacion();
        }
      },
      error: (err) => {
        console.error('Error creando activo:', err);
        this.isSaving = false;
      }
    });
  }

  private finalizeSave() {
    this.isSaving = false;
    this.closeCreateForm();
    alert('Producto guardado correctamente');
  }

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

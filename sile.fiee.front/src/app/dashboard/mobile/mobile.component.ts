import { Component, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';
import { DecodeHintType, BarcodeFormat } from '@zxing/library';
import { FormsModule } from '@angular/forms';
import { CatalogoService } from '../../services/catalogo.service';
import { UploadService } from '../../services/upload.service';

import { Activo } from '../../models/activo.model';
import { Marca } from '../../models/marca.model';
import { Proveedor } from '../../models/proveedor.model';
import { Linea } from '../../models/linea.model';
import { Presentacion } from '../../models/presentacion.model';
import { Area } from '../../models/area.model';
import { Resguardante } from '../../models/resguardante.model';

@Component({
  selector: 'app-mobile-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mobile.component.html',
  styleUrl: './mobile.component.css'
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
  newActivo: Partial<Activo> = {};
  selectedFile: File | null = null;
  isSaving = false;
  miId: number | null = null;

  listMarcas: Marca[] = [];
  listProveedores: Proveedor[] = [];
  listLineas: Linea[] = [];
  listPresentacion: Presentacion[] = [];
  listAreas: Area[] = [];
  listResguardantes: Resguardante[] = [];

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

    this.newActivo.creadoPor = this.miId || undefined;
    this.newActivo.ultimoActualizadoPor = this.miId || undefined;
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

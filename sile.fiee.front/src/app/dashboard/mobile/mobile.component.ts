import { Component, inject, signal, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';
import { FormsModule } from '@angular/forms';
import { CatalogoService } from '../../services/catalogo.service';
import { UploadService } from '../../services/upload.service';
import { CambiosService } from '../../services/cambios.service';
import { catchError, forkJoin, of } from 'rxjs';
import { CambioPendiente } from '../../models/cambio-pendiente.model';

import { Activo } from '../../models/activo.model';
import { Foto } from '../../models/foto.model';
import { Marca } from '../../models/marca.model';
import { Proveedor } from '../../models/proveedor.model';
import { Linea } from '../../models/linea.model';
import { Presentacion } from '../../models/presentacion.model';
import { Area } from '../../models/area.model';
import { Resguardante } from '../../models/resguardante.model';
import { Asignacion } from '../../models/asignacion.model';

type MobileTab = 'inicio' | 'inventario' | 'cambios' | 'perfil';

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
  private cambiosService = inject(CambiosService);
  private router = inject(Router);

  activeTab = signal<MobileTab>('inicio');
  miId: number | null = null;
  miRol: number | null = null;
  userName = signal('');

  // --- Scanner ---
  isScanning = signal(false);
  scanResult = signal<string>('');
  debugMessage = signal<string>('Esperando activación...');
  buscandoEscaneo = signal(false);

  // --- Inventory ---
  dataActivos = signal<Activo[]>([]);
  cargandoActivos = signal(false);
  filtroEstado = '1';
  searchQuery = '';
  allActivos: Activo[] = [];

  // --- Cambios (admin) ---
  dataCambios = signal<CambioPendiente[]>([]);
  dataProcesados = signal<CambioPendiente[]>([]);
  cargandoCambios = signal(false);
  filtroCambios: 'pendientes' | 'procesados' = 'pendientes';
  cantidadPendientes = signal(0);
  cambioSeleccionado: CambioPendiente | null = null;
  datosJsonParseado: any = null;
  comentarioRechazo = '';
  mostrandoTextarea = false;
  fotosActualesCambio = signal<Foto[]>([]);
  activoOriginal = signal<Activo | null>(null);

  // --- Detail modal ---
  showDetail = false;
  selectedActivo: Activo | null = null;
  detailFotos = signal<Foto[]>([]);
  detailAsignacion = signal<Asignacion | null>(null);

  // --- Create form ---
  showCreateForm = false;
  newActivo: Partial<Activo> = {};
  selectedFiles: File[] = [];
  isSaving = false;
  saveStep = signal('');

  // --- Edit form ---
  showEditForm = false;
  editActivoForm: any = {};
  editFotos = signal<Foto[]>([]);
  editAsignacion = signal<Asignacion | null>(null);
  fotosAEliminar: number[] = [];

  // --- Image preview ---
  showImagePreview = false;
  previewImageUrl = '';

  // --- Catalogs ---
  listMarcas = signal<Marca[]>([]);
  listProveedores = signal<Proveedor[]>([]);
  listLineas = signal<Linea[]>([]);
  listPresentacion = signal<Presentacion[]>([]);
  listAreas = signal<Area[]>([]);
  listResguardantes = signal<Resguardante[]>([]);

  // --- Toast ---
  toastMsg = signal('');
  toastError = signal(false);
  toastTimer: any;

  private codeReader = new BrowserMultiFormatReader();
  private controls: IScannerControls | null = null;

  ngOnInit() {
    this.miId = this.authService.getIdUsuario();
    this.miRol = this.authService.getFkRol();
    const stored = localStorage.getItem('userFullName') || localStorage.getItem('userName');
    this.userName.set(stored || 'Usuario');
    if (this.miRol === 3) this.activeTab.set('inventario');
    this.loadCatalogos();
    this.loadActivos();
    if (this.miRol === 1) this.cargarContadorPendientes();
  }

  ngOnDestroy() {
    this.stopScanning();
    if (this.toastTimer) clearTimeout(this.toastTimer);
  }

  @HostListener('window:keydown.escape')
  handleEscape() {
    if (this.showImagePreview) { this.showImagePreview = false; return; }
    if (this.showDetail) { this.showDetail = false; return; }
    if (this.showEditForm) { this.closeEditForm(); return; }
    if (this.showCreateForm) { this.closeCreateForm(); return; }
    if (this.isScanning()) { this.stopScanning(); }
  }

  setTab(tab: MobileTab) {
    if (tab === 'inventario') {
      this.filtroEstado = '1';
      this.searchQuery = '';
    }
    if (tab === 'cambios') this.filtroCambios = 'pendientes';
    this.activeTab.set(tab);
    if (tab === 'inventario') this.loadActivos();
    if (tab === 'cambios') {
      this.loadCambios();
      this.cargarContadorPendientes();
    }
  }

  // ===================== TOAST =====================
  showToast(msg: string, error = false) {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastMsg.set(msg);
    this.toastError.set(error);
    this.toastTimer = setTimeout(() => { this.toastMsg.set(''); this.toastTimer = null; }, 2000);
  }

  // ===================== CATALOGS =====================
  loadCatalogos() {
    forkJoin({
      marcas: this.catalogoService.getAll('marcas', '1').pipe(catchError(() => of([]))),
      proveedores: this.catalogoService.getAll('provedores', '1').pipe(catchError(() => of([]))),
      lineas: this.catalogoService.getAll('lineas', '1').pipe(catchError(() => of([]))),
      presentacion: this.catalogoService.getAll('presentacion', '1').pipe(catchError(() => of([]))),
      areas: this.catalogoService.getAll('areas', '1').pipe(catchError(() => of([]))),
      resguardantes: this.catalogoService.getAll('resguardantes', '1').pipe(catchError(() => of([])))
    }).subscribe(d => {
      this.listMarcas.set(d.marcas);
      this.listProveedores.set(d.proveedores);
      this.listLineas.set(d.lineas);
      this.listPresentacion.set(d.presentacion);
      this.listAreas.set(d.areas);
      this.listResguardantes.set(d.resguardantes);
    });
  }

  // ===================== INVENTORY =====================
  loadActivos() {
    this.cargandoActivos.set(true);
    this.catalogoService.getAll('activos', this.filtroEstado).subscribe({
      next: d => {
        this.allActivos = d;
        this.applySearch();
        this.cargandoActivos.set(false);
      },
      error: () => { this.cargandoActivos.set(false); }
    });
  }

  applySearch() {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) {
      this.dataActivos.set(this.allActivos);
    } else {
      this.dataActivos.set(this.allActivos.filter(a =>
        (a.idActivo && a.idActivo.toLowerCase().includes(q)) ||
        (a.nombre && a.nombre.toLowerCase().includes(q)) ||
        (a.descripcion && a.descripcion.toLowerCase().includes(q)) ||
        (a.nSerie && a.nSerie.toLowerCase().includes(q))
      ));
    }
  }

  onSearchChange() {
    this.applySearch();
  }

  onFiltroChange() {
    this.searchQuery = '';
    this.loadActivos();
  }

  verDetalle(item: Activo) {
    this.selectedActivo = item;
    this.detailFotos.set([]);
    this.detailAsignacion.set(null);
    this.showDetail = true;

    this.catalogoService.getAll(`fotos/activo/${item.idActivo}`).subscribe({
      next: fotos => this.detailFotos.set(fotos),
      error: () => {}
    });
    this.catalogoService.getAll(`asignaciones/activo/${item.idActivo}`).subscribe({
      next: asigs => {
        if (asigs && asigs.length > 0) this.detailAsignacion.set(asigs[0]);
      },
      error: () => {}
    });
  }

  openImagePreview(url: string) {
    this.previewImageUrl = url;
    this.showImagePreview = true;
  }

  getMarcaName(id: string | undefined): string {
    const m = this.listMarcas().find(x => x.idMarca === id);
    return m?.nombre || (id || 'N/A');
  }
  getProveedorName(id: string | undefined): string {
    const p = this.listProveedores().find(x => x.idProvedor === id);
    return p?.nombre || (id || 'N/A');
  }
  getLineaName(id: string | undefined): string {
    const l = this.listLineas().find(x => x.idLinea === id);
    return l?.nombre || (id || 'N/A');
  }
  getPresentacionName(id: string | undefined): string {
    const pr = this.listPresentacion().find(x => x.idPresentacion === id);
    return pr?.nombre || (id || 'N/A');
  }
  getAreaName(id: string | undefined): string {
    const a = this.listAreas().find(x => x.idArea === id);
    return a?.nombre || (id || 'N/A');
  }
  getResguardanteName(id: any): string {
    if (!id) return 'N/A';
    const r = this.listResguardantes().find(x => String(x.idResguardante) === String(id));
    return r ? `${r.nombres} ${r.apellidos}` : `ID: ${id}`;
  }

  // ===================== CREATE =====================
  openCreateForm() {
    this.newActivo = {
      idActivo: '', nombre: '', descripcion: '', precio: undefined, existencias: 1,
      garantia: '', nSerie: '', fkMarca: '', fkProvedor: '', fkLinea: '', fkPresentacion: '',
      fkArea: '', fkResguardante: '', estado: '1'
    };
    this.selectedFiles = [];
    this.showCreateForm = true;
    this.loadCatalogos();
  }

  closeCreateForm() {
    this.showCreateForm = false;
    this.selectedFiles = [];
  }

  onFilesSelected(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      const files = Array.from(event.target.files) as File[];
      const total = this.selectedFiles.length + (this.editFotos().length || 0) + files.length;
      if (total > 5) {
        this.showToast('Máximo 5 fotos por activo', true);
        event.target.value = '';
        return;
      }
      this.selectedFiles = [...this.selectedFiles, ...files];
      event.target.value = '';
    }
  }

  saveNuevoActivo() {
    const a: any = this.newActivo;
    if (!a.idActivo || !a.nombre || !a.descripcion || a.precio == null ||
        !a.garantia || !a.nSerie || !a.fkProvedor || !a.fkMarca || !a.fkLinea || !a.fkPresentacion) {
      this.showToast('Completa todos los campos requeridos *', true);
      return;
    }
    if (a.precio < 0) {
      this.showToast('El precio no puede ser negativo.', true);
      return;
    }

    if (this.miRol === 2) {
      this.saveStep.set('Subiendo fotos...');
      this.uploadFilesForEditor(filenames => {
        const payload = { ...this.newActivo, estado: '1', _fotosFilenames: filenames, _fotosEliminadas: [] };
        const cambio: CambioPendiente = {
          tipoCambio: 'CREAR', entidad: 'activos',
          datosJson: JSON.stringify(payload)
        };
        this.cambiosService.enviarCambio(cambio).subscribe({
          next: () => { this.showToast('Solicitud enviada a revision.'); this.closeCreateForm(); this.loadActivos(); },
          error: () => { this.showToast('Error al enviar solicitud.', true); this.saveStep.set(''); }
        });
      });
      return;
    }

    this.isSaving = true;
    this.saveStep.set('Verificando duplicado...');
    this.newActivo.creadoPor = this.miId || undefined;
    this.newActivo.ultimoActualizadoPor = this.miId || undefined;

    this.catalogoService.getById('activos', this.newActivo.idActivo!).subscribe({
      next: () => {
        this.showToast('El No. Activo ya existe', true);
        this.isSaving = false;
        this.saveStep.set('');
      },
      error: () => this.executeSaveActivo()
    });
  }

  private executeSaveActivo() {
    this.saveStep.set('Guardando activo...');
    this.catalogoService.create('activos', this.newActivo).subscribe({
      next: (activoCreado) => {
        const idActivo = (activoCreado.idActivo || this.newActivo.idActivo) as string;
        const fkArea = this.newActivo.fkArea as string;
        const fkResguardante = this.newActivo.fkResguardante as string;

        const uploadNext = (index: number) => {
          if (index < this.selectedFiles.length) {
            this.saveStep.set(`Subiendo foto ${index + 1}/${this.selectedFiles.length}...`);
            this.uploadService.uploadFoto(this.selectedFiles[index]).subscribe({
              next: (res: any) => {
                this.catalogoService.create('fotos', {
                  fkActivo: idActivo, foto: res.filename,
                  creadoPor: this.miId, ultimoActualizadoPor: this.miId, estado: '1'
                }).subscribe(() => uploadNext(index + 1));
              },
              error: () => uploadNext(index + 1)
            });
          } else {
            this.crearAsignacionFinal(idActivo, fkArea, fkResguardante);
          }
        };

        if (this.selectedFiles.length > 0) {
          uploadNext(0);
        } else {
          this.crearAsignacionFinal(idActivo, fkArea, fkResguardante);
        }
      },
      error: (err) => {
        console.error('Error al crear activo:', err);
        this.isSaving = false;
        this.saveStep.set('');
        this.showToast('Error al guardar', true);
      }
    });
  }

  private crearAsignacionFinal(idActivo: string, fkArea: string, fkResguardante: string) {
    if (fkArea && fkResguardante) {
      this.saveStep.set('Guardando asignación...');
      this.catalogoService.create('asignaciones', {
        fkActivo: idActivo, fkArea, fkResguardante,
        creadoPor: this.miId, ultimoActualizadoPor: this.miId, estado: '1'
      }).subscribe({ next: () => this.finalizeSave(), error: () => this.finalizeSave() });
    } else {
      this.finalizeSave();
    }
  }

  private finalizeSave() {
    this.isSaving = false;
    this.saveStep.set('');
    this.closeCreateForm();
    this.loadActivos();
    this.showToast('Activo guardado correctamente');
  }

  // ===================== EDIT =====================
  openEditForm(item: Activo) {
    this.showDetail = false;
    this.editActivoForm = { ...item };
    this.editActivoForm.fkArea = '';
    this.editActivoForm.fkResguardante = null;
    this.selectedFiles = [];
    this.fotosAEliminar = [];
    this.editFotos.set([]);
    this.editAsignacion.set(null);
    this.showEditForm = true;

    setTimeout(() => {
      forkJoin({
        fotos: this.catalogoService.getAll(`fotos/activo/${item.idActivo}`).pipe(catchError(() => of([]))),
        asignaciones: this.catalogoService.getAll(`asignaciones/activo/${item.idActivo}`).pipe(catchError(() => of([]))),
        catalogos: forkJoin({
          marcas: this.catalogoService.getAll('marcas', '1').pipe(catchError(() => of([]))),
          proveedores: this.catalogoService.getAll('provedores', '1').pipe(catchError(() => of([]))),
          lineas: this.catalogoService.getAll('lineas', '1').pipe(catchError(() => of([]))),
          presentacion: this.catalogoService.getAll('presentacion', '1').pipe(catchError(() => of([]))),
          areas: this.catalogoService.getAll('areas', '1').pipe(catchError(() => of([]))),
          resguardantes: this.catalogoService.getAll('resguardantes', '1').pipe(catchError(() => of([])))
        })
      }).subscribe(result => {
        this.editFotos.set(result.fotos.filter((f: Foto) => !this.fotosAEliminar.includes(f.idFoto!)));
        this.listMarcas.set(result.catalogos.marcas);
        this.listProveedores.set(result.catalogos.proveedores);
        this.listLineas.set(result.catalogos.lineas);
        this.listPresentacion.set(result.catalogos.presentacion);
        this.listAreas.set(result.catalogos.areas);
        this.listResguardantes.set(result.catalogos.resguardantes);
        if (result.asignaciones && result.asignaciones.length > 0) {
          this.editAsignacion.set(result.asignaciones[0]);
          if (!this.editActivoForm.fkArea) this.editActivoForm.fkArea = result.asignaciones[0].fkArea;
          if (!this.editActivoForm.fkResguardante) this.editActivoForm.fkResguardante = result.asignaciones[0].fkResguardante;
        }
      });
    });
  }

  closeEditForm() {
    this.showEditForm = false;
    this.editActivoForm = {};
    this.selectedFiles = [];
    this.fotosAEliminar = [];
    this.editFotos.set([]);
    this.saveStep.set('');
  }

  deleteEditFoto(idFoto: number) {
    this.editFotos.update(f => f.filter(x => x.idFoto !== idFoto));
    this.fotosAEliminar.push(idFoto);
  }

  saveEditActivo() {
    const a = this.editActivoForm;
    if (!a.nombre || !a.descripcion || a.precio == null ||
        !a.garantia || !a.nSerie || !a.fkProvedor || !a.fkMarca || !a.fkLinea || !a.fkPresentacion) {
      this.showToast('Completa todos los campos requeridos *', true);
      return;
    }
    if (a.precio < 0) {
      this.showToast('El precio no puede ser negativo.', true);
      return;
    }

    if (this.miRol === 2) {
      this.saveStep.set('Subiendo fotos...');
      this.uploadFilesForEditor(filenames => {
        const id = this.editActivoForm.idActivo as string;
        const payload = { ...this.editActivoForm, _fotosFilenames: filenames, _fotosEliminadas: this.fotosAEliminar };
        const cambio: CambioPendiente = {
          tipoCambio: 'ACTUALIZAR', entidad: 'activos', idEntidad: id,
          datosJson: JSON.stringify(payload)
        };
        this.cambiosService.enviarCambio(cambio).subscribe({
          next: () => { this.showToast('Solicitud enviada a revision.'); this.closeEditForm(); this.loadActivos(); },
          error: () => { this.showToast('Error al enviar solicitud.', true); this.saveStep.set(''); }
        });
      });
      return;
    }

    this.isSaving = true;
    const id = this.editActivoForm.idActivo as string;
    const fkArea = this.editActivoForm.fkArea as string;
    const fkResguardante = this.editActivoForm.fkResguardante as number | string;

    this.catalogoService.update('activos', id, this.editActivoForm).subscribe({
      next: () => {
        const deleteNext = (dIndex: number) => {
          if (dIndex < this.fotosAEliminar.length) {
            this.catalogoService.delete('fotos', String(this.fotosAEliminar[dIndex])).subscribe({
              next: () => deleteNext(dIndex + 1),
              error: () => deleteNext(dIndex + 1)
            });
          } else {
            startUpload();
          }
        };

        const startUpload = () => {
          const uploadNext = (index: number) => {
            if (index < this.selectedFiles.length) {
              this.uploadService.uploadFoto(this.selectedFiles[index]).subscribe({
                next: (res: any) => {
                  this.catalogoService.create('fotos', {
                    fkActivo: id, foto: res.filename,
                    creadoPor: this.miId, ultimoActualizadoPor: this.miId, estado: '1'
                  }).subscribe(() => uploadNext(index + 1));
                },
                error: () => uploadNext(index + 1)
              });
            } else {
              this.processAssignment(id, fkArea, fkResguardante);
            }
          };
          if (this.selectedFiles.length > 0) {
            uploadNext(0);
          } else {
            this.processAssignment(id, fkArea, fkResguardante);
          }
        };

        if (this.fotosAEliminar.length > 0) {
          deleteNext(0);
        } else {
          startUpload();
        }
      },
      error: () => { this.isSaving = false; this.showToast('Error al editar', true); }
    });
  }

  private processAssignment(id: string, fkArea: string, fkResguardante: number | string) {
    if (fkArea && fkResguardante) {
      if (this.editAsignacion()) {
        const updated = { ...this.editAsignacion(), fkArea, fkResguardante, ultimoActualizadoPor: this.miId };
        this.catalogoService.update('asignaciones', String(this.editAsignacion()?.idAsignaciones), updated).subscribe({
          next: () => this.finalizeEdit(),
          error: () => this.finalizeEdit()
        });
      } else {
        this.catalogoService.create('asignaciones', {
          fkActivo: id, fkArea, fkResguardante,
          creadoPor: this.miId, ultimoActualizadoPor: this.miId, estado: '1'
        }).subscribe({ next: () => this.finalizeEdit(), error: () => this.finalizeEdit() });
      }
    } else {
      this.finalizeEdit();
    }
  }

  private finalizeEdit() {
    this.isSaving = false;
    this.saveStep.set('');
    this.closeEditForm();
    this.loadActivos();
    this.showToast('Activo actualizado correctamente');
  }

  cambiarEstadoActivo(item: Activo, nuevoEstado: string) {
    if (this.miRol === 2) {
      const payload = { ...item, estado: nuevoEstado };
      const cambio: CambioPendiente = {
        tipoCambio: 'ACTUALIZAR', entidad: 'activos', idEntidad: item.idActivo,
        datosJson: JSON.stringify(payload)
      };
      this.cambiosService.enviarCambio(cambio).subscribe({
        next: () => { this.showToast('Solicitud enviada a revision.'); this.loadActivos(); },
        error: () => this.showToast('Error al enviar solicitud.', true)
      });
      return;
    }
    this.catalogoService.cambiarEstado('activos', item.idActivo!, nuevoEstado).subscribe({
      next: () => { this.loadActivos(); this.showToast('Estado actualizado'); },
      error: () => this.showToast('Error al cambiar estado', true)
    });
  }

  eliminarActivo(item: Activo) {
    if (this.miRol === 2) {
      const cambio: CambioPendiente = {
        tipoCambio: 'ELIMINAR', entidad: 'activos', idEntidad: item.idActivo,
        datosJson: JSON.stringify(item)
      };
      this.cambiosService.enviarCambio(cambio).subscribe({
        next: () => { this.showToast('Solicitud enviada a revision.'); this.loadActivos(); },
        error: () => this.showToast('Error al enviar solicitud.', true)
      });
      return;
    }
    this.catalogoService.cambiarEstado('activos', item.idActivo!, '3').subscribe({
      next: () => { this.loadActivos(); this.showToast('Activo eliminado'); },
      error: () => this.showToast('Error al eliminar', true)
    });
  }

  // ===================== SCANNER =====================
  startScanning() {
    this.scanResult.set('');
    this.buscandoEscaneo.set(false);
    this.isScanning.set(true);
    this.debugMessage.set('Iniciando cámara...');

    setTimeout(async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(d => d.kind === 'videoinput');
        let selectedDeviceId: string | undefined;

        if (videoDevices.length > 0) {
          selectedDeviceId = videoDevices[videoDevices.length - 1].deviceId;
          const backCamera = videoDevices.find(d =>
            d.label.toLowerCase().includes('back') ||
            d.label.toLowerCase().includes('environment') ||
            d.label.toLowerCase().includes('traser')
          );
          if (backCamera) selectedDeviceId = backCamera.deviceId;
        }

        const constraints: MediaStreamConstraints = {
          video: {
            deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
            facingMode: selectedDeviceId ? undefined : 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        };

        this.codeReader.decodeFromConstraints(constraints, 'video-preview', (result, error) => {
          if (result) {
            const text = result.getText();
            this.scanResult.set(text);
            this.debugMessage.set('Código detectado');
            if (navigator.vibrate) navigator.vibrate(200);
            this.stopScanning();
            this.buscarActivoEscaneado(text);
          }
          if (error && !this.scanResult()) {
            this.debugMessage.set(`Buscando... [${Math.floor(Math.random() * 99)}]`);
          }
        }).then(controls => { this.controls = controls; })
          .catch(err => {
            console.error('Error decodificando:', err);
            this.debugMessage.set('Error: ' + err.message);
          });

      } catch (err: any) {
        console.error('Error:', err);
        this.debugMessage.set('Error: ' + err.message);
      }
    }, 250);
  }

  stopScanning() {
    if (this.controls) { this.controls.stop(); this.controls = null; }
    this.isScanning.set(false);
    this.debugMessage.set('Detenido.');
  }

  private buscarActivoEscaneado(text: string) {
    this.buscandoEscaneo.set(true);
    this.catalogoService.getById('activos', text).subscribe({
      next: (activo) => {
        this.buscandoEscaneo.set(false);
        this.scanResult.set('');
        this.openEditForm(activo);
      },
      error: () => {
        this.buscandoEscaneo.set(false);
        this.showToast('No se encontró el activo: ' + text, true);
      }
    });
  }

  // ===================== CAMBIOS (ADMIN) =====================
  cargarContadorPendientes() {
    this.cambiosService.contarPendientes().subscribe({
      next: c => this.cantidadPendientes.set(c),
      error: () => {}
    });
  }

  loadCambios() {
    this.cargandoCambios.set(true);
    if (this.filtroCambios === 'procesados') {
      this.cambiosService.listarProcesados().subscribe({
        next: d => { this.dataProcesados.set(d); this.cargandoCambios.set(false); },
        error: () => this.cargandoCambios.set(false)
      });
    } else {
      this.cambiosService.listarPendientes().subscribe({
        next: d => { this.dataCambios.set(d); this.cargandoCambios.set(false); },
        error: () => this.cargandoCambios.set(false)
      });
    }
  }

  onFiltroCambiosChange() {
    this.loadCambios();
  }

  verDetalleCambio(cambio: CambioPendiente) {
    this.cambioSeleccionado = cambio;
    this.datosJsonParseado = JSON.parse(cambio.datosJson);
    this.comentarioRechazo = '';
    this.mostrandoTextarea = false;
    this.fotosActualesCambio.set([]);
    this.activoOriginal.set(null);
    if (cambio.tipoCambio !== 'CREAR' && cambio.idEntidad) {
      this.catalogoService.getAll(`fotos/activo/${cambio.idEntidad}`).subscribe({
        next: fotos => this.fotosActualesCambio.set(fotos),
        error: () => {}
      });
      if (cambio.tipoCambio === 'ACTUALIZAR') {
        this.catalogoService.getById('activos', cambio.idEntidad).subscribe({
          next: activo => this.activoOriginal.set(activo),
          error: () => {}
        });
      }
    }
  }

  campoCambiado(valorNuevo: any, campo: string): any {
    const original = this.activoOriginal() as any;
    if (!original || original[campo] == null) return {};
    if (original[campo] != valorNuevo) {
      return { color: '#dc2626', 'font-weight': '600' };
    }
    return {};
  }

  resumenCambiosTexto(): string {
    if (!this.activoOriginal() || !this.datosJsonParseado || this.cambioSeleccionado?.tipoCambio !== 'ACTUALIZAR') return '';
    const labels: Record<string, string> = {
      nombre: 'nombre', descripcion: 'descripción', precio: 'precio',
      existencias: 'existencias', garantia: 'garantía', nSerie: 'No. Serie',
      fkMarca: 'marca', fkProvedor: 'proveedor', fkLinea: 'línea',
      fkPresentacion: 'presentación', fkArea: 'área', fkResguardante: 'resguardante',
      estado: 'estado'
    };
    const cambiados: string[] = [];
    const original = this.activoOriginal() as any;
    for (const [campo, label] of Object.entries(labels)) {
      if (original[campo] != null && original[campo] != this.datosJsonParseado[campo]) {
        cambiados.push(label);
      }
    }
    if (cambiados.length === 0) return '';
    return 'Se cambió: ' + cambiados.join(', ') + '.';
  }

  getDatosResumen(datosJson: string): string {
    try {
      const obj = JSON.parse(datosJson);
      return obj.nombre ? obj.nombre : 'Sin nombre';
    } catch { return 'Datos inválidos'; }
  }

  cerrarModalCambio() {
    this.cambioSeleccionado = null;
    this.datosJsonParseado = null;
    this.comentarioRechazo = '';
    this.mostrandoTextarea = false;
    this.fotosActualesCambio.set([]);
    this.activoOriginal.set(null);
  }

  aprobarCambio() {
    if (!this.cambioSeleccionado?.idCambio) return;
    this.cambiosService.aprobarCambio(this.cambioSeleccionado.idCambio).subscribe({
      next: () => {
        this.cerrarModalCambio();
        this.loadCambios();
        this.cargarContadorPendientes();
        this.showToast('Solicitud aprobada');
      },
      error: () => this.showToast('Error al aprobar solicitud', true)
    });
  }

  iniciarRechazo() {
    if (!this.mostrandoTextarea) {
      this.mostrandoTextarea = true;
    } else {
      this.rechazarCambio();
    }
  }

  rechazarCambio() {
    if (!this.cambioSeleccionado?.idCambio) return;
    this.cambiosService.rechazarCambio(this.cambioSeleccionado.idCambio, this.comentarioRechazo).subscribe({
      next: () => {
        this.cerrarModalCambio();
        this.loadCambios();
        this.cargarContadorPendientes();
        this.showToast('Solicitud rechazada');
      },
      error: () => this.showToast('Error al rechazar solicitud', true)
    });
  }

  // ===================== HELPERS =====================
  private uploadFilesForEditor(callback: (filenames: string[]) => void) {
    if (this.selectedFiles.length === 0) { callback([]); return; }
    const filenames: string[] = [];
    const uploadNext = (index: number) => {
      if (index < this.selectedFiles.length) {
        this.uploadService.uploadFoto(this.selectedFiles[index]).subscribe({
          next: (res: any) => { filenames.push(res.filename); uploadNext(index + 1); },
          error: () => uploadNext(index + 1)
        });
      } else { callback(filenames); }
    };
    uploadNext(0);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

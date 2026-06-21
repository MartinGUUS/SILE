import { Component, inject, signal, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';
import { FormsModule } from '@angular/forms';
import { CatalogoService } from '../../services/catalogo.service';
import { UploadService } from '../../services/upload.service';
import { CambiosService } from '../../services/cambios.service';
import { ObservacionesService } from '../../services/observaciones.service';
import { UsuariosService } from '../../services/usuarios.service';
import { catchError, forkJoin, of } from 'rxjs';
import { CambioPendiente } from '../../models/cambio-pendiente.model';

import { Activo } from '../../models/activo.model';
import { Foto } from '../../models/foto.model';
import { Marca } from '../../models/marca.model';
import { Area } from '../../models/area.model';
import { Resguardante } from '../../models/resguardante.model';
import { Asignacion } from '../../models/asignacion.model';
import { Observacion } from '../../models/observacion.model';
import { Usuario } from '../../models/usuario.model';

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
  private observacionesService = inject(ObservacionesService);
  private usuariosService = inject(UsuariosService);
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
  allCambios: CambioPendiente[] = [];
  allProcesados: CambioPendiente[] = [];
  busquedaCambios = '';
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
  observaciones = signal<Observacion[]>([]);
  nuevaObservacion = '';
  dataUsuarios = signal<Usuario[]>([]);

  // --- Create form ---
  showCreateForm = false;
  newActivo: Partial<Activo> = {};
  selectedFiles: File[] = [];
  selectedFilesPreview = signal<{file: File, url: string}[]>([]);
  isSaving = false;
  saveStep = signal('');
  idActivoExiste = signal(false);
  scanningForCreate = signal(false);
  private checkIdTimer: any;
  private createScanControls: IScannerControls | null = null;

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
    this.usuariosService.getAllUsuarios().subscribe({
      next: d => this.dataUsuarios.set(d),
      error: () => {}
    });
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
    this.activeTab.set(tab);
    if (tab === 'inventario') this.loadActivos();
    if (tab === 'cambios') {
      this.filtroCambios = 'pendientes';
      this.busquedaCambios = '';
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
      areas: this.catalogoService.getAll('areas', '1').pipe(catchError(() => of([]))),
      resguardantes: this.catalogoService.getAll('resguardantes', '1').pipe(catchError(() => of([])))
    }).subscribe(d => {
      this.listMarcas.set(d.marcas);
      this.listAreas.set(d.areas);
      this.listResguardantes.set(d.resguardantes);
    });
  }

  // ===================== INVENTORY =====================
  loadActivos() {
    this.cargandoActivos.set(true);
    this.catalogoService.getAll('activos', this.filtroEstado).subscribe({
      next: d => {
        if (this.miRol !== 1) {
          d = d.filter((a: any) => a.estado !== '5');
        }
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
        (a.descripcion && a.descripcion.toLowerCase().includes(q))
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
    this.observaciones.set([]);
    this.nuevaObservacion = '';
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
    this.cargarObservaciones();
  }

  openImagePreview(url: string) {
    this.previewImageUrl = url;
    this.showImagePreview = true;
  }

  getMarcaName(id: string | undefined): string {
    const m = this.listMarcas().find(x => x.idMarca === id);
    return m?.nombre || (id || 'N/A');
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

  getUserFullNameById(id: number | undefined): string {
    if (!id) return '—';
    const u = this.dataUsuarios().find(user => user.idUsuario === id);
    return u ? `${u.nombre}${u.apellido ? ' ' + u.apellido : ''}` : `ID ${id}`;
  }

  // ===================== CREATE =====================

  onIdActivoChange(valor: string) {
    if (this.checkIdTimer) clearTimeout(this.checkIdTimer);
    if (!valor || !valor.trim()) {
      this.idActivoExiste.set(false);
      return;
    }
    this.checkIdTimer = setTimeout(() => {
      this.catalogoService.getById('activos', valor.trim()).subscribe({
        next: () => this.idActivoExiste.set(true),
        error: () => this.idActivoExiste.set(false)
      });
    }, 400);
  }

  onCoresguardanteAuto() {
    const fkResguardante = this.showCreateForm
      ? this.newActivo.fkResguardante
      : this.editActivoForm.fkResguardante;
    if (!fkResguardante || fkResguardante == 1) {
      if (this.showCreateForm) {
        (this.newActivo as any).coresguardante = 1;
      } else {
        this.editActivoForm.coresguardante = 1;
      }
    }
  }

  openCreateForm() {
    this.idActivoExiste.set(false);
    if (this.checkIdTimer) clearTimeout(this.checkIdTimer);
    this.newActivo = {
      idActivo: '', nombre: '', descripcion: '', modelo: '',
      nSerie: '', fkMarca: '',
      fkArea: '', fkResguardante: undefined, coresguardante: undefined, estado: undefined
    };
    this.selectedFiles = [];
    this.clearSelectedFilesPreview();
    this.showCreateForm = true;
    this.loadCatalogos();
  }

  startCreateScan() {
    if (this.createScanControls) return;
    this.scanningForCreate.set(true);

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

        this.codeReader.decodeFromConstraints(constraints, 'create-video-preview', (result, error) => {
          if (result) {
            const text = result.getText();
            if (navigator.vibrate) navigator.vibrate(200);
            (this.newActivo as any).idActivo = text;
            this.onIdActivoChange(text);
            this.stopCreateScan();
          }
          if (error && this.scanningForCreate()) {
            // silently scanning
          }
        }).then(controls => {
          this.createScanControls = controls;
        }).catch(err => {
          console.error('Error escaneando:', err);
          this.stopCreateScan();
        });

      } catch (err: any) {
        console.error('Error:', err);
        this.stopCreateScan();
      }
    }, 250);
  }

  stopCreateScan() {
    if (this.createScanControls) {
      this.createScanControls.stop();
      this.createScanControls = null;
    }
    this.scanningForCreate.set(false);
  }

  closeCreateForm() {
    this.stopCreateScan();
    this.idActivoExiste.set(false);
    if (this.checkIdTimer) clearTimeout(this.checkIdTimer);
    this.showCreateForm = false;
    this.selectedFiles = [];
    this.clearSelectedFilesPreview();
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
      const previews = files.map(file => ({ file, url: URL.createObjectURL(file) }));
      this.selectedFilesPreview.set([...this.selectedFilesPreview(), ...previews]);
      event.target.value = '';
    }
  }

  removeSelectedFile(index: number) {
    URL.revokeObjectURL(this.selectedFilesPreview()[index].url);
    this.selectedFilesPreview.update(arr => arr.filter((_, i) => i !== index));
    this.selectedFiles.splice(index, 1);
  }

  private clearSelectedFilesPreview() {
    for (const p of this.selectedFilesPreview()) {
      URL.revokeObjectURL(p.url);
    }
    this.selectedFilesPreview.set([]);
  }

  saveNuevoActivo() {
    const a: any = this.newActivo;
    if (!a.fkArea) a.fkArea = '1';
    if (!a.fkResguardante) a.fkResguardante = 1;
    if (!a.coresguardante) (a as any).coresguardante = 1;
    if (!a.estado) {
      this.showToast('Selecciona un estado', true);
      return;
    }
    if (!a.idActivo || !a.nombre || !a.descripcion ||
        !a.nSerie || !a.fkMarca) {
      this.showToast('Completa todos los campos requeridos *', true);
      return;
    }
    if (this.miRol === 2) {
      this.saveStep.set('Subiendo fotos...');
      this.uploadFilesForEditor(filenames => {
        const payload = { ...this.newActivo, _fotosFilenames: filenames, _fotosEliminadas: [], fkCoresguardante: this.newActivo.coresguardante };
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
            this.crearAsignacionFinal(idActivo, fkArea, fkResguardante, this.newActivo.coresguardante);
          }
        };

        if (this.selectedFiles.length > 0) {
          uploadNext(0);
        } else {
          this.crearAsignacionFinal(idActivo, fkArea, fkResguardante, this.newActivo.coresguardante);
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

  private crearAsignacionFinal(idActivo: string, fkArea: string, fkResguardante: string, fkCoresguardante: any) {
    if (fkArea || fkResguardante) {
      this.saveStep.set('Guardando asignación...');
      this.catalogoService.create('asignaciones', {
        fkActivo: idActivo, fkArea: fkArea || null, fkResguardante: fkResguardante || null,
        fkCoresguardante: fkCoresguardante || null,
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
    this.clearSelectedFilesPreview();
    this.showEditForm = true;

    setTimeout(() => {
      forkJoin({
        fotos: this.catalogoService.getAll(`fotos/activo/${item.idActivo}`).pipe(catchError(() => of([]))),
        asignaciones: this.catalogoService.getAll(`asignaciones/activo/${item.idActivo}`).pipe(catchError(() => of([]))),
        catalogos: forkJoin({
          marcas: this.catalogoService.getAll('marcas', '1').pipe(catchError(() => of([]))),
          areas: this.catalogoService.getAll('areas', '1').pipe(catchError(() => of([]))),
          resguardantes: this.catalogoService.getAll('resguardantes', '1').pipe(catchError(() => of([])))
        })
      }).subscribe(result => {
        this.editFotos.set(result.fotos.filter((f: Foto) => !this.fotosAEliminar.includes(f.idFoto!)));
        this.listMarcas.set(result.catalogos.marcas);
        this.listAreas.set(result.catalogos.areas);
        this.listResguardantes.set(result.catalogos.resguardantes);
        if (result.asignaciones && result.asignaciones.length > 0) {
          this.editAsignacion.set(result.asignaciones[0]);
          if (!this.editActivoForm.fkArea) this.editActivoForm.fkArea = result.asignaciones[0].fkArea;
          if (!this.editActivoForm.fkResguardante) this.editActivoForm.fkResguardante = result.asignaciones[0].fkResguardante;
          this.editActivoForm.coresguardante = result.asignaciones[0].fkCoresguardante || undefined;
          if (!this.editActivoForm.fkResguardante || this.editActivoForm.fkResguardante === 1)
            this.editActivoForm.coresguardante = 1;
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
    this.clearSelectedFilesPreview();
  }

  deleteEditFoto(idFoto: number) {
    this.editFotos.update(f => f.filter(x => x.idFoto !== idFoto));
    this.fotosAEliminar.push(idFoto);
  }

  saveEditActivo() {
    const a = this.editActivoForm;
    if (!a.fkArea) a.fkArea = '1';
    if (!a.fkResguardante) a.fkResguardante = 1;
    if (!a.coresguardante) a.coresguardante = 1;
    if (!a.nombre || !a.descripcion ||
        !a.nSerie || !a.fkMarca) {
      this.showToast('Completa todos los campos requeridos *', true);
      return;
    }
    if (this.miRol === 2) {
      this.saveStep.set('Subiendo fotos...');
      this.uploadFilesForEditor(filenames => {
        const id = this.editActivoForm.idActivo as string;
        const payload = { ...this.editActivoForm, _fotosFilenames: filenames, _fotosEliminadas: this.fotosAEliminar, fkCoresguardante: this.editActivoForm.coresguardante };
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
    if (fkArea || fkResguardante) {
      if (this.editAsignacion()) {
        const updated = { ...this.editAsignacion(), fkArea: fkArea || null, fkResguardante: fkResguardante || null, fkCoresguardante: this.editActivoForm.coresguardante || null, ultimoActualizadoPor: this.miId };
        this.catalogoService.update('asignaciones', String(this.editAsignacion()?.idAsignaciones), updated).subscribe({
          next: () => this.finalizeEdit(),
          error: () => this.finalizeEdit()
        });
      } else {
        this.catalogoService.create('asignaciones', {
          fkActivo: id, fkArea: fkArea || null, fkResguardante: fkResguardante || null,
          fkCoresguardante: this.editActivoForm.coresguardante || null,
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

  onEstadoChange(event: Event, item: any) {
    const select = event.target as HTMLSelectElement;
    const nuevoEstado = select.value;
    if (item.estado === nuevoEstado) return;
    if (nuevoEstado === '5' && !confirm('¿Estás seguro de que deseas eliminar este activo?')) {
      select.value = item.estado;
      return;
    }
    item.estado = nuevoEstado;
    this.cambiarEstadoActivo(item, nuevoEstado);
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
      next: () => { this.loadActivos(); this.showToast('Activo dado de baja'); },
      error: () => this.showToast('Error al eliminar', true)
    });
  }

  cargarObservaciones() {
    if (!this.selectedActivo?.idActivo) return;
    this.observacionesService.getAllByActivo(this.selectedActivo.idActivo).subscribe({
      next: data => this.observaciones.set(data),
      error: () => this.observaciones.set([])
    });
  }

  agregarObservacion() {
    if (!this.nuevaObservacion.trim() || !this.selectedActivo?.idActivo) return;
    const data = {
      fkActivo: this.selectedActivo.idActivo,
      texto: this.nuevaObservacion.trim(),
      creadoPor: this.miId
    };
    this.observacionesService.create(data).subscribe({
      next: () => {
        this.nuevaObservacion = '';
        this.cargarObservaciones();
      },
      error: () => this.showToast('Error al agregar observacion', true)
    });
  }

  eliminarObservacion(id: number) {
    if (!confirm('Eliminar esta observacion?')) return;
    this.observacionesService.delete(id).subscribe({
      next: () => this.cargarObservaciones(),
      error: () => this.showToast('Error al eliminar observacion', true)
    });
  }

  getEstadoLabel(estado: string): string {
    switch (estado) {
      case '1': return 'Activo';
      case '2': return 'Sobrante';
      case '3': return 'Baja';
      case '4': return 'Nuevo';
      case '5': return 'Eliminado';
      case '100': return 'Borrado';
      default: return 'Desconocido';
    }
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
        next: d => { this.allProcesados = d; this.cargandoCambios.set(false); this.filtrarCambios(); },
        error: () => this.cargandoCambios.set(false)
      });
    } else {
      this.cambiosService.listarPendientes().subscribe({
        next: d => { this.allCambios = d; this.cargandoCambios.set(false); this.filtrarCambios(); },
        error: () => this.cargandoCambios.set(false)
      });
    }
  }

  onFiltroCambiosChange() {
    this.loadCambios();
  }

  filtrarCambios() {
    const q = this.busquedaCambios.toLowerCase().trim();
    if (this.filtroCambios === 'procesados') {
      if (!q) { this.dataProcesados.set(this.allProcesados); }
      else {
        this.dataProcesados.set(this.allProcesados.filter(c =>
          (c.idEntidad && c.idEntidad.toLowerCase().includes(q)) ||
          (c.idSolicitante && String(c.idSolicitante).includes(q)) ||
          (c.tipoCambio && c.tipoCambio.toLowerCase().includes(q)) ||
          (c.datosJson && c.datosJson.toLowerCase().includes(q))
        ));
      }
    } else {
      if (!q) { this.dataCambios.set(this.allCambios); }
      else {
        this.dataCambios.set(this.allCambios.filter(c =>
          (c.idEntidad && c.idEntidad.toLowerCase().includes(q)) ||
          (c.idSolicitante && String(c.idSolicitante).includes(q)) ||
          (c.tipoCambio && c.tipoCambio.toLowerCase().includes(q)) ||
          (c.datosJson && c.datosJson.toLowerCase().includes(q))
        ));
      }
    }
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
      if (cambio.tipoCambio === 'ACTUALIZAR' || cambio.tipoCambio === 'ELIMINAR') {
        // Para cambios ya procesados, usar _estadoAnterior guardado en el JSON
        if (cambio.estado !== 'PENDIENTE' && this.datosJsonParseado?._estadoAnterior) {
          const anterior = this.datosJsonParseado._estadoAnterior;
          delete anterior._estadoAnterior;
          this.activoOriginal.set(anterior);
        } else if (cambio.tipoCambio === 'ACTUALIZAR') {
          forkJoin({
            activo: this.catalogoService.getById('activos', cambio.idEntidad).pipe(catchError(() => of(null))),
            asignaciones: this.catalogoService.getAll(`asignaciones/activo/${cambio.idEntidad}`).pipe(catchError(() => of([])))
          }).subscribe({
            next: result => {
              const activo = result.activo;
              if (activo) {
                if (result.asignaciones && result.asignaciones.length > 0) {
                  (activo as any).fkArea = result.asignaciones[0].fkArea;
                  (activo as any).fkResguardante = result.asignaciones[0].fkResguardante;
                  (activo as any).fkCoresguardante = result.asignaciones[0].fkCoresguardante;
                }
                this.activoOriginal.set(activo);
              }
            },
            error: () => {}
          });
        }
      }
    }
  }

  campoCambiado(valorNuevo: any, campo: string): any {
    const original = this.activoOriginal() as any;
    if (!original) return {};
    const origVal = original[campo];
    const nuevo = valorNuevo;
    if (nuevo === undefined) return {};
    if (origVal == null && (nuevo == null || nuevo === '')) return {};
    if (origVal != nuevo) {
      return { color: '#dc2626', 'font-weight': '600' };
    }
    return {};
  }

  resumenCambiosTexto(): string {
    if (!this.activoOriginal() || !this.datosJsonParseado || this.cambioSeleccionado?.tipoCambio !== 'ACTUALIZAR') return '';
    const labels: Record<string, string> = {
      nombre: 'nombre', descripcion: 'descripción', modelo: 'modelo', nSerie: 'No. Serie',
      fkMarca: 'marca', fkArea: 'área', fkResguardante: 'resguardante', fkCoresguardante: 'corresguardante',
      estado: 'estado'
    };
    const cambiados: string[] = [];
    const original = this.activoOriginal() as any;
    for (const [campo, label] of Object.entries(labels)) {
      const origVal = original[campo];
      const newVal = this.datosJsonParseado[campo];
      if (newVal === undefined) continue;
      if (origVal != newVal && !(origVal == null && (newVal == null || newVal === ''))) {
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

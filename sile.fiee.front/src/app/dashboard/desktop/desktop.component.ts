import { Component, inject, signal, OnInit, OnDestroy, HostListener, ViewChild, ViewChildren, ElementRef, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { UsuariosService } from '../../services/usuarios.service';
import { CatalogoService } from '../../services/catalogo.service';
import { UploadService } from '../../services/upload.service';
import { CambiosService } from '../../services/cambios.service';
import { CambioPendiente } from '../../models/cambio-pendiente.model';
import { Activo } from '../../models/activo.model';
import { Usuario } from '../../models/usuario.model';
import { Marca } from '../../models/marca.model';
import { Proveedor } from '../../models/proveedor.model';
import { Linea } from '../../models/linea.model';
import { Presentacion } from '../../models/presentacion.model';
import { Area } from '../../models/area.model';
import { Resguardante } from '../../models/resguardante.model';
import { Foto } from '../../models/foto.model';
import { Asignacion } from '../../models/asignacion.model';

type TabType = 'activos' | 'usuarios' | 'areas' | 'presentacion' | 'lineas' | 'marcas' | 'provedores' | 'resguardantes' | 'cambios' | 'mis-solicitudes';

@Component({
  selector: 'app-desktop-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './desktop.component.html',
  styleUrl: './desktop.component.css'
})
export class DesktopDashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private usuariosService = inject(UsuariosService);
  private catalogoService = inject(CatalogoService);
  private uploadService = inject(UploadService);
  private router = inject(Router);
  private cambiosService = inject(CambiosService);
  activeTab = signal<TabType>('activos');

  // Data local
  dataUsuarios = signal<Usuario[]>([]);
  dataActivos = signal<Activo[]>([]);
  dataCatalogo = signal<any[]>([]);

  // Estados de edición (no-signal porque se ligan bidireccionalmente con ngModel y falla el AST de Angular)
  editingId: string | number | null = null;
  editForm: any = {};

  miId: number | null = null;
  miRol: number | null = null;
  userName = signal('');
  cantidadPendientes: number = 0;
  cargandoCambios = false;
  cargandoSolicitudes = false;
  pendientesInterval: any;

  // Datos de cambios pendientes / solicitudes
  dataCambios = signal<CambioPendiente[]>([]);
  dataProcesados = signal<CambioPendiente[]>([]);
  dataSolicitudes = signal<CambioPendiente[]>([]);
  filtroCambios = 'pendientes';
  cambioSeleccionado: CambioPendiente | null = null;
  datosJsonParseado: any = null;
  comentarioRechazo = '';
  mostrandoTextarea = false;
  mensajeCambios = '';
  mensajeCambiosError = false;
  fotosActualesCambio = signal<any[]>([]);
  activoOriginal = signal<any>(null);

  @ViewChild('idActivoInput') idActivoInput!: ElementRef;
  @ViewChildren('editInput') editInputs!: QueryList<ElementRef>;

  // Modal Create Activo
  showModalCreateActivo = false;
  newActivo: Partial<Activo> = { estado: '1' };
  selectedFiles: File[] = [];
  isSaving = false;
  idActivoExiste = signal(false);
  private checkIdTimer: any;

  // Modal Edit Activo
  showModalEditActivo = false;
  editActivoForm: any = {};
  assignmentActivo = signal<Asignacion | null>(null);
  // Reutilizamos selectedFiles para editar también

  // Listas de catálogos como señales para reactividad garantizada
  listMarcas = signal<Marca[]>([]);
  listProveedores = signal<Proveedor[]>([]);
  listLineas = signal<Linea[]>([]);
  listPresentacion = signal<Presentacion[]>([]);
  listAreas = signal<Area[]>([]);
  listResguardantes = signal<Resguardante[]>([]);

  // Modal Create Catalogo
  showModalCatalogo = false;
  newCatalogo: any = {};
  isSavingCatalogo = false;

  // Filtro estado activos (1=activos, 2=inactivos)
  filtroEstadoActivos = '1';

  // Búsqueda de activos
  searchQuery = '';
  allActivos: Activo[] = [];

  // Filtro estado catálogos (1=activos, 2=inactivos) - Por defecto en activos (1)
  filtroEstadoCatalogo: Record<string, string> = {};

  // Filtro estado usuarios (1=activos, 2=inactivos)
  filtroEstadoUsuarios = '1';

  // Modal Detalle
  showModalDetalle = false;
  selectedActivo: Activo | null = null;
  fotosActivo = signal<Foto[]>([]);
  fotosAEliminar: number[] = [];

  // Modal Vista Previa Imagen
  showModalImagePreview = false;
  previewImageUrl = '';

  ngOnInit() {
    this.miId = this.authService.getIdUsuario();
    this.miRol = this.authService.getFkRol();
    this.userName.set(localStorage.getItem('userFullName') || localStorage.getItem('userName') || 'Usuario');
    this.loadDataForTab();
    
    if (this.miRol === 1) {
      this.loadCatalogosParaActivos().subscribe(data => this.updateCatalogLists(data));
      this.cargarContadorPendientes();
      this.pendientesInterval = setInterval(() => {
        this.cargarContadorPendientes();
      }, 60000);
    } else if (this.miRol === 2) {
      this.loadCatalogosParaActivos().subscribe(data => this.updateCatalogLists(data));
    }
  }

  ngOnDestroy() {
    if (this.pendientesInterval) {
      clearInterval(this.pendientesInterval);
    }
  }

  cargarContadorPendientes(): void {
    this.cambiosService.contarPendientes().subscribe({
      next: (count) => this.cantidadPendientes = count,
      error: () => {} 
    });
  }

  notifMensaje = signal('');
  notifError = signal(false);
  notifTimeout: any;

  mostrarNotificacion(mensaje: string, esError: boolean = false): void {
    if (this.notifTimeout) clearTimeout(this.notifTimeout);
    this.notifMensaje.set(mensaje);
    this.notifError.set(esError);
    this.notifTimeout = setTimeout(() => { this.notifMensaje.set(''); this.notifTimeout = null; }, 2000);
  }

  cerrarNotificacion(): void {
    if (this.notifTimeout) clearTimeout(this.notifTimeout);
    this.notifMensaje.set('');
    this.notifTimeout = null;
  }

  @HostListener('window:keydown.escape')
  handleEscape() {
    if (this.showModalImagePreview) {
      this.closeImagePreview();
    } else {
      this.cancelEdit(); // Cancelar edición en línea si existe
      this.closeCreateActivo();
      this.closeCreateCatalogo();
      this.closeDetalle();
      this.closeEditActivo();
      this.cerrarModalCambio();
    }
  }

  loadCatalogosParaActivos() {
    console.log('[DEBUG] Recargando catálogos para el formulario de Activos...');
    return forkJoin({
      marcas: this.catalogoService.getAll('marcas', '1').pipe(catchError(() => of([]))),
      proveedores: this.catalogoService.getAll('provedores', '1').pipe(catchError(() => of([]))),
      lineas: this.catalogoService.getAll('lineas', '1').pipe(catchError(() => of([]))),
      presentacion: this.catalogoService.getAll('presentacion', '1').pipe(catchError(() => of([]))),
      areas: this.catalogoService.getAll('areas', '1').pipe(catchError(() => of([]))),
      resguardantes: this.catalogoService.getAll('resguardantes', '1').pipe(catchError(() => of([])))
    });
  }

  updateCatalogLists(data: any) {
    this.listMarcas.set(data.marcas);
    this.listProveedores.set(data.proveedores);
    this.listLineas.set(data.lineas);
    this.listPresentacion.set(data.presentacion);
    this.listAreas.set(data.areas);
    this.listResguardantes.set(data.resguardantes);
    console.log('[DEBUG] Catálogos actualizados:', {
      marcas: this.listMarcas().length,
      areas: this.listAreas().length,
      resguardantes: this.listResguardantes().length
    });
  }

  setTab(tab: TabType) {
    this.cancelEdit();
    this.dataUsuarios.set([]);
    this.dataActivos.set([]);
    this.dataCatalogo.set([]);
    this.searchQuery = '';

    if (tab === 'usuarios') this.filtroEstadoUsuarios = '1';
    if (tab === 'activos') this.filtroEstadoActivos = '1';
    if (this.isCatalogoTab(tab)) this.filtroEstadoCatalogo[tab] = '1';
    if (tab === 'cambios') this.filtroCambios = 'pendientes';
    
    this.activeTab.set(tab);
    if (tab === 'cambios') {
      this.usuariosService.getAllUsuarios().subscribe({
        next: d => this.dataUsuarios.set(d),
        error: () => {}
      });
    }
    this.loadDataForTab();
  }

  isCatalogoTab(tab: TabType): boolean {
    return ['areas', 'presentacion', 'lineas', 'marcas', 'provedores', 'resguardantes'].includes(tab);
  }

  getDictId(item: any): string {
    const id = item.idMarca || item.idLinea || item.idProvedor || item.idArea || item.idPresentacion || item.idResguardante;
    return id !== undefined && id !== null ? String(id) : '';
  }

  loadDataForTab() {
    const tab = this.activeTab();
    if (tab === 'usuarios') {
      if (this.miRol === 1) {
        this.usuariosService.getAllUsuarios().subscribe({
          next: d => this.dataUsuarios.set(d.filter(u => u.estado === this.filtroEstadoUsuarios)),
          error: console.error
        });
      }
    } else if (tab === 'activos') {
      this.catalogoService.getAll('activos', this.filtroEstadoActivos).subscribe({
        next: d => {
          this.allActivos = d;
          this.applySearch();
        },
        error: console.error
      });
    } else if (this.isCatalogoTab(tab)) {
      const estado = this.filtroEstadoCatalogo[tab] || '1';
      console.log(`[CATALOGO] Cargando: ${tab} | Filtro Estado: ${estado}`);
      this.catalogoService.getAll(tab, estado).subscribe({
        next: d => {
          console.log(`[CATALOGO] ${tab} recibidos:`, d);
          this.dataCatalogo.set(d);
        },
        error: (err) => {
          console.error(`[CATALOGO] Error cargando ${tab}:`, err);
        }
      });
    } else if (tab === 'cambios') {
      this.cargarCambiosSegunFiltro();
    } else if (tab === 'mis-solicitudes') {
      this.cargandoSolicitudes = true;
      this.cambiosService.listarMisSolicitudes().subscribe({
        next: d => { this.dataSolicitudes.set(d); this.cargandoSolicitudes = false; },
        error: (err) => { console.error(err); this.cargandoSolicitudes = false; }
      });
    }
  }

  cargarCambiosSegunFiltro() {
    this.cargandoCambios = true;
    if (this.filtroCambios === 'procesados') {
      this.cambiosService.listarProcesados().subscribe({
        next: d => { this.dataProcesados.set(d); this.cargandoCambios = false; },
        error: (err) => { console.error(err); this.cargandoCambios = false; }
      });
    } else {
      this.cambiosService.listarPendientes().subscribe({
        next: d => { this.dataCambios.set(d); this.cargandoCambios = false; },
        error: (err) => { console.error(err); this.cargandoCambios = false; }
      });
    }
  }

  onFiltroCambiosChange() {
    this.cargarCambiosSegunFiltro();
  }

  onFiltroCatalogoChange() {
    this.loadDataForTab();
  }

  onFiltroUsuariosChange() {
    this.loadDataForTab();
  }

  onFiltroActivosChange() {
    this.searchQuery = '';
    this.loadDataForTab();
  }

  onSearchChange() {
    this.applySearch();
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

  eliminarUsuario(id: number) {
    if (!confirm('Eliminar este usuario? Esta accion es permanente (borrado logico).')) return;
    this.usuariosService.cambiarEstado(id, '3').subscribe({
      next: () => {
        this.loadDataForTab();
        this.mostrarNotificacion('Usuario eliminado');
      },
      error: () => this.mostrarNotificacion('Error al eliminar.', true)
    });
  }

  eliminarRegistro(endpoint: string, id: string) {
    if (endpoint === 'activos' && this.miRol === 2) {
      if (!confirm('¿Solicitar eliminación de este activo?')) return;
      
      const activoAEliminar = this.dataActivos().find(a => a.idActivo === id);
      const cambio: CambioPendiente = {
        tipoCambio: 'ELIMINAR',
        entidad: 'activos',
        idEntidad: id,
        datosJson: JSON.stringify(activoAEliminar || { idActivo: id })
      };
      
      this.cambiosService.enviarCambio(cambio).subscribe({
        next: () => {
          this.mostrarNotificacion('Solicitud enviada a revision. Un administrador la evaluara.');
          this.loadDataForTab();
        },
        error: () => this.mostrarNotificacion('Error al enviar solicitud.', true)
      });
      return;
    }

    if (!confirm('¿Eliminar este registro? Esta acción es permanente (borrado lógico).')) return;
    this.cambiarEstadoGenerico(endpoint, id, '3');
  }

  // --- MÉTODOS DE EDICIÓN ---
  startEdit(id: string | number, item: any) {
    this.editingId = id;
    this.editForm = { ...item };

    // Foco automático en el primer input de edición
    setTimeout(() => {
      const firstInput = this.editInputs.first;
      if (firstInput) {
        firstInput.nativeElement.focus();
      }
    }, 50);
  }

  cancelEdit() {
    this.editingId = null;
    this.editForm = {};
  }

  saveEditUsuario(id: number) {
    this.usuariosService.actualizar(id, this.editForm).subscribe({
      next: () => {
        this.cancelEdit();
        this.loadDataForTab();
      },
      error: console.error
    });
  }

  saveEditCatalogo(endpoint: string, id: string) {
    this.catalogoService.update(endpoint, id, this.editForm).subscribe({
      next: () => {
        this.cancelEdit();
        this.loadDataForTab();
      },
      error: console.error
    });
  }

  // --- CREAR CATALOGO ---
  openCreateCatalogo() {
    this.newCatalogo = {};
    this.showModalCatalogo = true;
  }

  closeCreateCatalogo() {
    this.showModalCatalogo = false;
  }

  saveNuevoCatalogo() {
    const tab = this.activeTab();

    // Validar que los campos clave existan
    if (tab !== 'resguardantes' && !this.newCatalogo.id) {
      alert('El campo ID es obligatorio.');
      return;
    }
    if (tab !== 'resguardantes' && !this.newCatalogo.nombre) {
      alert('El campo Nombre es obligatorio.');
      return;
    }
    if (tab === 'resguardantes' && (!this.newCatalogo.nombres || !this.newCatalogo.apellidos)) {
      alert('Nombres y Apellidos son obligatorios.');
      return;
    }

    this.isSavingCatalogo = true;
    this.newCatalogo.estado = "1";
    this.newCatalogo.creadoPor = this.miId;
    this.newCatalogo.ultimoActualizadoPor = this.miId;

    const idValue = this.newCatalogo.id;
    if (tab !== 'resguardantes' && idValue) {
      this.catalogoService.getById(tab, idValue).subscribe({
        next: (exists) => {
          if (exists) {
            alert(`El ID "${idValue}" ya existe en el catálogo ${tab}. Por favor, usa uno diferente.`);
            this.isSavingCatalogo = false;
          } else {
            this.proceedWithSaveCatalogo(tab);
          }
        },
        error: () => this.proceedWithSaveCatalogo(tab)
      });
    } else {
      this.proceedWithSaveCatalogo(tab);
    }
  }

  private proceedWithSaveCatalogo(tab: string) {
    if (tab !== 'resguardantes') {
      const idFieldMap: Record<string, string> = {
        marcas: 'idMarca',
        lineas: 'idLinea',
        provedores: 'idProvedor',
        areas: 'idArea',
        presentacion: 'idPresentacion'
      };
      const pkField = idFieldMap[tab];
      if (pkField) {
        this.newCatalogo[pkField] = this.newCatalogo.id;
        delete this.newCatalogo.id;
      }
    } else {
      // Para resguardantes, nos aseguramos de que no se envíe un campo 'id' vacío o nulo que confunda a JPA
      delete this.newCatalogo.id;
    }

    console.log(`Creando nuevo registro en ${tab}:`, this.newCatalogo);
    this.catalogoService.create(tab, this.newCatalogo).subscribe({
      next: () => {
        console.log('Registro creado con éxito');
        this.isSavingCatalogo = false;
        this.closeCreateCatalogo();
        this.loadDataForTab();
      },
      error: (err) => {
        console.error('Error creando catalogo:', err);
        this.isSavingCatalogo = false;
        const msg = err.error?.message || 'Error al guardar. Verifica que los datos sean correctos.';
        alert(msg);
      }
    });
  }

  // --- CREAR ACTIVO ---

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

  openCreateActivo() {
    this.idActivoExiste.set(false);
    if (this.checkIdTimer) clearTimeout(this.checkIdTimer);
    this.newActivo = {
      idActivo: '', nombre: '', descripcion: '', precio: undefined, existencias: 1, 
      garantia: '', nSerie: '', fkMarca: '', fkProvedor: '', fkLinea: '', fkPresentacion: '',
      fkArea: '', fkResguardante: undefined
    };
    this.selectedFiles = [];
    this.showModalCreateActivo = true;

    // Recargar catálogos para asegurar que los nuevos registros aparezcan en los selects
    this.loadCatalogosParaActivos().subscribe(data => this.updateCatalogLists(data));

    // Poner el foco en el campo ID Activo tras abrir el modal
    setTimeout(() => {
      if (this.idActivoInput) {
        this.idActivoInput.nativeElement.focus();
      }
    }, 100);
  }

  closeCreateActivo() {
    this.idActivoExiste.set(false);
    if (this.checkIdTimer) clearTimeout(this.checkIdTimer);
    this.showModalCreateActivo = false;
    this.selectedFiles = [];
  }

  onFileSelected(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      const selected = Array.from(event.target.files) as File[];
      
      // Validar máximo 5 fotos (incluyendo las ya existentes)
      const totalFotos = this.fotosActivo().length + selected.length;
      if (totalFotos > 5) {
        alert('Un producto solo puede tener un máximo de 5 fotos. Por favor, selecciona menos archivos.');
        event.target.value = ''; // Limpiar el input
        this.selectedFiles = [];
        return;
      }

      this.selectedFiles = selected;
      console.log(`[DEBUG] ${this.selectedFiles.length} archivos seleccionados`);
    }
  }

  verDetalleActivo(item: any) {
    this.selectedActivo = item;
    this.fotosActivo.set([]);
    this.assignmentActivo.set(null);
    this.showModalDetalle = true;
    
    console.log(`[DEBUG] Viendo detalle de: ${item.idActivo}`);

    // Cargar fotos del activo
    this.catalogoService.getAll(`fotos/activo/${item.idActivo}`).subscribe({
      next: (fotos) => { this.fotosActivo.set(fotos.filter(f => !this.fotosAEliminar.includes(f.idFoto!))); },
      error: (err) => console.error('[DEBUG] Error al cargar fotos:', err)
    });

    // Cargar asignación del activo
    this.catalogoService.getAll(`asignaciones/activo/${item.idActivo}`).subscribe({
      next: (asigs) => {
        console.log(`[DEBUG] Asignaciones recibidas para ${item.idActivo}:`, JSON.stringify(asigs));
        if (asigs && asigs.length > 0) {
          this.assignmentActivo.set(asigs[0]);
        } else {
          this.assignmentActivo.set(null);
        }
      },
      error: (err) => {
        console.error('[DEBUG] Error al cargar asignación:', err);
        this.assignmentActivo.set(null);
      }
    });

    // Opcional: recargar catálogos en segundo plano para asegurar nombres actualizados
    this.loadCatalogosParaActivos().subscribe(data => this.updateCatalogLists(data));
  }

  getAreaName(id: string | undefined): string {
    const a = this.listAreas().find(area => area.idArea === id);
    return a?.nombre ? a.nombre : (id ? `ID: ${id}` : 'N/A');
  }

  getResguardanteName(id: any): string {
    if (!id) return 'N/A';
    const sId = String(id);
    const r = this.listResguardantes().find(res => String(res.idResguardante) === sId);
    return r ? `${r.nombres} ${r.apellidos}` : `ID: ${id}`;
  }

  getUserNameById(id: number | undefined): string {
    if (!id) return '—';
    const u = this.dataUsuarios().find(user => user.idUsuario === id);
    return u ? `${id} - ${u.nombre}${u.apellido ? ' ' + u.apellido : ''}` : `${id}`;
  }

  getMarcaName(id: string | undefined): string {
    const m = this.listMarcas().find(marca => marca.idMarca === id);
    return m?.nombre ? m.nombre : (id || 'N/A');
  }

  getProveedorName(id: string | undefined): string {
    const p = this.listProveedores().find(prov => prov.idProvedor === id);
    return p?.nombre ? p.nombre : (id || 'N/A');
  }

  getLineaName(id: string | undefined): string {
    const l = this.listLineas().find(linea => linea.idLinea === id);
    return l?.nombre ? l.nombre : (id || 'N/A');
  }

  getPresentacionName(id: string | undefined): string {
    const pr = this.listPresentacion().find(pres => pres.idPresentacion === id);
    return pr?.nombre ? pr.nombre : (id || 'N/A');
  }

  closeDetalle() {
    this.showModalDetalle = false;
    this.selectedActivo = null;
    this.fotosActivo.set([]);
    this.assignmentActivo.set(null);
  }

  openImagePreview(url: string) {
    this.previewImageUrl = url;
    this.showModalImagePreview = true;
  }

  closeImagePreview() {
    this.showModalImagePreview = false;
    this.previewImageUrl = '';
  }

  deleteFoto(idFoto: number) {
    if (this.miRol === 2) {
      this.fotosActivo.update(fotos => fotos.filter(f => f.idFoto !== idFoto));
      this.fotosAEliminar.push(idFoto);
      return;
    }
    this.catalogoService.delete('fotos', String(idFoto)).subscribe({
      next: () => {
        this.fotosActivo.update(fotos => fotos.filter(f => f.idFoto !== idFoto));
      },
      error: (err: any) => console.error('Error al eliminar la foto:', err)
    });
  }

  deleteEditFoto(idFoto: number) {
    this.fotosActivo.update(fotos => fotos.filter(f => f.idFoto !== idFoto));
    this.fotosAEliminar.push(idFoto);
  }

  // --- EDITAR ACTIVO (MODAL) ---
  openEditActivo(item: any) {
    console.log('[DEBUG] Abriendo edición para:', item.idActivo);
    this.editActivoForm = { ...item };
    this.editActivoForm.fkArea = '';
    this.editActivoForm.fkResguardante = null;
    this.selectedFiles = [];
    this.fotosActivo.set([]);
    this.assignmentActivo.set(null);
    this.showModalEditActivo = true;

    // Diferir carga para que el modal se renderice inmediatamente
    setTimeout(() => {
      forkJoin({
        fotos: this.catalogoService.getAll(`fotos/activo/${item.idActivo}`).pipe(catchError(() => of([]))),
        asignaciones: this.catalogoService.getAll(`asignaciones/activo/${item.idActivo}`).pipe(catchError(() => of([]))),
        catalogos: this.loadCatalogosParaActivos()
      }).subscribe({
        next: (result) => {
          this.fotosActivo.set(result.fotos.filter(f => !this.fotosAEliminar.includes(f.idFoto!)));
          this.updateCatalogLists(result.catalogos);

          if (result.asignaciones && result.asignaciones.length > 0) {
            const asig = result.asignaciones[0];
            this.assignmentActivo.set(asig);
            if (!this.editActivoForm.fkArea)
              this.editActivoForm.fkArea = asig.fkArea;
            if (!this.editActivoForm.fkResguardante)
              this.editActivoForm.fkResguardante = asig.fkResguardante;
          }
        },
        error: (err) => console.error('[DEBUG] Error cargando datos de edición:', err)
      });
    });
  }

  closeEditActivo() {
    this.showModalEditActivo = false;
    this.editActivoForm = {};
    this.selectedFiles = [];
    this.fotosAEliminar = [];
    this.fotosActivo.set([]);
  }

  saveEditActivo() {
    const a = this.editActivoForm;
    if (!a.fkArea) a.fkArea = '1';
    if (!a.fkResguardante) a.fkResguardante = 1;
    if (!a.idActivo || !a.nombre || !a.descripcion || a.precio == null ||
        !a.garantia || !a.nSerie || !a.fkProvedor || !a.fkMarca || !a.fkLinea || !a.fkPresentacion) {
      this.mostrarNotificacion('Completa todos los campos requeridos *', true);
      return;
    }
    if (a.precio < 0) {
      this.mostrarNotificacion('El precio no puede ser negativo.', true);
      return;
    }
    if (a.existencias != null && a.existencias < 0) {
      this.mostrarNotificacion('Las existencias no pueden ser negativas.', true);
      return;
    }
    
    if (this.miRol === 2) {
      const id = this.editActivoForm.idActivo as string;
      // Subir fotos primero si hay, luego enviar el cambio con los filenames y fotos eliminadas
      this.uploadFilesForEditor((filenames) => {
        const payload = { ...this.editActivoForm, _fotosFilenames: filenames, _fotosEliminadas: this.fotosAEliminar };
        const cambio: CambioPendiente = {
          tipoCambio: 'ACTUALIZAR',
          entidad: 'activos',
          idEntidad: id,
          datosJson: JSON.stringify(payload)
        };
        
        this.cambiosService.enviarCambio(cambio).subscribe({
          next: () => {
            this.mostrarNotificacion('Solicitud enviada a revision. Un administrador la evaluara.');
            this.closeEditActivo();
            this.loadDataForTab();
          },
          error: () => this.mostrarNotificacion('Error al enviar solicitud.', true)
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
        const uploadNextFile = (index: number) => {
          if (index < this.selectedFiles.length) {
            this.catalogoService.uploadFile(this.selectedFiles[index]).subscribe({
              next: (res: any) => {
                const fotoData = {
                  fkActivo: id,
                  foto: res.filename,
                  creadoPor: this.miId,
                  ultimoActualizadoPor: this.miId,
                  estado: "1"
                };
                this.catalogoService.create('fotos', fotoData).subscribe(() => uploadNextFile(index + 1));
              },
              error: () => uploadNextFile(index + 1)
            });
          } else {
            this.processAssignment(id, fkArea, fkResguardante);
          }
        };

        if (this.selectedFiles.length > 0) {
          uploadNextFile(0);
        } else {
          this.processAssignment(id, fkArea, fkResguardante);
        }
        }; // end startUpload
        if (this.fotosAEliminar.length > 0) {
          deleteNext(0);
        } else {
          startUpload();
        }
      },
      error: (err) => {
        console.error('Error al editar activo:', err);
        this.isSaving = false;
      }
    });
  }

  private processAssignment(id: string, fkArea: string, fkResguardante: number | string) {
    if (fkArea || fkResguardante) {
      if (this.assignmentActivo()) {
        const updatedAsig = {
          ...this.assignmentActivo(),
          fkArea: fkArea || null,
          fkResguardante: fkResguardante || null,
          ultimoActualizadoPor: this.miId
        };
        this.catalogoService.update('asignaciones', String(this.assignmentActivo()?.idAsignaciones), updatedAsig).subscribe({
          next: () => { console.log('[DEBUG] Asignación actualizada correctamente'); this.finalizeEditActivo(); },
          error: (err) => { console.error('[DEBUG] Error actualizando asignación:', err); this.finalizeEditActivo(); }
        });
      } else {
        const newAsig = {
          fkActivo: id,
          fkArea: fkArea || null,
          fkResguardante: fkResguardante || null,
          creadoPor: this.miId,
          ultimoActualizadoPor: this.miId,
          estado: "1"
        };
        this.catalogoService.create('asignaciones', newAsig).subscribe({
          next: () => this.finalizeEditActivo(),
          error: () => this.finalizeEditActivo()
        });
      }
    } else {
      this.finalizeEditActivo();
    }
  }

  finalizeEditActivo() {
    this.isSaving = false;
    this.closeEditActivo();
    this.loadDataForTab();
    this.mostrarNotificacion('Activo actualizado correctamente');
  }

  saveNuevoActivo() {
    const a = this.newActivo;
    if (!a.fkArea) a.fkArea = '1';
    if (!a.fkResguardante) (a as any).fkResguardante = 1;
    if (!a.nombre || !a.descripcion || a.precio == null ||
        !a.garantia || !a.nSerie || !a.fkProvedor || !a.fkMarca || !a.fkLinea || !a.fkPresentacion) {
      this.mostrarNotificacion('Completa todos los campos requeridos *', true);
      return;
    }
    if (a.precio < 0) {
      this.mostrarNotificacion('El precio no puede ser negativo.', true);
      return;
    }
    if (a.existencias != null && a.existencias < 1) {
      this.mostrarNotificacion('Las existencias deben ser mínimo 1.', true);
      return;
    }
    
    if (this.miRol === 2) {
      const id = this.editActivoForm.idActivo as string;
      this.uploadFilesForEditor((filenames) => {
        const payload = { ...this.editActivoForm, _fotosFilenames: filenames, _fotosEliminadas: this.fotosAEliminar };
        const cambio: CambioPendiente = {
          tipoCambio: 'ACTUALIZAR',
          entidad: 'activos',
          idEntidad: id,
          datosJson: JSON.stringify(payload)
        };
        
        this.cambiosService.enviarCambio(cambio).subscribe({
          next: () => {
            this.mostrarNotificacion('Solicitud enviada a revision. Un administrador la evaluara.');
            this.closeCreateActivo();
            this.loadDataForTab();
          },
          error: () => this.mostrarNotificacion('Error al enviar solicitud.', true)
        });
      });
      return;
    }

    this.isSaving = true;

    this.newActivo.creadoPor = this.miId || undefined;
    this.newActivo.ultimoActualizadoPor = this.miId || undefined;
    this.newActivo.estado = "1";

    // Verificar duplicado antes de guardar
    this.catalogoService.getById('activos', this.newActivo.idActivo!).subscribe({
      next: (exists) => {
        if (exists) {
          alert('El No. Activo ya existe en el sistema. Por favor, usa uno diferente.');
          this.isSaving = false;
        } else {
          this.executeSaveActivo();
        }
      },
      error: () => {
        // Si da error (ej: 404), procedemos a guardar porque significa que no existe
        this.executeSaveActivo();
      }
    });
  }

  private executeSaveActivo() {
    this.catalogoService.create('activos', this.newActivo).subscribe({
      next: (activoCreado) => {
        const idActivo = (activoCreado.idActivo || this.newActivo.idActivo) as string;
        const fkArea = this.newActivo.fkArea as string;
        const fkResguardante = this.newActivo.fkResguardante as number | string;

        const uploadNextFile = (index: number) => {
          if (index < this.selectedFiles.length) {
            this.catalogoService.uploadFile(this.selectedFiles[index]).subscribe({
              next: (res: any) => {
                const fotoData = {
                  fkActivo: idActivo,
                  foto: res.filename,
                  creadoPor: this.miId,
                  ultimoActualizadoPor: this.miId,
                  estado: "1"
                };
                this.catalogoService.create('fotos', fotoData).subscribe(() => uploadNextFile(index + 1));
              },
              error: () => uploadNextFile(index + 1)
            });
          } else {
            this.crearAsignacionFinal(idActivo, fkArea, fkResguardante);
          }
        };

        if (this.selectedFiles.length > 0) {
          uploadNextFile(0);
        } else {
          this.crearAsignacionFinal(idActivo, fkArea, fkResguardante);
        }
      },
      error: (err) => {
        console.error('Error al crear activo:', err);
        this.isSaving = false;
      }
    });
  }

  private crearAsignacionFinal(idActivo: string, fkArea: string, fkResguardante: number | string) {
    if (fkArea || fkResguardante) {
      const asignacionData = {
        fkActivo: idActivo,
        fkArea: fkArea || null,
        fkResguardante: fkResguardante || null,
        creadoPor: this.miId,
        ultimoActualizadoPor: this.miId,
        estado: "1"
      };
      this.catalogoService.create('asignaciones', asignacionData).subscribe({
        next: () => this.finalizeSave(),
        error: () => this.finalizeSave()
      });
    } else {
      this.finalizeSave();
    }
  }

  private finalizeSave() {
    this.isSaving = false;
    this.closeCreateActivo();
    this.loadDataForTab();
    this.mostrarNotificacion('Activo guardado correctamente');
  }

  // --- MÉTODOS ESTADO / ROL ---
  cambiarEstadoUsuario(idUsuario: number, nuevoEstado: string) {
    if (idUsuario === this.miId) return;
    this.usuariosService.cambiarEstado(idUsuario, nuevoEstado).subscribe({
      next: () => {
        this.loadDataForTab();
        this.mostrarNotificacion(nuevoEstado === '3' ? 'Usuario eliminado' : 'Estado actualizado');
      },
      error: () => this.mostrarNotificacion('Error al cambiar estado.', true)
    });
  }

  cambiarRolUsuario(idUsuario: number, event: Event) {
    if (idUsuario === this.miId) return;
    const select = event.target as HTMLSelectElement;
    this.usuariosService.cambiarRol(idUsuario, parseInt(select.value, 10)).subscribe({
      next: () => this.loadDataForTab(),
      error: console.error
    });
  }

  cambiarEstadoGenerico(endpoint: string, id: string, nuevoEstado: string) {
    if (endpoint === 'activos' && this.miRol === 2) {
      const activo = this.dataActivos().find(a => a.idActivo === id);
      if (!activo) return;
      const payload = { ...activo, estado: nuevoEstado };
      const cambio: CambioPendiente = {
        tipoCambio: 'ACTUALIZAR',
        entidad: 'activos',
        idEntidad: id,
        datosJson: JSON.stringify(payload)
      };
      this.cambiosService.enviarCambio(cambio).subscribe({
        next: () => {
          this.mostrarNotificacion('Solicitud enviada a revision.');
          this.loadDataForTab();
        },
        error: () => this.mostrarNotificacion('Error al enviar solicitud.', true)
      });
      return;
    }
    this.catalogoService.cambiarEstado(endpoint, id, nuevoEstado).subscribe({
      next: () => {
        this.loadDataForTab();
        this.mostrarNotificacion(nuevoEstado === '3' ? 'Activo eliminado' : 'Estado actualizado');
      },
      error: console.error
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  /**
   * Sube los archivos seleccionados (selectedFiles) al servidor y devuelve
   * los nombres de archivo via callback. Si no hay archivos, callback con [].
   */
  private uploadFilesForEditor(callback: (filenames: string[]) => void): void {
    if (this.selectedFiles.length === 0) {
      callback([]);
      return;
    }

    const filenames: string[] = [];
    const uploadNext = (index: number) => {
      if (index < this.selectedFiles.length) {
        this.catalogoService.uploadFile(this.selectedFiles[index]).subscribe({
          next: (res: any) => {
            filenames.push(res.filename);
            uploadNext(index + 1);
          },
          error: () => uploadNext(index + 1) // Continuar aunque falle un archivo
        });
      } else {
        callback(filenames);
      }
    };
    uploadNext(0);
  }

  // --- CAMBIOS PENDIENTES (inline) ---
  verDetalleCambio(cambio: CambioPendiente): void {
    this.cambioSeleccionado = cambio;
    this.datosJsonParseado = JSON.parse(cambio.datosJson);
    this.comentarioRechazo = '';
    this.mostrandoTextarea = false;
    this.fotosActualesCambio.set([]);
    this.activoOriginal.set(null);
    if (cambio.tipoCambio !== 'CREAR' && cambio.idEntidad) {
      this.catalogoService.getAll(`fotos/activo/${cambio.idEntidad}`).subscribe({
        next: (fotos) => { this.fotosActualesCambio.set(fotos); },
        error: () => { this.fotosActualesCambio.set([]); }
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
            next: (result) => {
              const activo = result.activo;
              if (activo) {
                if (result.asignaciones && result.asignaciones.length > 0) {
                  (activo as any).fkArea = result.asignaciones[0].fkArea;
                  (activo as any).fkResguardante = result.asignaciones[0].fkResguardante;
                }
                this.activoOriginal.set(activo);
              }
            },
            error: () => { this.activoOriginal.set(null); }
          });
        }
      }
    }
  }

  campoCambiado(valorNuevo: any, campo: string): any {
    if (!this.activoOriginal()) return {};
    const original = this.activoOriginal()[campo];
    const nuevo = valorNuevo;
    if (nuevo === undefined) return {};
    if (original == null && (nuevo == null || nuevo === '')) return {};
    if (original != nuevo) {
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
    for (const [campo, label] of Object.entries(labels)) {
      const origVal = this.activoOriginal()[campo];
      const newVal = this.datosJsonParseado[campo];
      if (newVal === undefined) continue;
      if (origVal != newVal && !(origVal == null && (newVal == null || newVal === ''))) {
        cambiados.push(label);
      }
    }
    if (cambiados.length === 0) return '';
    return 'Se cambió: ' + cambiados.join(', ') + '.';
  }

  cerrarModalCambio(): void {
    this.cambioSeleccionado = null;
    this.datosJsonParseado = null;
    this.comentarioRechazo = '';
    this.mostrandoTextarea = false;
    this.fotosActualesCambio.set([]);
    this.activoOriginal.set(null);
  }

  aprobarCambio(): void {
    if (!this.cambioSeleccionado?.idCambio) return;
    this.cambiosService.aprobarCambio(this.cambioSeleccionado.idCambio).subscribe({
      next: () => {
        this.cerrarModalCambio();
        this.loadDataForTab();
        this.cargarContadorPendientes();
        this.mostrarNotificacion('Solicitud aprobada');
      },
      error: () => this.mostrarNotificacion('Error al aprobar solicitud', true)
    });
  }

  iniciarRechazo(): void {
    if (!this.mostrandoTextarea) {
      this.mostrandoTextarea = true;
    } else {
      this.rechazarCambio();
    }
  }

  rechazarCambio(): void {
    if (!this.cambioSeleccionado?.idCambio) return;
    this.cambiosService.rechazarCambio(this.cambioSeleccionado.idCambio, this.comentarioRechazo).subscribe({
      next: () => {
        this.cerrarModalCambio();
        this.loadDataForTab();
        this.cargarContadorPendientes();
        this.mostrarNotificacion('Solicitud rechazada');
      },
      error: () => this.mostrarNotificacion('Error al rechazar solicitud', true)
    });
  }

  getDatosResumen(datosJson: string): string {
    try {
      const obj = JSON.parse(datosJson);
      return obj.nombre ? obj.nombre : 'Sin nombre';
    } catch {
      return 'Datos inválidos';
    }
  }
}

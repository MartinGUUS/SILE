import { Component, inject, signal, OnInit, HostListener, ViewChild, ViewChildren, ElementRef, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { UsuariosService } from '../../services/usuarios.service';
import { CatalogoService } from '../../services/catalogo.service';
import { UploadService } from '../../services/upload.service';

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

type TabType = 'activos' | 'usuarios' | 'areas' | 'presentacion' | 'lineas' | 'marcas' | 'provedores' | 'resguardantes';

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

  @ViewChild('idActivoInput') idActivoInput!: ElementRef;
  @ViewChildren('editInput') editInputs!: QueryList<ElementRef>;

  // Modal Create Activo
  showModalCreateActivo = false;
  newActivo: Partial<Activo> = { estado: '1' };
  selectedFiles: File[] = [];
  isSaving = false;

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

  // Filtro estado catálogos (1=activos, 2=inactivos) - Por defecto en activos (1)
  filtroEstadoCatalogo = '1';

  // Modal Detalle
  showModalDetalle = false;
  selectedActivo: Activo | null = null;
  fotosActivo = signal<Foto[]>([]);

  // Modal Vista Previa Imagen
  showModalImagePreview = false;
  previewImageUrl = '';

  ngOnInit() {
    this.miId = this.authService.getIdUsuario();
    this.miRol = this.authService.getFkRol();
    this.loadDataForTab();
    
    if (this.miRol === 1) {
      this.loadCatalogosParaActivos().subscribe(data => this.updateCatalogLists(data));
    }
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
    // Limpiar señales para evitar ver datos viejos de otras pestañas mientras carga la nueva
    this.dataUsuarios.set([]);
    this.dataActivos.set([]);
    this.dataCatalogo.set([]);
    
    this.activeTab.set(tab);
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
          next: d => this.dataUsuarios.set(d),
          error: console.error
        });
      }
    } else if (tab === 'activos') {
      // Carga activos según el filtro de estado seleccionado
      this.catalogoService.getAll('activos', this.filtroEstadoActivos).subscribe({
        next: d => this.dataActivos.set(d),
        error: console.error
      });
    } else if (this.isCatalogoTab(tab)) {
      console.log(`[CATALOGO] Cargando: ${tab} | Filtro Estado: ${this.filtroEstadoCatalogo}`);
      this.catalogoService.getAll(tab, this.filtroEstadoCatalogo).subscribe({
        next: d => {
          console.log(`[CATALOGO] ${tab} recibidos:`, d);
          this.dataCatalogo.set(d);
        },
        error: (err) => {
          console.error(`[CATALOGO] Error cargando ${tab}:`, err);
        }
      });
    }
  }

  onFiltroCatalogoChange() {
    this.loadDataForTab();
  }

  onFiltroActivosChange() {
    this.loadDataForTab();
  }

  eliminarUsuario(id: number) {
    if (!confirm('¿Eliminar este usuario? Esta acción es permanente (borrado lógico).')) return;
    this.usuariosService.cambiarEstado(id, '3').subscribe({
      next: () => this.loadDataForTab(),
      error: console.error
    });
  }

  eliminarRegistro(endpoint: string, id: string) {
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
  openCreateActivo() {
    this.newActivo = {
      idActivo: '', nombre: '', descripcion: '', precio: 0, existencias: 1, 
      garantia: '', nSerie: '', fkMarca: '', fkProvedor: '', fkLinea: '', fkPresentacion: '',
      fkArea: '', fkResguardante: ''
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
      next: (fotos) => { this.fotosActivo.set(fotos); },
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

  getResguardanteName(id: number | string): string {
    const r = this.listResguardantes().find(res => res.idResguardante == id);
    return r ? `${r.nombres} ${r.apellidos}` : `ID: ${id}`;
  }

  getAreaName(id: string | undefined): string {
    const a = this.listAreas().find(area => area.idArea === id);
    return a?.nombre ? a.nombre : `ID: ${id}`;
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
    // Eliminación inmediata sin confirmación
    this.catalogoService.delete('fotos', String(idFoto)).subscribe({
      next: () => {
        this.fotosActivo.update(fotos => fotos.filter(f => f.idFoto !== idFoto));
      },
      error: (err: any) => console.error('Error al eliminar la foto:', err)
    });
  }

  // --- EDITAR ACTIVO (MODAL) ---
  openEditActivo(item: any) {
    console.log('[DEBUG] Abriendo edición para:', item.idActivo);
    this.editActivoForm = { ...item };
    this.selectedFiles = [];
    this.fotosActivo.set([]); // Cargar fotos actuales para el modal de edición
    this.assignmentActivo.set(null);
    this.showModalEditActivo = true;

    this.showModalEditActivo = true;

    // Buscar asignación actual
    this.catalogoService.getAll(`asignaciones/activo/${item.idActivo}`).subscribe({
      next: (asigs) => {
        console.log(`[DEBUG] Asignación encontrada para editar ${item.idActivo}:`, JSON.stringify(asigs));
        if (asigs && asigs.length > 0) {
          const asig = asigs[0];
          this.assignmentActivo.set(asig);
          // Actualización de referencia para forzar detección de cambios en Angular
          this.editActivoForm = {
            ...this.editActivoForm,
            fkArea: asig.fkArea,
            fkResguardante: asig.fkResguardante
          };
        }
      },
      error: (err) => console.error('[DEBUG] Error buscando asignación para editar:', err)
    });

    // Opcional: recargar catálogos en segundo plano
    this.loadCatalogosParaActivos().subscribe(data => this.updateCatalogLists(data));
  }

  closeEditActivo() {
    this.showModalEditActivo = false;
    this.editActivoForm = {};
    this.selectedFiles = [];
    this.fotosActivo.set([]);
  }

  saveEditActivo() {
    if (!this.editActivoForm.nombre) return;
    this.isSaving = true;
    const id = this.editActivoForm.idActivo as string;
    const fkArea = this.editActivoForm.fkArea as string;
    const fkResguardante = this.editActivoForm.fkResguardante as number | string;

    this.catalogoService.update('activos', id, this.editActivoForm).subscribe({
      next: () => {
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
      },
      error: (err) => {
        console.error('Error al editar activo:', err);
        this.isSaving = false;
      }
    });
  }

  private processAssignment(id: string, fkArea: string, fkResguardante: number | string) {
    if (fkArea && fkResguardante) {
      if (this.assignmentActivo()) {
        const updatedAsig = {
          ...this.assignmentActivo(),
          fkArea: fkArea,
          fkResguardante: fkResguardante,
          ultimoActualizadoPor: this.miId
        };
        this.catalogoService.update('asignaciones', String(this.assignmentActivo()?.idAsignacion), updatedAsig).subscribe({
          next: () => this.finalizeEditActivo(),
          error: () => this.finalizeEditActivo()
        });
      } else {
        const newAsig = {
          fkActivo: id,
          fkArea: fkArea,
          fkResguardante: fkResguardante,
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
  }

  saveNuevoActivo() {
    if (!this.newActivo.idActivo || !this.newActivo.nombre) return;
    this.isSaving = true;

    this.newActivo.creadoPor = this.miId || undefined;
    this.newActivo.ultimoActualizadoPor = this.miId || undefined;
    this.newActivo.estado = "1";

    // Verificar duplicado antes de guardar
    this.catalogoService.getById('activos', this.newActivo.idActivo).subscribe({
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
    if (fkArea && fkResguardante) {
      const asignacionData = {
        fkActivo: idActivo,
        fkArea: fkArea,
        fkResguardante: fkResguardante,
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
  }

  // --- MÉTODOS ESTADO / ROL ---
  cambiarEstadoUsuario(idUsuario: number, nuevoEstado: string) {
    if (idUsuario === this.miId) return;
    this.usuariosService.cambiarEstado(idUsuario, nuevoEstado).subscribe({
      next: () => this.loadDataForTab(),
      error: console.error
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
    this.catalogoService.cambiarEstado(endpoint, id, nuevoEstado).subscribe({
      next: () => this.loadDataForTab(),
      error: console.error
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

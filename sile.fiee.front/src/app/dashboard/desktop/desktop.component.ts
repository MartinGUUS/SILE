import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UsuariosService } from '../../services/usuarios.service';
import { CatalogoService } from '../../services/catalogo.service';

type TabType = 'activos' | 'usuarios' | 'areas' | 'presentacion' | 'lineas' | 'marcas' | 'provedores';

@Component({
  selector: 'app-desktop-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="desktop-layout">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <h2>SILE</h2>
          <span class="badge">Desktop</span>
        </div>
        
        <nav class="sidebar-nav">
          <ul class="nav-list">
            <li class="nav-item">
              <a href="javascript:void(0)" class="nav-link" [class.active]="activeTab() === 'activos'" (click)="setTab('activos')">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                Visualizar Objetos
              </a>
            </li>
            <li class="nav-item">
              <a href="javascript:void(0)" class="nav-link" [class.active]="activeTab() === 'marcas'" (click)="setTab('marcas')">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 17 22 12"></polyline></svg>
                Marcas
              </a>
            </li>
            <li class="nav-item">
              <a href="javascript:void(0)" class="nav-link" [class.active]="activeTab() === 'provedores'" (click)="setTab('provedores')">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
                Proveedores
              </a>
            </li>
            <li class="nav-item">
              <a href="javascript:void(0)" class="nav-link" [class.active]="activeTab() === 'areas'" (click)="setTab('areas')">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                Áreas
              </a>
            </li>
            <li class="nav-item">
              <a href="javascript:void(0)" class="nav-link" [class.active]="activeTab() === 'presentacion'" (click)="setTab('presentacion')">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                Presentación
              </a>
            </li>
            <li class="nav-item">
              <a href="javascript:void(0)" class="nav-link" [class.active]="activeTab() === 'lineas'" (click)="setTab('lineas')">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                Líneas
              </a>
            </li>
            <!-- Solo visible para rol 1 (Admin) -->
            <li class="nav-item" *ngIf="miRol === 1">
              <a href="javascript:void(0)" class="nav-link" [class.active]="activeTab() === 'usuarios'" (click)="setTab('usuarios')">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                Usuarios
              </a>
            </li>
          </ul>
        </nav>

        <div class="sidebar-footer">
          <button class="logout-btn" (click)="logout()">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <header class="topbar">
          <div class="topbar-search">
            <input type="text" placeholder="Buscar..." class="search-input">
          </div>
          <div class="user-profile">
            <div class="avatar"></div>
            <span>{{ miRol === 1 ? 'Administrador' : 'Usuario' }}</span>
          </div>
        </header>

        <div class="content-area">
          
          <!-- Vista de ACTIVOS -->
          <div *ngIf="activeTab() === 'activos'">
            <div class="page-header">
              <h1>Inventario de Objetos</h1>
              <button class="primary-btn">Nuevo Activo</button>
            </div>

            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>No. Activo</th>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th>Estado</th>
                    <th>Precio</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let item of dataActivos()">
                    <td>{{ item.idActivo }}</td>
                    <td>
                      <ng-container *ngIf="editingId !== item.idActivo">{{ item.nombre }}</ng-container>
                      <ng-container *ngIf="editingId === item.idActivo">
                        <input [(ngModel)]="editForm.nombre" class="edit-input">
                      </ng-container>
                    </td>
                    <td>
                      <ng-container *ngIf="editingId !== item.idActivo">{{ item.descripcion }}</ng-container>
                      <ng-container *ngIf="editingId === item.idActivo">
                        <input [(ngModel)]="editForm.descripcion" class="edit-input">
                      </ng-container>
                    </td>
                    <td>
                      <span class="status-badge" [class.active]="item.estado === '1'" [class.inactive]="item.estado === '2'">
                        {{ item.estado === '1' ? 'Activo' : 'Inactivo' }}
                      </span>
                    </td>
                    <td>
                      <ng-container *ngIf="editingId !== item.idActivo">\${{ item.precio }}</ng-container>
                      <ng-container *ngIf="editingId === item.idActivo">
                        <input type="number" [(ngModel)]="editForm.precio" class="edit-input" style="width: 80px">
                      </ng-container>
                    </td>
                    <td>
                      <ng-container *ngIf="editingId !== item.idActivo">
                        <button class="action-btn outline-btn" (click)="startEdit(item.idActivo, item)">Editar</button>
                        <button *ngIf="item.estado === '2'" class="action-btn success" (click)="cambiarEstadoGenerico('activos', item.idActivo, '1')">Activar</button>
                        <button *ngIf="item.estado === '1'" class="action-btn danger" (click)="cambiarEstadoGenerico('activos', item.idActivo, '2')">Desactivar</button>
                      </ng-container>
                      <ng-container *ngIf="editingId === item.idActivo">
                        <button class="action-btn success" (click)="saveEditCatalogo('activos', item.idActivo)">Guardar</button>
                        <button class="action-btn danger" (click)="cancelEdit()">Cancelar</button>
                      </ng-container>
                    </td>
                  </tr>
                  <tr *ngIf="dataActivos().length === 0">
                    <td colspan="6" style="text-align: center; color: var(--gray-500)">Sin registros en activos.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Vista de USUARIOS -->
          <div *ngIf="activeTab() === 'usuarios' && miRol === 1">
            <div class="page-header">
              <h1>Administración de Usuarios</h1>
            </div>

            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Usuario</th>
                    <th>Correo</th>
                    <th>Rol</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let user of dataUsuarios()" [class.op-50]="user.idUsuario === miId">
                    <td>{{ user.idUsuario }}</td>
                    <td>
                      <ng-container *ngIf="editingId !== user.idUsuario">
                        {{ user.nombre }} {{ user.apellido }} <span *ngIf="user.idUsuario === miId" class="badge" style="margin-left: 0.5rem">Tú</span>
                      </ng-container>
                      <ng-container *ngIf="editingId === user.idUsuario">
                        <input [(ngModel)]="editForm.nombre" class="edit-input" placeholder="Nombre" style="width: 100px;">
                        <input [(ngModel)]="editForm.apellido" class="edit-input" placeholder="Apellido" style="width: 100px;">
                      </ng-container>
                    </td>
                    <td>{{ user.correo }}</td>
                    <td>
                      <select 
                        class="role-select" 
                        [value]="user.fkRol || 3" 
                        (change)="cambiarRolUsuario(user.idUsuario, $event)"
                        [disabled]="user.idUsuario === miId || editingId === user.idUsuario">
                        <option value="1">Administrador (1)</option>
                        <option value="2">Editor (2)</option>
                        <option value="3">Espectador (3)</option>
                      </select>
                    </td>
                    <td>
                      <span class="status-badge" [class.active]="user.estado === '1'" [class.inactive]="user.estado === '2'">
                        {{ user.estado === '1' ? 'Activo' : 'Inactivo' }}
                      </span>
                    </td>
                    <td>
                      <ng-container *ngIf="editingId !== user.idUsuario">
                        <button class="action-btn outline-btn" (click)="startEdit(user.idUsuario, user)">Editar</button>
                        <button 
                          *ngIf="user.estado === '2'" 
                          class="action-btn success"
                          [disabled]="user.idUsuario === miId"
                          (click)="cambiarEstadoUsuario(user.idUsuario, '1')">
                          Activar
                        </button>
                        <button 
                          *ngIf="user.estado === '1'" 
                          class="action-btn danger"
                          [disabled]="user.idUsuario === miId"
                          (click)="cambiarEstadoUsuario(user.idUsuario, '2')">
                          Desactivar
                        </button>
                      </ng-container>
                      <ng-container *ngIf="editingId === user.idUsuario">
                        <button class="action-btn success" (click)="saveEditUsuario(user.idUsuario)">Guardar</button>
                        <button class="action-btn danger" (click)="cancelEdit()">Cancelar</button>
                      </ng-container>
                    </td>
                  </tr>
                  <tr *ngIf="dataUsuarios().length === 0">
                    <td colspan="6" style="text-align: center; color: var(--gray-500)">Cargando usuarios... o sin usuarios.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Vista COMPARTIDA para Catalogos Secundarios -->
          <div *ngIf="isCatalogoTab(activeTab())">
            <div class="page-header">
              <h1 style="text-transform: capitalize;">Catálogo: {{ activeTab() }}</h1>
              <button class="primary-btn">Nuevo Registro</button>
            </div>

            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th *ngIf="activeTab() === 'areas'">Descripción</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let item of dataCatalogo()">
                    <td>{{ getDictId(item) }}</td>
                    <td>
                      <ng-container *ngIf="editingId !== getDictId(item)">{{ item.nombre }}</ng-container>
                      <ng-container *ngIf="editingId === getDictId(item)">
                        <input [(ngModel)]="editForm.nombre" class="edit-input" placeholder="Nombre de {{ activeTab() }}">
                      </ng-container>
                    </td>
                    <td *ngIf="activeTab() === 'areas'">
                      <ng-container *ngIf="editingId !== getDictId(item)">{{ item.descripcion }}</ng-container>
                      <ng-container *ngIf="editingId === getDictId(item)">
                        <input [(ngModel)]="editForm.descripcion" class="edit-input" placeholder="Descripción">
                      </ng-container>
                    </td>
                    <td>
                      <span class="status-badge" [class.active]="item.estado === '1'" [class.inactive]="item.estado === '2'">
                        {{ item.estado === '1' ? 'Activo' : 'Inactivo' }}
                      </span>
                    </td>
                    <td>
                      <ng-container *ngIf="editingId !== getDictId(item)">
                        <button class="action-btn outline-btn" (click)="startEdit(getDictId(item), item)">Editar</button>
                        <button *ngIf="item.estado === '2'" class="action-btn success" (click)="cambiarEstadoGenerico(activeTab(), getDictId(item), '1')">Activar</button>
                        <button *ngIf="item.estado === '1'" class="action-btn danger" (click)="cambiarEstadoGenerico(activeTab(), getDictId(item), '2')">Desactivar</button>
                      </ng-container>
                      <ng-container *ngIf="editingId === getDictId(item)">
                        <button class="action-btn success" (click)="saveEditCatalogo(activeTab(), getDictId(item))">Guardar</button>
                        <button class="action-btn danger" (click)="cancelEdit()">Cancelar</button>
                      </ng-container>
                    </td>
                  </tr>
                  <tr *ngIf="dataCatalogo().length === 0">
                    <td [attr.colspan]="activeTab() === 'areas' ? 5 : 4" style="text-align: center; color: var(--gray-500)">Vacío. Agrega registros.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  `,
  styles: `
    .desktop-layout { display: flex; height: 100vh; background-color: var(--bg-color); }
    .sidebar { width: 280px; background-color: #fff; border-right: 1px solid var(--border-color); display: flex; flex-direction: column; overflow-y: auto; }
    .sidebar-header { padding: 2rem 1.5rem; display: flex; align-items: center; gap: 0.5rem; border-bottom: 1px solid var(--border-color); }
    .sidebar-header h2 { margin: 0; font-size: 1.5rem; color: var(--gray-900); font-weight: 700; letter-spacing: -0.05em; }
    .badge { background-color: var(--gray-100); color: var(--gray-600); padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 500; }
    .sidebar-nav { flex: 1; padding: 1.5rem 1rem; }
    .nav-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.5rem; }
    .nav-link { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; color: var(--gray-600); text-decoration: none; border-radius: 8px; font-weight: 500; transition: all 0.2s; cursor: pointer; }
    .nav-link:hover { background-color: var(--gray-50); color: var(--gray-900); }
    .nav-link.active { background-color: var(--gray-900); color: #fff; }
    .sidebar-footer { padding: 1.5rem; border-top: 1px solid var(--border-color); }
    .logout-btn { display: flex; align-items: center; gap: 0.75rem; width: 100%; padding: 0.75rem; background: none; border: none; color: var(--gray-600); font-weight: 500; cursor: pointer; border-radius: 8px; transition: all 0.2s; text-align: left; }
    .logout-btn:hover { background-color: var(--gray-50); color: var(--gray-900); }
    
    .main-content { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
    .topbar { height: 72px; background-color: #fff; border-bottom: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between; padding: 0 2rem; }
    .search-input { padding: 0.5rem 1rem; border: 1px solid var(--border-color); border-radius: 8px; width: 300px; outline: none; background-color: var(--gray-50); }
    .search-input:focus { border-color: var(--gray-400); }
    .user-profile { display: flex; align-items: center; gap: 0.75rem; font-weight: 500; color: var(--gray-800); }
    .avatar { width: 36px; height: 36px; background-color: var(--gray-200); border-radius: 50%; }
    
    .content-area { flex: 1; padding: 2.5rem; overflow-y: auto; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    .page-header h1 { margin: 0; font-size: 1.875rem; color: var(--gray-900); }
    
    .primary-btn { background-color: var(--gray-900); color: #fff; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 500; cursor: pointer; transition: background-color 0.2s; }
    .primary-btn:hover { background-color: var(--gray-800); }
    
    .table-container { background-color: #fff; border-radius: 12px; border: 1px solid var(--border-color); overflow: hidden; }
    .data-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.875rem; }
    .data-table th, .data-table td { padding: 1rem 1.5rem; border-bottom: 1px solid var(--border-color); }
    .data-table th { background-color: var(--gray-50); font-weight: 500; color: var(--gray-500); text-transform: uppercase; letter-spacing: 0.05em; }
    .data-table td { color: var(--gray-800); }
    .data-table tr:last-child td { border-bottom: none; }
    
    .status-badge { padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 500; }
    .status-badge.active { background-color: #ecfdf5; color: #059669; }
    .status-badge.inactive { background-color: #fef2f2; color: #dc2626; }
    
    .action-btn { font-size: 0.75rem; font-weight: 600; padding: 0.4rem 0.75rem; border-radius: 6px; cursor: pointer; border: none; transition: background 0.2s; margin-right: 0.5rem;}
    .action-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .action-btn.success { background-color: var(--gray-900); color: #fff; }
    .action-btn.success:not(:disabled):hover { background-color: var(--gray-800); }
    .action-btn.danger { background-color: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
    .action-btn.danger:not(:disabled):hover { background-color: #fee2e2; }
    .action-btn.outline-btn { background-color: #fff; border: 1px solid #cbd5e1; color: #334155; }
    .action-btn.outline-btn:hover { background-color: #f1f5f9; }

    .role-select { padding: 0.3rem; border-radius: 6px; border: 1px solid var(--border-color); background: var(--gray-50); color: var(--gray-800); font-size: 0.8rem; }
    .role-select:disabled { opacity: 0.6; cursor: not-allowed; }
    
    .edit-input { padding: 0.4rem 0.5rem; border: 1px solid var(--border-color); border-radius: 6px; font-size: 0.8rem; margin-right: 0.3rem; background: #fff; color: var(--gray-900); }
    .edit-input:focus { border-color: var(--gray-400); outline: none; }
    
    .op-50 { opacity: 0.7; background-color: #f8fafc; }
  `
})
export class DesktopDashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private usuariosService = inject(UsuariosService);
  private catalogoService = inject(CatalogoService);
  private router = inject(Router);

  activeTab = signal<TabType>('activos');
  
  // Data local
  dataUsuarios = signal<any[]>([]);
  dataActivos = signal<any[]>([]);
  dataCatalogo = signal<any[]>([]);

  // Estados de edición (no-signal porque se ligan bidireccionalmente con ngModel y falla el AST de Angular)
  editingId: string | number | null = null;
  editForm: any = {};

  miId: number | null = null;
  miRol: number | null = null;

  ngOnInit() {
    this.miId = this.authService.getIdUsuario();
    this.miRol = this.authService.getFkRol();
    this.loadDataForTab();
  }

  setTab(tab: TabType) {
    this.cancelEdit();
    this.activeTab.set(tab);
    this.loadDataForTab();
  }

  isCatalogoTab(tab: TabType): boolean {
    return ['areas', 'presentacion', 'lineas', 'marcas', 'provedores'].includes(tab);
  }

  getDictId(item: any): string {
    return item.idMarca || item.idLinea || item.idProvedor || item.idArea || item.idPresentacion || '';
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
      this.catalogoService.getAll('activos').subscribe({
        next: d => this.dataActivos.set(d),
        error: console.error
      });
    } else if (this.isCatalogoTab(tab)) {
      this.catalogoService.getAll(tab).subscribe({
        next: d => this.dataCatalogo.set(d),
        error: console.error
      });
    }
  }

  // --- MÉTODOS DE EDICIÓN ---
  startEdit(id: string | number, item: any) {
    this.editingId = id;
    this.editForm = { ...item }; 
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

  // --- MÉTODOS ESTADO / ROL ---
  cambiarEstadoUsuario(idUsuario: number, nuevoEstado: string) {
    if(idUsuario === this.miId) return;
    this.usuariosService.cambiarEstado(idUsuario, nuevoEstado).subscribe({
      next: () => this.loadDataForTab(),
      error: console.error
    });
  }

  cambiarRolUsuario(idUsuario: number, event: Event) {
    if(idUsuario === this.miId) return;
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

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

type TabType = 'activos' | 'usuarios' | 'areas' | 'presentacion' | 'lineas' | 'marcas' | 'provedores' | 'resguardantes';

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
            <ng-container *ngIf="miRol === 1">
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
              <li class="nav-item">
                <a href="javascript:void(0)" class="nav-link" [class.active]="activeTab() === 'resguardantes'" (click)="setTab('resguardantes')">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                  Resguardantes
                </a>
              </li>
              <!-- Solo visible para rol 1 (Admin) -->
              <li class="nav-item" *ngIf="miRol === 1">
                <a href="javascript:void(0)" class="nav-link" [class.active]="activeTab() === 'usuarios'" (click)="setTab('usuarios')">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  Usuarios
                </a>
              </li>
            </ng-container>
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
              <div style="display: flex; gap: 0.75rem; align-items: center;">
                <select class="filter-select" [(ngModel)]="filtroEstadoActivos" (change)="onFiltroActivosChange()">
                  <option value="1">Activos</option>
                  <option value="2">Inactivos</option>
                </select>
                <button class="primary-btn" *ngIf="miRol === 1" (click)="openCreateActivo()">Nuevo Activo</button>
              </div>
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
                      <ng-container *ngIf="editingId !== (item.idActivo || item.noActivo)">{{ item.descripcion }}</ng-container>
                      <ng-container *ngIf="editingId === (item.idActivo || item.noActivo)">
                        <input [(ngModel)]="editForm.descripcion" class="edit-input">
                      </ng-container>
                    </td>
                    <td>
                      <span class="status-badge" 
                        [class.active]="item.estado === '1'"
                        [class.inactive]="item.estado === '2'">
                        {{ item.estado === '1' ? 'Activo' : 'Inactivo' }}
                      </span>
                    </td>
                    <td>
                      <ng-container *ngIf="editingId !== item.idActivo">{{ '$' + item.precio }}</ng-container>
                      <ng-container *ngIf="editingId === item.idActivo">
                        <input type="number" [(ngModel)]="editForm.precio" class="edit-input" style="width: 80px">
                      </ng-container>
                    </td>
                    <td>
                      <ng-container *ngIf="editingId !== item.idActivo">
                        <button class="action-btn" style="background: var(--gray-900); color: white;" (click)="verDetalleActivo(item)">Ver</button>
                        <button class="action-btn outline-btn" *ngIf="miRol === 1" (click)="openEditActivo(item)">Editar</button>
                        <button *ngIf="item.estado === '2' && miRol === 1" class="action-btn success" (click)="cambiarEstadoGenerico('activos', item.idActivo, '1')">Activar</button>
                        <button *ngIf="item.estado === '1' && miRol === 1" class="action-btn danger" (click)="cambiarEstadoGenerico('activos', item.idActivo, '2')">Desactivar</button>
                        <button *ngIf="item.estado === '2' && miRol === 1" class="action-btn" style="background:#7f1d1d;color:#fff;" (click)="eliminarRegistro('activos', item.idActivo)">Eliminar</button>
                      </ng-container>
                      <ng-container *ngIf="editingId === item.idActivo">
                        <button class="action-btn success" (click)="saveEditCatalogo('activos', item.idActivo)">Guardar</button>
                        <button class="action-btn danger" (click)="cancelEdit()">Cancelar</button>
                      </ng-container>
                    </td>
                  </tr>
                  <tr *ngIf="dataActivos().length === 0">
                    <td colspan="6" style="text-align: center; color: var(--gray-500)">Sin registros con ese filtro.</td>
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
                        <input [(ngModel)]="editForm.nombre" class="edit-input" placeholder="Nombre" style="width: 100px;" #editInput>
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
                        <button 
                          *ngIf="user.estado === '2'" 
                          class="action-btn"
                          style="background:#7f1d1d;color:#fff;"
                          [disabled]="user.idUsuario === miId"
                          (click)="eliminarUsuario(user.idUsuario)">
                          Eliminar
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
              <div style="display: flex; gap: 0.75rem; align-items: center;">
                <select class="filter-select" [(ngModel)]="filtroEstadoCatalogo" (change)="onFiltroCatalogoChange()">
                  <option value="1">Activos</option>
                  <option value="2">Inactivos</option>
                </select>
                <button class="primary-btn" (click)="openCreateCatalogo()">Nuevo Registro</button>
              </div>
            </div>

            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th *ngIf="activeTab() !== 'resguardantes'">Nombre</th>
                    <th *ngIf="activeTab() === 'resguardantes'">Nombres</th>
                    <th *ngIf="activeTab() === 'resguardantes'">Apellidos</th>
                    <th *ngIf="activeTab() === 'areas'">Descripción</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let item of dataCatalogo()">
                    <td>{{ getDictId(item) }}</td>
                    <td *ngIf="activeTab() !== 'resguardantes'">
                      <ng-container *ngIf="editingId !== getDictId(item)">{{ item.nombre }}</ng-container>
                      <ng-container *ngIf="editingId === getDictId(item)">
                        <input [(ngModel)]="editForm.nombre" class="edit-input" placeholder="Nombre de {{ activeTab() }}" #editInput>
                      </ng-container>
                    </td>
                    <td *ngIf="activeTab() === 'resguardantes'">
                      <ng-container *ngIf="editingId !== getDictId(item)">{{ item.nombres }}</ng-container>
                      <ng-container *ngIf="editingId === getDictId(item)">
                        <input [(ngModel)]="editForm.nombres" class="edit-input" placeholder="Nombres" #editInput>
                      </ng-container>
                    </td>
                    <td *ngIf="activeTab() === 'resguardantes'">
                      <ng-container *ngIf="editingId !== getDictId(item)">{{ item.apellidos }}</ng-container>
                      <ng-container *ngIf="editingId === getDictId(item)">
                        <input [(ngModel)]="editForm.apellidos" class="edit-input" placeholder="Apellidos">
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
                        <button *ngIf="item.estado === '2'" class="action-btn" style="background:#7f1d1d;color:#fff;" (click)="eliminarRegistro(activeTab(), getDictId(item))">Eliminar</button>
                      </ng-container>
                      <ng-container *ngIf="editingId === getDictId(item)">
                        <button class="action-btn success" (click)="saveEditCatalogo(activeTab(), getDictId(item))">Guardar</button>
                        <button class="action-btn danger" (click)="cancelEdit()">Cancelar</button>
                      </ng-container>
                    </td>
                  </tr>
                  <tr *ngIf="dataCatalogo().length === 0">
                    <td colspan="6" style="text-align: center; color: var(--gray-500)">Vacío. Agrega registros.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
        </div>
      </main>

      <!-- Modal Crear Catálogo -->
      <div class="modal-overlay" *ngIf="showModalCatalogo" (click)="closeCreateCatalogo()">
        <div class="modal-content" style="width: 400px;" (click)="$event.stopPropagation()">
          <button class="close-btn" (click)="closeCreateCatalogo()">✕</button>
          <h2 style="text-transform: capitalize; margin-bottom: 1.5rem;">Nuevo {{ activeTab() }}</h2>
          <!-- Campo ID (solo para catálogos con PK varchar) -->
          <div class="form-group" *ngIf="activeTab() !== 'resguardantes'">
            <label>ID (clave única)</label>
            <input type="text" [(ngModel)]="newCatalogo.id" placeholder="Ej: MRC-001, PRV-002..." style="font-family: monospace;">
          </div>
          <div class="form-group" *ngIf="activeTab() !== 'resguardantes'" style="margin-top: 0.75rem;">
            <label>Nombre</label>
            <input type="text" [(ngModel)]="newCatalogo.nombre">
          </div>
          <div class="form-group" *ngIf="activeTab() === 'areas'" style="margin-top: 0.75rem;">
            <label>Descripción</label>
            <input type="text" [(ngModel)]="newCatalogo.descripcion">
          </div>
          <div class="form-group" *ngIf="activeTab() === 'resguardantes'">
            <label>Nombres</label>
            <input type="text" [(ngModel)]="newCatalogo.nombres">
          </div>
          <div class="form-group" *ngIf="activeTab() === 'resguardantes'" style="margin-top: 0.75rem;">
            <label>Apellidos</label>
            <input type="text" [(ngModel)]="newCatalogo.apellidos">
          </div>
          <div class="modal-actions" style="margin-top: 1.5rem;">
            <button class="action-btn outline-btn" (click)="closeCreateCatalogo()" [disabled]="isSavingCatalogo">Cancelar</button>
            <button class="action-btn success" (click)="saveNuevoCatalogo()" [disabled]="isSavingCatalogo">{{ isSavingCatalogo ? 'Guardando...' : 'Guardar' }}</button>
          </div>
        </div>
      </div>

      <!-- Modal Crear Activo -->
      <div class="modal-overlay" *ngIf="showModalCreateActivo" (click)="closeCreateActivo()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <button class="close-btn" (click)="closeCreateActivo()">✕</button>
          <h2 style="margin-bottom: 1.5rem;">Agregar Nuevo Activo</h2>
          <div class="form-grid">
            <div class="form-group">
              <label>No. Activo</label>
              <input type="text" [(ngModel)]="newActivo.idActivo" placeholder="Ej: ACT-10003" #idActivoInput>
            </div>
            <div class="form-group">
              <label>Nombre</label>
              <input type="text" [(ngModel)]="newActivo.nombre">
            </div>
            <div class="form-group full-width">
              <label>Descripción</label>
              <input type="text" [(ngModel)]="newActivo.descripcion">
            </div>
            <div class="form-group">
              <label>Precio</label>
              <input type="number" [(ngModel)]="newActivo.precio">
            </div>
            <!-- Existencias siempre será 1 por defecto -->
            <div class="form-group">
              <label>Garantía</label>
              <input type="text" [(ngModel)]="newActivo.garantia">
            </div>
            <div class="form-group">
              <label>No. Serie</label>
              <input type="text" [(ngModel)]="newActivo.nSerie">
            </div>
            <div class="form-group">
              <label>Marca</label>
              <select [(ngModel)]="newActivo.fkMarca">
                <option *ngFor="let m of listMarcas()" [value]="m.idMarca">{{ m.nombre }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Proveedor</label>
              <select [(ngModel)]="newActivo.fkProvedor">
                <option *ngFor="let p of listProveedores()" [value]="p.idProvedor">{{ p.nombre }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Línea</label>
              <select [(ngModel)]="newActivo.fkLinea">
                <option *ngFor="let l of listLineas()" [value]="l.idLinea">{{ l.nombre }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Presentación</label>
              <select [(ngModel)]="newActivo.fkPresentacion">
                <option *ngFor="let pr of listPresentacion()" [value]="pr.idPresentacion">{{ pr.nombre }}</option>
              </select>
            </div>
            <!-- Asignación -->
            <div class="form-group full-width" style="border-top: 1px dashed #cbd5e1; padding-top: 1rem; margin-top: 0.5rem;">
              <h3 style="margin: 0 0 1rem 0; font-size: 1rem; color: var(--gray-800);">Asignación</h3>
            </div>
            <div class="form-group">
              <label>Área</label>
              <select [(ngModel)]="newActivo.fkArea">
                <option *ngFor="let a of listAreas()" [value]="a.idArea">{{ a.nombre }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Resguardante</label>
              <select [(ngModel)]="newActivo.fkResguardante">
                <option *ngFor="let r of listResguardantes()" [ngValue]="r.idResguardante">{{ r.nombres }} {{ r.apellidos }}</option>
              </select>
            </div>
            <div class="form-group full-width" style="border-top: 1px dashed #cbd5e1; padding-top: 1rem; margin-top: 0.5rem;">
              <label>Importar Fotos (Opcional)</label>
              <input type="file" accept="image/*" (change)="onFileSelected($event)" multiple>
              <div *ngIf="selectedFiles.length > 0" style="margin-top: 0.5rem; color: #059669; font-size: 0.8rem;">
                {{ selectedFiles.length }} archivos seleccionados.
              </div>
            </div>
          </div>
          <div class="modal-actions">
            <button class="action-btn outline-btn" (click)="closeCreateActivo()" [disabled]="isSaving">Cancelar</button>
            <button class="action-btn success" (click)="saveNuevoActivo()" [disabled]="isSaving">{{ isSaving ? 'Guardando...' : 'Guardar Activo' }}</button>
          </div>
        </div>
      </div>

      <!-- Modal Detalle Activo -->
      <div class="modal-overlay" *ngIf="showModalDetalle" (click)="closeDetalle()">
        <div class="modal-content" (click)="$event.stopPropagation()" style="width: 800px">
          <button class="close-btn" (click)="closeDetalle()">✕</button>
          <h2>Detalle del Activo: {{ selectedActivo?.idActivo }}</h2>
          
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">Nombre</span>
              <span class="detail-value">{{ selectedActivo?.nombre }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Estado</span>
              <span class="status-badge" [class.active]="selectedActivo?.estado === '1'" [class.inactive]="selectedActivo?.estado === '2'">
                {{ selectedActivo?.estado === '1' ? 'Activo' : 'Inactivo' }}
              </span>
            </div>
            <div class="detail-item full-width" style="grid-column: span 2">
              <span class="detail-label">Descripción</span>
              <span class="detail-value">{{ selectedActivo?.descripcion }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Precio</span>
              <span class="detail-value">{{ '$' + selectedActivo?.precio }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">No. Serie</span>
              <span class="detail-value">{{ selectedActivo?.nSerie || 'N/A' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Marca</span>
              <span class="detail-value">{{ selectedActivo?.fkMarca || 'N/A' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Garantía</span>
              <span class="detail-value">{{ selectedActivo?.garantia || 'N/A' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Área Asignada</span>
              <span class="detail-value">{{ assignmentActivo() ? getAreaName(assignmentActivo().fkArea) : 'No asignado' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Resguardante</span>
              <span class="detail-value">{{ assignmentActivo() ? getResguardanteName(assignmentActivo().fkResguardante) : 'No asignado' }}</span>
            </div>
          </div>

          <h3>Fotos del Activo</h3>
          <div class="photos-gallery">
            <div class="photo-card" *ngFor="let f of fotosActivo()">
              <img [src]="'/fotos/view/' + f.foto" alt="Foto del activo" (click)="openImagePreview('/fotos/view/' + f.foto)" style="cursor: pointer;">
              <button class="delete-photo-btn" (click)="deleteFoto(f.idFoto)" title="Eliminar foto">✕</button>
            </div>
            <div class="no-photos" *ngIf="fotosActivo().length === 0">
              No hay fotos registradas para este activo.
            </div>
          </div>

          <div class="modal-actions" style="margin-top: 2rem">
            <button class="primary-btn" (click)="closeDetalle()">Cerrar</button>
          </div>
        </div>
      </div>

      <!-- Modal Editar Activo -->
      <div class="modal-overlay" *ngIf="showModalEditActivo" (click)="closeEditActivo()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <button class="close-btn" (click)="closeEditActivo()">✕</button>
          <h2>Editar Activo: {{ editActivoForm.idActivo }}</h2>
          <div class="form-grid">
            <div class="form-group">
              <label>No. Activo (No editable)</label>
              <input type="text" [value]="editActivoForm.idActivo" disabled>
            </div>
            <div class="form-group">
              <label>Nombre</label>
              <input type="text" [(ngModel)]="editActivoForm.nombre">
            </div>
            <div class="form-group full-width">
              <label>Descripción</label>
              <input type="text" [(ngModel)]="editActivoForm.descripcion">
            </div>
            <div class="form-group">
              <label>Precio</label>
              <input type="number" [(ngModel)]="editActivoForm.precio">
            </div>
            <div class="form-group">
              <label>No. Serie</label>
              <input type="text" [(ngModel)]="editActivoForm.nSerie">
            </div>
            <div class="form-group">
              <label>Marca</label>
              <select [(ngModel)]="editActivoForm.fkMarca">
                <option *ngFor="let m of listMarcas()" [value]="m.idMarca">{{ m.nombre }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Proveedor</label>
              <select [(ngModel)]="editActivoForm.fkProvedor">
                <option *ngFor="let p of listProveedores()" [value]="p.idProvedor">{{ p.nombre }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Línea</label>
              <select [(ngModel)]="editActivoForm.fkLinea">
                <option *ngFor="let l of listLineas()" [value]="l.idLinea">{{ l.nombre }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Presentación</label>
              <select [(ngModel)]="editActivoForm.fkPresentacion">
                <option *ngFor="let pr of listPresentacion()" [value]="pr.idPresentacion">{{ pr.nombre }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Área</label>
              <select [(ngModel)]="editActivoForm.fkArea">
                <option *ngFor="let a of listAreas()" [value]="a.idArea">{{ a.idArea }} - {{ a.nombre }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Resguardante</label>
              <select [(ngModel)]="editActivoForm.fkResguardante">
                <option *ngFor="let r of listResguardantes()" [ngValue]="r.idResguardante">{{ r.nombres }} {{ r.apellidos }}</option>
              </select>
            </div>
            <div class="form-group full-width">
              <label>Fotos Actuales</label>
              <div class="photos-gallery small">
                <div class="photo-card" *ngFor="let f of fotosActivo()">
                  <img [src]="'/fotos/view/' + f.foto" alt="Foto" (click)="openImagePreview('/fotos/view/' + f.foto)" style="cursor: pointer;">
                  <button class="delete-photo-btn" (click)="deleteFoto(f.idFoto)">✕</button>
                </div>
              </div>
            </div>
            <div class="form-group full-width">
              <label>Agregar nuevas fotos</label>
              <input type="file" (change)="onFileSelected($event)" accept="image/*" multiple>
              <small *ngIf="selectedFiles.length > 0">{{ selectedFiles.length }} archivos seleccionados</small>
            </div>
          </div>
          <div class="modal-actions">
            <button class="action-btn danger" (click)="closeEditActivo()">Cancelar</button>
            <button class="primary-btn" (click)="saveEditActivo()" [disabled]="isSaving">
              {{ isSaving ? 'Guardando...' : 'Guardar Cambios' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Modal Vista Previa de Imagen -->
      <div class="modal-overlay" *ngIf="showModalImagePreview" (click)="closeImagePreview()" style="background: rgba(0,0,0,0.9); z-index: 10000;">
        <div class="modal-content" (click)="$event.stopPropagation()" style="background: transparent; border: none; box-shadow: none; max-width: 90vw; max-height: 90vh; padding: 0; display: flex; justify-content: center; align-items: center;">
          <button class="close-btn" (click)="closeImagePreview()" style="color: white; top: -40px; right: 0;">✕</button>
          <img [src]="previewImageUrl" style="max-width: 100%; max-height: 100%; border-radius: 8px; box-shadow: 0 0 50px rgba(0,0,0,0.5);">
        </div>
      </div>
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
    .filter-select { padding: 0.5rem 0.75rem; border: 1px solid var(--border-color); border-radius: 8px; background: #fff; color: var(--gray-800); font-size: 0.875rem; cursor: pointer; }
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
    
    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-content { background: #fff; padding: 2rem; border-radius: 12px; width: 600px; max-width: 90%; max-height: 90vh; overflow-y: auto; }
    .modal-content h2 { margin-top: 0; margin-bottom: 1.5rem; color: var(--gray-900); }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem; }
    .form-group { display: flex; flex-direction: column; gap: 0.4rem; }
    .form-group.full-width { grid-column: span 2; }
    .form-group label { font-size: 0.875rem; font-weight: 500; color: var(--gray-700); }
    .form-group input, .form-group select { padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 8px; font-size: 0.875rem; background: var(--gray-50); color: var(--gray-900); outline: none; }
    .form-group input:focus, .form-group select:focus { border-color: var(--gray-400); }
    .modal-actions { display: flex; justify-content: flex-end; gap: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-color); }
    
    .close-btn { position: absolute; top: 1.5rem; right: 1.5rem; background: none; border: none; font-size: 1.25rem; color: var(--gray-400); cursor: pointer; transition: color 0.2s; }
    .close-btn:hover { color: var(--gray-900); }
    .modal-content { position: relative; }

    /* Estilos Detalle Activo */
    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem; }
    .detail-item { display: flex; flex-direction: column; gap: 0.25rem; }
    .detail-label { font-size: 0.75rem; font-weight: 600; color: var(--gray-500); text-transform: uppercase; }
    .detail-value { font-size: 1rem; font-weight: 500; color: var(--gray-900); }
    .photos-gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 1rem; margin-top: 1rem; }
    .photo-card { position: relative; border-radius: 8px; overflow: hidden; border: 1px solid var(--border-color); aspect-ratio: 1; }
    .photo-card img { width: 100%; height: 100%; object-fit: cover; }
    .delete-photo-btn { position: absolute; top: 5px; right: 5px; background: #ef4444; color: white; border: none; border-radius: 50%; width: 20px; height: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 10px; }
    .delete-photo-btn:hover { background: #dc2626; }
    .photos-gallery.small { grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 0.5rem; margin-bottom: 1rem; }
    .no-photos { grid-column: span 3; padding: 2rem; text-align: center; background: var(--gray-50); color: var(--gray-500); border-radius: 8px; }
  `
})
export class DesktopDashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private usuariosService = inject(UsuariosService);
  private catalogoService = inject(CatalogoService);
  private uploadService = inject(UploadService);
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

  @ViewChild('idActivoInput') idActivoInput!: ElementRef;
  @ViewChildren('editInput') editInputs!: QueryList<ElementRef>;

  // Modal Create Activo
  showModalCreateActivo = false;
  newActivo: any = { estado: 1 };
  selectedFiles: File[] = [];
  isSaving = false;

  // Modal Edit Activo
  showModalEditActivo = false;
  editActivoForm: any = {};
  assignmentActivo = signal<any>(null);
  // Reutilizamos selectedFiles para editar también

  // Listas de catálogos como señales para reactividad garantizada
  listMarcas = signal<any[]>([]);
  listProveedores = signal<any[]>([]);
  listLineas = signal<any[]>([]);
  listPresentacion = signal<any[]>([]);
  listAreas = signal<any[]>([]);
  listResguardantes = signal<any[]>([]);

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
  selectedActivo: any = null;
  fotosActivo = signal<any[]>([]);

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

  getResguardanteName(id: number): string {
    const r = this.listResguardantes().find(res => res.idResguardante == id);
    return r ? `${r.nombres} ${r.apellidos}` : `ID: ${id}`;
  }

  getAreaName(id: string): string {
    const a = this.listAreas().find(area => area.idArea === id);
    return a ? a.nombre : `ID: ${id}`;
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
    const id = this.editActivoForm.idActivo;
    const fkArea = this.editActivoForm.fkArea;
    const fkResguardante = this.editActivoForm.fkResguardante;

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

  private processAssignment(id: string, fkArea: string, fkResguardante: number) {
    if (fkArea && fkResguardante) {
      if (this.assignmentActivo()) {
        const updatedAsig = {
          ...this.assignmentActivo(),
          fkArea: fkArea,
          fkResguardante: fkResguardante,
          ultimoActualizadoPor: this.miId
        };
        this.catalogoService.update('asignaciones', String(this.assignmentActivo().idAsignaciones), updatedAsig).subscribe({
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

    this.newActivo.creadoPor = this.miId;
    this.newActivo.ultimoActualizadoPor = this.miId;
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
        const idActivo = activoCreado.idActivo || this.newActivo.idActivo;
        const fkArea = this.newActivo.fkArea;
        const fkResguardante = this.newActivo.fkResguardante;

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

  private crearAsignacionFinal(idActivo: string, fkArea: string, fkResguardante: number) {
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

import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CambiosService } from '../../../services/cambios.service';
import { CambioPendiente } from '../../../models/cambio-pendiente.model';

@Component({
  selector: 'app-cambios-pendientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cambios-pendientes.component.html',
  styleUrls: ['./cambios-pendientes.component.css']
})
export class CambiosPendientesComponent implements OnChanges {
  @Input() active = false;

  cambios: CambioPendiente[] = [];
  cargando = true;
  error = '';
  
  cambioSeleccionado: CambioPendiente | null = null;
  datosJsonParseado: any = null;
  comentarioRechazo = '';
  mostrandoTextarea = false;

  constructor(private cambiosService: CambiosService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['active'] && this.active) {
      this.cargarCambios();
    }
  }

  cargarCambios(): void {
    this.cargando = true;
    this.error = '';
    this.cambiosService.listarPendientes().subscribe({
      next: (data) => {
        this.cambios = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Error al cargar los cambios pendientes.';
        this.cargando = false;
      }
    });
  }

  verDetalle(cambio: CambioPendiente): void {
    this.cambioSeleccionado = cambio;
    this.datosJsonParseado = JSON.parse(cambio.datosJson);
    this.comentarioRechazo = '';
    this.mostrandoTextarea = false;
  }

  cerrarModal(): void {
    this.cambioSeleccionado = null;
    this.datosJsonParseado = null;
    this.comentarioRechazo = '';
    this.mostrandoTextarea = false;
  }
  mensaje = '';
  mensajeError = false;

  aprobar(): void {
    if (!this.cambioSeleccionado?.idCambio) return;
    this.cambiosService.aprobarCambio(this.cambioSeleccionado.idCambio).subscribe({
      next: () => {
        this.cerrarModal();
        this.cargarCambios();
        this.mostrarMensaje('Cambio aprobado correctamente');
      },
      error: () => this.mostrarMensaje('Error al aprobar el cambio', true)
    });
  }

  iniciarRechazo(): void {
    if (!this.mostrandoTextarea) {
      this.mostrandoTextarea = true;
    } else {
      this.rechazar();
    }
  }

  rechazar(): void {
    if (!this.cambioSeleccionado?.idCambio) return;
    this.cambiosService.rechazarCambio(this.cambioSeleccionado.idCambio, this.comentarioRechazo).subscribe({
      next: () => {
        this.cerrarModal();
        this.cargarCambios();
        this.mostrarMensaje('Cambio rechazado');
      },
      error: () => this.mostrarMensaje('Error al rechazar el cambio', true)
    });
  }

  private mostrarMensaje(msg: string, error = false): void {
    this.mensaje = msg;
    this.mensajeError = error;
    setTimeout(() => { this.mensaje = ''; }, 4000);
  }
}

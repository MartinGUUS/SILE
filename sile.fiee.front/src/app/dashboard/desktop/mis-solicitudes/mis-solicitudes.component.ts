import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CambiosService } from '../../../services/cambios.service';
import { CambioPendiente } from '../../../models/cambio-pendiente.model';

@Component({
  selector: 'app-mis-solicitudes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mis-solicitudes.component.html',
  styleUrls: ['./mis-solicitudes.component.css']
})
export class MisSolicitudesComponent implements OnChanges {
  @Input() active = false;
  solicitudes: CambioPendiente[] = [];
  cargando = true;
  error = '';

  constructor(private cambiosService: CambiosService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['active'] && this.active) {
      this.cargarSolicitudes();
    }
  }

  cargarSolicitudes(): void {
    this.cargando = true;
    this.error = '';
    this.cambiosService.listarMisSolicitudes().subscribe({
      next: (data) => {
        this.solicitudes = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Error al cargar mis solicitudes.';
        this.cargando = false;
      }
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

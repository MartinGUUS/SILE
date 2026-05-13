export interface CambioPendiente {
  idCambio?: number;
  tipoCambio: 'CREAR' | 'ACTUALIZAR' | 'ELIMINAR';
  entidad: string;
  idEntidad?: string;
  datosJson: string;
  idSolicitante?: number;
  idRevisor?: number;
  estado?: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';
  comentario?: string;
  creadoEn?: string;
  actualizadoEn?: string;
}

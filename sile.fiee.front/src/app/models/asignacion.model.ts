export interface Asignacion {
  idAsignaciones?: number;
  fkActivo?: string;
  fkArea?: string;
  fkResguardante?: number;
  fkCoresguardante?: number;
  estado?: string;
  creadoPor?: number;
  ultimoActualizadoPor?: number;
}

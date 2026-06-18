export interface Activo {
  idActivo?: string;
  nombre?: string;
  descripcion?: string;
  modelo?: string;
  nSerie?: string;
  fkMarca?: string;
  fkArea?: string;
  fkResguardante?: string;
  coresguardante?: number;
  estado?: string;
  creadoPor?: number;
  ultimoActualizadoPor?: number;
}

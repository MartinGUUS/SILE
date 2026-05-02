export interface Activo {
  idActivo?: string;
  nombre?: string;
  descripcion?: string;
  precio?: number;
  existencias?: number;
  garantia?: string;
  nSerie?: string;
  fkMarca?: string;
  fkProvedor?: string;
  fkLinea?: string;
  fkPresentacion?: string;
  fkArea?: string;
  fkResguardante?: string;
  estado?: string;
  creadoPor?: number;
  ultimoActualizadoPor?: number;
}

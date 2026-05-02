export interface Usuario {
  idUsuario?: number;
  nombre?: string;
  apellido?: string;
  correo?: string;
  contrasena?: string;
  estado?: string;
  fkRol?: number;
}

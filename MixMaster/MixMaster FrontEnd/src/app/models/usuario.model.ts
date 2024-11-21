export interface Usuario {
    idUsuario: number;
    rut: string;
    nombre: string;
    apellidoP: string;
    apellidoM: string;
    telefono: string;
    email: string;  
    clave: string;
    fechaNacimiento: Date;
    fechaCreacion: Date;
    activo: boolean;
  }
  
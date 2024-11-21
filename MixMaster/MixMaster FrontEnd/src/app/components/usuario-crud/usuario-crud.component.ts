import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { UsuarioService } from "../../services/usuario.service";
import { Usuario } from "../../models/usuario.model";
import { CommonModule } from "@angular/common";
import { validarRut } from "../../utils/validator";

@Component({
  selector: "app-usuario-crud",
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: "./usuario-crud.component.html",
  styleUrls: ["./usuario-crud.component.css"],
})
export class UsuarioCrudComponent implements OnInit {
  usuarios: Usuario[] = [];
  usuario: Usuario = this.resetUsuario();
  modalOpen = false;
  editMode = false;
  maxDate: string = "";

  constructor(private usuarioService: UsuarioService) {}

  ngOnInit(): void {
    this.getAllUsuarios();
    this.setMaxDate();
  }

  getAllUsuarios(): void {
    this.usuarioService.getAllUsuarios().subscribe((data) => {
      this.usuarios = Array.isArray(data) ? data : [data];
    });
  }

  closeModal(): void {
    this.modalOpen = false;
  }

  setMaxDate(): void {
    const today = new Date();
    const year = today.getFullYear() - 18;
    const month = today.getMonth() + 1;
    const day = today.getDate();

    this.maxDate = `${year}-${month.toString().padStart(2, "0")}-${day
      .toString()
      .padStart(2, "0")}`;
  }

  saveUsuario(): void {
    // Aquí eliminamos cualquier campo nulo antes de enviarlo
    const usuarioData = { ...this.usuario };
      if (!validarRut(this.usuario.rut)) {
          alert('El RUT ingresado no es válido');
          return;
      }
      // Continuar con la lógica para guardar el usuario
      if (this.editMode) {
          this.usuarioService.updateUsuario(usuarioData.idUsuario, usuarioData)
              .subscribe(() => {
                  this.getAllUsuarios();
                  this.closeModal();
              });
      } else {
          this.usuarioService.createUsuario(usuarioData)
              .subscribe(() => {
                  this.getAllUsuarios();
                  this.closeModal();
              });
      }
  }
  
  

  deleteUsuario(idUsuario: number): void {
    this.usuarioService.deleteUsuario(idUsuario)
      .subscribe(() => this.getAllUsuarios());
  }

  private resetUsuario(): Usuario {
    return {
      idUsuario: 0,
      rut: "",
      nombre: "",
      apellidoP: "",
      apellidoM: "",
      telefono: "",
      email: "",
      clave: "",
      fechaNacimiento: new Date(),
      fechaCreacion: new Date(),
      activo: true,
    };
  }

  openModal(usuario?: Usuario): void {
    this.modalOpen = true;
    this.editMode = !!usuario;
    this.usuario = usuario ? { ...usuario } : this.resetUsuario();
  }

  editUsuario(usuario: Usuario): void {
    this.openModal(usuario);
  }

  
}

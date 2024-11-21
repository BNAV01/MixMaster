import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from '../models/usuario.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private baseUrl = 'http://localhost:8080/usuario'; // Ajusta el puerto según tu configuración

  constructor(private http: HttpClient) {}
  getAllUsuarios(): Observable<Usuario[]> {
    return this.http.get<{ data: Usuario[] }>(`${this.baseUrl}/getAll`)
      .pipe(map((response: { data: Usuario[] }) => response.data));
  }
  getUsuarioById(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.baseUrl}/getById/${id}`);
  }

  createUsuario(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.baseUrl}/create`, usuario);
  }
  

  updateUsuario(id: number, usuario: Usuario): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.baseUrl}/update/${id}`, usuario);
  }

  softDeleteUsuario(id: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/inactive/${id}`, {});
  }

  deleteUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/delete/${id}`);
  }
}

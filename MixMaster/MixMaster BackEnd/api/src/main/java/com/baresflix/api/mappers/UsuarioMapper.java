package com.baresflix.api.mappers;


import org.springframework.stereotype.Component;
import com.baresflix.api.models.Usuario;
import com.baresflix.api.DTO.UsuarioDTO;
@Component
public class UsuarioMapper {
    public static UsuarioDTO createDTO(Usuario usuario) {
        return UsuarioDTO.builder()
                .idUsuario(usuario.getIdUsuario())
                .rut(usuario.getRut())
                .nombre(usuario.getNombre())
                .apellidoP(usuario.getApellidoP())
                .apellidoM(usuario.getApellidoM())
                .telefono(usuario.getTelefono())
                .email(usuario.getEmail())
                .clave(usuario.getClave())
                .fechaNacimiento(usuario.getFechaNacimiento())
                .fechaCreacion(usuario.getFechaCreacion())
                .activo(usuario.getActivo())
                .preferencias(usuario.getPreferencias().stream().map(PreferenciasMapper::createDTO).toList())
                .build();
    }
}

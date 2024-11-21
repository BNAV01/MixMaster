package com.baresflix.api.DTO;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioDTO {
    private int idUsuario;
    private String rut;
    private String nombre;
    private String apellidoP;
    private String apellidoM;
    private String telefono;
    private String email;
    private String clave;
    private Date fechaNacimiento;
    private Date fechaCreacion;
    @JsonProperty("active")
    private boolean activo;
    private List<PreferenciasDTO> preferencias;
}

package com.baresflix.api.DTO;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;
import java.util.Date;
import java.util.List;

@Data
@Builder
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

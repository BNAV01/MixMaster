package com.baresflix.api.DTO;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;
import java.util.Date;
import java.util.List;

@Data
@Builder
public class ValoracionesDTO {
    private int idValoracion;
    private UsuarioDTO usuarioDTO;
    private LicorDTO licorDTO;
    private CoctelDTO coctelDTO;
    private int valoracion;
    private String comentario;
    private Date fechaValoracion;


}

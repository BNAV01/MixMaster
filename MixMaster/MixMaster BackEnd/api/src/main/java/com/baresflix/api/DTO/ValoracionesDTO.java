package com.baresflix.api.DTO;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ValoracionesDTO {
    private int idValoracion;
    private UsuarioDTO usuarioDTO;
    private LicorDTO licorDTO;
    private CoctelDTO coctelDTO;
    private int valoracion;
    private String comentario;
    private Date fechaValoracion;
}

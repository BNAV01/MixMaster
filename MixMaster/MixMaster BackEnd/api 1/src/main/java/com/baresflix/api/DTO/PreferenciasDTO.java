package com.baresflix.api.DTO;


import lombok.Builder;
import lombok.Data;


@Data
@Builder
public class PreferenciasDTO {
    private int idPreferencia;
    private UsuarioDTO usuarioDTO;
    private LicorDTO licorDTO;
    private CoctelDTO coctelDTO;
}

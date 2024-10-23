package com.baresflix.api.DTO;
import lombok.Builder;
import lombok.Data;

@Data
@Builder

public class CoctelIngredienteDTO {
    private int id_preparacion_coctel;
    private CoctelDTO coctelDTO;
    private IngredienteDTO ingredienteDTO;
    private LicorDTO licorDTO;
    private String cantidad;
}

package com.baresflix.api.DTO;
import lombok.Builder;
import lombok.Data;

@Data
@Builder

public class LicorIngredienteDTO {
    private int id_preparacion_licor;;
    private LicorDTO licorDTO;
    private IngredienteDTO ingredienteDTO;
}

package com.baresflix.api.DTO;
import lombok.Builder;
import lombok.Data;

@Data
@Builder

public class IngredienteDTO {
    private int idIngrediente;
    private String nombre;
/*    private List<CoctelIngredienteDTO> coctelIngredienteDTO;
    private List<LicorIngredienteDTO> licorIngredienteDTO;*/
}

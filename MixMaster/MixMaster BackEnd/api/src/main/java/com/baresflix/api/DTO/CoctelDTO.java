package com.baresflix.api.DTO;
import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class CoctelDTO {
    private int idCoctel;
    private String nombreCoctel;
    private List<CoctelIngredienteDTO> ingredienteCoctelDTO;
    private List<PreferenciasDTO> preferenciasDTO;
}

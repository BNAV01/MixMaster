package com.baresflix.api.DTO;
import lombok.Builder;
import lombok.Data;

import java.util.List;
@Data
@Builder

public class LicorDTO {
    private int idLicor;
    private String nombreLicor;
    private String tipo;
/*    private List<PreferenciasDTO> preferenciasDTO;
    private List<CoctelIngredienteDTO> coctelIngredienteDTO;
    private List<LicorIngredienteDTO> licorIngredientesDTO;*/
}
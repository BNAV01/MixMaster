package com.baresflix.api.mappers;

import com.baresflix.api.DTO.IngredienteDTO;
import com.baresflix.api.models.Ingrediente;

public class IngredienteMapper {
    public static IngredienteDTO createDTO(Ingrediente ingrediente) {
        return IngredienteDTO.builder()
                .idIngrediente(ingrediente.getIdIngrediente())
                .nombre(ingrediente.getNombre())
/*
                .coctelIngredienteDTO(ingrediente.getCoctelIngredientes().stream().map(CoctelIngredienteMapper::createDTO).toList())
                .licorIngredienteDTO(ingrediente.getLicorIngredientes().stream().map(LicorIngredienteMapper::createDTO).toList())
*/
                .build();
    }
}

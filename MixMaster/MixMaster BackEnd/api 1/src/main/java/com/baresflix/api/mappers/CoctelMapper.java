package com.baresflix.api.mappers;

import com.baresflix.api.DTO.CoctelDTO;
import com.baresflix.api.models.Coctel;
import org.springframework.stereotype.Component;

@Component
public class CoctelMapper {
    public static CoctelDTO createDTO(Coctel coctel) {
        return CoctelDTO.builder()
                .idCoctel(coctel.getIdCoctel())
                .nombreCoctel(coctel.getNombreCoctel())
/*
                .ingredienteCoctelDTO(coctel.getIngredientesCoctel().stream().map(CoctelIngredienteMapper::createDTO).toList())
                .preferenciasDTO(coctel.getPreferencias().stream().map(PreferenciasMapper::createDTO).toList())
*/
                .build();
    }

}

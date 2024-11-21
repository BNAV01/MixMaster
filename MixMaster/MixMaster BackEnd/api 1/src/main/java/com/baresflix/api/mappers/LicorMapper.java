package com.baresflix.api.mappers;

import com.baresflix.api.models.Licor;
import com.baresflix.api.DTO.LicorDTO;

import org.springframework.stereotype.Component;

@Component
public class LicorMapper {
    public static LicorDTO createDTO(Licor licor) {
        return LicorDTO.builder()
                .idLicor(licor.getIdLicor())
                .nombreLicor(licor.getNombreLicor())
                .tipo(licor.getTipo())
/*
                .preferenciasDTO(licor.getPreferencias().stream().map(PreferenciasMapper::createDTO).toList())
                .coctelIngredienteDTO(licor.getCoctelIngredientes().stream().map(CoctelIngredienteMapper::createDTO).toList())
                .licorIngredientesDTO(licor.getLicorIngredientes().stream().map(LicorIngredienteMapper::createDTO).toList())
*/
                .build();
    }

}

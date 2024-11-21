package com.baresflix.api.mappers;

import com.baresflix.api.DTO.LicorIngredienteDTO;
import com.baresflix.api.models.LicorIngrediente;
import org.springframework.stereotype.Component;

@Component
public class LicorIngredienteMapper {
    public static LicorIngredienteDTO createDTO(LicorIngrediente licorIngrediente) {
        return LicorIngredienteDTO.builder()
                .id_preparacion_licor(licorIngrediente.getId_preparacion_licor())
                .licorDTO(LicorMapper.createDTO(licorIngrediente.getLicor()))
                .ingredienteDTO(IngredienteMapper.createDTO(licorIngrediente.getIngrediente()))
                .build();
    }
}

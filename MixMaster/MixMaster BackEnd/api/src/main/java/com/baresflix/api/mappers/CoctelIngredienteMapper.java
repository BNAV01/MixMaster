package com.baresflix.api.mappers;
import com.baresflix.api.DTO.CoctelIngredienteDTO;
import com.baresflix.api.models.CoctelIngrediente;
import org.springframework.stereotype.Component;

@Component
public class CoctelIngredienteMapper {
    public static CoctelIngredienteDTO createDTO(CoctelIngrediente coctelIngrediente) {
        return CoctelIngredienteDTO.builder()
                .id_preparacion_coctel(coctelIngrediente.getId_preparacion_coctel())
                .coctelDTO(CoctelMapper.createDTO(coctelIngrediente.getCoctel()))
                .ingredienteDTO(IngredienteMapper.createDTO(coctelIngrediente.getIngrediente()))
                .licorDTO(LicorMapper.createDTO(coctelIngrediente.getLicor()))
                .cantidad(coctelIngrediente.getCantidad())
                .build();

    }



}


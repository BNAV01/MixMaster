package com.baresflix.api.mappers;


import org.springframework.stereotype.Component;
import com.baresflix.api.models.Preferencias;
import com.baresflix.api.DTO.PreferenciasDTO;



@Component
public class PreferenciasMapper {
    public static PreferenciasDTO createDTO(Preferencias preferencias) {
        return PreferenciasDTO.builder()
                .idPreferencia(preferencias.getIdPreferencia())
                .usuarioDTO(UsuarioMapper.createDTO(preferencias.getUsuario()))
                .licorDTO(LicorMapper.createDTO(preferencias.getLicor()))
                .coctelDTO(CoctelMapper.createDTO(preferencias.getCoctel()))
                .build();
    }
}

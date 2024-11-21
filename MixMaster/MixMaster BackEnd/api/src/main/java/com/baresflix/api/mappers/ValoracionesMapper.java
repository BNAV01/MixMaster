package com.baresflix.api.mappers;




import com.baresflix.api.DTO.ValoracionesDTO;
import com.baresflix.api.models.Valoraciones;
import org.springframework.stereotype.Component;

@Component
public class ValoracionesMapper {
    public static ValoracionesDTO createDTO(Valoraciones valoraciones){
        return ValoracionesDTO.builder()
                .idValoracion(valoraciones.getIdValoracion())
                .usuarioDTO(UsuarioMapper.createDTO(valoraciones.getUsuario()))
                .licorDTO(LicorMapper.createDTO(valoraciones.getLicor()))
                .coctelDTO(CoctelMapper.createDTO(valoraciones.getCoctel()))
                .valoracion(valoraciones.getValoracion())
                .comentario(valoraciones.getComentario())
                .fechaValoracion(valoraciones.getFechaValoracion())
                .build();
    }

}
 
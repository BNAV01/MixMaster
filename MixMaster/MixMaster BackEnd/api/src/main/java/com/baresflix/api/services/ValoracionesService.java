package com.baresflix.api.services;

import com.baresflix.api.DTO.GenericResponse;
import com.baresflix.api.DTO.ValoracionesDTO;
import com.baresflix.api.models.Valoraciones;
import com.baresflix.api.models.Coctel;
import com.baresflix.api.models.Licor;
import com.baresflix.api.models.Usuario;
import com.baresflix.api.repository.IValoracionesRepository;
import com.baresflix.api.repository.ICoctelRepository;
import com.baresflix.api.repository.ILicorRepository;
import com.baresflix.api.repository.IUsuarioRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ValoracionesService {
    private final IValoracionesRepository _valoracionesRepository;
    private final IUsuarioRepository _usuarioRepository;
    private final ICoctelRepository _coctelRepository;
    private final ILicorRepository _licorRepository;

    public ValoracionesService(
            IValoracionesRepository valoracionesRepository,
            IUsuarioRepository usuarioRepository,
            ICoctelRepository coctelRepository,
            ILicorRepository licorRepository
    ) {
        this._valoracionesRepository = valoracionesRepository;
        this._usuarioRepository = usuarioRepository;
        this._coctelRepository = coctelRepository;
        this._licorRepository = licorRepository;
    }

    // Crear valoración
    public GenericResponse create(ValoracionesDTO valoracionesDTO) {
        try {
            Usuario usuario = _usuarioRepository.findById(valoracionesDTO.getUsuarioDTO().getIdUsuario())
                    .orElseThrow(() -> new Exception("Usuario no encontrado"));

            Coctel coctel = _coctelRepository.findById(valoracionesDTO.getCoctelDTO().getIdCoctel())
                    .orElse(null); // Opcional, puede ser null

            Licor licor = _licorRepository.findById(valoracionesDTO.getLicorDTO().getIdLicor())
                    .orElse(null); // Opcional, puede ser null

            Valoraciones valoracion = Valoraciones.builder()
                    .usuario(usuario)
                    .coctel(coctel)
                    .licor(licor)
                    .valoracion(valoracionesDTO.getValoracion())
                    .comentario(valoracionesDTO.getComentario())
                    .fechaValoracion(valoracionesDTO.getFechaValoracion())
                    .build();

            valoracion = _valoracionesRepository.save(valoracion);

            return GenericResponse.builder()
                    .data(valoracion)
                    .error(null)
                    .build();
        } catch (Exception e) {
            return GenericResponse.builder()
                    .data(null)
                    .error(e.getMessage())
                    .build();
        }
    }

    // Otros métodos permanecen iguales (getAll, getById, update, delete)
}

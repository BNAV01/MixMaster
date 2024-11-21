package com.baresflix.api.services;

import com.baresflix.api.DTO.GenericResponse;
import com.baresflix.api.DTO.PreferenciasDTO;
import com.baresflix.api.models.Preferencias;
import com.baresflix.api.models.Usuario;
import com.baresflix.api.models.Coctel;
import com.baresflix.api.models.Licor;
import com.baresflix.api.repository.IPreferenciasRepository;
import com.baresflix.api.repository.IUsuarioRepository;
import com.baresflix.api.repository.ICoctelRepository;
import com.baresflix.api.repository.ILicorRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PreferenciasService {
    private final IPreferenciasRepository _preferenciasRepository;
    private final IUsuarioRepository _usuarioRepository;
    private final ICoctelRepository _coctelRepository;
    private final ILicorRepository _licorRepository;

    public PreferenciasService(
            IPreferenciasRepository preferenciasRepository,
            IUsuarioRepository usuarioRepository,
            ICoctelRepository coctelRepository,
            ILicorRepository licorRepository
    ) {
        this._preferenciasRepository = preferenciasRepository;
        this._usuarioRepository = usuarioRepository;
        this._coctelRepository = coctelRepository;
        this._licorRepository = licorRepository;
    }

    // Crear preferencia
    public GenericResponse create(PreferenciasDTO preferenciasDTO) {
        try {
            Usuario usuario = _usuarioRepository.findById(preferenciasDTO.getUsuarioDTO().getIdUsuario())
                    .orElseThrow(() -> new Exception("Usuario no encontrado"));

            Coctel coctel = _coctelRepository.findById(preferenciasDTO.getCoctelDTO().getIdCoctel())
                    .orElse(null);

            Licor licor = _licorRepository.findById(preferenciasDTO.getLicorDTO().getIdLicor())
                    .orElse(null);

            Preferencias preferencia = Preferencias.builder()
                    .usuario(usuario)
                    .coctel(coctel)
                    .licor(licor)
                    .build();

            preferencia = _preferenciasRepository.save(preferencia);

            return GenericResponse.builder()
                    .data(preferencia)
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

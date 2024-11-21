package com.baresflix.api.services;

import com.baresflix.api.DTO.CoctelDTO;
import com.baresflix.api.DTO.GenericResponse;
import com.baresflix.api.models.Coctel;
import com.baresflix.api.repository.ICoctelRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CoctelService {
    private final ICoctelRepository _coctelRepository;

    public CoctelService(ICoctelRepository coctelRepository) {
        this._coctelRepository = coctelRepository;
    }

    public GenericResponse create( CoctelDTO coctelDTO) {
        Coctel coctel = Coctel.builder()
                .nombreCoctel(coctelDTO.getNombreCoctel())
                .build();
        coctel = _coctelRepository.save(coctel);

        return GenericResponse.builder()
                .data(coctel)
                .error(null)
                .build();
    }

    public GenericResponse getAll() {
        List<Coctel> cocteles = _coctelRepository.findAll();
        return GenericResponse.builder()
                .data(cocteles)
                .error(null)
                .build();
    }

    public GenericResponse getById(int idCoctel) throws Exception {
        Coctel coctel = _coctelRepository.findById(idCoctel)
                .orElseThrow(() -> new Exception("Coctel no encontrado"));
        return GenericResponse.builder()
                .data(coctel)
                .error(null)
                .build();
    }

    public GenericResponse update(CoctelDTO coctelDTO) throws Exception {
        Coctel coctel = _coctelRepository.findById(coctelDTO.getIdCoctel())
                .orElseThrow(() -> new Exception("Coctel no encontrado"));
        coctel.setNombreCoctel(coctelDTO.getNombreCoctel());
        coctel = _coctelRepository.save(coctel);

        return GenericResponse.builder()
                .data(coctel)
                .error(null)
                .build();
    }

    public GenericResponse delete(int idCoctel) throws Exception {
        Coctel coctel = _coctelRepository.findById(idCoctel)
                .orElseThrow(() -> new Exception("Coctel no encontrado"));
        _coctelRepository.delete(coctel);

        return GenericResponse.builder()
                .data("Coctel eliminado correctamente")
                .error(null)
                .build();
    }
}

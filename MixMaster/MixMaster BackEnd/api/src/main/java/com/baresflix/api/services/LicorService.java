package com.baresflix.api.services;

import com.baresflix.api.DTO.GenericResponse;
import com.baresflix.api.DTO.LicorDTO;
import com.baresflix.api.models.Licor;
import com.baresflix.api.repository.ILicorRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LicorService {
    private final ILicorRepository _licorRepository;

    public LicorService(ILicorRepository licorRepository) {
        this._licorRepository = licorRepository;
    }

    public GenericResponse create(LicorDTO licorDTO) {
        Licor licor = Licor.builder()
                .nombreLicor(licorDTO.getNombreLicor())
                .tipo(licorDTO.getTipo())
                .descripcion(licorDTO.getDescripcion())
                .build();
        licor = _licorRepository.save(licor);

        return GenericResponse.builder()
                .data(licor)
                .error(null)
                .build();
    }

    public GenericResponse getAll() {
        List<Licor> licores = _licorRepository.findAll();
        return GenericResponse.builder()
                .data(licores)
                .error(null)
                .build();
    }

    public GenericResponse getById(int idLicor) throws Exception {
        Licor licor = _licorRepository.findById(idLicor)
                .orElseThrow(() -> new Exception("Licor no encontrado"));
        return GenericResponse.builder()
                .data(licor)
                .error(null)
                .build();
    }

    public GenericResponse update(LicorDTO licorDTO) throws Exception {
        Licor licor = _licorRepository.findById(licorDTO.getIdLicor())
                .orElseThrow(() -> new Exception("Licor no encontrado"));
        licor.setNombreLicor(licorDTO.getNombreLicor());
        licor.setTipo(licorDTO.getTipo());
        licor = _licorRepository.save(licor);

        return GenericResponse.builder()
                .data(licor)
                .error(null)
                .build();
    }

    public GenericResponse delete(int idLicor) throws Exception {
        Licor licor = _licorRepository.findById(idLicor)
                .orElseThrow(() -> new Exception("Licor no encontrado"));
        _licorRepository.delete(licor);

        return GenericResponse.builder()
                .data("Licor eliminado correctamente")
                .error(null)
                .build();
    }
}

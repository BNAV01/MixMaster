package com.baresflix.api.services;

import com.baresflix.api.DTO.GenericResponse;
import com.baresflix.api.models.LicorIngrediente;
import com.baresflix.api.repository.ILicorIngredienteRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class LicorIngredienteService {
    private final ILicorIngredienteRepository licorIngredienteRepository;

    public LicorIngredienteService(ILicorIngredienteRepository licorIngredienteRepository) {
        this.licorIngredienteRepository = licorIngredienteRepository;
    }

    // Crear relación Licor-Ingrediente
    public GenericResponse create(LicorIngrediente licorIngrediente) {
        try {
            LicorIngrediente saved = licorIngredienteRepository.save(licorIngrediente);
            return GenericResponse.builder()
                    .data(saved)
                    .error(null)
                    .build();
        } catch (Exception e) {
            return GenericResponse.builder()
                    .data(null)
                    .error(e.getMessage())
                    .build();
        }
    }

    // Obtener todas las relaciones Licor-Ingrediente
    public GenericResponse getAll() {
        List<LicorIngrediente> relaciones = licorIngredienteRepository.findAll();
        return GenericResponse.builder()
                .data(relaciones)
                .error(null)
                .build();
    }

    // Obtener relación específica por ID
    public GenericResponse getById(int idRelacion) throws Exception {
        Optional<LicorIngrediente> relacion = licorIngredienteRepository.findById(idRelacion);
        if (relacion.isPresent()) {
            return GenericResponse.builder()
                    .data(relacion.get())
                    .error(null)
                    .build();
        }
        throw new Exception("Relación Licor-Ingrediente no encontrada");
    }

    // Eliminar relación Licor-Ingrediente
    public GenericResponse delete(int idRelacion) throws Exception {
        Optional<LicorIngrediente> relacion = licorIngredienteRepository.findById(idRelacion);
        if (relacion.isPresent()) {
            licorIngredienteRepository.delete(relacion.get());
            return GenericResponse.builder()
                    .data("Relación eliminada correctamente")
                    .error(null)
                    .build();
        }
        throw new Exception("Relación Licor-Ingrediente no encontrada");
    }
}

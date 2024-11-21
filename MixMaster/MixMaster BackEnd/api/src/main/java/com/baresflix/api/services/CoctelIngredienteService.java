package com.baresflix.api.services;

import com.baresflix.api.DTO.GenericResponse;
import com.baresflix.api.models.CoctelIngrediente;
import com.baresflix.api.repository.ICoctelIngredienteRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CoctelIngredienteService {
    private final ICoctelIngredienteRepository coctelIngredienteRepository;

    public CoctelIngredienteService(ICoctelIngredienteRepository coctelIngredienteRepository) {
        this.coctelIngredienteRepository = coctelIngredienteRepository;
    }

    // Crear una nueva relación Coctel-Ingrediente
    public GenericResponse create(CoctelIngrediente coctelIngrediente) {
        try {
            CoctelIngrediente saved = coctelIngredienteRepository.save(coctelIngrediente);
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

    // Obtener todas las relaciones Coctel-Ingrediente
    public GenericResponse getAll() {
        List<CoctelIngrediente> relaciones = coctelIngredienteRepository.findAll();
        return GenericResponse.builder()
                .data(relaciones)
                .error(null)
                .build();
    }

    // Obtener una relación específica por ID
    public GenericResponse getById(int idRelacion) throws Exception {
        Optional<CoctelIngrediente> relacion = coctelIngredienteRepository.findById(idRelacion);
        if (relacion.isPresent()) {
            return GenericResponse.builder()
                    .data(relacion.get())
                    .error(null)
                    .build();
        }
        throw new Exception("Relación Coctel-Ingrediente no encontrada");
    }

    // Eliminar una relación Coctel-Ingrediente por ID
    public GenericResponse delete(int idRelacion) throws Exception {
        Optional<CoctelIngrediente> relacion = coctelIngredienteRepository.findById(idRelacion);
        if (relacion.isPresent()) {
            coctelIngredienteRepository.delete(relacion.get());
            return GenericResponse.builder()
                    .data("Relación eliminada correctamente")
                    .error(null)
                    .build();
        }
        throw new Exception("Relación Coctel-Ingrediente no encontrada");
    }

    // Actualizar una relación Coctel-Ingrediente
    public GenericResponse update(int idRelacion, CoctelIngrediente coctelIngredienteActualizado) throws Exception {
        Optional<CoctelIngrediente> relacionExistente = coctelIngredienteRepository.findById(idRelacion);
        if (relacionExistente.isPresent()) {
            CoctelIngrediente relacion = relacionExistente.get();
            relacion.setCoctel(coctelIngredienteActualizado.getCoctel());
            relacion.setIngrediente(coctelIngredienteActualizado.getIngrediente());
            relacion.setCantidad(coctelIngredienteActualizado.getCantidad());
            CoctelIngrediente saved = coctelIngredienteRepository.save(relacion);
            return GenericResponse.builder()
                    .data(saved)
                    .error(null)
                    .build();
        }
        throw new Exception("Relación Coctel-Ingrediente no encontrada");
    }
}

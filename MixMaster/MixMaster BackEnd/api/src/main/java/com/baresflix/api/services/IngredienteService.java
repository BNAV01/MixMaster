package com.baresflix.api.services;

import com.baresflix.api.DTO.GenericResponse;
import com.baresflix.api.DTO.IngredienteDTO;
import com.baresflix.api.models.Ingrediente;
import com.baresflix.api.repository.IIngredienteRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class IngredienteService {
    private final IIngredienteRepository _ingredienteRepository;

    public IngredienteService(IIngredienteRepository ingredienteRepository) {
        this._ingredienteRepository = ingredienteRepository;
    }

    public GenericResponse create(IngredienteDTO ingredienteDTO) {
        Ingrediente ingrediente = Ingrediente.builder()
                .nombre(ingredienteDTO.getNombre())
                .build();
        ingrediente = _ingredienteRepository.save(ingrediente);

        return GenericResponse.builder()
                .data(ingrediente)
                .error(null)
                .build();
    }

    public GenericResponse getAll() {
        List<Ingrediente> ingredientes = _ingredienteRepository.findAll();
        return GenericResponse.builder()
                .data(ingredientes)
                .error(null)
                .build();
    }

    public GenericResponse getById(int idIngrediente) throws Exception {
        Ingrediente ingrediente = _ingredienteRepository.findById(idIngrediente)
                .orElseThrow(() -> new Exception("Ingrediente no encontrado"));
        return GenericResponse.builder()
                .data(ingrediente)
                .error(null)
                .build();
    }

    public GenericResponse update(IngredienteDTO ingredienteDTO) throws Exception {
        Ingrediente ingrediente = _ingredienteRepository.findById(ingredienteDTO.getIdIngrediente())
                .orElseThrow(() -> new Exception("Ingrediente no encontrado"));
        ingrediente.setNombre(ingredienteDTO.getNombre());
        ingrediente = _ingredienteRepository.save(ingrediente);

        return GenericResponse.builder()
                .data(ingrediente)
                .error(null)
                .build();
    }

    public GenericResponse delete(int idIngrediente) throws Exception {
        Ingrediente ingrediente = _ingredienteRepository.findById(idIngrediente)
                .orElseThrow(() -> new Exception("Ingrediente no encontrado"));
        _ingredienteRepository.delete(ingrediente);

        return GenericResponse.builder()
                .data("Ingrediente eliminado correctamente")
                .error(null)
                .build();
    }
}

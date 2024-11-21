package com.baresflix.api.repository;

import com.baresflix.api.models.Ingrediente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IIngredienteRepository extends JpaRepository<Ingrediente, Integer> {
    Optional<Ingrediente> findByIdIngrediente(int idIngrediente);
    List<Ingrediente> findAllByNombreContaining(String nombre);
}

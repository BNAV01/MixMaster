package com.baresflix.api.repository;

import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.baresflix.api.models.Valoraciones;

import java.util.List;
import java.util.Optional;

@Repository
public interface IValoracionesRepository extends JpaRepository<Valoraciones, Integer> {
    Optional<Valoraciones> findByIdValoracion(int idValoracion);




}

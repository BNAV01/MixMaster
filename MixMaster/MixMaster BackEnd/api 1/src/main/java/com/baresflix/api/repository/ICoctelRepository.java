package com.baresflix.api.repository;

import com.baresflix.api.models.Coctel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ICoctelRepository extends JpaRepository<Coctel, Integer> {
    Optional<Coctel> findByIdCoctel(int idCoctel);
    Optional<Coctel> findByNombreCoctel(String nombre);
    List<Coctel> findAllByNombreCoctelContaining(String nombre);
}

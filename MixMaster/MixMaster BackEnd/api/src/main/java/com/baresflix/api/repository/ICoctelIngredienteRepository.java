package com.baresflix.api.repository;

import com.baresflix.api.models.CoctelIngrediente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ICoctelIngredienteRepository extends JpaRepository<CoctelIngrediente, Integer> {
    List<CoctelIngrediente> findAllByCoctelIdCoctel(int idCoctel);
    List<CoctelIngrediente> findAllByIngredienteIdIngrediente(int idIngrediente);
    List<CoctelIngrediente> findAllByLicorIdLicor(int idLicor);
}

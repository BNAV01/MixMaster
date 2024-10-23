package com.baresflix.api.repository;

import com.baresflix.api.models.LicorIngrediente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ILicorIngredienteRepository extends JpaRepository<LicorIngrediente, Integer> {
    List<LicorIngrediente> findAllByLicorIdLicor(int idLicor);
    List<LicorIngrediente> findAllByIngredienteIdIngrediente(int idIngrediente);
}

package com.baresflix.api.repository;

import com.baresflix.api.models.Licor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ILicorRepository extends JpaRepository<Licor, Integer> {

    Optional<Licor> findByIdLicor(int idLicor);
    Optional<Licor> findByNombreLicor(String nombre);
    List<Licor> findAllByIdLicorIn(List<Integer> ids);
    List<Licor> findAllByNombreLicorContaining(String nombre);
    List<Licor> findAllByTipo(String tipo);
}

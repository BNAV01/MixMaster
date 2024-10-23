package com.baresflix.api.repository;

import com.baresflix.api.models.Preferencias;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IPreferenciasRepository extends JpaRepository<Preferencias, Integer>{

    Optional<Preferencias> findByIdPreferencia(int idPreferencia);
    List<Preferencias> findAllByIdPreferenciaIn(List<Integer> ids);
    List<Preferencias> findAllByUsuarioIdUsuario(int idUsuario);
    List<Preferencias> findAllByLicorIdLicor(int idLicor);
    List<Preferencias> findAllByCoctelIdCoctel(int idCoctel);


}

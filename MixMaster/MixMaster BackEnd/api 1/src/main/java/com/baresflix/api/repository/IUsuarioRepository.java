package com.baresflix.api.repository;

import com.baresflix.api.models.Usuario;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IUsuarioRepository extends JpaRepository<Usuario, Integer> {
    Optional<Usuario> findByEmail(String email);

    Optional<Usuario> findByRut(String rut);

    Optional<Usuario> findByIdUsuarioAndActivoIsTrue(int id);

    Optional<Usuario> findByIdUsuario(Integer integer);

    Optional<List<Usuario>> findAllByIdUsuarioIn(List<Integer> ids);

    Optional<Usuario> existsByEmail(String email);

}

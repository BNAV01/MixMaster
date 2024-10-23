package com.baresflix.api.services;

import com.baresflix.api.DTO.GenericResponse;
import com.baresflix.api.DTO.UsuarioDTO;
import com.baresflix.api.exceptions.UsuarioException;
import com.baresflix.api.models.Usuario;
import com.baresflix.api.mappers.UsuarioMapper;

import com.baresflix.api.repository.IPreferenciasRepository;
import com.baresflix.api.repository.IUsuarioRepository;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.text.MessageFormat;
import java.util.List;
import java.util.*;

import java.util.stream.Collectors;


@Service
public class UsuarioService {
    private IUsuarioRepository _usuarioRepository;
    private IPreferenciasRepository _preferenciasRepository;

    private UsuarioMapper _usuarioMapper;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    public UsuarioService(PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager, IUsuarioRepository _usuarioRepository) {
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this._usuarioRepository = _usuarioRepository;
    }

/*    public UsuarioDTO update(int idUsuario, UsuarioDTO usuarioDTO) throws UsuarioException {
        Optional<Usuario> usuario = _usuarioRepository.findByIdUsuario(idUsuario);
        if (usuario.isPresent()) {
            Usuario usuarioToUpdate = usuario.get();
            usuarioToUpdate.setNombre(usuarioDTO.getNombre());
            usuarioToUpdate.setApellidoP(usuarioDTO.getApellidoP());
            usuarioToUpdate.setApellidoM(usuarioDTO.getApellidoM());
            usuarioToUpdate.setTelefono(usuarioDTO.getTelefono());
            usuarioToUpdate.setEmail(usuarioDTO.getEmail());
            usuarioToUpdate.setClave(passwordEncoder.encode(usuarioDTO.getClave())); // Recomendación de seguridad

            return UsuarioDTO.builder()
                    .nombre(usuario.get().getNombre())
                    .apellidoP(usuario.get().getApellidoP())
                    .apellidoM(usuario.get().getApellidoM())
                    .telefono(usuario.get().getTelefono())
                    .email(usuario.get().getEmail())
                    .clave(usuario.get().getClave())
                    .build();

        } else {
            throw new UsuarioException("Usuario no encontrado");
        }
    }*/

/*    public UsuarioDTO softDelete(int idUsuario) throws UsuarioException {
        Optional<Usuario> usuario = _usuarioRepository.findByIdUsuario(idUsuario);
        if (usuario.isPresent()) {
            Usuario usuarioToDelete = usuario.get();
            usuarioToDelete.setActivo(false);  // Cambia el estado activo a falso en lugar de eliminar

            return UsuarioDTO.builder()
                    .activo(usuario.get().getActivo())
                    .build();
        } else {
            throw new UsuarioException("Usuario no encontrado");
        }
    }*/

    public GenericResponse softDelete(int idUsuario) throws UsuarioException{
        GenericResponse response;
        try {
            Usuario usuario = _usuarioRepository.findByIdUsuario(idUsuario).orElse(null);
            if (usuario == null)
                throw new UsuarioException(MessageFormat.format("Usuario {0} no encontrada o no existe ", idUsuario));
            if (!usuario.getActivo())
                throw new UsuarioException(MessageFormat.format("Usuario {0} actualmente no esta activo ", idUsuario));
            usuario.setActivo(false);
            usuario = _usuarioRepository.save(usuario);
            UsuarioDTO usuarioDTOResponse = _usuarioMapper.createDTO(usuario);
            response = GenericResponse.builder()
                    .data(usuarioDTOResponse)
                    .error(null)
                    .build();

        } catch (UsuarioException e) {
            response = GenericResponse.builder()
                    .data(null)
                    .error(e.getMessage())
                    .build();
        }
        return response;
    }

    public GenericResponse activeUser(int idUsuario) throws UsuarioException{
        GenericResponse response;
        try {
            Usuario usuario = _usuarioRepository.findByIdUsuario(idUsuario).orElse(null);
            if (usuario == null)
                throw new UsuarioException(MessageFormat.format("Usuario {0} no encontrada o no existe ", idUsuario));
            if (usuario.getActivo())
                throw new UsuarioException(MessageFormat.format("Usuario {0} actualmente esta activo ", idUsuario));
            usuario.setActivo(true);
            usuario = _usuarioRepository.save(usuario);
            UsuarioDTO usuarioDTOResponse = _usuarioMapper.createDTO(usuario);
            response = GenericResponse.builder()
                    .data(usuarioDTOResponse)
                    .error(null)
                    .build();
        } catch (UsuarioException e) {
            response = GenericResponse.builder()
                    .data(null)
                    .error(e.getMessage())
                    .build();
        }
        return response;
    }
    public GenericResponse update(UsuarioDTO usuarioDTO) throws UsuarioException{
        GenericResponse response;
        try {
            Usuario usuario = _usuarioRepository.findByIdUsuario(usuarioDTO.getIdUsuario()).orElse(null);
            if (usuario == null)
                throw new UsuarioException(MessageFormat.format("Usuario {0} no encontrada o no existe ", usuarioDTO.getNombre()));

            usuario.setNombre(usuarioDTO.getNombre());
            usuario.setApellidoP(usuarioDTO.getApellidoP());
            usuario.setApellidoM(usuarioDTO.getApellidoM());
            usuario.setTelefono(usuarioDTO.getTelefono());
            usuario.setEmail(usuarioDTO.getEmail());
            usuario.setFechaNacimiento(usuarioDTO.getFechaNacimiento());
            usuario.setFechaCreacion(usuarioDTO.getFechaCreacion());
            usuario.setActivo(usuarioDTO.isActivo());

            usuario = _usuarioRepository.save(usuario);
            UsuarioDTO usuarioDTOResponse = _usuarioMapper.createDTO(usuario);
            response = GenericResponse.builder()
                    .data(usuarioDTOResponse)
                    .error(null)
                    .build();

        } catch (UsuarioException e) {
            response = GenericResponse.builder()
                    .data(null)
                    .error(e.getMessage())
                    .build();
        }
        return response;
    }

/*    public UsuarioDTO create(UsuarioDTO usuarioDTO) {
        Usuario usuario = Usuario.builder()
                .rut(usuarioDTO.getRut())
                .nombre(usuarioDTO.getNombre())
                .apellidoP(usuarioDTO.getApellidoP())
                .apellidoM(usuarioDTO.getApellidoM())
                .telefono(usuarioDTO.getTelefono())
                .email(usuarioDTO.getEmail())
                .clave(usuarioDTO.getClave())
                .fechaNacimiento(usuarioDTO.getFechaNacimiento())
                .fechaCreacion(usuarioDTO.getFechaCreacion())
                .activo(usuarioDTO.isActivo())

                .build();

        usuario = _usuarioRepository.save(usuario);
        usuarioDTO.setIdUsuario(usuario.getIdUsuario());
        return usuarioDTO;
    }*/


    public GenericResponse create(UsuarioDTO usuarioDTO) {
        GenericResponse response;
        try {
            Usuario usuario = Usuario.builder()
                    .rut(usuarioDTO.getRut())
                    .nombre(usuarioDTO.getNombre())
                    .apellidoP(usuarioDTO.getApellidoP())
                    .apellidoM(usuarioDTO.getApellidoM())
                    .telefono(usuarioDTO.getTelefono())
                    .email(usuarioDTO.getEmail())
                    .clave(usuarioDTO.getClave())
                    .fechaNacimiento(usuarioDTO.getFechaNacimiento())
                    .fechaCreacion(usuarioDTO.getFechaCreacion())
                    .activo(usuarioDTO.isActivo())
                    .build();

            usuario = _usuarioRepository.save(usuario);
            UsuarioDTO usuarioDTOResponse = _usuarioMapper.createDTO(usuario);
            response = GenericResponse.builder()
                    .data(usuarioDTOResponse)
                    .error(null)
                    .build();
        } catch (Exception e) {
            response = GenericResponse.builder()
                    .data(null)
                    .error(e.getMessage())
                    .build();
        }
        return response;
    }
    public GenericResponse getAllUsuarios(){
        List<UsuarioDTO> usuarioDTOS = new ArrayList<>();
        List<Usuario> usuarios = this._usuarioRepository.findAll();
        for (Usuario usuario : usuarios){
            UsuarioDTO usuarioDTO = _usuarioMapper.createDTO(usuario);
            usuarioDTOS.add(usuarioDTO);
        }
        return GenericResponse.builder().data(usuarioDTOS).error(null).build();
    }


    public GenericResponse getById(int idUsuario) throws  UsuarioException{
        Usuario usuario = _usuarioRepository.findByIdUsuario(idUsuario).orElseThrow(() -> new UsuarioException("Usuario no encontrado"));
        UsuarioDTO usuarioDTO = _usuarioMapper.createDTO(usuario);

        return GenericResponse.builder().data(usuarioDTO).error(null).build();
    }

/*    public UsuarioDTO getById(int idUsuario) throws  UsuarioException{
        Optional<Usuario> usuario = _usuarioRepository.findByIdUsuario(idUsuario);
        if(usuario.isPresent()){
            return UsuarioDTO.builder()
                    .idUsuario(usuario.get().getIdUsuario())
                    .rut(usuario.get().getRut())
                    .nombre(usuario.get().getNombre())
                    .apellidoP(usuario.get().getApellidoP())
                    .apellidoM(usuario.get().getApellidoM())
                    .telefono(usuario.get().getTelefono())
                    .email(usuario.get().getEmail())
                    .build();
        } throw new UsuarioException("Usuario no encontrado");
    }*/

    public UsuarioDTO getByRut(String rut) throws  UsuarioException{
        Optional<Usuario> usuario = _usuarioRepository.findByRut(rut);
        if(usuario.isPresent()){
            return UsuarioDTO.builder()
                    .idUsuario(usuario.get().getIdUsuario())
                    .nombre(usuario.get().getNombre())
                    .apellidoP(usuario.get().getApellidoP())
                    .email(usuario.get().getEmail())
                    .build();
        } throw new UsuarioException("Usuario no encontrado");
    }

    public void delete(int idUsuario) throws UsuarioException {
        Optional<Usuario> usuario = _usuarioRepository.findByIdUsuario(idUsuario);
        if (usuario.isPresent()){
            _usuarioRepository.delete(usuario.get());

        }
        throw new UsuarioException("Usuario no encontrado");
    }
    
    public UsuarioDTO findUserActiveById(int idUsuario) throws UsuarioException {
        Optional<Usuario> usuario = _usuarioRepository.findByIdUsuarioAndActivoIsTrue(idUsuario);
        if (usuario.isPresent()) {
            if (usuario.get().getActivo()) {
                return UsuarioDTO.builder()
                        .idUsuario(usuario.get().getIdUsuario())
                        .nombre(usuario.get().getNombre())
                        .apellidoP(usuario.get().getApellidoP())
                        .email(usuario.get().getEmail())
                        .build();
            } else {
                throw new UsuarioException("Usuario no activo");
            }
        } else {
            throw new UsuarioException("Usuario no encontrado");
        }
    }




}


package com.baresflix.api.controllers;

import com.baresflix.api.DTO.UsuarioDTO;
import com.baresflix.api.exceptions.UsuarioException;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:4200")
@AllArgsConstructor
@RestController
@RequestMapping("/usuario")
public class UsuarioController {


    private final com.baresflix.api.services.UsuarioService _usuarioService;

    @GetMapping("")
    public ResponseEntity index()        {
        return new ResponseEntity("Hola mundo desde Usuario", HttpStatus.OK);
    }

    @GetMapping("/getById/{idUsuario}")
    public ResponseEntity getById(@PathVariable int idUsuario) throws UsuarioException {
        return new ResponseEntity(_usuarioService.getById(idUsuario), HttpStatus.OK);
    }

    @GetMapping("/getAll")
    public ResponseEntity getAllUsuarios() {
        return new ResponseEntity(_usuarioService.getAllUsuarios(), HttpStatus.OK);
    }

    @PostMapping("/create")
    public ResponseEntity postMapping(@RequestBody UsuarioDTO usuarioDTO){
        return new ResponseEntity(_usuarioService.create(usuarioDTO), HttpStatus.OK);
    }

    @PutMapping("/update/{idUsuario}")
    public ResponseEntity update(@RequestBody UsuarioDTO usuarioDTO) throws UsuarioException {
        return new ResponseEntity(_usuarioService.update(usuarioDTO), HttpStatus.OK);
    }

    @PutMapping("/inactive/{idUsuario}")
    public ResponseEntity softDelete(@PathVariable int idUsuario) throws  UsuarioException {
        return new ResponseEntity(_usuarioService.softDelete(idUsuario), HttpStatus.OK);
    }

    @PutMapping("/active/{idUsuario}")
    public ResponseEntity activeUser(@PathVariable int idUsuario) throws UsuarioException {
        return new ResponseEntity(_usuarioService.activeUser(idUsuario), HttpStatus.OK);
    }

    @DeleteMapping("/delete/{idUsuario}")
    public ResponseEntity delete(@PathVariable int idUsuario) throws UsuarioException {
        _usuarioService.delete(idUsuario);
        return new ResponseEntity(HttpStatus.OK);
    }

}





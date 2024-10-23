package com.baresflix.api.exceptions;


import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

public class RestExceptionHandler extends ResponseEntityExceptionHandler {

    @ExceptionHandler(UsuarioException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ResponseEntity<String> usuarioNotFoundException(UsuarioException usuarioException) {
        return new ResponseEntity<String>(usuarioException.getMessage(), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(CoctelException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ResponseEntity<String> coctelNotFoundException(CoctelException coctelException) {
        return new ResponseEntity<String>(coctelException.getMessage(), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(CoctelIngredienteException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ResponseEntity<String> coctelIngredienteNotFoundException(CoctelIngredienteException coctelIngredienteException) {
        return new ResponseEntity<String>(coctelIngredienteException.getMessage(), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(IngredienteException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ResponseEntity<String> ingredienteNotFoundException(IngredienteException ingredienteException) {
        return new ResponseEntity<String>(ingredienteException.getMessage(), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(LicorException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ResponseEntity<String> licorNotFoundException(LicorException licorException) {
        return new ResponseEntity<String>(licorException.getMessage(), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(LicorIngredienteException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ResponseEntity<String> licorIngredienteNotFoundException(LicorIngredienteException licorIngredienteException) {
        return new ResponseEntity<String>(licorIngredienteException.getMessage(), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(PreferenciasException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ResponseEntity<String> preferenciasNotFoundException(PreferenciasException preferenciasException) {
        return new ResponseEntity<String>(preferenciasException.getMessage(), HttpStatus.NOT_FOUND);
    }


}

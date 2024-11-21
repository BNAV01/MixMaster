package com.baresflix.api.exceptions;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class PreferenciasException extends Exception {
    public PreferenciasException(String message) {
        super(message);
    }
}

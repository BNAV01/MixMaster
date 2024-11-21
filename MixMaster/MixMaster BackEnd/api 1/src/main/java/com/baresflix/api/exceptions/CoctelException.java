package com.baresflix.api.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class CoctelException extends Exception {
    public CoctelException(String message) {
        super(message);
    }
}
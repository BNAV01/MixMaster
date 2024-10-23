package com.baresflix.api.exceptions;


public class JwtResponseException extends Exception {
    public JwtResponseException(String message) {
        super(message);
    }
}

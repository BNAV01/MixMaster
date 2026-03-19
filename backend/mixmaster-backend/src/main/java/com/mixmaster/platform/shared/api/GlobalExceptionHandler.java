package com.mixmaster.platform.shared.api;

import com.mixmaster.platform.interfaces.consumerweb.exceptions.ConsumerWebException;
import com.mixmaster.platform.interfaces.saasadmin.exceptions.SaasAdminException;
import com.mixmaster.platform.interfaces.tenantconsole.exceptions.TenantConsoleException;
import java.time.OffsetDateTime;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidation(MethodArgumentNotValidException exception) {
        return ResponseEntity.badRequest().body(new ApiErrorResponse(
            "VALIDATION_ERROR",
            exception.getMessage(),
            OffsetDateTime.now()
        ));
    }

    @ExceptionHandler({
        ConsumerWebException.class,
        TenantConsoleException.class,
        SaasAdminException.class,
        IllegalArgumentException.class
    })
    public ResponseEntity<ApiErrorResponse> handleBadRequest(RuntimeException exception) {
        return ResponseEntity.badRequest().body(new ApiErrorResponse(
            "BAD_REQUEST",
            exception.getMessage(),
            OffsetDateTime.now()
        ));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleGeneric(Exception exception) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiErrorResponse(
            "INTERNAL_ERROR",
            exception.getMessage(),
            OffsetDateTime.now()
        ));
    }
}

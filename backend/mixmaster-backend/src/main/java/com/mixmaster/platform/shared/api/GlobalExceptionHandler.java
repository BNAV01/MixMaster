package com.mixmaster.platform.shared.api;

import com.mixmaster.platform.interfaces.consumerweb.exceptions.ConsumerWebException;
import com.mixmaster.platform.interfaces.saasadmin.exceptions.SaasAdminException;
import com.mixmaster.platform.interfaces.tenantconsole.exceptions.TenantConsoleException;
import java.time.OffsetDateTime;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidation(MethodArgumentNotValidException exception) {
        String message = exception.getBindingResult().getFieldErrors().stream()
            .map(this::formatFieldValidationMessage)
            .distinct()
            .collect(Collectors.joining("; "));
        if (message.isBlank()) {
            message = "Validation failed for the request body.";
        }

        return ResponseEntity.badRequest().body(new ApiErrorResponse(
            "VALIDATION_ERROR",
            message,
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

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiErrorResponse> handleUnauthorized(BadCredentialsException exception) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ApiErrorResponse(
            "UNAUTHORIZED",
            exception.getMessage(),
            OffsetDateTime.now()
        ));
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiErrorResponse> handleAuthentication(AuthenticationException exception) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ApiErrorResponse(
            "UNAUTHORIZED",
            exception.getMessage(),
            OffsetDateTime.now()
        ));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiErrorResponse> handleForbidden(AccessDeniedException exception) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ApiErrorResponse(
            "FORBIDDEN",
            exception.getMessage(),
            OffsetDateTime.now()
        ));
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiErrorResponse> handleStatusException(ResponseStatusException exception) {
        String message = exception.getReason() != null ? exception.getReason() : exception.getMessage();
        return ResponseEntity.status(exception.getStatusCode()).body(new ApiErrorResponse(
            exception.getStatusCode().toString(),
            message,
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

    private String formatFieldValidationMessage(FieldError fieldError) {
        String defaultMessage = fieldError.getDefaultMessage() != null ? fieldError.getDefaultMessage() : "invalid value";
        return "%s: %s".formatted(fieldError.getField(), defaultMessage);
    }
}

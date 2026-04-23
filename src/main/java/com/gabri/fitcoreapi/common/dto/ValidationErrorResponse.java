package com.gabri.fitcoreapi.common.dto;

import java.time.Instant;
import java.util.Map;

public class ValidationErrorResponse extends ApiErrorResponse {

    private final Map<String, String> fieldErrors;

    public ValidationErrorResponse(
            Instant timestamp,
            int status,
            String error,
            String message,
            String path,
            Map<String, String> fieldErrors
    ) {
        super(timestamp, status, error, message, path);
        this.fieldErrors = fieldErrors;
    }

    public Map<String, String> getFieldErrors() {
        return fieldErrors;
    }
}
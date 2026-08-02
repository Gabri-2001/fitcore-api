package com.gabri.fitcoreapi.progress.web;

import com.gabri.fitcoreapi.progress.dto.CreateProgressRecordRequest;
import com.gabri.fitcoreapi.progress.dto.ProgressRecordResponse;
import com.gabri.fitcoreapi.progress.service.ProgressRecordService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/users/{userId}/progress-records")
@PreAuthorize("@userAccess.isCurrentUser(#userId)")
public class ProgressRecordController {

    private final ProgressRecordService service;

    public ProgressRecordController(ProgressRecordService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProgressRecordResponse create(@PathVariable Long userId,
            @Valid @RequestBody CreateProgressRecordRequest request) {
        return ProgressRecordResponse.from(service.create(userId, request));
    }

    @GetMapping
    public List<ProgressRecordResponse> find(
            @PathVariable Long userId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        return service.find(userId, from, to).stream().map(ProgressRecordResponse::from).toList();
    }
}

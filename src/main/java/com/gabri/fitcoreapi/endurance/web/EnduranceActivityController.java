package com.gabri.fitcoreapi.endurance.web;

import com.gabri.fitcoreapi.endurance.dto.CreateEnduranceActivityRequest;
import com.gabri.fitcoreapi.endurance.dto.EnduranceActivityResponse;
import com.gabri.fitcoreapi.endurance.service.EnduranceActivityService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/users/{userId}/endurance-activities")
@PreAuthorize("@userAccess.isCurrentUser(#userId)")
public class EnduranceActivityController {
    private final EnduranceActivityService service;
    public EnduranceActivityController(EnduranceActivityService service){this.service=service;}
    @PostMapping @ResponseStatus(HttpStatus.CREATED)
    public EnduranceActivityResponse create(@PathVariable Long userId,
        @Valid @RequestBody CreateEnduranceActivityRequest request) {
        return EnduranceActivityResponse.from(service.createManual(userId,request));
    }
    @GetMapping
    public List<EnduranceActivityResponse> list(@PathVariable Long userId) {
        return service.list(userId).stream().map(EnduranceActivityResponse::from).toList();
    }
    @GetMapping("/{id}")
    public EnduranceActivityResponse get(@PathVariable Long userId,@PathVariable Long id) {
        return EnduranceActivityResponse.from(service.find(userId,id));
    }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long userId,@PathVariable Long id) {
        service.delete(userId,id);
    }
}

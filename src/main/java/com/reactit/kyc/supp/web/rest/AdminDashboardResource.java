package com.reactit.kyc.supp.web.rest;

import com.reactit.kyc.supp.service.AdminDashboardService;
import com.reactit.kyc.supp.service.dto.AdminDashboardDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/dashboard")
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardResource {

    private final AdminDashboardService dashboardService;

    public AdminDashboardResource(AdminDashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public ResponseEntity<AdminDashboardDTO> getDashboard() {
        return ResponseEntity.ok(dashboardService.getDashboardData());
    }
}


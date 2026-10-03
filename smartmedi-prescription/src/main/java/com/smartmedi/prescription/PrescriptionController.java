package com.smartmedi.prescription;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prescriptions")
public class PrescriptionController {

    private final PrescriptionService service;

    public PrescriptionController(PrescriptionService service) {
        this.service = service;
    }

    // Get all prescriptions
    @GetMapping
    public List<Prescription> getAll() {
        return service.getAll();
    }

    // Get prescription by ID
    @GetMapping("/{id}")
    public Prescription getById(
            @PathVariable Long id) {

        return service.getById(id);
    }

    // Get prescription by QR code
    @GetMapping("/qr/{qrCode}")
    public Prescription getByQrCode(
            @PathVariable String qrCode) {

        return service.getByQrCode(qrCode);
    }

    // Create new prescription
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Prescription create(
            @Valid @RequestBody Prescription prescription) {

        return service.create(prescription);
    }

    // Update existing prescription
    @PutMapping("/{id}")
    public Prescription update(
            @PathVariable Long id,
            @Valid @RequestBody Prescription prescription) {

        return service.update(id, prescription);
    }

    // Approve prescription
    @PutMapping("/{id}/approve")
    public Prescription approve(
            @PathVariable Long id) {

        return service.approve(id);
    }

    // Delete prescription
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @PathVariable Long id) {

        service.delete(id);
    }

    // Dispense medicine
    @PutMapping("/{prescriptionId}/items/{itemId}/dispense")
    public Prescription dispense(
            @PathVariable Long prescriptionId,
            @PathVariable Long itemId,
            @RequestParam int quantity) {

        return service.dispense(
                prescriptionId,
                itemId,
                quantity
        );
    }
}
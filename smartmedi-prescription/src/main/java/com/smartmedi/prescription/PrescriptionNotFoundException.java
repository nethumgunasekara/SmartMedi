package com.smartmedi.prescription;

public class PrescriptionNotFoundException extends RuntimeException {

    public PrescriptionNotFoundException(Long id) {
        super("Prescription not found with id: " + id);
    }

    public PrescriptionNotFoundException(String qrCode) {
        super("Prescription not found with QR code: " + qrCode);
    }
}
package com.smartmedi.prescription;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;

import jakarta.persistence.*;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "prescriptions")
@JsonIdentityInfo(
        generator = ObjectIdGenerators.PropertyGenerator.class,
        property = "id"
)
public class Prescription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @NotBlank(message = "Patient name is required")
    @Column(nullable = false)
    private String patientName;


    @NotBlank(message = "Doctor name is required")
    @Column(nullable = false)
    private String doctorName;


    @NotNull(message = "Validity date is required")
    @Future(message = "Validity date must be in the future")
    private LocalDate validUntil;


    @Enumerated(EnumType.STRING)
    private PrescriptionStatus status =
            PrescriptionStatus.NEW;


    @Column(unique = true, updatable = false)
    private String qrCode;


    @Column(length = 100)
    private String safetyWarningType;


    @Column(length = 1000)
    private String safetyWarningDescription;


    @OneToMany(
            mappedBy = "prescription",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<PrescriptionItem> items =
            new ArrayList<>();


    public Prescription() {
    }


    public Long getId() {
        return id;
    }


    public void setId(Long id) {
        this.id = id;
    }


    public String getPatientName() {
        return patientName;
    }


    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }


    public String getDoctorName() {
        return doctorName;
    }


    public void setDoctorName(String doctorName) {
        this.doctorName = doctorName;
    }


    public LocalDate getValidUntil() {
        return validUntil;
    }


    public void setValidUntil(LocalDate validUntil) {
        this.validUntil = validUntil;
    }


    public PrescriptionStatus getStatus() {
        return status;
    }


    public void setStatus(PrescriptionStatus status) {
        this.status = status;
    }


    public String getQrCode() {
        return qrCode;
    }


    public void setQrCode(String qrCode) {
        this.qrCode = qrCode;
    }


    public String getSafetyWarningType() {
        return safetyWarningType;
    }


    public void setSafetyWarningType(
            String safetyWarningType) {

        this.safetyWarningType =
                safetyWarningType;
    }


    public String getSafetyWarningDescription() {
        return safetyWarningDescription;
    }


    public void setSafetyWarningDescription(
            String safetyWarningDescription) {

        this.safetyWarningDescription =
                safetyWarningDescription;
    }


    public List<PrescriptionItem> getItems() {
        return items;
    }


    public void setItems(
            List<PrescriptionItem> items) {

        this.items = items;

        if (items != null) {

            for (PrescriptionItem item : items) {

                item.setPrescription(this);
            }
        }
    }


    // Helper method to add an item
    public void addItem(
            PrescriptionItem item) {

        items.add(item);

        item.setPrescription(this);
    }


    // Helper method to remove an item
    public void removeItem(
            PrescriptionItem item) {

        items.remove(item);

        item.setPrescription(null);
    }
}
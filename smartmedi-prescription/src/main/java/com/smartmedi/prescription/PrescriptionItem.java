package com.smartmedi.prescription;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class PrescriptionItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    // Connects the item to its prescription
    // Ignore this side when converting to JSON
    // to avoid circular JSON references.
    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "prescription_id")
    private Prescription prescription;


    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "medicine_id")
    private Medicine medicine;


    private String dosage;

    private String frequency;

    private int durationDays;

    private int quantityPrescribed;

    private int remainingQuantity;


    public PrescriptionItem() {
    }


    public Long getId() {
        return id;
    }


    public void setId(Long id) {
        this.id = id;
    }


    public Prescription getPrescription() {
        return prescription;
    }


    public void setPrescription(
            Prescription prescription) {

        this.prescription = prescription;
    }


    public Medicine getMedicine() {
        return medicine;
    }


    public void setMedicine(Medicine medicine) {
        this.medicine = medicine;
    }


    public String getDosage() {
        return dosage;
    }


    public void setDosage(String dosage) {
        this.dosage = dosage;
    }


    public String getFrequency() {
        return frequency;
    }


    public void setFrequency(String frequency) {
        this.frequency = frequency;
    }


    public int getDurationDays() {
        return durationDays;
    }


    public void setDurationDays(int durationDays) {
        this.durationDays = durationDays;
    }


    public int getQuantityPrescribed() {
        return quantityPrescribed;
    }


    public void setQuantityPrescribed(
            int quantityPrescribed) {

        this.quantityPrescribed =
                quantityPrescribed;
    }


    public int getRemainingQuantity() {
        return remainingQuantity;
    }


    public void setRemainingQuantity(
            int remainingQuantity) {

        this.remainingQuantity =
                remainingQuantity;
    }
}
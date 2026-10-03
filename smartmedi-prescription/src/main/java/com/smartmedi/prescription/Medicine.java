package com.smartmedi.prescription;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;

@Entity
public class Medicine {

    @Id
    private String medicineId;

    private String name;

    private String brand;

    private double unitPrice;


    public Medicine() {
    }


    public String getMedicineId() {
        return medicineId;
    }


    public void setMedicineId(String medicineId) {
        this.medicineId = medicineId;
    }


    public String getName() {
        return name;
    }


    public void setName(String name) {
        this.name = name;
    }


    public String getBrand() {
        return brand;
    }


    public void setBrand(String brand) {
        this.brand = brand;
    }


    public double getUnitPrice() {
        return unitPrice;
    }


    public void setUnitPrice(double unitPrice) {
        this.unitPrice = unitPrice;
    }


    public boolean checkAvailability() {
        return true;
    }
}
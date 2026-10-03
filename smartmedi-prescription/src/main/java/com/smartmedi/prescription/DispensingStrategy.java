package com.smartmedi.prescription;

public interface DispensingStrategy {

    void dispense(
            PrescriptionItem item,
            int quantity
    );
}
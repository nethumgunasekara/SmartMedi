package com.smartmedi.prescription;

import org.springframework.stereotype.Component;

@Component
public class FullDispensing implements DispensingStrategy {

    @Override
    public void dispense(
            PrescriptionItem item,
            int quantity) {

        item.setRemainingQuantity(0);
    }
}
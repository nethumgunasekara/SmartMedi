package com.smartmedi.prescription;

import org.springframework.stereotype.Component;

@Component
public class PartialDispensing implements DispensingStrategy {

    @Override
    public void dispense(
            PrescriptionItem item,
            int quantity) {

        item.setRemainingQuantity(
                item.getRemainingQuantity() - quantity
        );
    }
}
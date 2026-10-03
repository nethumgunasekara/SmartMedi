package com.smartmedi.prescription;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class PrescriptionService {

    private final PrescriptionRepository repository;

    private final PartialDispensing partialDispensing;
    private final FullDispensing fullDispensing;

    public PrescriptionService(
            PrescriptionRepository repository,
            PartialDispensing partialDispensing,
            FullDispensing fullDispensing) {

        this.repository = repository;
        this.partialDispensing = partialDispensing;
        this.fullDispensing = fullDispensing;
    }

    // Get all prescriptions
    public List<Prescription> getAll() {

        return repository.findAll();
    }

    // Get prescription by ID
    public Prescription getById(Long id) {

        return repository.findById(id)
                .orElseThrow(() ->
                        new PrescriptionNotFoundException(id));
    }

    // Get prescription by QR code
    public Prescription getByQrCode(String qrCode) {

        return repository.findByQrCode(qrCode)
                .orElseThrow(() ->
                        new PrescriptionNotFoundException(qrCode));
    }

    // Create prescription
    public Prescription create(Prescription prescription) {

        // New prescription must have no ID
        prescription.setId(null);

        prescription.setStatus(
                PrescriptionStatus.NEW
        );

        prescription.setQrCode(
                generateQrCode()
        );

        for (PrescriptionItem item :
                prescription.getItems()) {

            // New item must have no ID
            item.setId(null);

            item.setRemainingQuantity(
                    item.getQuantityPrescribed()
            );
        }

        return repository.save(prescription);
    }

    // Update prescription
    @Transactional
    public Prescription update(
            Long id,
            Prescription updated) {

        // Get the existing prescription
        Prescription existing =
                repository.findById(id)
                        .orElseThrow(() ->
                                new PrescriptionNotFoundException(id));


        // -------------------------------------------------
        // Update prescription details
        // -------------------------------------------------

        existing.setPatientName(
                updated.getPatientName()
        );

        existing.setDoctorName(
                updated.getDoctorName()
        );

        existing.setValidUntil(
                updated.getValidUntil()
        );

        existing.setSafetyWarningType(
                updated.getSafetyWarningType()
        );

        existing.setSafetyWarningDescription(
                updated.getSafetyWarningDescription()
        );


        // -------------------------------------------------
        // Existing and updated prescription items
        // -------------------------------------------------

        List<PrescriptionItem> oldItems =
                existing.getItems();

        List<PrescriptionItem> newItems =
                updated.getItems();


        // -------------------------------------------------
        // Update existing items or add new items
        // -------------------------------------------------

        for (PrescriptionItem newItem : newItems) {

            PrescriptionItem existingItem = null;


            // Find existing item by ID
            if (newItem.getId() != null) {

                for (PrescriptionItem oldItem : oldItems) {

                    if (
                            oldItem.getId() != null &&
                                    oldItem.getId().equals(
                                            newItem.getId()
                                    )
                    ) {

                        existingItem = oldItem;

                        break;
                    }
                }
            }


            // -------------------------------------------------
            // EXISTING ITEM
            // -------------------------------------------------

            if (existingItem != null) {

                // Keep existing PrescriptionItem ID.
                // Do NOT set the ID to null.

                existingItem.setDosage(
                        newItem.getDosage()
                );

                existingItem.setFrequency(
                        newItem.getFrequency()
                );

                existingItem.setDurationDays(
                        newItem.getDurationDays()
                );

                existingItem.setQuantityPrescribed(
                        newItem.getQuantityPrescribed()
                );


                // Update medicine details
                if (
                        existingItem.getMedicine() != null &&
                                newItem.getMedicine() != null
                ) {

                    existingItem.getMedicine().setName(
                            newItem.getMedicine().getName()
                    );

                    existingItem.getMedicine().setBrand(
                            newItem.getMedicine().getBrand()
                    );

                    existingItem.getMedicine().setUnitPrice(
                            newItem.getMedicine().getUnitPrice()
                    );
                }
            }


            // -------------------------------------------------
            // NEW ITEM
            // -------------------------------------------------

            else {

                // This is a new PrescriptionItem.
                // JPA will generate a new ID.

                newItem.setId(null);

                newItem.setRemainingQuantity(
                        newItem.getQuantityPrescribed()
                );

                oldItems.add(newItem);
            }
        }


        // -------------------------------------------------
        // Remove items deleted from edit form
        // -------------------------------------------------

        oldItems.removeIf(oldItem -> {

            if (oldItem.getId() == null) {
                return false;
            }


            for (PrescriptionItem newItem : newItems) {

                if (
                        newItem.getId() != null &&
                                newItem.getId().equals(
                                        oldItem.getId()
                                )
                ) {

                    return false;
                }
            }


            return true;
        });


        // -------------------------------------------------
        // Save EXISTING prescription
        // -------------------------------------------------

        return repository.save(existing);
    }


    // Delete prescription
    public void delete(Long id) {

        Prescription existing =
                getById(id);

        repository.delete(existing);
    }


    // Approve prescription
    public Prescription approve(Long id) {

        Prescription prescription =
                getById(id);

        if (prescription.getStatus() !=
                PrescriptionStatus.NEW) {

            throw new RuntimeException(
                    "Only new prescriptions can be approved"
            );
        }

        prescription.setStatus(
                PrescriptionStatus.APPROVED
        );

        return repository.save(
                prescription
        );
    }


    // Dispense medicine
    public Prescription dispense(
            Long prescriptionId,
            Long itemId,
            int quantity) {

        Prescription prescription =
                getById(prescriptionId);


        // Check expiry
        if (LocalDate.now().isAfter(
                prescription.getValidUntil())) {

            prescription.setStatus(
                    PrescriptionStatus.EXPIRED
            );

            repository.save(
                    prescription
            );

            throw new RuntimeException(
                    "Prescription has expired and cannot be dispensed"
            );
        }


        // Check cancelled prescription
        if (prescription.getStatus() ==
                PrescriptionStatus.CANCELLED) {

            throw new RuntimeException(
                    "Cancelled prescription cannot be dispensed"
            );
        }


        // Check already fully dispensed
        if (prescription.getStatus() ==
                PrescriptionStatus.FULLY_DISPENSED) {

            throw new RuntimeException(
                    "Prescription is already fully dispensed"
            );
        }


        // Check approval
        if (
                prescription.getStatus() !=
                        PrescriptionStatus.APPROVED
                        &&
                        prescription.getStatus() !=
                                PrescriptionStatus.PARTIALLY_DISPENSED
        ) {

            throw new RuntimeException(
                    "Prescription must be approved before dispensing"
            );
        }


        // Check quantity
        if (quantity <= 0) {

            throw new RuntimeException(
                    "Dispense quantity must be greater than 0"
            );
        }


        PrescriptionItem selectedItem =
                null;


        // Find medicine item
        for (PrescriptionItem item :
                prescription.getItems()) {

            if (item.getId().equals(itemId)) {

                selectedItem = item;

                break;
            }
        }


        if (selectedItem == null) {

            throw new RuntimeException(
                    "Prescription item not found"
            );
        }


        // Check remaining quantity
        if (
                quantity >
                        selectedItem.getRemainingQuantity()
        ) {

            throw new RuntimeException(
                    "Dispense quantity exceeds remaining quantity"
            );
        }


        /*
         * Strategy Pattern
         */

        if (
                quantity ==
                        selectedItem.getRemainingQuantity()
        ) {

            fullDispensing.dispense(
                    selectedItem,
                    quantity
            );

        } else {

            partialDispensing.dispense(
                    selectedItem,
                    quantity
            );
        }


        // Check whether all medicines are finished
        boolean allFinished = true;


        for (PrescriptionItem item :
                prescription.getItems()) {

            if (item.getRemainingQuantity() > 0) {

                allFinished = false;

                break;
            }
        }


        if (allFinished) {

            prescription.setStatus(
                    PrescriptionStatus.FULLY_DISPENSED
            );

        } else {

            prescription.setStatus(
                    PrescriptionStatus.PARTIALLY_DISPENSED
            );
        }


        return repository.save(
                prescription
        );
    }


    // Generate QR code
    private String generateQrCode() {

        return "RX-" +
                UUID.randomUUID()
                        .toString()
                        .substring(0, 8)
                        .toUpperCase();
    }
}
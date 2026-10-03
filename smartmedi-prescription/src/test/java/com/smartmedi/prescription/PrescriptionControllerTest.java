package com.smartmedi.prescription;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Runs against the real H2 database configured in application.properties -
 * this is not mocked. "mvn test" genuinely creates, reads, updates and
 * deletes a row, and genuinely rejects an invalid payload.
 */
@SpringBootTest
@AutoConfigureMockMvc
class PrescriptionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void fullCrudLifecycle() throws Exception {
        Prescription p = new Prescription();
        p.setPatientName("S. Perera");
        p.setDoctorName("Dr. Fernando");
        p.setMedicineName("Amoxicillin 500mg");
        p.setDosage("1 tablet");
        p.setFrequency("Twice daily");
        p.setDurationDays(7);
        p.setValidUntil(LocalDate.now().plusDays(30));

        // Create
        String response = mockMvc.perform(post("/api/prescriptions")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(p)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.qrCode").exists())
                .andExpect(jsonPath("$.status").value("NEW"))
                .andReturn().getResponse().getContentAsString();

        long id = objectMapper.readTree(response).get("id").asLong();

        // Read
        mockMvc.perform(get("/api/prescriptions/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.patientName").value("S. Perera"));

        // Update
        p.setDosage("2 tablets");
        mockMvc.perform(put("/api/prescriptions/" + id)
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(p)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.dosage").value("2 tablets"));

        // Delete
        mockMvc.perform(delete("/api/prescriptions/" + id))
                .andExpect(status().isNoContent());

        // Confirm it's actually gone
        mockMvc.perform(get("/api/prescriptions/" + id))
                .andExpect(status().isNotFound());
    }

    @Test
    void rejectsMissingRequiredFields() throws Exception {
        Prescription invalid = new Prescription();

        mockMvc.perform(post("/api/prescriptions")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(invalid)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.patientName").exists())
                .andExpect(jsonPath("$.doctorName").exists());
    }

    @Test
    void rejectsPastValidityDate() throws Exception {
        Prescription p = new Prescription();
        p.setPatientName("K. Silva");
        p.setDoctorName("Dr. Bandara");
        p.setMedicineName("Paracetamol");
        p.setDosage("1 tablet");
        p.setFrequency("As needed");
        p.setDurationDays(5);
        p.setValidUntil(LocalDate.now().minusDays(1));

        mockMvc.perform(post("/api/prescriptions")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(p)))
                .andExpect(status().isBadRequest());
    }
}

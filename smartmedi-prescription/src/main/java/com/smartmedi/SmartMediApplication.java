package com.smartmedi;

import com.smartmedi.prescription.User;
import com.smartmedi.prescription.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class SmartMediApplication {

    public static void main(String[] args) {
        SpringApplication.run(SmartMediApplication.class, args);
    }

    @Bean
    CommandLineRunner seedUsers(UserRepository userRepository) {

        return args -> {

            if (userRepository.findByEmailAndPassword(
                    "doctor@smartmedi.com", "1234").isEmpty()) {

                userRepository.save(
                        new User(
                                "Dr. Sahan Wijeratne",
                                "doctor@smartmedi.com",
                                "1234",
                                "DOCTOR"
                        )
                );
            }

            if (userRepository.findByEmailAndPassword(
                    "pharmacist@smartmedi.com", "1234").isEmpty()) {

                userRepository.save(
                        new User(
                                "Nadeesha Fernando",
                                "pharmacist@smartmedi.com",
                                "1234",
                                "PHARMACIST"
                        )
                );
            }
        };
    }
}
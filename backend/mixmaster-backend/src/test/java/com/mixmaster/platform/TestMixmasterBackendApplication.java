package com.mixmaster.platform;

import org.springframework.boot.SpringApplication;

public class TestMixmasterBackendApplication {

    public static void main(String[] args) {
        SpringApplication.from(MixmasterBackendApplication::main)
            .with(TestcontainersConfiguration.class)
            .run(args);
    }
}

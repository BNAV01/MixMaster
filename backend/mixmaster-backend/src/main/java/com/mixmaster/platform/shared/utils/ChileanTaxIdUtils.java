package com.mixmaster.platform.shared.utils;

import java.util.Locale;

public final class ChileanTaxIdUtils {

    private ChileanTaxIdUtils() {
    }

    public static String normalize(String rawValue) {
        if (rawValue == null) {
            return null;
        }

        String compact = rawValue.trim().replace(".", "").replace("-", "").toUpperCase(Locale.ROOT);
        if (compact.isBlank()) {
            return null;
        }

        if (compact.length() < 2) {
            throw new IllegalArgumentException("RUT must include body and verifier digit");
        }

        String body = compact.substring(0, compact.length() - 1);
        String verifier = compact.substring(compact.length() - 1);

        if (!body.chars().allMatch(Character::isDigit)) {
            throw new IllegalArgumentException("RUT body must be numeric");
        }

        if (!verifier.matches("[0-9K]")) {
            throw new IllegalArgumentException("RUT verifier digit is invalid");
        }

        return Integer.parseInt(body) + "-" + verifier;
    }

    public static void validate(String rawValue, String fieldLabel) {
        String normalized = normalize(rawValue);
        if (normalized == null) {
            return;
        }

        String body = normalized.substring(0, normalized.length() - 2);
        String expectedVerifier = normalized.substring(normalized.length() - 1);
        String actualVerifier = computeVerifierDigit(Integer.parseInt(body));

        if (!actualVerifier.equals(expectedVerifier)) {
            throw new IllegalArgumentException(fieldLabel + " is not a valid Chilean RUT");
        }
    }

    private static String computeVerifierDigit(int body) {
        int multiplier = 2;
        int sum = 0;
        int workingValue = body;

        while (workingValue > 0) {
            sum += (workingValue % 10) * multiplier;
            workingValue /= 10;
            multiplier = multiplier == 7 ? 2 : multiplier + 1;
        }

        int remainder = 11 - (sum % 11);
        return switch (remainder) {
            case 11 -> "0";
            case 10 -> "K";
            default -> String.valueOf(remainder);
        };
    }
}

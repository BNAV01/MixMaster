package com.mixmaster.platform.modules.identity.auth.services;

import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import org.springframework.stereotype.Service;

@Service
public class CredentialSecurityService {

    private static final String LOWERCASE = "abcdefghijkmnopqrstuvwxyz";
    private static final String UPPERCASE = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    private static final String DIGITS = "23456789";
    private static final String SPECIAL = "!@#$%^&*()-_=+?";
    private static final String ALL = LOWERCASE + UPPERCASE + DIGITS + SPECIAL;
    private static final int MIN_PASSWORD_LENGTH = 12;
    private static final int GENERATED_PASSWORD_LENGTH = 20;

    private final SecureRandom secureRandom = new SecureRandom();

    public BootstrapCredential issueBootstrapCredential(String suggestedPassword, String email, String fullName) {
        if (suggestedPassword != null && !suggestedPassword.isBlank()) {
            validatePassword(suggestedPassword, email, fullName);
            return new BootstrapCredential(suggestedPassword, false);
        }

        return new BootstrapCredential(generateStrongPassword(), true);
    }

    public void validatePassword(String password, String email, String fullName) {
        if (password == null || password.isBlank()) {
            throw new IllegalArgumentException("A password is required");
        }

        if (password.length() < MIN_PASSWORD_LENGTH || password.length() > 128) {
            throw new IllegalArgumentException("Password must be between 12 and 128 characters");
        }

        if (password.chars().noneMatch(Character::isLowerCase)) {
            throw new IllegalArgumentException("Password must include at least one lowercase letter");
        }

        if (password.chars().noneMatch(Character::isUpperCase)) {
            throw new IllegalArgumentException("Password must include at least one uppercase letter");
        }

        if (password.chars().noneMatch(Character::isDigit)) {
            throw new IllegalArgumentException("Password must include at least one number");
        }

        if (password.chars().noneMatch(character -> SPECIAL.indexOf(character) >= 0)) {
            throw new IllegalArgumentException("Password must include at least one special character");
        }

        String normalizedPassword = password.toLowerCase(Locale.ROOT);
        for (String fragment : sensitiveFragments(email, fullName)) {
            if (fragment.length() >= 3 && normalizedPassword.contains(fragment)) {
                throw new IllegalArgumentException("Password cannot contain parts of the user's identity");
            }
        }
    }

    private String generateStrongPassword() {
        List<Character> characters = new ArrayList<>(List.of(
            randomCharacter(LOWERCASE),
            randomCharacter(UPPERCASE),
            randomCharacter(DIGITS),
            randomCharacter(SPECIAL)
        ));

        while (characters.size() < GENERATED_PASSWORD_LENGTH) {
            characters.add(randomCharacter(ALL));
        }

        for (int index = characters.size() - 1; index > 0; index--) {
            int swapIndex = secureRandom.nextInt(index + 1);
            char current = characters.get(index);
            characters.set(index, characters.get(swapIndex));
            characters.set(swapIndex, current);
        }

        StringBuilder builder = new StringBuilder(GENERATED_PASSWORD_LENGTH);
        for (char character : characters) {
            builder.append(character);
        }
        return builder.toString();
    }

    private char randomCharacter(String alphabet) {
        return alphabet.charAt(secureRandom.nextInt(alphabet.length()));
    }

    private List<String> sensitiveFragments(String email, String fullName) {
        List<String> fragments = new ArrayList<>();
        if (email != null) {
            String localPart = email.trim().toLowerCase(Locale.ROOT);
            int separatorIndex = localPart.indexOf('@');
            if (separatorIndex >= 0) {
                localPart = localPart.substring(0, separatorIndex);
            }

            for (String token : localPart.split("[._\\-]+")) {
                if (!token.isBlank()) {
                    fragments.add(token);
                }
            }
        }

        if (fullName != null) {
            for (String token : fullName.trim().toLowerCase(Locale.ROOT).split("\\s+")) {
                if (!token.isBlank()) {
                    fragments.add(token);
                }
            }
        }
        return fragments;
    }

    public record BootstrapCredential(
        String password,
        boolean generated
    ) {
    }
}

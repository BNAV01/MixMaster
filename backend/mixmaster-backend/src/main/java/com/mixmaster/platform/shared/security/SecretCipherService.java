package com.mixmaster.platform.shared.security;

import com.mixmaster.platform.shared.config.ApplicationProperties;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;
import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.stereotype.Service;

@Service
public class SecretCipherService {

    private static final int GCM_TAG_LENGTH_BITS = 128;
    private static final int IV_LENGTH_BYTES = 12;

    private final byte[] keyBytes;
    private final SecureRandom secureRandom = new SecureRandom();

    public SecretCipherService(ApplicationProperties applicationProperties) {
        String rawKey = applicationProperties.getSecurity().getSecrets().getEncryptionKey();
        if (rawKey == null || rawKey.isBlank()) {
            throw new IllegalStateException("MIXMASTER_ENCRYPTION_KEY is required to protect encrypted secrets");
        }

        try {
            this.keyBytes = MessageDigest.getInstance("SHA-256").digest(rawKey.getBytes(StandardCharsets.UTF_8));
        } catch (Exception exception) {
            throw new IllegalStateException("Encryption key could not be initialized", exception);
        }
    }

    public String encrypt(String plaintext) {
        try {
            byte[] iv = new byte[IV_LENGTH_BYTES];
            secureRandom.nextBytes(iv);

            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.ENCRYPT_MODE, new SecretKeySpec(keyBytes, "AES"), new GCMParameterSpec(GCM_TAG_LENGTH_BITS, iv));

            byte[] encrypted = cipher.doFinal(plaintext.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(iv) + ":" + Base64.getEncoder().encodeToString(encrypted);
        } catch (Exception exception) {
            throw new IllegalStateException("Secret could not be encrypted", exception);
        }
    }

    public String decrypt(String encryptedValue) {
        try {
            String[] pieces = encryptedValue.split(":", 2);
            if (pieces.length != 2) {
                throw new IllegalArgumentException("Encrypted secret format is invalid");
            }

            byte[] iv = Base64.getDecoder().decode(pieces[0]);
            byte[] ciphertext = Base64.getDecoder().decode(pieces[1]);

            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.DECRYPT_MODE, new SecretKeySpec(keyBytes, "AES"), new GCMParameterSpec(GCM_TAG_LENGTH_BITS, iv));
            byte[] decrypted = cipher.doFinal(ciphertext);
            return new String(decrypted, StandardCharsets.UTF_8);
        } catch (Exception exception) {
            throw new IllegalStateException("Secret could not be decrypted", exception);
        }
    }
}

package com.mixmaster.platform.shared.utils;

import java.math.BigInteger;
import java.security.SecureRandom;

public final class UlidGenerator {

    private static final char[] ENCODING = "0123456789ABCDEFGHJKMNPQRSTVWXYZ".toCharArray();
    private static final BigInteger BASE = BigInteger.valueOf(32L);
    private static final SecureRandom RANDOM = new SecureRandom();

    private UlidGenerator() {
    }

    public static String nextUlid() {
        byte[] bytes = new byte[16];
        long timestamp = System.currentTimeMillis();

        for (int index = 5; index >= 0; index--) {
            bytes[index] = (byte) (timestamp & 0xFF);
            timestamp >>>= 8;
        }

        byte[] randomness = new byte[10];
        RANDOM.nextBytes(randomness);
        System.arraycopy(randomness, 0, bytes, 6, randomness.length);

        BigInteger value = new BigInteger(1, bytes);
        char[] result = new char[26];

        for (int index = result.length - 1; index >= 0; index--) {
            BigInteger[] division = value.divideAndRemainder(BASE);
            result[index] = ENCODING[division[1].intValue()];
            value = division[0];
        }

        return new String(result);
    }
}

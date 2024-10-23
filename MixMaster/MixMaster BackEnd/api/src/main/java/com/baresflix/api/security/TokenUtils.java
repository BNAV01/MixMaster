package com.baresflix.api.security;

import com.baresflix.api.exceptions.JwtResponseException;
import com.baresflix.api.models.Usuario;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.apache.tomcat.util.codec.binary.Base64;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
public class TokenUtils {
    @Value("${app.jwt.secret_token}")
    public String SECRET_KEY;
    @Value("${app.jwt.access_token_validity_in_minutes}")
    public int ACCESS_TOKEN_VALIDITY_SECOND = 0;
    @Value("${app.jwt.issuedBy}")
    public String ISSUED_BY;

    public TokenUtils() {}

    public String createToken(Usuario user) {
        long expirationTime = (long) ACCESS_TOKEN_VALIDITY_SECOND * 60 * 1000;
        Date expirationDate = new Date(System.currentTimeMillis() + expirationTime);

        Map<String, Object> extraClaims = new HashMap<>();

        extraClaims.put("idUsuario", user.getIdUsuario());
        extraClaims.put("rut", user.getRut());
        extraClaims.put("nombre", user.getNombre());
        extraClaims.put("apellidoP", user.getApellidoP());
        extraClaims.put("apellidoM", user.getApellidoM());
        extraClaims.put("telefono", user.getTelefono());
        extraClaims.put("email", user.getEmail());
        extraClaims.put("clave", user.getClave());
        extraClaims.put("fechaNacimiento", user.getFechaNacimiento());
        extraClaims.put("fechaCreacion", user.getFechaCreacion());
        extraClaims.put("activo", user.getActivo());




        return Jwts.builder()
                .setSubject(user.getEmail())
                .setExpiration(expirationDate)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setIssuer(ISSUED_BY)
                .addClaims(extraClaims)
                .signWith(SignatureAlgorithm.HS256, Keys.hmacShaKeyFor(SECRET_KEY.getBytes(StandardCharsets.UTF_8)))
                .compact();
    }

    public String createRefreshToken() {
        UUID token = UUID.randomUUID();
        return Base64.encodeBase64String(token.toString().getBytes());
    }

    public String extractEmail(String token) throws JwtResponseException {
        try {
            Claims decryptedToken = Jwts.parser()
                    .setSigningKey(SECRET_KEY.getBytes(StandardCharsets.UTF_8))
                    .parseClaimsJws(token.trim())
                    .getBody();
            return decryptedToken.getSubject();
        } catch (Exception e) {
            throw new JwtResponseException("Invalid token");
        }
    }

    public UsernamePasswordAuthenticationToken getAuthentication(String token) {
        try {
            Claims claims = Jwts.parser()
                    .setSigningKey(SECRET_KEY.getBytes(StandardCharsets.UTF_8))
                    .parseClaimsJws(token)
                    .getBody();

            String email = claims.getSubject();
            return new UsernamePasswordAuthenticationToken(email, null, Collections.emptyList());
        } catch (JwtException e) {
            return null;
        }
    }

    public Boolean validateJwtToken(String authToken) throws JwtResponseException {
        try {
            Jwts.parser()
                    .setSigningKey(SECRET_KEY.getBytes(StandardCharsets.UTF_8))
                    .parseClaimsJws(authToken);
            return true;
        } catch (SignatureException e) {
            throw new JwtResponseException("Invalid JWT signature");
        } catch (MalformedJwtException e) {
            throw new JwtResponseException("Invalid JWT token");
        } catch (ExpiredJwtException e) {
            return false;
        } catch (UnsupportedJwtException e) {
            throw new JwtResponseException("JWT token is unsupported");
        } catch (IllegalArgumentException e) {
            throw new JwtResponseException("JWT claims string is empty");
        }
    }

    public String refreshToken(Map<String, Object> claims, String sub) {
        long expirationTime = ACCESS_TOKEN_VALIDITY_SECOND * 60 * 1000;
        Date expirationDate = new Date(System.currentTimeMillis() + expirationTime);

        return Jwts.builder()
                .setSubject(sub)
                .setExpiration(expirationDate)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setIssuer(ISSUED_BY)
                .addClaims(claims)
                .signWith(SignatureAlgorithm.HS256, Keys.hmacShaKeyFor(SECRET_KEY.getBytes(StandardCharsets.UTF_8)))
                .compact();
    }
}

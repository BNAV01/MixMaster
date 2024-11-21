package com.baresflix.api.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "Usuarios")
@NoArgsConstructor
@AllArgsConstructor
@Data
@Getter
@Setter
@Builder
public class Usuario implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int idUsuario;

    @Column(length = 10, unique = true, nullable = false)
    private String rut;

    @Column(length = 100, nullable = false)
    private String nombre;

    @Column(length = 100, nullable = false)
    private String apellidoP;

    @Column(length = 100)
    private String apellidoM;

    @Column(length = 15)
    private String telefono;

    @Column(length = 100, nullable = false, unique = true)
    private String email;

    @NotBlank(message = "La contraseña no puede estar vacía")
    @Size(min = 6, max = 16, message = "La contraseña debe tener entre 6 y 16 caracteres")
    @Column(nullable = false)
    private String clave;

    @Column(name = "fecha_nacimiento", nullable = false)
    private Date fechaNacimiento;

    @Column(name = "fecha_creacion")
    private Date fechaCreacion;

    private Boolean activo;

    @OneToMany(mappedBy = "usuario")
    private List<Preferencias> preferencias;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of();
    }

    @Override
    public String getPassword() {
        return this.clave;
    }

    @Override
    public String getUsername() {
        return this.email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return this.activo != null && this.activo;
    }
}

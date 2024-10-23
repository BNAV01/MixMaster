package com.baresflix.api.models;

import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.persistence.*;

import java.util.Date;

@Entity
@Table(name = "Valoraciones")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Valoraciones {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int idValoracion;

    @ManyToOne
    @JoinColumn(name = "id_usuario")
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "id_licor")
    private Licor licor;

    @ManyToOne
    @JoinColumn(name = "id_coctel")
    private Coctel coctel;

    @Size(min = 1, max = 5)
    @Column(nullable = false)
    private int valoracion;

    @Column(length = 255)
    private String comentario;

    @Column(name = "fecha_valoracion")
    private Date fechaValoracion;
}

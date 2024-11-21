package com.baresflix.api.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "Coctel_ingredientes")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CoctelIngrediente {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id_preparacion_coctel;


    @ManyToOne
    @JoinColumn(name = "id_coctel")
    private Coctel coctel;


    @ManyToOne
    @JoinColumn(name = "id_ingrediente")
    private Ingrediente ingrediente;


    @ManyToOne
    @JoinColumn(name = "id_licor")
    private Licor licor;

    @Column(length = 50)
    private String cantidad;
}
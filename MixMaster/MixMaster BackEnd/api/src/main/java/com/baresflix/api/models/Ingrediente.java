package com.baresflix.api.models;

import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.persistence.*;

import java.util.List;

@Entity
@Table(name = "Ingredientes")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Ingrediente {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idIngrediente;

    @Column(length = 100, nullable = false)
    private String nombre;

/*    @OneToMany(mappedBy = "ingrediente")
    private List<CoctelIngrediente> coctelIngredientes;

    @OneToMany(mappedBy = "ingrediente")
    private List<LicorIngrediente> licorIngredientes;*/
}
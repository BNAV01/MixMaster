package com.baresflix.api.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
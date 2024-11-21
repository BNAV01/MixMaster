import tensorflow as tf
import numpy as np

def crear_modelo(num_usuarios, num_cocteles, num_licores, num_ingredientes, embedding_dim=50):
    usuario_input = tf.keras.layers.Input(shape=(1,), name="usuario_input")
    coctel_input = tf.keras.layers.Input(shape=(1,), name="coctel_input")
    licor_input = tf.keras.layers.Input(shape=(1,), name="licor_input")
    ingrediente_input = tf.keras.layers.Input(shape=(1,), name="ingrediente_input")

    # Embeddings
    usuario_embedding = tf.keras.layers.Embedding(num_usuarios, embedding_dim)(usuario_input)
    coctel_embedding = tf.keras.layers.Embedding(num_cocteles, embedding_dim)(coctel_input)
    licor_embedding = tf.keras.layers.Embedding(num_licores, embedding_dim)(licor_input)
    ingrediente_embedding = tf.keras.layers.Embedding(num_ingredientes, embedding_dim)(ingrediente_input)

    # Aplanar los embeddings
    usuario_vector = tf.keras.layers.Flatten()(usuario_embedding)
    coctel_vector = tf.keras.layers.Flatten()(coctel_embedding)
    licor_vector = tf.keras.layers.Flatten()(licor_embedding)
    ingrediente_vector = tf.keras.layers.Flatten()(ingrediente_embedding)

    # Producto escalar (similaridad)
    dot_usuario_coctel = tf.keras.layers.Dot(axes=1)([usuario_vector, coctel_vector])
    dot_usuario_licor = tf.keras.layers.Dot(axes=1)([usuario_vector, licor_vector])
    dot_usuario_ingrediente = tf.keras.layers.Dot(axes=1)([usuario_vector, ingrediente_vector])

    # Suma de las contribuciones
    salida = tf.keras.layers.Add()([dot_usuario_coctel, dot_usuario_licor, dot_usuario_ingrediente])

    # Modelo final
    modelo = tf.keras.Model(
        inputs=[usuario_input, coctel_input, licor_input, ingrediente_input],
        outputs=salida
    )
    modelo.compile(optimizer="adam", loss="mse", metrics=["mae"])
    return modelo

def entrenar_modelo(modelo, datos_entrenamiento, caracteristicas, epochs=10, batch_size=32):
    usuarios = datos_entrenamiento["id_usuario"].values
    cocteles = datos_entrenamiento["id_coctel"].values
    ingredientes = caracteristicas["id_ingrediente"].values
    valoraciones = datos_entrenamiento["valoracion"].values

    history = modelo.fit(
        [usuarios, cocteles, ingredientes],
        valoraciones,
        epochs=epochs,
        batch_size=batch_size,
        validation_split=0.2,
        verbose=1
    )
    return history

def predecir_valoraciones(modelo, usuario_id, cocteles, ingredientes):
    cocteles = np.array(cocteles)
    ingredientes = np.array(ingredientes)
    predicciones = modelo.predict([np.full_like(cocteles, usuario_id), cocteles, ingredientes])
    return predicciones

def predecir_recomendaciones(modelo, usuario_id, cocteles, licores, ingredientes):
    # Crear entradas para los cocteles y licores
    usuario_vector = np.full_like(cocteles, usuario_id)
    coctel_predicciones = modelo.predict([usuario_vector, cocteles, ingredientes], verbose=0)

    # Calcular recomendaciones para los licores también
    licor_vector = np.full_like(licores, usuario_id)
    licor_predicciones = modelo.predict([licor_vector, licores, ingredientes], verbose=0)

    # Ordenar por puntuaciones (de mayor a menor)
    cocteles_recomendados = cocteles[np.argsort(-coctel_predicciones.flatten())]
    licores_recomendados = licores[np.argsort(-licor_predicciones.flatten())]

    # Retornar recomendaciones
    return {
        "cocteles": cocteles_recomendados.tolist(),
        "licores": licores_recomendados.tolist()
    }

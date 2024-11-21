from sklearn.metrics.pairwise import cosine_similarity
import pandas as pd

def generar_matriz_usuario_item(valoraciones):
    matriz = valoraciones.pivot(index='usuario_id', columns='coctel_id', values='valoracion').fillna(0)
    return matriz

def calcular_similitud_usuarios(matriz):
    return cosine_similarity(matriz)

def recomendaciones_colaborativo(usuario_id, matriz, similitudes):
    usuario_idx = matriz.index.get_loc(usuario_id)
    similaridades_usuario = similitudes[usuario_idx]
    puntuaciones = matriz.T.dot(similaridades_usuario) / (similaridades_usuario.sum() + 1e-9)
    return puntuaciones.sort_values(ascending=False).index.tolist()

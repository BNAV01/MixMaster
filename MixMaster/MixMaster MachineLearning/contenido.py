from sklearn.metrics.pairwise import cosine_similarity

def generar_matriz_caracteristicas(caracteristicas):
    matriz = caracteristicas.pivot(index='coctel_id', columns='ingrediente_id', values='presente').fillna(0)
    return matriz

def calcular_similitud_items(matriz):
    return cosine_similarity(matriz)

def recomendaciones_por_contenido(coctel_id, matriz, similitudes):
    item_idx = matriz.index.get_loc(coctel_id)
    similaridades_item = similitudes[item_idx]
    return matriz.index[similaridades_item.argsort()[::-1]].tolist()

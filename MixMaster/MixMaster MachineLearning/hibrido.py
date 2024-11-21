from colaborativo import recomendaciones_colaborativo
from contenido import recomendaciones_por_contenido
import contenido
def recomendaciones_hibridas(usuario_id, matriz_usuarios, similitudes_usuarios, matriz_items, similitudes_items, peso_colaborativo=0.5):
    colaborativas = recomendaciones_colaborativo(usuario_id, matriz_usuarios, similitudes_usuarios)
    contenido = recomendaciones_por_contenido(usuario_id, matriz_items, similitudes_items)
    
    # Pondera los resultados
    hibridas = {}
    for item in colaborativas:
        hibridas[item] = hibridas.get(item, 0) + peso_colaborativo
    for item in contenido:
        hibridas[item] = hibridas.get(item, 0) + (1 - peso_colaborativo)
    
    return sorted(hibridas, key=hibridas.get, reverse=True)

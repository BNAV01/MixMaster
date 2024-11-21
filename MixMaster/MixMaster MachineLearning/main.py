from flask import Flask, request, jsonify
from database import (
    obtener_valoraciones,
    obtener_usuarios,
    obtener_cocteles,
    obtener_licores,
    obtener_ingredientes,
    obtener_caracteristicas_cocteles,
    obtener_caracteristicas_licores
)
from colaborativo import recomendaciones_colaborativo
from contenido import recomendaciones_por_contenido
from hibrido import recomendaciones_hibridas
from modelo_tensorflow import crear_modelo, entrenar_modelo, predecir_recomendaciones

# Crear la aplicación Flask
app = Flask(__name__)

# Variables globales para los datos y el modelo TensorFlow
valoraciones = None
usuarios = None
cocteles = None
licores = None
ingredientes = None
caracteristicas_cocteles = None
caracteristicas_licores = None
modelo_tensorflow = None
num_usuarios = None
num_cocteles = None
num_licores = None
num_ingredientes = None

# Inicializar el sistema al inicio de la aplicación
with app.app_context():
    print("Inicializando el sistema...")

    # Cargar datos desde la base de datos
    valoraciones = obtener_valoraciones()
    usuarios = obtener_usuarios()
    cocteles = obtener_cocteles()
    licores = obtener_licores()
    ingredientes = obtener_ingredientes()
    caracteristicas_cocteles = obtener_caracteristicas_cocteles()
    caracteristicas_licores = obtener_caracteristicas_licores()

    # Preparar variables para el modelo TensorFlow
    num_usuarios = valoraciones["id_usuario"].nunique()
    num_cocteles = cocteles["id_coctel"].nunique()
    num_licores = licores["id_licor"].nunique()
    num_ingredientes = ingredientes["id_ingrediente"].nunique()

    print(f"Datos cargados: {num_usuarios} usuarios, {num_cocteles} cocteles, {num_licores} licores, {num_ingredientes} ingredientes.")

    # Crear y entrenar el modelo TensorFlow
    modelo_tensorflow = crear_modelo(
        num_usuarios=num_usuarios,
        num_cocteles=num_cocteles,
        num_licores=num_licores,
        num_ingredientes=num_ingredientes,
        embedding_dim=50
    )

    entrenar_modelo(modelo_tensorflow, valoraciones, caracteristicas_cocteles)

    print("Sistema inicializado con éxito.")

@app.route("/recomendaciones/colaborativo", methods=["GET"])
def api_recomendaciones_colaborativas():
    id_usuario = request.args.get("id_usuario", type=int)
    if id_usuario is None:
        return jsonify({"error": "Falta el parámetro id_usuario"}), 400

    recomendaciones = recomendaciones_colaborativo(id_usuario, valoraciones)
    return jsonify({"id_usuario": id_usuario, "recomendaciones": recomendaciones})

@app.route("/recomendaciones/contenido", methods=["GET"])
def api_recomendaciones_contenido():
    id_usuario = request.args.get("id_usuario", type=int)
    if id_usuario is None:
        return jsonify({"error": "Falta el parámetro id_usuario"}), 400

    recomendaciones = recomendaciones_por_contenido(
        id_usuario,
        usuarios,
        cocteles,
        ingredientes,
        caracteristicas_cocteles
    )
    return jsonify({"id_usuario": id_usuario, "recomendaciones": recomendaciones})

@app.route("/recomendaciones/hibrido", methods=["GET"])
def api_recomendaciones_hibridas():
    usuario_id = request.args.get("usuario_id", type=int)
    if usuario_id is None:
        return jsonify({"error": "Falta el parámetro usuario_id"}), 400

    recomendaciones = recomendaciones_hibridas(
        usuario_id,
        valoraciones,
        usuarios,
        cocteles,
        licores,
        ingredientes,
        caracteristicas_cocteles,
        caracteristicas_licores
    )
    return jsonify({"usuario_id": usuario_id, "recomendaciones": recomendaciones})

@app.route("/recomendaciones/tensorflow", methods=["GET"])
def api_recomendaciones_tensorflow():
    id_usuario = request.args.get("id_usuario", type=int)
    if id_usuario is None:
        return jsonify({"error": "Falta el parámetro id_usuario"}), 400

    recomendaciones = predecir_recomendaciones(
        modelo_tensorflow,
        id_usuario,
        cocteles["id_coctel"].values,
        licores["id_licor"].values,
        ingredientes["id_ingrediente"].values
    )
    return jsonify({"id_usuario": id_usuario, "recomendaciones": recomendaciones.tolist()})

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)

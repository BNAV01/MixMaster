import mysql.connector
import pandas as pd

def conectar_bd():
    return mysql.connector.connect(
        host='localhost',
        user='root',
        password='',  # Dejar vacío si no usas contraseña
        database='sisRecomendaciones'
    )

def obtener_valoraciones():
    conn = conectar_bd()
    query = "SELECT id_usuario, id_coctel, id_licor, valoracion FROM valoraciones"
    valoraciones = pd.read_sql(query, conn)
    conn.close()
    return valoraciones

def obtener_usuarios():
    conn = conectar_bd()
    query = "SELECT id_usuario, nombre, apellidop, email FROM usuarios"
    usuarios = pd.read_sql(query, conn)
    conn.close()
    return usuarios

def obtener_cocteles():
    conn = conectar_bd()
    query = "SELECT id_coctel, nombre_coctel FROM cocteles"
    cocteles = pd.read_sql(query, conn)
    conn.close()
    return cocteles

def obtener_licores():
    conn = conectar_bd()
    query = "SELECT id_licor, nombre_licor, tipo FROM licores"
    licores = pd.read_sql(query, conn)
    conn.close()
    return licores

def obtener_ingredientes():
    conn = conectar_bd()
    query = "SELECT id_ingrediente, nombre FROM ingredientes"
    ingredientes = pd.read_sql(query, conn)
    conn.close()
    return ingredientes

def obtener_caracteristicas_cocteles():
    conn = conectar_bd()
    query = """
    SELECT c.id_coctel, i.id_ingrediente
    FROM cocteles c
    INNER JOIN coctel_ingredientes ic ON c.id_coctel = ic.id_coctel
    INNER JOIN ingredientes i ON ic.id_ingrediente = i.id_ingrediente
    """
    caracteristicas = pd.read_sql(query, conn)
    conn.close()
    return caracteristicas

def obtener_caracteristicas_licores():
    conn = conectar_bd()
    query = """
    SELECT l.id_licor, i.id_ingrediente
    FROM licores l
    INNER JOIN licor_ingredientes li ON l.id_licor = li.id_licor
    INNER JOIN ingredientes i ON li.id_ingrediente = i.id_ingrediente
    """
    caracteristicas = pd.read_sql(query, conn)
    conn.close()
    return caracteristicas

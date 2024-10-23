# Sistema de Gestión de Usuarios y Recomendación

Este proyecto es una aplicación de gestión de usuarios y un sistema de recomendación, desarrollado con un **backend en Spring Boot (Java 23)** y un **frontend en Angular**, utilizando **Bootstrap** y **Popper Core** para el diseño de la interfaz de usuario. El backend está optimizado para ejecutar **algoritmos avanzados de recomendación** mediante la integración de un **script en Python** y permite gestionar conexiones con bases de datos en **MySQL**.

## Características principales

- **Gestión de usuarios**: Crear, editar, eliminar y visualizar usuarios.
- **Sistema de recomendación**: Implementación de un algoritmo de recomendación avanzado.
- **Frontend en Angular**: Diseño moderno con Bootstrap y Popper Core.
- **Backend en Spring Boot**: Backend escalable y robusto para manejar grandes volúmenes de datos.
- **Conexión a MySQL**: Integración con bases de datos relacionales.
- **Ejecución de scripts de Python**: Algoritmos de recomendación ejecutados en el backend.

## Tecnologías

### Backend
- **Java 23 (Spring Boot)**
- **MySQL** para la base de datos
- **JPA/Hibernate** para ORM
- **Spring Security** para la autenticación
- **Ejecución de scripts de Python**

### Frontend
- **Angular**
- **Bootstrap** y **Popper Core** para el diseño de la interfaz de usuario
- **TypeScript**

## Requisitos

- **Java 23**
- **Node.js y npm**
- **Angular CLI**
- **MySQL**
- **Python 3** (para el sistema de recomendaciones)

## Instalación

### Backend (Spring Boot)

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/usuario/proyecto-recomendaciones.git

2. Configurar la base de datos MySQL en application.properties:
    ```bash
    spring.datasource.url=jdbc:mysql://localhost:3306/YOUR_DATABASE_NAME
    spring.datasource.username=YOUR_USER
    spring.datasource.password=YOUR_PASSWORD

3. Ejecutar backend: 
    ```bash

### Frontend (Angular)

1. Navegar a la carpeta del frontend:
    ```bash
    cd frontend

2. Instalar dependencias:
    ```bash
    npm install

3. Ejecutar aplicación Angular:
    ```bash
    ng serve --open

### Scripts de Python

Los scripts de recomendación se ejecutarán automáticamente en el backend. Asegúrate de tener Python instalado y configurado.


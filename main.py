from flask import render_template, jsonify, redirect, url_for, request, session
from config import app
from config import get_db_connection
from werkzeug.exceptions import BadRequest

app.secret_key = 'clave_secreta_para_sesion'  # Necesario para usar session

# Verificar la conexión MySQL
@app.route('/verificar_conexion')
def verificar_conexion():
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute("SELECT VERSION()")
            version = cursor.fetchone()
        conn.close()
        return f"Conexión exitosa. Versión de MySQL: {version['VERSION()']}"
    except Exception as e:
        return f"Error en la conexión: {e}"

# Obtener productos desde la base de datos
def obtener_productos_desde_bd():
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            query = """SELECT 
                    p.codigo_producto AS codigo_ferremas,
                    p.nombre_producto,
                    p.descripcion,
                    m.nombre_marca,
                    c.nombre_categoria,
                    p.stock,
                    pr.fecha_precio,
                    pr.valor
                FROM producto p
                LEFT JOIN marca m ON p.id_marca = m.id_marca
                LEFT JOIN categoria c ON p.id_categoria = c.id_categoria
                LEFT JOIN (
                    SELECT id_producto, MAX(fecha_precio) AS ultima_fecha
                    FROM precio_producto
                    GROUP BY id_producto
                ) ultimos ON p.id_producto = ultimos.id_producto
                LEFT JOIN precio_producto pr 
                    ON p.id_producto = pr.id_producto AND pr.fecha_precio = ultimos.ultima_fecha"""  # Tu misma consulta aquí (omitida por brevedad)
            cursor.execute(query)
            resultados = cursor.fetchall()

        productos = []
        for fila in resultados:
            productos.append({
                "Codigo_del_producto": fila["codigo_ferremas"],
                "Nombre": fila["nombre_producto"],
                "Marca": fila["nombre_marca"],
                "Categoria": fila["nombre_categoria"],
                "Stock": fila["stock"],
                "Descripcion": fila["descripcion"],
                "Precio": [
                    {
                        "Fecha": fila["fecha_precio"].isoformat() if fila["fecha_precio"] else None,
                        "Valor": float(fila["valor"]) if fila["valor"] else None
                    }
                ]
            })

        return productos

    except Exception as e:
        return None

# Ruta API para ver todos los productos
@app.route('/api/productos', methods=['GET'])
def obtener_productos():
    productos = obtener_productos_desde_bd()
    if productos:
        marca = request.args.get('marca', '').lower()
        categoria = request.args.get('categoria', '').lower()
        codigo = request.args.get('codigo', '').lower()

        resultado = []
        for p in productos:
            if marca and marca not in p['Marca'].lower():
                continue
            if categoria and categoria not in p['Categoria'].lower():
                continue
            if codigo and codigo not in p.get('Codigo_del_producto', '').lower():
                continue
            resultado.append(p)

        return jsonify(resultado)
    else:
        return jsonify({"error": "No se pudo obtener los productos"}), 500

# Mostrar productos
@app.route('/')
def mostrar_productos():
    productos = obtener_productos_desde_bd()
    return render_template('index.html', productos=productos)

# Agregar producto al carrito usando sesión
@app.route('/agregar_al_carrito', methods=['POST'])
def agregar_al_carrito():
    data = request.get_json()  # Obtiene el JSON enviado por el cliente
    producto_id = data.get('producto_id')
    cantidad = data.get('cantidad', 1)

    if not producto_id:
        return jsonify({'error': 'Falta el ID del producto'}), 400

    carrito = session.get('carrito', {})
    carrito[producto_id] = carrito.get(producto_id, 0) + cantidad
    session['carrito'] = carrito

    return jsonify({'success': f'Producto {producto_id} añadido con cantidad {cantidad}'})

# Obtener productos con cantidades desde la sesión
def obtener_producto_por_id(lista_ids, cantidades_dict):
    if not lista_ids:
        return []

    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            lista_ids = [str(i).strip() for i in lista_ids]
            formato_ids = ','.join(['%s'] * len(lista_ids))
            query = f"""
                SELECT 
                    p.codigo_producto AS codigo_ferremas,
                    p.nombre_producto,
                    m.nombre_marca,
                    pr.valor,
                    p.stock
                FROM producto p
                LEFT JOIN marca m ON p.id_marca = m.id_marca
                LEFT JOIN (
                    SELECT id_producto, MAX(fecha_precio) AS ultima_fecha
                    FROM precio_producto
                    GROUP BY id_producto
                ) ultimos ON p.id_producto = ultimos.id_producto
                LEFT JOIN precio_producto pr 
                    ON p.id_producto = pr.id_producto AND pr.fecha_precio = ultimos.ultima_fecha
                WHERE p.codigo_producto IN ({formato_ids})
            """
            cursor.execute(query, lista_ids)
            resultados = cursor.fetchall()

        productos = []
        for fila in resultados:
            codigo = fila["codigo_ferremas"]
            cantidad = cantidades_dict.get(codigo, 1)
            precio = float(fila["valor"]) if fila["valor"] else 0.0
            subtotal = precio * cantidad

            productos.append({
                "Codigo_del_producto": codigo,
                "Nombre": fila["nombre_producto"],
                "Marca": fila["nombre_marca"],
                "Precio_unitario": precio,
                "Cantidad": cantidad,
                "Subtotal": subtotal,
                "Stock": fila["stock"]
            })

        return productos

    except Exception as e:
        print("Error al obtener productos con cantidades:", e)
        return []

# Ver carrito
@app.route('/ver_carrito')
def ver_carrito():
    carrito = session.get('carrito', {}) 

    if not carrito:
        return render_template('carrito.html', productos=[], total=0)

    lista_ids = list(carrito.keys())
    cantidades = carrito 

    productos_info = obtener_producto_por_id(lista_ids, cantidades)

    total = sum(p["Subtotal"] for p in productos_info)

    return render_template('carrito.html', productos=productos_info, total=total)

@app.route('/eliminar_del_carrito/<producto_id>', methods=['DELETE'])
def eliminar_del_carrito(producto_id):
    carrito = session.get('carrito', {})

    if producto_id in carrito:
        del carrito[producto_id]
        session['carrito'] = carrito
        return jsonify({"success": f"Producto {producto_id} eliminado del carrito"})
    else:
        return jsonify({"error": "Producto no encontrado en el carrito"}), 404
    
@app.route('/finalizar_compra', methods=['POST'])
def finalizar_compra():
    carrito = session.get('carrito', {})
    
    if not carrito:
        return jsonify({"error": "Tu carrito está vacío"}), 400
    
    try:
        print("Inicio de proceso de compra")
        productos_comprados = []

        conn = get_db_connection()
        with conn.cursor() as cursor:
            for producto_id, cantidad in carrito.items():
                print(f"Procesando producto: {producto_id} con cantidad: {cantidad}")
                cursor.execute("""
                    SELECT 
                        p.nombre_producto, 
                        m.nombre_marca, 
                        pr.valor AS precio_unitario, 
                        p.stock 
                    FROM producto p
                    LEFT JOIN marca m ON p.id_marca = m.id_marca
                    LEFT JOIN (
                        SELECT id_producto, MAX(fecha_precio) AS ultima_fecha
                        FROM precio_producto
                        GROUP BY id_producto
                    ) ultimos ON p.id_producto = ultimos.id_producto
                    LEFT JOIN precio_producto pr 
                        ON p.id_producto = pr.id_producto AND pr.fecha_precio = ultimos.ultima_fecha
                    WHERE p.codigo_producto = %s
                """, (producto_id,))
                
                producto = cursor.fetchone()

                if not producto:
                    return jsonify({"error": f"Producto {producto_id} no encontrado"}), 404

                stock_actual = producto['stock']
                if stock_actual < cantidad:
                    return jsonify({"error": f"Stock insuficiente para el producto {producto_id}"}), 400
                
                nuevo_stock = stock_actual - cantidad
                print(f"Actualizando stock de {producto_id} a {nuevo_stock}")
                cursor.execute(
                    "UPDATE producto SET stock = %s WHERE codigo_producto = %s",
                    (nuevo_stock, producto_id)
                )

                subtotal = producto['precio_unitario'] * cantidad

                productos_comprados.append({
                    'codigo': producto_id,
                    'nombre': producto['nombre_producto'],
                    'marca': producto['nombre_marca'],
                    'precio_unitario': producto['precio_unitario'],
                    'cantidad': cantidad,
                    'subtotal': subtotal
                })

            conn.commit()
            print("Compra confirmada y stock actualizado.")

        session.pop('carrito', None)
        session['productos_comprados'] = productos_comprados

        # Retorna la URL para redirigir a la página de confirmación
        return jsonify({
            "success": "Compra realizada con éxito",
            "redirect_url": url_for('confirmacion_pedido')  # Asegúrate de tener esta ruta definida
        })

    except Exception as e:
        print(f"Error al finalizar la compra: {e}")
        if 'conn' in locals():
            conn.rollback()
        return jsonify({"error": "Hubo un error al procesar la compra"}), 500

@app.route('/confirmacion_pedido')
def confirmacion_pedido():
    productos_comprados = session.get('productos_comprados', [])
    return render_template('confirmacion_pedido.html', productos=productos_comprados)

@app.route('/consulta_api')
def consulta_api():
    return render_template('consulta_api.html')   

if __name__ == '__main__':
    app.run(debug=True)
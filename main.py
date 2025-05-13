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
                        COALESCE(SUM(it.stock), 0) AS stock_total,
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
                        ON p.id_producto = pr.id_producto AND pr.fecha_precio = ultimos.ultima_fecha
                    LEFT JOIN inventario_tienda it ON p.id_producto = it.id_producto
                    GROUP BY 
                        p.codigo_producto, p.nombre_producto, p.descripcion, 
                        m.nombre_marca, c.nombre_categoria, pr.fecha_precio, pr.valor""" 
            cursor.execute(query)
            resultados = cursor.fetchall()

        productos = []
        for fila in resultados:
            productos.append({
                "Codigo_del_producto": fila["codigo_ferremas"],
                "Nombre": fila["nombre_producto"],
                "Marca": fila["nombre_marca"],
                "Categoria": fila["nombre_categoria"],
                "Stock": fila["stock_total"],
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
    data = request.get_json()
    print(f"Datos recibidos: {data}") 
    producto_id = data.get('producto_id')
    print(f"Producto ID: {producto_id}")
    cantidad = data.get('cantidad', 1)
    print(f"Cantidad solicitada: {cantidad}")
    id_tienda = 2  # Aquí está el ID de la tienda en bruto
    print(f"ID Tienda: {id_tienda}")

    if not producto_id:
        return jsonify({'error': 'Falta el ID del producto'}), 400

    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT it.stock 
                FROM inventario_tienda it 
                JOIN producto p ON it.id_producto = p.id_producto 
                WHERE p.codigo_producto = %s AND it.id_tienda = %s
            """, (producto_id, id_tienda))

            row = cursor.fetchone()
            print(f"Resultado de la consulta: {row}")

            if not row:
                return jsonify({'error': 'No hay stock'}), 404

            stock_disponible = row['stock'] 
            print(f"Stock disponible: {stock_disponible}")

            if stock_disponible < cantidad:
                return jsonify({'error': 'No hay suficiente stock para este producto en la tienda'}), 400

    except Exception as e:
        print(f"Error en la consulta: {e}") 
        return jsonify({'error': 'Error al verificar el stock'}), 500

    # Agregar el producto al carrito
    carrito = session.get('carrito', {})
    carrito[producto_id] = carrito.get(producto_id, 0) + cantidad
    session['carrito'] = carrito

    return jsonify({'success': f'Producto {producto_id} añadido con cantidad {cantidad}'})

# Obtener productos con cantidades desde la sesión
def obtener_producto_por_id(lista_codigos, cantidades):
    productos = []
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            for codigo in lista_codigos:
                cursor.execute("""
                    SELECT 
                        p.codigo_producto AS Codigo_del_producto,
                        p.nombre_producto AS Nombre,
                        m.nombre_marca AS Marca,
                        p.precio AS Precio_unitario
                    FROM producto p
                    JOIN marca m ON p.id_marca = m.id_marca
                    WHERE p.codigo_producto = %s
                """, (codigo,))
                row = cursor.fetchone()
                if row:
                    cantidad = cantidades.get(codigo, 1)
                    subtotal = row['Precio_unitario'] * cantidad
                    productos.append({
                        'Codigo_del_producto': row['Codigo_del_producto'],
                        'Nombre': row['Nombre'],
                        'Marca': row['Marca'],
                        'Precio_unitario': row['Precio_unitario'],
                        'Cantidad': cantidad,
                        'Subtotal': subtotal
                    })
    except Exception as e:
        print(f"Error en obtener_producto_por_id: {e}")
    
    return productos

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
    id_tienda = 2  #Aqui va el Id de la tienda que debe ser dinamico

    if not carrito:
        return jsonify({'error': 'El carrito está vacío'}), 400

    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            for codigo_producto, cantidad in carrito.items():
                # Obtener el ID real del producto
                cursor.execute("SELECT id_producto FROM producto WHERE codigo_producto = %s", (codigo_producto,))
                producto_row = cursor.fetchone()
                if not producto_row:
                    return jsonify({'error': f'Producto con código {codigo_producto} no encontrado'}), 400

                id_producto = producto_row['id_producto']

                # Verificar stock
                cursor.execute("""
                    SELECT stock FROM inventario_tienda
                    WHERE id_producto = %s AND id_tienda = %s
                """, (id_producto, id_tienda))
                inventario_row = cursor.fetchone()

                if not inventario_row:
                    return jsonify({'error': f'Producto {codigo_producto} no disponible en esta tienda'}), 400

                stock_actual = inventario_row['stock']
                if stock_actual < cantidad:
                    return jsonify({'error': f'Stock insuficiente para el producto {codigo_producto}'}), 400

                # Actualizar stock
                nuevo_stock = stock_actual - cantidad
                cursor.execute("""
                    UPDATE inventario_tienda
                    SET stock = %s
                    WHERE id_producto = %s AND id_tienda = %s
                """, (nuevo_stock, id_producto, id_tienda))

            conn.commit()

        # Limpiar carrito después de la compra
        session['carrito'] = {}

        return jsonify({
            'success': 'Compra finalizada exitosamente',
            'redirect_url': url_for('confirmacion_pedido')  # Puedes cambiar esto si deseas otra página
        })

    except Exception as e:
        print(f"Error al finalizar compra: {e}")
        return jsonify({'error': 'Error al procesar la compra'}), 500

@app.route('/confirmacion_pedido')
def confirmacion_pedido():
    productos_comprados = session.get('productos_comprados', [])
    return render_template('confirmacion_pedido.html', productos=productos_comprados)

@app.route('/consulta_api')
def consulta_api():
    return render_template('consulta_api.html')   

if __name__ == '__main__':
    app.run(debug=True)
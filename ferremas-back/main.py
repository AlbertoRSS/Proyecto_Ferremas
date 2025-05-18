from flask import render_template, jsonify, redirect, url_for, request, session, Flask
from config import app
from config import get_db_connection
from flask_cors import CORS
from werkzeug.exceptions import BadRequest
from transbank.webpay.webpay_plus.transaction import Transaction
from transbank.common.integration_type import IntegrationType
from transbank.common.options import WebpayOptions
import time

app.secret_key = 'clave_secreta_para_sesion'  # Necesario para usar session

CORS(app)

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
                        p.id_producto AS id_producto,
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
                ],
                "id_producto": fila["id_producto"]
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
    
@app.route('/stock-tiendas', methods=['GET'])
def obtener_inventario_tiendas():
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            query = """
                SELECT t.nombre_tienda,
                       it.id_tienda,
                       it.id_producto,
                       it.stock
                FROM inventario_tienda it
                JOIN tienda t ON it.id_tienda = t.id_tienda
            """
            cursor.execute(query)
            resultados = cursor.fetchall()
        
        conn.close()

        return jsonify(resultados)

    except Exception as e:
        return jsonify({"error": str(e)})

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

    codigo_producto = data.get('producto_id')  
    cantidad = data.get('cantidad', 1)
    id_tienda = data.get('tienda', 1)

    if not codigo_producto:
        return jsonify({'error': 'Falta el código del producto'}), 400

    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:

            # Obtener el ID real del producto
            cursor.execute("SELECT id_producto FROM producto WHERE codigo_producto = %s", (codigo_producto,))
            row = cursor.fetchone()

            if not row:
                return jsonify({'error': 'Producto no encontrado'}), 404

            id_producto = row['id_producto']
            print(f"ID del producto encontrado: {id_producto}")

            # Verificar stock
            cursor.execute("""
                SELECT stock 
                FROM inventario_tienda 
                WHERE id_producto = %s AND id_tienda = %s
            """, (id_producto, id_tienda))
            stock_row = cursor.fetchone()

            if not stock_row:
                return jsonify({'error': 'No hay stock del producto en la tienda'}), 404

            stock_disponible = stock_row['stock']
            print(f"Stock disponible: {stock_disponible}")

            # Verificar carrito
            cursor.execute("""
                SELECT * 
                FROM ferremas.carrito_temporal ct 
                WHERE producto_id = %s AND id_tienda = %s
            """, (id_producto, id_tienda))
            carrito = cursor.fetchone()

            if carrito:
                nuevaCantidad = int(cantidad) + int(carrito['cantidad'])

                if stock_disponible < nuevaCantidad:
                    return jsonify({'error': 'No hay suficiente stock'}), 400

                cursor.execute("""
                    UPDATE ferremas.carrito_temporal
                    SET cantidad = %s
                    WHERE id = %s
                """, (nuevaCantidad, carrito['id']))
                conn.commit()
                return jsonify({'success': f'Producto {codigo_producto} modificado con cantidad: {nuevaCantidad}'})

            if stock_disponible < cantidad:
                return jsonify({'error': 'No hay suficiente stock'}), 400

            # Insertar en la tabla carrito_temporal
            cursor.execute("""
                INSERT INTO carrito_temporal (producto_id, cantidad, id_tienda)
                VALUES (%s, %s, %s)
                ON DUPLICATE KEY UPDATE cantidad = cantidad + VALUES(cantidad)
            """, (id_producto, cantidad, id_tienda))

            conn.commit()

        conn.close()
        return jsonify({'success': f'Producto {codigo_producto} añadido con cantidad: {cantidad}'})

    except Exception as e:
        print(f"Error al agregar al carrito: {e}")
        return jsonify({'error': 'Error interno al agregar al carrito'}), 500

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
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT ct.cantidad,
                       ct.producto_id,
                       ct.id_tienda,
                       p.codigo_producto,
                       p.nombre_producto,
                       p.precio,
                       m.nombre_marca
                FROM carrito_temporal ct
                JOIN producto p ON ct.producto_id = p.id_producto
                JOIN marca m ON p.id_marca = m.id_marca
            """)
            rows = cursor.fetchall()

        conn.close()

        productos_info = []
        total = 0

        for row in rows:
            subtotal = row['cantidad'] * row['precio']
            productos_info.append({
                "Codigo_del_producto": row['codigo_producto'],
                "Cantidad": row['cantidad'],
                "ProductoId": row['producto_id'],
                "TiendaId": row['id_tienda'],
                "Nombre": row['nombre_producto'],
                "Marca": row['nombre_marca'],
                "Precio_unitario": row['precio'],
                "Cantidad": row['cantidad'],
                "Subtotal": subtotal
            })
            total += subtotal

        return {"productos_info": productos_info, "total":total}

    except Exception as e:
        print(f"Error al consultar el carrito: {e}")
        return render_template('carrito.html', productos=[], total=0)

@app.route('/eliminar_del_carrito/<producto_id>/<id_tienda>', methods=['DELETE'])
def eliminar_del_carrito(producto_id, id_tienda):
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM carrito_temporal WHERE producto_id = %s AND id_tienda = %s", (producto_id, id_tienda))
            conn.commit()
            if cursor.rowcount == 0:
                return jsonify({"error": "Producto no encontrado en el carrito"}), 404

        conn.close()
        return jsonify({"success": f"Producto {producto_id} eliminado del carrito"})

    except Exception as e:
        print(f"Error al eliminar el producto del carrito: {e}")
        return jsonify({"error": "Error al eliminar el producto del carrito"}), 500
    
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

@app.route('/api/iniciar-transaccion', methods=['POST'])
def iniciar_transaccion_api():
    data = request.get_json()
    amount = data.get('amount')
    buy_order = 'orden-' + str(time.time())
    session_id = 'sesion-' + str(time.time())

    options = WebpayOptions(app.config['WEBPAY_COMMERCE_CODE'], app.config['WEBPAY_API_KEY_SECRET'], IntegrationType.TEST)
    transaction = Transaction(options)

    try:
        init_result = transaction.create(
            amount=amount,
            buy_order=buy_order,
            session_id=session_id,
            return_url=app.config['WEBPAY_URL_RETURN']
        )
        
        return jsonify({'url': init_result['url'], 'token': init_result['token']})
    except Exception as e:
        print(f"Error al iniciar la transacción: {e}")
        return jsonify({'error': 'Error al iniciar la transacción.'}), 500
    
@app.route('/webpay/retorno', methods=['POST'])
def webpay_retorno():
    data = request.get_json()
    print(data)
    token_ws = data.get('token_ws')
    print(token_ws)
    options = WebpayOptions(app.config['WEBPAY_COMMERCE_CODE'], app.config['WEBPAY_API_KEY_SECRET'], IntegrationType.TEST)
    transaction = Transaction(options = options)
    try:
        result = transaction.commit(token=token_ws)

        # Aquí puedes procesar el resultado (verificar estado, monto, etc.)
        # y luego redirigir a la URL final con el token para consultar el resultado final
        return result
    except Exception as e:
        print(f"Error al obtener el resultado de la transacción: {e}")
        return "Error al obtener el resultado de la transacción."

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)
function consultarAPI() {
    // Obtener los valores de los filtros
    const marca = document.getElementById('marca').value;
    const categoria = document.getElementById('categoria').value;
    const codigo = document.getElementById('codigo').value;

    // Construir la URL de la API con los filtros como parámetros (si los hay)
    let url = '/api/productos';
    let params = [];
    if (marca) params.push(`marca=${marca}`);
    if (categoria) params.push(`categoria=${categoria}`);
    if (codigo) params.push(`codigo=${codigo}`);

    if (params.length > 0) {
        url += '?' + params.join('&');
    }

    // Realizar la solicitud a la API
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
                return;
            }

            // Limpiar los resultados anteriores
            const tbody = document.getElementById('resultado-body');
            tbody.innerHTML = '';

            // Mostrar los productos en la tabla
            data.forEach(producto => {
                const row = document.createElement('tr');

                row.innerHTML = `
                    <td>${producto.Codigo_del_producto}</td>
                    <td>${producto.Nombre}</td>
                    <td>${producto.Marca}</td>
                    <td>${producto.Categoria}</td>
                    <td>${producto.Stock}</td>
                    <td>${producto.Descripcion}</td>
                    <td>${producto.Precio[0].Valor || 'N/A'}</td>
                    <td>${producto.Precio[0].Fecha || 'N/A'}</td>
                `;
                
                tbody.appendChild(row);
            });

            // Mostrar la tabla de resultados
            document.getElementById('tabla-productos').style.display = 'table';
        })
        .catch(error => {
            console.error('Error al consultar la API:', error);
            alert('Hubo un problema al consultar los productos.');
        });
}
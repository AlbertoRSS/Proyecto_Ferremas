// Función para agregar al carrito
function agregarAlCarrito(event, productoId) {
    event.preventDefault();  // Prevenir el envío del formulario que causa el refresh de la página

    fetch('/agregar_al_carrito', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'  // Muy importante
        },
        body: JSON.stringify({
            producto_id: productoId,
            cantidad: 1
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(data.success); // Muestra el mensaje de éxito
        } else {
            alert(data.error || 'Error al agregar al carrito');
        }
    })
    .catch(error => {
        alert('Error al comunicar con el servidor');
        console.error(error);
    });
}

// Llamada para escuchar el evento de submit en el formulario
document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', function(event) {
        const productoId = form.querySelector('input[type="hidden"]').value;  // Obtener el producto_id
        agregarAlCarrito(event, productoId);
    });
});

  
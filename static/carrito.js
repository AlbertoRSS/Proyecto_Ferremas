function eliminarProducto(productoId) {
  // Confirmar eliminación
  if (confirm('¿Estás seguro de eliminar este producto del carrito?')) {
    fetch(`/eliminar_del_carrito/${productoId}`, {
      method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert(data.success);
        // Recargar la página para mostrar el carrito actualizado
        window.location.reload();
      } else {
        alert(data.error || 'Error al eliminar el producto');
      }
    })
    .catch(error => {
      alert('Error al comunicar con el servidor');
      console.error(error);
    });
  }
}

document.getElementById('finalizar-compra-btn').addEventListener('click', function () {
  fetch('/finalizar_compra', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(response => response.json())
    .then(data => {
      if (data.success && data.redirect_url) {
        // Redirigir a la página de confirmación recibida en el JSON
        window.location.href = data.redirect_url;
      } else {
        alert(data.error || 'Error al finalizar la compra');
      }
    })
    .catch(error => {
      alert('Error al comunicar con el servidor');
      console.error(error);
    });
});
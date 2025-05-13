import { useEffect, useState } from "react";
import axios from "axios";
import './carrito.css';
import { Outlet, Link } from "react-router-dom";

const Carrito = () => {
  // useEffect(() => {
  //   axios.get('http://localhost:5000/api/productos')
  //       .then(response => {
  //           console.log(response)
  //           setProductos(response.data)
  //       })
  //       .catch(error => {
  //           console.log('err')
  //       });
  // }, []);

  const [carrito, setCarrito] = useState([])

  const formatoMoneda = (numero) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(numero);
  };

  const quitarProducto = (producto) => {
    console.log("Aqui quitaria este producto")
    console.log(producto)
    console.log("si pudiera")
  }

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <a className="navbar-brand" href="/">FERREMAS</a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbar-ferre">
            <ul className="navbar-nav ms-auto">
              <li key="li1" className="nav-item">
                <a className="nav-link active" href="/">Inicio</a>
              </li>
              <li key="li2" className="nav-item">
                <a className="nav-link" href="#">Contacto</a>
              </li>
              <li key="li3" className="nav-item">
                <a className="nav-link" href="/carrito">Carrito</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
        
      <div id="carrito-container">
        {carrito.length > 0 ?
        <>
          <table className="table">
            <thead>
              <tr>
                <th key="th-codigo">Código</th>
                <th key="th-nombre">Nombre</th>
                <th key="th-marca">Marca</th>
                <th key="th-precio">Precio</th>
                <th key="th-cantidad">Cantidad</th>
                <th key="th-subtotal">Subtotal</th>
                <th key="th-acción">Acción</th>
              </tr>
            </thead>
            <tbody>
              {carrito.map((item) => (
                <>
                  <tr>
                    <td>{ item.Codigo_del_producto }</td>
                    <td>{ item.Nombre }</td>
                    <td>{ item.Marca }</td>
                    <td>{ formatoMoneda(item.Precio_unitario) }</td>
                    <td>{ item.Cantidad }</td>
                    <td>{ item.Subtotal }</td>
                    <td>
                      <button className="btn btn-danger btn-sm" onclick={()=>quitarProducto(item.Codigo_del_producto)}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                </>
              ))}
            </tbody>
          </table>
        </>
        :
        <p>Tu carrito está vacío.</p>}
      </div>
      
      <div className="d-flex justify-content-between mt-4">
        <h4>Total: { "aqui iria el total" }</h4>
        <button id="finalizar-compra-btn" className="btn btn-primary">Finalizar Compra</button>
      </div>

      <a href="/tienda" className="btn btn-primary mt-3">Volver al inicio</a>

      {/* <!-- FOOTER --> */}
      <footer className="bg-dark text-white text-center p-3 mt-5">
        &copy; 2025 FERREMAS. Todos los derechos reservados.
      </footer>
    </>
  )
};

export default Carrito;
import { useEffect, useState } from "react";
import axios from "axios";
import './carrito.css';
import { Outlet, Link } from "react-router-dom";

const Carrito = () => {
  useEffect(() => {
    axios.get('http://localhost:5000/ver_carrito')
        .then(response => {
            console.log(response)
            setCarrito(response.data.productos_info)
            setTotal(response.data.total)
        })
        .catch(error => {
            console.log(error)
        });
  }, []);

  const [carrito, setCarrito] = useState([])
  const [total, setTotal] = useState([])

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

  const pagar = async () => {
    // try {
      console.log(total)
      const body = {
        amount: parseFloat(total)
      }
      axios.post('http://localhost:5000/api/iniciar-transaccion', body)
        .then(response => {
          console.log(response)
          // const data = response.json();
          window.location.href = `${response.data.url}?token_ws=${response.data.token}`;
        })
        .catch(error => {
            console.log(error)
            console.error('Error de red:', error);
        });
      // const response = await fetch('http://tu-backend-flask.com/api/iniciar-transaccion', {
      //   method: 'POST',
      //   headers: {'Content-Type': 'application/json',},
      //   body: JSON.stringify({ amount: parseFloat(monto) }),
      // });

    //   if (response.ok) {
    //     const data = await response.json();
    //     window.location.href = `${data.url}?token_ws=${data.token}`;
    //   } else {
    //     console.error('Error al iniciar la transacción:', response.status);
    //     // Mostrar mensaje de error al usuario
    //   }
    // } catch (error) {
    //   console.error('Error de red:', error);
    //   // Mostrar mensaje de error al usuario
    // }
  };

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
        
      <div id="carrito-container" className="p-5" >
        {carrito.length > 0 ?
        <>
          <table className="table" >
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
                    <td>{ formatoMoneda(item.Subtotal) }</td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={()=>quitarProducto(item.Codigo_del_producto)}>
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
      
      <div className="d-flex flex-row justify-content-around" >
          <a href="/" role="button" className="button-b align-self-end" >Volver al inicio </a>

        <div className="d-flex flex-column" > 
          <h4>Total: { formatoMoneda(total) }  </h4>
          <button id="finalizar-compra-btn" type="button" className="button ml-5" onClick={pagar}>
              Finalizar Compra
          </button>
        </div>
      </div>


      {/* <!-- FOOTER --> */}
      <footer className="bg-dark text-white text-center p-3 mt-5">
        &copy; 2025 FERREMAS. Todos los derechos reservados.
      </footer>
    </>
  )
};

export default Carrito;
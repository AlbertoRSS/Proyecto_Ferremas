import { useEffect, useState } from "react";
import axios from "axios";
import './carrito.css';
import Navbar from "../../components/navbar"; 
import Footer from "../../components/footer";
import Moneda from "../../components/moneda";

const Carrito = () => {
  useEffect(() => {
    axios.get('http://localhost:5000/ver_carrito')
        .then(response => {
            setCarrito(response.data.productos_info)
            setTotal(response.data.total)
        })
        .catch(error => {
            console.log(error)
        });
  }, []);

  const [carrito, setCarrito] = useState([])
  const [total, setTotal] = useState(0)

  const quitarProducto = (producto) => {
    console.log(producto)
    const url = `http://localhost:5000/eliminar_del_carrito/${producto.ProductoId}/${producto.TiendaId}`
    axios.delete(url)
      .then(response => {
        cargarCarrito()
      })
      .catch(error => {
          console.log(error)
          console.error('Error de red:', error);
      });
  }

  const cargarCarrito = () => {
    axios.get('http://localhost:5000/ver_carrito')
        .then(response => {
            setCarrito(response.data.productos_info)
            setTotal(response.data.total)
        })
        .catch(error => {
            console.log(error)
        });
  }

  const pagar = async () => {
      console.log(total)
      const body = {
        amount: parseFloat(total)
      }
      axios.post('http://localhost:5000/api/iniciar-transaccion', body)
        .then(response => {
          window.location.href = `${response.data.url}?token_ws=${response.data.token}`;
        })
        .catch(error => {
            console.log(error)
            console.error('Error de red:', error);
        });
  };

  return (
    <>
      <Navbar/>
        
      <div id="carrito-container" className="p-5" style={{"minHeight": "34.45rem"}} >
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
                    <td>{ <Moneda moneda={item.Precio_unitario} /> }</td>
                    <td>{ item.Cantidad }</td>
                    <td>{ <Moneda moneda={item.Subtotal} /> }</td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={()=>quitarProducto(item)}>
                        Quitar
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
          <h4>Total: <Moneda moneda={total} /> </h4>
          <button id="finalizar-compra-btn" type="button" className="button ml-5" onClick={pagar}>
              Finalizar Compra
          </button>
        </div>
      </div>

      <Footer/>
    </>
  )
};

export default Carrito;
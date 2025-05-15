import { useEffect, useState } from "react";
import axios from "axios";
import './tienda.css';
import { Outlet, Link } from "react-router-dom";

const Tienda = () => {
  useEffect(() => {
    axios.get('http://localhost:5000/api/productos')
        .then(rProductos => {
            setProductos(rProductos.data)
        })
        .catch(error => {
            console.log(error)
        });
    axios.get('http://localhost:5000/stock-tiendas')
        .then(rStock => {
            setStockTiendas(rStock.data)
        })
        .catch(error => {
            console.log(error)
        });
  }, []);

  const [productos, setProductos] = useState([])
  const [stockTiendas, setStockTiendas] = useState([])
  const [tienda, setTienda] = useState(0)

  const formatoMoneda = (numero) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(numero);
  };

  const agregarCarrito = (producto) => {
    const body = {
      cantidad: 1,
      producto_id: producto.Codigo_del_producto,
      tienda: tienda
    }
    axios.post('http://localhost:5000/agregar_al_carrito', body)
        .then(response => {
          console.log(response)
          alert(response.data.success);
          setTienda(0)
        })
        .catch(error => {
          console.log(error)
          alert('Error al comunicar con el servidor');
        });
  }

  const selectEvent = (event, id_producto) => {
    let t = stockTiendas.filter((tienda) => event.target.value.includes(tienda.nombre_tienda) && tienda.id_producto === id_producto)
    setTienda(t[0]?.id_tienda || 0)
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
                <a className="nav-link" href="/">Inicio</a>
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

      {/* <!-- BANNER PROMOCIONAL --> */}
      <section id="banner">
        <div className="container">
          <h1>Bienvenido a FERREMAS</h1>
          <p>
            Explora nuestras ofertas y últimas novedades en herramientas y
            construcción.
          </p>
        </div>
      </section>

      <div className="container">
        <h2 className="mb-4 pt-4">Productos Destacados</h2>
        <div key="destacados" className="row">
          {productos.map((producto) => (
            <>
              <div key={"destacado-"+producto['Codigo_del_producto']} className="col-md-4 mb-4">
                <div className="card h-100">
                  <div className="img-wrapper">
                    <img 
                      src={'img/'+producto['Nombre']+'.jpeg' }  
                      className="card-img-top img-fluid img-fixed-size image featured" 
                      alt={ producto['Nombre'] } 
                    />
                  </div>
                  <div className="card-body">
                    <h5 className="card-title"> { producto['Nombre'] } </h5>
                    <p className="card-text"><strong> { formatoMoneda(producto['Precio'][0]['Valor']) }</strong></p>
                    <p className="card-text text-muted"> Stock: { producto['Stock'] }</p>
                    <button 
                      type="button" 
                      className="button" 
                      data-bs-toggle="modal" 
                      data-bs-target={"#modal"+producto['Codigo_del_producto']}>
                      Ver más
                    </button>
                  </div>
                </div>
              </div>
            </>
          ))}

          {productos.map((producto) => (
            <>
              <div 
                className="modal fade" 
                id={"modal"+producto['Codigo_del_producto']} 
                tabIndex="-1" 
                aria-labelledby={"modalLabel"+producto['Codigo_del_producto']} 
                aria-hidden="true">
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 
                      className="modal-title" 
                      id={"modalLabel"+producto['Codigo_del_producto']}
                      >
                        { producto['Nombre'] }
                    </h5>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                  </div>
                  <div className="modal-body">
                    <p> { producto['Descripcion'] } </p>
                    <p> <strong> Categoria: </strong> { producto['Categoria'] } </p>
                    <p> <strong> Marca: </strong> { producto['Marca'] } </p>
                    <p> <strong> Precio: </strong> {formatoMoneda(producto['Precio'][0]['Valor']) } </p>
                    {/* <p> <strong> Stock: </strong> { producto['Stock'] } </p> */}
                    <p> <strong> Tienda: </strong> 
                      <select class="form-select" aria-label="Default select example" onChange={event => selectEvent(event, producto.id_producto)}>
                        <option selected> Seleccionar </option>
                        {stockTiendas.filter((tienda) => tienda.id_producto === producto["id_producto"]).map((tienda) => (
                          <option id={tienda.id_tienda} > {tienda.nombre_tienda} (Stock: {tienda.stock}) </option>
                        ))}
                      </select> 
                    </p>
                  </div>
                  <div className="modal-footer">
                    <button className="btn btn-success" onClick={()=>agregarCarrito(producto)}>Añadir al Carrito</button>
                    <button className="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                  </div>
                </div>
              </div>
            </div>
            </>
          ))}
        </div>
      </div>

      {/* <!-- FOOTER --> */}
      <footer className="bg-dark text-white text-center p-3 mt-5">
        &copy; 2025 FERREMAS. Todos los derechos reservados.
      </footer>
    </>
  )
};

export default Tienda;
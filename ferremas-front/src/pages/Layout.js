import { useEffect, useState } from "react";
import axios from "axios";
import { Outlet, Link } from "react-router-dom";

const Layout = () => {
  useEffect(() => {
    axios.get('http://localhost:5000/api/productos')
        .then(response => {
            console.log(response)
            setProductos(response.data)
        })
        .catch(error => {
            console.log(error)
        });
  }, []);
  const [productos, setProductos] = useState([])

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <a className="navbar-brand" href="#">FERREMAS</a>
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
              <a className="nav-link active" href="#">Inicio</a>
            </li>
            <li key="li2" className="nav-item">
              <a className="nav-link" href="#">Contacto</a>
            </li>
            <li key="li3" className="nav-item">
              <a className="nav-link" href="{{ url_for('ver_carrito') }}">
                asdf
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    {/* <!-- BANNER PROMOCIONAL --> */}
    <div className="container my-4">
      <div className="p-5 text-white bg-primary rounded-3">
        <h1>Bienvenido a FERREMAS</h1>
        <p>
          Explora nuestras ofertas y últimas novedades en herramientas y
          construcción.
        </p>
      </div>
    </div>

    <div className="container">
      <h2 className="mb-4">Productos Recomendados</h2>
      <div className="row">
        {productos.map((producto) => (
          <>
            <div className="col-md-4 mb-4">
              <div className="card h-100">
                <img src={'img/'+producto['Nombre']+'.jpeg' }  className="card-img-top" alt={ producto['Nombre'] } />
                <div className="card-body">
                  <h5 className="card-title"> { producto['Nombre'] } </h5>
                  <p className="card-text"><strong> { producto['Precio'][0]['Valor'] }</strong></p>
                  <p className="card-text text-muted">Stock: { producto['Stock'] }</p>
                  <button type="button" className="btn btn-primary mt-2" data-bs-toggle="modal" data-bs-target="#modal{{ producto['Codigo_del_producto'] }}">
                    Ver más
                  </button>
                </div>
              </div>
            </div>
          </>
        ))}
        {/* {% for producto in productos %}
          <div className="col-md-4 mb-4">
            <div className="card h-100">
              <img src="{{ url_for('static', filename='img/' + producto['Nombre'] + '.jpeg') }}" className="card-img-top" alt="{{ producto['Nombre'] }}">
              <div className="card-body">
                <h5 className="card-title">{{ producto['Nombre'] }}</h5>
                <p className="card-text"><strong>${{ producto['Precio'][0]['Valor'] if producto['Precio'] else 'Sin precio' }}</strong></p>
                <p className="card-text text-muted">Stock: {{ producto['Stock'] }}</p>
                <!-- Botón para abrir el modal -->
                <button type="button" className="btn btn-primary mt-2" data-bs-toggle="modal" data-bs-target="#modal{{ producto['Codigo_del_producto'] }}">
                  Ver más
                </button>
              </div>
            </div>
          </div>

          <!-- Modal -->
          <div className="modal fade" id="modal{{ producto['Codigo_del_producto'] }}" tabindex="-1" aria-labelledby="modalLabel{{ producto['Codigo_del_producto'] }}" aria-hidden="true">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id="modalLabel{{ producto['Codigo_del_producto'] }}">{{ producto['Nombre'] }}</h5>
                  <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                </div>
                <div className="modal-body">
                  <p>{{ producto['Descripcion'] }}</p>
                  <p><strong>Categoria: </strong>{{ producto['Categoria'] }}</p>
                  <p><strong>Marca: </strong>{{ producto['Marca'] }}</p>
                  <p><strong>Precio:</strong> ${{ producto['Precio'][0]['Valor'] if producto['Precio'] else 'Sin precio' }}</p>
                  <p><strong>Stock:</strong> {{ producto['Stock'] }}</p>
                </div>
                <div className="modal-footer">
                  <form id="form{{ producto['Codigo_del_producto'] }}" method="post">
                    <input type="hidden" name="producto_id" value="{{ producto['Codigo_del_producto'] }}">
                    <button type="submit" className="btn btn-success">Añadir al Carrito</button>
                </form>
                  <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                </div>
              </div>
            </div>
          </div>
        {% endfor %} */}
      </div>
    </div>

    {/* <!-- FOOTER --> */}
    <footer className="bg-dark text-white text-center p-3 mt-5">
      &copy; 2025 FERREMAS. Todos los derechos reservados.
    </footer>

      {/* <Outlet /> */}
    </>
  )
};

export default Layout;

const Pago = () => {
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

      PAGO

      {/* <!-- FOOTER --> */}
      <footer className="bg-dark text-white text-center p-3 mt-5">
        &copy; 2025 FERREMAS. Todos los derechos reservados.
      </footer>
    </>
  )
};

export default Pago;
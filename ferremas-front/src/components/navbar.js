import { useEffect, useState } from "react";
import axios from "axios";

const Navbar = () => {
  const [indicadores, setIndicadores] = useState([])
  const [select, setSelect] = useState('Peso Chileno')

  useEffect(() => {
    const iniCLP = {
      "codigo": "clp",
      "nombre": "Peso Chileno",
      "unidad_medida": "Pesos",
      "fecha": "2025-05-16T04:00:00.000Z",
      "valor": 1
    }

    let storage  = localStorage.getItem("indicador");
    if(!storage){
      localStorage.setItem("indicador", "Peso Chileno");
      localStorage.setItem("valor", 1);
      storage = "Peso Chileno"
    }
    setSelect(storage)
    axios.get('https://www.mindicador.cl/api/')
        .then(response => {
            setIndicadores(response.data)
            let ind = [iniCLP]
            const unidades = ['dolar','euro']
            unidades.forEach(u => {
              ind.push(response.data[u])
            });
            setIndicadores(ind)
        })
        .catch(error => {
            console.log(error)
        });
  }, [select]);

  const selectEvent = event => { 
    const val = indicadores.filter(i => i.nombre === event.target.value)[0]
    localStorage.setItem("indicador", val.nombre);
    localStorage.setItem("valor", val.valor);
    setSelect(event.target.value)
    const clickEvent = new Event('valor');
    dispatchEvent(clickEvent);
  }

  return (
    <>
      <nav className="navbar sticky-top navbar-expand-lg navbar-dark bg-dark ">
        <div className="container">
          <a className="navbar-brand" href="/">FERREMAS</a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbar-ferre"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbar-ferre">
            <ul className="navbar-nav ms-auto">
              
              <li key="select" className="nav-item mr-4" style={{"marginRight": "1.5rem"}} > 
                <select 
                  className="form-select" 
                  aria-label="Default select example"
                  value={select}
                  onChange={selectEvent}>
                  {indicadores.map((i) => (
                    <option value={i.nombre} key={i.nombre}> {i.nombre} </option>
                  ))}
                </select> 
              </li>
              <li key="Inicio" className="nav-item">
                <a className="nav-link" href="/">Inicio</a>
              </li>
              <li key="Contacto" className="nav-item">
                <a className="nav-link" href="/contacto">Contacto</a>
              </li>
              <li key="Carrito" className="nav-item">
                <a className="nav-link" href="/carrito">Carrito</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  )
};

export default Navbar;
import { useEffect, useState } from "react";
import axios from "axios";
import './contactos.css';
import Navbar from "../../components/navbar"; 
import Footer from "../../components/footer";
import Moneda from "../../components/moneda";

const Contactos = () => {
  const [contactos, setContactos] = useState([])

  useEffect(() => {
    axios.get('http://localhost:5000/contactos_realizados')
        .then(response => {
            setContactos(response.data)
        })
        .catch(error => {
            console.log(error)
        });
  }, []);

  return (
    <>
      <Navbar/>

      <div className="container d-flex flex-column" style={{"minHeight": "39.45rem"}}>
        <h3 className="mt-4"> Contactos: </h3>
        {contactos.map((con) => (
          <>
            <div className="card shadow-sm mt-4" style={{width: "100%"}}>
              <div className="card-body">
                <div className="row mb-3">
                  <div className="fw-bold text-muted">Usuario: {con.nombre_cliente}</div>
                  <div className="fw-bold text-muted">Correo: {con.correo_cliente}</div>
                  <div className="fw-bold text-muted">Mensaje:</div>
                  <p className="card-text text-muted">
                    {con.mensaje} 
                  </p>
                </div>

              </div>
            </div>
          </>
        ))}
      </div>

      <Footer/>
    </>
  )
};

export default Contactos;
// import { useEffect, useState } from "react";
// import axios from "axios";
import Navbar from "../../components/navbar"; 
import Footer from "../../components/footer";
import './Contacto.css';

const Pago = () => {

  return (
    <>
      <Navbar/>
        
      <div className="container d-flex justify-content-center align-items-center" style={{minHeight: "79.8vh"}} >
        <div className="card shadow-lg text-center" style={{maxWidth: "900px"}}>
          <div className="card-body">
            <h4 className="mb-4 mt-1">Formulario de Contacto</h4>
            <form action="#" method="post">
              <input type="text" id="nombre" name="nombre" placeholder="Nombre" /><br/>
              <input type="email" id="correo" name="correo" placeholder="Correo" /><br/>
              <input type="number" id="telefono" name="telefono" placeholder="Teléfono" /><br/>
              <textarea id="comentarios" name="comentarios" rows="4" cols="40" placeholder="Mensaje" ></textarea><br/><br/>
              <div className="d-flex flex-row justify-content-around" >
                  <a href="/" role="button" className="button-b align-self-end" >Volver </a>
                  <button id="enviar-contacto-btn" type="button" className="button" onClick={()=>{}}>
                      Enviar
                  </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Footer/>
    </>
  )
};

export default Pago;
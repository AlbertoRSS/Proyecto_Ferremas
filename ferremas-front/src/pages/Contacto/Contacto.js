import { useState } from "react";
import axios from "axios";
import Navbar from "../../components/navbar"; 
import Footer from "../../components/footer";
import './contacto.css';

const Pago = () => {
  const [nombre, setNombre] = useState("")
  const [email, setEmail] = useState("")
  const [mensaje, setMensaje] = useState("")

  const envsarContacto = () => {
    let body = {
      nombre: nombre,
      correo: email,
      mensaje: mensaje
    }
    axios.post('http://localhost:5000/enviar_contacto', body)
        .then(response => {
          alert(response.data.success);
        })
        .catch(error => {
          console.log(error)
          alert('Error al contactar');
        });
  }

  return (
    <>
      <Navbar/>
        
      <div className="container d-flex justify-content-center align-items-center" style={{minHeight: "79.8vh"}} >
        <div className="card shadow-lg text-center" style={{maxWidth: "900px"}}>
          <div className="card-body">
            <h4 className="mb-4 mt-1">Formulario de Contacto</h4>
            <p>Aqui puedes dejarnos un mensaje y te responderemos en cuanto podamos 😉 </p>
            <form action="#" method="post">
              <input 
                type="text" 
                id="nombre" 
                name="nombre" 
                placeholder="Nombre" 
                value={nombre}
                onChange={e=>{setNombre(e.target.value)}}
              /><br/>
              <input 
                type="email" 
                id="correo" 
                name="correo" 
                placeholder="Correo" 
                value={email}
                onChange={e=>{setEmail(e.target.value)}}
              /><br/>
              <textarea 
                id="comentarios" 
                name="comentarios" 
                rows="4" 
                cols="40" 
                placeholder="Mensaje" 
                value={mensaje}
                onChange={e=>{setMensaje(e.target.value)}}
              ></textarea><br/><br/>
              <div className="d-flex flex-row justify-content-around" >
                  <a href="/" role="button" className="button-b align-self-end" >Volver </a>
                  <button id="enviar-contacto-btn" type="button" className="button" onClick={envsarContacto}>
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
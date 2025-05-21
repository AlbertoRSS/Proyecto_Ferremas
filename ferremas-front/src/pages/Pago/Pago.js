import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../components/navbar"; 
import Footer from "../../components/footer";
import Moneda from "../../components/moneda";

const Pago = () => {
  const [resultado, setResultado] = useState("WAITING")
  const [datos, setDatos] = useState({})

  useEffect(() => {
    const search = window.location.search;
    const params = new URLSearchParams(search);
    const token_ws = params.get('token_ws');
    const body = {token_ws: token_ws} 
    axios.post('http://localhost:5000/webpay/retorno', body )
        .then(response => {
            setDatos(response.data)
            setResultado(response.data.status)
        })
        .catch(error => {
            console.log(error)
        });
  }, []);

  return (
    <>
      <Navbar/>

      {
        resultado === "FAILED" ?
        <>
          <div className="container d-flex justify-content-center align-items-center" style={{minHeight: "79.8vh"}} >
            <div className="card border-danger shadow-lg text-center" style={{maxWidth: "400px"}}>
              <div className="card-body">
                <h4 className="card-title text-danger">Pago rechazado</h4>
                <p className="card-text">El pago no fue exitoso.</p>
                <ul className="list-group list-group-flush">
                  <li className="list-group-item"><strong>Orden: {datos?.buy_order}</strong> </li>
                  <li className="list-group-item"><strong>Monto: <Moneda moneda={datos?.amount} /> </strong> </li>
                </ul>
                <p className="mt-3 text-muted">Por favor, intenta nuevamente. <a href="/carrito"> volver </a></p>
              </div>
            </div>
          </div>
        </>
        : resultado === "AUTHORIZED" ?
        <>
          <div className="container d-flex justify-content-center align-items-center" style={{minHeight: "79.8vh"}} >
            <div className="card border-success shadow-lg text-center" style={{maxWidth: "400px"}}>
              <div className="card-body">
                <h4 className="card-title text-success">¡Pago exitoso!</h4>
                <p className="card-text">Gracias por tu compra.</p>
                <ul className="list-group list-group-flush">
                  <li className="list-group-item"><strong>Orden: {datos?.buy_order}</strong> </li>
                  <li className="list-group-item"><strong>Monto: <Moneda moneda={datos?.amount} /> </strong> </li>
                </ul>
              </div>
            </div>
          </div>
        </>
        : 
        <>
          <div className="d-flex justify-content-center align-items-center" style={{minHeight: "79.8vh"}} >
            <div className="text-center">
              <div className="spinner-border" style={{width: "3rem", height: "3rem", color: "#ed786a !important"}}>
                <span className="visually-hidden">Cargando...</span>
              </div>
              <div className="mt-3">Procesando pago...</div>
            </div>
          </div>
        </>
      }

      <Footer/>
    </>
  )
};

export default Pago;
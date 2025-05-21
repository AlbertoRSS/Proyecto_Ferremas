import { useEffect, useState } from "react";

const Moneda = ({ moneda }) => {
  const [valor, setValor] = useState(1)

  useEffect(() => {
    const handleStorageChange = () => {
      const storedData = localStorage.getItem('valor');
      setValor(storedData);
    };
    window.addEventListener('valor', handleStorageChange);
    handleStorageChange()
  }, []);

  const formatoMoneda = (numero) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(numero/valor);
  };

  return (<> {formatoMoneda(moneda)} </>)
};

export default Moneda;
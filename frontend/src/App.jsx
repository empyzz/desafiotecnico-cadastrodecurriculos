import { Link, Route, Routes } from 'react-router-dom';
import Lista from './pages/Lista.jsx';
import Detalhes from './pages/Detalhes.jsx';
import Formulario from './pages/Formulario.jsx';
import './style.css';
export default function App() {
  return <>
    <header><Link to="/">Candidatos</Link> <Link to="/candidatos/novo">Novo candidato</Link></header>
    <main><Routes>
      <Route path="/" element={<Lista />} />
      <Route path="/candidatos/novo" element={<Formulario />} />
      <Route path="/candidatos/:id" element={<Detalhes />} />
      <Route path="*" element={<><h1>Página não encontrada</h1><Link to="/">Voltar à listagem</Link></>} />
    </Routes></main>
  </>;
}

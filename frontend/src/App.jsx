import { Link, Route, Routes } from 'react-router-dom';
export default function App() {
  return <>
    <header><Link to="/">Candidatos</Link> <Link to="/candidatos/novo">Novo candidato</Link></header>
    <main><Routes>
      <Route path="/" element={<h1>Candidatos</h1>} />
      <Route path="/candidatos/novo" element={<h1>Novo candidato</h1>} />
      <Route path="/candidatos/:id" element={<h1>Detalhes do candidato</h1>} />
      <Route path="*" element={<><h1>Página não encontrada</h1><Link to="/">Voltar à listagem</Link></>} />
    </Routes></main>
  </>;
}

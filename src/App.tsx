import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Lottery from './pages/Lottery';
import Pokedex from './pages/Pokedex';
import PokemonDetails from './pages/PokemonDetails';
import History from './pages/History';
import Favorites from './pages/Favorites';
import LootTable from './pages/LootTable';
import Guide from './pages/Guide';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/sorteio" replace />} />
          <Route path="sorteio" element={<Lottery />} />
          <Route path="pokedex" element={<Pokedex />} />
          <Route path="pokemon/:id" element={<PokemonDetails />} />
          <Route path="loot" element={<LootTable />} />
          <Route path="guia" element={<Guide />} />
          <Route path="favoritos" element={<Favorites />} />
          <Route path="historico" element={<History />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

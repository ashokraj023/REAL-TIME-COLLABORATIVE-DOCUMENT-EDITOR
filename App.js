import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Editor from './pages/EditorPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/documents/:id" element={<Editor />} />
    </Routes>
  );
}

export default App;

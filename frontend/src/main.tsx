import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import ProjectEdit from "./pages/ProjectEdit";
import { Routes, Route } from 'react-router-dom';

createRoot(document.getElementById("root")!).render(<App />);

<Routes>
  <Route path="/project/:id/edit" element={<ProjectEdit />} />
</Routes>

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/user/Home.jsx';
import './App.css';

function App() {
  

  return (
    <>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />      
          </Route>
        </Routes>
    </>
  )
}

export default App;

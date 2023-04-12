import React from 'react';
//import Layout from './layout/ResponsiveDrawer';
//import Layout from './layout/PersistentDrawerLeft';
//import Layout from './layout/ResponsiveDrawerHidable';
import { BrowserRouter, Routes, Route  } from 'react-router-dom';
import Home from "./pages/Home";
import About from "./pages/About"
import Page404 from "./pages/Page404";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route /*element={<Layout />}*/>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Route>

        <Route path='*' element={<Page404/>} />
      </Routes>
    </BrowserRouter>  );
};

export default App;
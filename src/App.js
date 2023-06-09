import React, { useCallback, useMemo } from 'react';
import Box from "@mui/material/Box";
import { BrowserRouter, Route, Routes, Navigate} from "react-router-dom";
import Home from "./Home";
import Layout from "./Layout";
import NFT from "./pages/NFT";
import Matrices from "./pages/Matrices";
import Admin from "./pages/Admin";
import { Suspense } from "react";
import "./i18n";

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback="loading">
        <Box sx={{minHeight:"100vh"}}>
          <Layout>
            <Routes>
              <Route exact path="/" element={ <Navigate to="/dashboard"/> }/>
              <Route exact path="/dashboard" element={ <Home /> }/>
              {/* <Route exact path="/nft" element={ <NFT /> }/> */}
              <Route exact path="/matrices" element={ <Matrices /> }/>
              <Route exact path="/admin" element={ <Admin /> }/>
            </Routes>
          </Layout>
        </Box>
      </Suspense>
    </BrowserRouter >
  );
}

export default App;
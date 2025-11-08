import {Route,  Routes } from 'react-router'

import  Home from "./Pages/Home.jsx"
import  CreatePage from "./Pages/CreatePage.jsx"
import  Notedetailpage from "./Pages/Notedetailpage.jsx"


const App = () => {
  return (
    <div>
      <Routes>
        <Route path= "/" element ={<Home/>} />
        <Route path= "/create" element ={<CreatePage/>} />
        <Route path= "/note/:id" element ={<Notedetailpage/>} />

      </Routes>
    </div>
  )
}

export default App

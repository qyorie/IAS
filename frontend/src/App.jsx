import {Route,  Routes } from 'react-router'

import  Homepage from "./Pages/Homepage.jsx"
import  CreatePage from "./Pages/CreatePage.jsx"
import  Notedetailpage from "./Pages/Notedetailpage.jsx"


const App = () => {
  return (
    <div>
      <Routes>
        <Route path= "/" element ={<Homepage/>} />
        <Route path= "/create" element ={<CreatePage/>} />
        <Route path= "/note/:id" element ={<Notedetailpage/>} />

      </Routes>
    </div>
  )
}

export default App

import {Route,  Routes } from 'react-router'

import  Homepage from "./Pages/Homepage"
import  CreatePage from "./Pages/CreatePage"
import  Notedetailpage from './Pages/Notedetailpage'


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

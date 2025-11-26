import {Route,  Routes } from 'react-router'

import  Home from "./Pages/Home.jsx"
import  CreatePost from "./Pages/CreatePost.jsx"
import  ManageUser from "./Pages/ManageUser.jsx"
import  ManagePost from"./Pages/ManagePost.jsx"
import Footer from './components/Footer.jsx'
import Navbar from './components/Navbar.jsx'
import useAuthCheck from './hooks/useAuthCheck.js'


const App = () => {
  useAuthCheck();
  return (
    <>
      <Navbar/>
      <Routes>
        <Route path= "/" element ={<Home/>} />
        <Route path= "/create" element ={<CreatePost/>} />
        <Route path= "/manageusers" element ={<ManageUser/>} />
        <Route path= "/manageposts" element ={<ManagePost/>} />
      </Routes>
      <Footer/>
    </>
  )
}

export default App

import {Route,  Routes } from 'react-router'
import { AuthProvider } from './context/AuthContext';
import {ProtectedRoute, AdminRoute, PublicOnlyRoute} from './components/ProtectedRoute.jsx';
import  Home from "./pages/Home.jsx"
import  CreatePost from "./pages/CreatePost.jsx"
import  ManageUser from "./pages/ManageUser.jsx"
import  ManagePost from"./pages/ManagePost.jsx"
import PostDetail from './pages/PostDetail.jsx';
import NotFound from './pages/NotFound.jsx';
import Footer from './components/Footer.jsx'
import Navbar from './components/Navbar.jsx'


const App = () => {
  return (
    <AuthProvider>
      <Navbar/>
      <Routes>
        <Route path= "/" element ={<Home/>} />
        <Route path= "/posts/:id" element ={<PostDetail/>} />

        <Route element ={<ProtectedRoute/>} >
          <Route path= "/create" element ={<CreatePost/>} />
          <Route path= "/manageposts" element ={<ManagePost/>} />
        </Route>
        <Route element ={<AdminRoute/>} >
          <Route path= "/manageusers" element ={<ManageUser/>} />
          <Route path= "/manageposts" element ={<ManagePost/>} />
        </Route>

        <Route path="*" element={<NotFound/>} />
      </Routes>
      <Footer/>
    </AuthProvider>
  )
}

export default App

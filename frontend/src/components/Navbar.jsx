import { useState } from 'react';
import { Link } from 'react-router-dom';
import LoginModal from './LoginModal.jsx';
import RegisterModal from './RegisterModal.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { LogOut } from 'lucide-react';
import toast from 'react-hot-toast';


const Navbar = () => {
  const { accessToken, role, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const handleLogout = async () => {
    try {
      logout();
      toast.success("Logout successful!");
    } catch (err) {
      toast.error("Error logging out");
    } finally {
      localStorage.removeItem("accessToken");
    }
  };

  return (
    <>
      <nav className="bg-gray-800 text-white">
        <div className="mx-auto max-w-6xl p-4">
          <div className="flex items-center justify-between">
            {role === 'user' ? (
              <>
                <Link to="/"><img src="/logo.svg" alt="Company Logo"/></Link>
              </>
            ) : (
              <>
                <Link to="/"><img src="/logo.svg" alt="Company Logo"></img></Link>
              </>
            )}
            
            <div className="space-x-4">
              {role === 'admin' && (
                <>
                  <Link to="/" className="hover:text-blue-400">Home</Link>
                  <Link to="/create" className="hover:text-blue-400">Create Post</Link>
                  <Link to="/manageposts" className="hover:text-blue-400">Manage Posts</Link>
                  <Link to="/manageusers" className="hover:text-blue-400">Manage Users</Link>
                </>
              )}
              { role === 'user' && (
                <>
                  <Link to="/" className="hover:text-blue-400">Home</Link>
                  <Link to="/create" className="hover:text-blue-400">Create Post</Link>
                  <Link to="/manageposts" className="hover:text-blue-400">Manage Posts</Link>
                </>
              )}

              {!accessToken && (
                <>
                  <button onClick={() => setShowLogin(true)} className="btn btn-primary hover:text-white">Login</button>
                  <button onClick={() => setShowRegister(true)} className="btn btn-secondary hover:text-blue-400">Sign Up</button>
                </>
              )}

              {accessToken && (
                <button
                  onClick={handleLogout}
                  className="bg-red-600 px-3 py-1 rounded hover:bg-red-700"
                >
                  <LogOut className="inline-block mr-2 h-4 w-4" />
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <LoginModal show={showLogin} onClose={() => setShowLogin(false)} />
      <RegisterModal show={showRegister} onClose={() => setShowRegister(false)} />
    </>
  );
};

export default Navbar;

// import { Link } from 'react-router';
// import { Plus, LogIn } from 'lucide-react';

// const Navbar = () => {
//   return (
//     <nav className="border-b bg-neutral">
//       <div className="mx-auto max-w-6xl p-4">
//         <div className="flex items-center justify-between">
//           <h1 className="btn btn-ghost text-xl">SML</h1>
//           <div className="flex items-center gap-4">
//             <Link to={"/create"} className="btn btn-primary rounded-full">
//               <Plus className="size-5"/>
//               <span>Create a Post</span>
//             </Link>
//             <Link to={"/create"} className="btn rounded-full">
//               <LogIn className="size-5"/>
//               <span>login/register</span>
//             </Link>
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// }

// export default Navbar;

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LoginModal from './LoginModal.jsx';
import RegisterModal from './RegisterModal.jsx';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/');
    window.location.reload();
  };

  return (
    <>
      <nav className="bg-gray-800 text-white">
        <div className="mx-auto max-w-6xl p-4">
          <div className="flex items-center justify-between">
            <h1 className="btn text-xl font-semibold">SML</h1>
            <div className="space-x-4">

              {role === 'user' && (
                <>
                  <Link to="/" className="hover:text-blue-400">Home</Link>
                  <Link to="/create" className="hover:text-blue-400">Create Post</Link>
                  <Link to="/manage" className="hover:text-blue-400">Manage Posts</Link>
                </>
              )}

              {role === 'admin' && (
                <>
                  <Link to="/" className="hover:text-blue-400">Home</Link>
                  <Link to="/manage" className="hover:text-blue-400">Manage Posts</Link>
                  <Link to="/users" className="hover:text-blue-400">Manage Users</Link>
                </>
              )}

              {!token && (
                <>
                  <button onClick={() => setShowLogin(true)} className="btn btn-primary hover:text-white">Login</button>
                  <button onClick={() => setShowRegister(true)} className="btn btn-secondary hover:text-blue-400">Sign Up</button>
                </>
              )}

              {token && (
                <button
                  onClick={handleLogout}
                  className="bg-red-600 px-3 py-1 rounded hover:bg-red-700"
                >
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

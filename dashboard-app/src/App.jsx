// MAIN
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';


import MainLayout from './components/layout/MainLayout';


import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AnalyticPage from './pages/AnalyticPage';
import SettingPage from './pages/SettingPage';



const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useStore((state) => state.auth.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  const { isDarkMode } = useStore();

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <BrowserRouter>
        <Routes>

          <Route path="/login" element={<LoginPage />} />


          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >

            <Route index element={<DashboardPage />} />


            <Route path="analytics" element={<AnalyticPage />} />


            <Route path="settings" element={<SettingPage />} />
          </Route>


          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;





// DEMO

// import React from 'react';

// import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { useStore } from './store/useStore';

// import MainLayout from './components/layout/MainLayout';


// import LoginPage from './pages/LoginPage';
// import DashboardPage from './pages/DashboardPage';
// import AnalyticPage from './pages/AnalyticPage';
// import SettingPage from './pages/SettingPage';


// const ProtectedRoute = ({ children }) => {
//   const isAuthenticated = useStore((state) => state.auth.isAuthenticated);
//   return isAuthenticated ? children : <Navigate to="/login" replace />;
// };

// function App() {
//   const { isDarkMode } = useStore();

//   return (
//     <div className={isDarkMode ? 'dark' : ''}>

//       <Router>
//         <Routes>

//           <Route path="/login" element={<LoginPage />} />


//           <Route
//             path="/"
//             element={
//               <ProtectedRoute>
//                 <MainLayout />
//               </ProtectedRoute>
//             }
//           >

//             <Route index element={<DashboardPage />} />

//             <Route path="analytics" element={<AnalyticPage />} />

//             <Route path="settings" element={<SettingPage />} />
//           </Route>

//           <Route path="*" element={<Navigate to="/" replace />} />
//         </Routes>
//       </Router>
//     </div>
//   );
// }

// export default App;
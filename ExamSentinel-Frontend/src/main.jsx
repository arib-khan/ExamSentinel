// // // Updated main.jsx
// // import { createRoot } from "react-dom/client";
// // import "./index.css";
// // import App from "./App.jsx";
// // import { ThemeProvider } from "./constants/theme-provider";
// // import { Provider } from "react-redux";
// // import { store } from "./store/index.js";
// // import { PermissionProvider } from "./contexts/PermissionContext";

// // createRoot(document.getElementById("root")).render(
// //   <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
// //     <Provider store={store}>
// //       <PermissionProvider>
// //         <App />
// //       </PermissionProvider>
// //     </Provider>
// //   </ThemeProvider>
// // );

// // Updated main.jsx
// import { StrictMode } from 'react';
// import { createRoot } from 'react-dom/client';
// import { Provider } from 'react-redux';
// import { PermissionProvider } from './contexts/PermissionContext';
// import { UserRoleProvider } from './contexts/UserRoleContext';
// import App from './App.jsx';
// import './index.css';
// import Loader from './components/reusableComponets/Loader';
// import { store } from './store';
// import { ThemeProvider } from './constants/theme-provider';

// createRoot(document.getElementById('root')).render(
//   // <StrictMode>
//   <Provider store={store}>
//     {/* <PersistGate loading={<Loader />} persistor={persistor}> */}
//     <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
//       <UserRoleProvider>
//         <PermissionProvider>
//           <App />
//         </PermissionProvider>
//       </UserRoleProvider>
//     </ThemeProvider>
//     {/* </PersistGate> */}
//   </Provider>
//   // </StrictMode>
// );

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { PermissionProvider } from './contexts/PermissionContext';
import { UserRoleProvider } from './contexts/UserRoleContext';
import App from './App.jsx';
import './index.css';
import Loader from './components/reusableComponets/Loader';
import { store } from './store';
import { ThemeProvider } from './constants/theme-provider';
import { config } from './config';
import { ExamSocketProvider } from './store/context/ExamSocketContext';

// Load config before rendering
config.load().then(() => {
  createRoot(document.getElementById('root')).render(
    // <StrictMode>
    <Provider store={store}>
      {/* <PersistGate loading={<Loader />} persistor={persistor}> */}
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <ExamSocketProvider>
          <UserRoleProvider>
            <PermissionProvider>
              <App />
            </PermissionProvider>
          </UserRoleProvider>
        </ExamSocketProvider>
      </ThemeProvider>
      {/* </PersistGate> */}
    </Provider>
    // </StrictMode>
  );
}).catch(error => {
  console.error('Failed to load config:', error);
  // Render with fallback config
  createRoot(document.getElementById('root')).render(
    <Provider store={store}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <UserRoleProvider>
          <PermissionProvider>
            <App />
          </PermissionProvider>
        </UserRoleProvider>
      </ThemeProvider>
    </Provider>
  );
});
import {
  createBrowserRouter,
  Outlet,
  redirect,
  RouterProvider,
} from "react-router";
import "./App.css";
import Login from "./Pages/Login/Login";
import SignUp from "./Pages/SignUp/signUp";
import Profile from "./Pages/Profile/profile";
import LandingPage from "./Pages/LandingPage/LandingPage";
import Navbar from "./Components/Navbar/Navbar";
import ForgotPassword from "./Pages/ForgotPassword/ForgotPassword";
import Wallet from "./Pages/Wallet/Wallet";

function LayoutWithNavbar() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}

function App() {
  const router = createBrowserRouter([
    { path: "/", loader: () => redirect("/Login") },
    { path: "Login", element: <Login /> },
    { path: "SignUp", element: <SignUp /> },
    { path: "ForgotPassword", element: <ForgotPassword /> },

    {
      path: "/",
      element: LayoutWithNavbar(),
      children: [
        { path: "Profile", element: <Profile /> },
        { path: "LandingPage", element: <LandingPage /> },
        { path: "Wallet", element: <Wallet /> },
      ],
    },
  ]);

  return (
    <div className="app">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;

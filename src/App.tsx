import { createBrowserRouter, redirect, RouterProvider } from "react-router";
import "./App.css";
import Login from "./Pages/Login/Login";
import SignUp from "./Pages/SignUp/signUp";
import Profile from "./Pages/Profile/profile";
import PopUp from "./Components/PopUp/PopUp";

function App() {
  const router = createBrowserRouter([
    { path: "/", loader: () => redirect("/Login") },
    { path: "Login", element: <Login /> },
    { path: "SignUp", element: <SignUp /> },
    { path: "Profile", element: <Profile /> },
    { path: "POP", element: <PopUp /> },
  ]);

  return (
    <div className="app">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;

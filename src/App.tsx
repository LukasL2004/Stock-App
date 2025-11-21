import { createBrowserRouter, redirect, RouterProvider } from "react-router";
import "./App.css";
import Login from "./Pages/Login/Login";

function App() {
  const router = createBrowserRouter([
    { path: "/", loader: () => redirect("/Login") },
    { path: "Login", element: <Login /> },
  ]);

  return (
    <div className="app">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;

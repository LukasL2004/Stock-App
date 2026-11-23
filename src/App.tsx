import { createBrowserRouter, Navigate, Outlet, redirect, RouterProvider, useRouteError, Link } from "react-router";
import "./App.css";
import "./Components/UI/ui.css";
import Login from "./Pages/Login/Login";
import SignUp from "./Pages/SignUp/signUp";
import Profile from "./Pages/Profile/profile";
import LandingPage from "./Pages/LandingPage/LandingPage";
import Navbar from "./Components/Navbar/Navbar";
import ForgotPassword from "./Pages/ForgotPassword/ForgotPassword";
import Wallet from "./Pages/Wallet/Wallet";
import Footer from "./Components/Footer/Footer";
import ChatbaseWidget from "./Components/Reuseable/ChatBot/chatbot";
import { ThemeProvider } from "./lib/theme";
import { ToastProvider } from "./lib/toast";
import { I18nProvider } from "./i18n";
import { useI18n } from "./i18n/useI18n";
import { isAuthenticated } from "./lib/auth";
import Button from "./Components/UI/Button";

function LayoutWithNavbar() {
  return (
    <div className="main-layout">
      <Navbar />
      <main id="main">
        <Outlet />
      </main>
      <Footer />
      <ChatbaseWidget />
    </div>
  );
}

function RouteError() {
  const { t } = useI18n();
  const error = useRouteError() as { status?: number; statusText?: string } | undefined;
  const notFound = error?.status === 404;
  return (
    <div className="page" style={{ minHeight: "60vh", display: "grid", placeItems: "center", textAlign: "center" }}>
      <div>
        <h1 style={{ fontSize: "1.5rem" }}>{notFound ? t("route.notFound") : t("route.error")}</h1>
        <p className="muted" style={{ margin: "8px 0 20px" }}>
          {notFound ? t("route.notFoundBody") : t("route.errorBody")}
        </p>
        <Link to="/dashboard">
          <Button variant="primary">{t("route.goDashboard")}</Button>
        </Link>
      </div>
    </div>
  );
}

const requireAuth = () => (isAuthenticated() ? null : redirect("/Login"));
const redirectIfAuthed = () => (isAuthenticated() ? redirect("/dashboard") : null);

const router = createBrowserRouter([
  { path: "/", loader: () => redirect(isAuthenticated() ? "/dashboard" : "/Login") },
  { path: "Login", element: <Login />, loader: redirectIfAuthed },
  { path: "SignUp", element: <SignUp />, loader: redirectIfAuthed },
  { path: "ForgotPassword", element: <ForgotPassword /> },
  {
    path: "/",
    loader: requireAuth,
    element: <LayoutWithNavbar />,
    errorElement: <RouteError />,
    children: [
      { path: "dashboard", element: <LandingPage /> },
      { path: "portfolio", element: <Wallet /> },
      { path: "profile", element: <Profile /> },
      // Legacy paths kept so old links keep working
      { path: "LandingPage", element: <Navigate to="/dashboard" replace /> },
      { path: "Wallet", element: <Navigate to="/portfolio" replace /> },
      { path: "Profile", element: <Navigate to="/profile" replace /> },
      { path: "*", element: <RouteError /> },
    ],
  },
]);

export default function App() {
  return (
    <I18nProvider>
      <ThemeProvider>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </ThemeProvider>
    </I18nProvider>
  );
}

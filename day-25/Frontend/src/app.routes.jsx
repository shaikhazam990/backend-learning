import { createBrowserRouter } from "react-router";
import Login    from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import Protected from "./features/auth/components/Protected";
import Home     from "./features/home/pages/Home";

// All routes in one place
// Protected wraps Home so unauthenticated users are redirected to /login
export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Protected>
        <Home/>
      </Protected>
    ),
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
]);
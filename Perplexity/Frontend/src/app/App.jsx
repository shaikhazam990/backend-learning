import { RouterProvider } from "react-router";
import { router } from "./app.routes";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUser, setLoading, clearUser } from "../features/auth/auth.slice";
import { getMe } from "../features/auth/service/auth.api";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const initAuth = async () => {
      try {
        dispatch(setLoading(true));
        const data = await getMe();
        dispatch(setUser(data.user));
      } catch {
        dispatch(clearUser());
      } finally {
        dispatch(setLoading(false)); 
      }
    };
    initAuth();
  }, []);

  return <RouterProvider router={router} />;
}

export default App;
import { Navigate } from "react-router";
import { useAuth } from "../hooks/useAuth";

// Protected wraps any page that needs the user to be logged in
// If loading → show spinner
// If not logged in → redirect to /login
// If logged in → show the page normally

const Protected = ({ children }) => {
  const { user, loading } = useAuth();

  // Still checking if user is logged in (getMe API call in progress)
  if (loading) {
    return (
      <>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          .protected-spinner-wrap {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgb(33, 33, 33);
          }
          .protected-spinner {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            border: 3px solid #2a2a2a;
            border-top-color: #dd4200;
            animation: spin 0.7s linear infinite;
          }
        `}</style>
        <div className="protected-spinner-wrap">
          <div className="protected-spinner" />
        </div>
      </>
    );
  }

  // getMe finished and no user found → go to login
  if (!user) {
    return <Navigate to="/login" />;
  }

  // User is logged in → render the protected page
  return children;
};

export default Protected;
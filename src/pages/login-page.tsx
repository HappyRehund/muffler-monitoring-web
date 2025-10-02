import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuthContext } from "../hooks/use-auth-context";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { user, handleSignIn, handleSignUp, loading } = useAuthContext();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (user) {
    return <Navigate to="/incidents" replace />;
  }

  const onSignIn = async () => {
    try {
      setError('');
      await handleSignIn(email, password);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred during sign in");
      }
    }
  };

  const onSignUp = async () => {
    try {
      setError('');
      await handleSignUp(email, password);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred during sign up.");
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded shadow-md w-96">
        <h1 className="text-2xl font-bold mb-4">Login Sistem Monitoring</h1>
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          placeholder="Email"
          className="w-full p-2 mb-4 border rounded"
        />
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          placeholder="Password"
          className="w-full p-2 mb-4 border rounded"
        />
        <div className="flex justify-between">
          <button onClick={onSignIn} className="bg-blue-500 text-white px-4 py-2 rounded">
            Sign In
          </button>
          <button onClick={onSignUp} className="bg-green-500 text-white px-4 py-2 rounded">
            Sign Up
          </button>
        </div>
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>
    </div>
  );
}
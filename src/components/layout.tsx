import { Outlet } from "react-router-dom";
import { useAuthContext } from "../hooks/use-auth-context";

export default function Layout() {
  const { user, handleSignOut } = useAuthContext();

  return (
    <div className="bg-gray-50 min-h-screen">
      <nav className='bg-amber-300 w-full p-4 flex justify-between items-center shadow-md'>
        <h1 className="text-xl font-bold">Brong Monitoring System</h1>
        <div>
          <span className="mr-4">{user?.email}</span>
          <button onClick={handleSignOut} className="bg-red-500 text-white px-4 py-2 rounded">
            Sign Out
          </button>
        </div>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
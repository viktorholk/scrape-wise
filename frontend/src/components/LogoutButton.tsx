import { useNavigate } from 'react-router-dom';

export default function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token'); // Clear the token
    navigate('/login'); // Redirect to login
  };

  return (
    <button onClick={handleLogout} className="text-red-500">
      Logout
    </button>
  );
}
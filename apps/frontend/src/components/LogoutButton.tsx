import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login'); 
  };

  return (
    <button onClick={handleLogout} className="w-full text-muted-foreground flex gap-2 items-center ">
      <LogOut/> Logout
    </button>
  );
}
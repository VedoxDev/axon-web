// Logo component
import { useNavigate } from 'react-router-dom';
import LogoImage from '../assets/images/Logo_Login.png';

interface LogoProps {
  className?: string;
  clickable?: boolean;
}

function Logo({ className = "", clickable = true }: LogoProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/dashboard');
  };

  if (!clickable) {
    return (
      <img 
        src={LogoImage} 
        alt="Axon logo" 
        className={className}
      />
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`flex items-center hover:opacity-80 transition-opacity ${className}`}
      title="Ir al inicio"
    >
      <img src={LogoImage} alt="Axon logo" className="h-16"/>
    </button>
  );
}

export default Logo; 
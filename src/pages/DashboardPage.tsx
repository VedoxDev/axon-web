import { Link } from 'react-router-dom';
import { Logo, Button } from '../components';

function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 shadow-lg p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Logo />
          <nav className="flex space-x-4">
            <Link to="/" className="text-gray-300 hover:text-white transition-colors">
              Cerrar sesión
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">¡Bienvenido a Axon!</h1>
          <p className="text-gray-400 text-lg mb-8">
            Has iniciado sesión exitosamente. Esta es tu página principal.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {/* Feature Cards */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
              <h3 className="text-xl font-semibold mb-3">Salas de Chat</h3>
              <p className="text-gray-400 mb-4">Únete a salas de chat en tiempo real</p>
              <Button variant="orange">Explorar Salas</Button>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
              <h3 className="text-xl font-semibold mb-3">Crear Sala</h3>
              <p className="text-gray-400 mb-4">Crea tu propia sala de chat</p>
              <Button variant="primary">Crear Nueva Sala</Button>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
              <h3 className="text-xl font-semibold mb-3">Perfil</h3>
              <p className="text-gray-400 mb-4">Gestiona tu perfil y configuración</p>
              <Button variant="secondary">Ver Perfil</Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default DashboardPage; 
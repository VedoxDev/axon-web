import React, { useEffect, useState } from 'react';
import { LiveKitRoom, VideoConference, RoomAudioRenderer } from '@livekit/components-react';
import '@livekit/components-styles';
import './livekit-spanish.css';
import { useAlert } from '../../hooks/useAlert';
import callsService, { type Call } from '../../services/callsService';
import { LIVEKIT_URL } from '../../config/apiConfig';

interface VideoCallScreenProps {
  callId: string;
  onClose: () => void;
}

const VideoCallScreen: React.FC<VideoCallScreenProps> = ({ callId, onClose }) => {
  const { showError, showSuccess } = useAlert();
  
  // State
  const [call, setCall] = useState<Call | null>(null);
  const [token, setToken] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  // Get LiveKit URL from configuration
  const livekitUrl = LIVEKIT_URL;

  useEffect(() => {
    joinCall();
  }, []);

  const joinCall = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Tu navegador no soporta videollamadas. Intenta con un navegador más reciente o verifica que estés usando HTTPS.');
      }

      // Check for available devices
      let hasCamera = false;
      let hasMicrophone = false;
      
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        hasCamera = devices.some(device => device.kind === 'videoinput');
        hasMicrophone = devices.some(device => device.kind === 'audioinput');
        
        console.log('Available devices:', { hasCamera, hasMicrophone });
      } catch (error) {
        console.warn('Could not enumerate devices:', error);
        // Continue anyway, let LiveKit handle device detection
      }

      // Join call via API
      const { call: callData, token: callToken } = await callsService.joinCall(callId);
      setCall(callData);
      setToken(callToken);
      
      // Update video enabled state based on call type and device availability
      if (callData.audioOnly || !hasCamera) {
        setIsVideoEnabled(false);
        console.log('Video disabled:', callData.audioOnly ? 'audio-only call' : 'no camera available');
      }

      if (!hasMicrophone) {
        setIsAudioEnabled(false);
        console.log('Audio disabled: no microphone available');
      }
      
      console.log('Joining call:', callData.title, 'Room:', callData.roomName);
      
      // Show appropriate success message based on device availability
      if (!hasCamera && !hasMicrophone) {
        showSuccess('Conectado en modo solo escucha (sin micrófono ni cámara)', '👂');
      } else if (!hasCamera) {
        showSuccess('Conectado sin cámara (solo audio)', '🎤');
      } else if (!hasMicrophone) {
        showSuccess('Conectado sin micrófono (solo video)', '📹');
      } else {
        showSuccess('Conectado a la llamada', '🎥');
      }

    } catch (error: any) {
      console.error('Failed to join call:', error);
      
      // Handle specific error cases
      let errorMessage = error.message || 'Error al unirse a la llamada';
      
      if (error.message && error.message.includes('call-has-ended')) {
        errorMessage = 'Esta llamada ya ha finalizado';
      } else if (error.message && error.message.includes('call not found')) {
        errorMessage = 'La llamada no existe o ya ha finalizado';
      } else if (error.message && error.message.includes('unauthorized')) {
        errorMessage = 'No tienes permisos para unirte a esta llamada';
      }
      
      setError(errorMessage);
      showError(errorMessage, 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      // Notify backend that we're leaving
      await callsService.leaveCall(callId);
      showSuccess('Has salido de la llamada', '👋');
    } catch (error: any) {
      console.error('Failed to leave call:', error);
    } finally {
      onClose();
    }
  };

  const handleError = (error: Error) => {
    console.error('LiveKit error:', error);
    setError(error.message);
    showError('Error en la llamada: ' + error.message, 'Error');
  };

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999]">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-lg">
          <h3 className="text-lg font-semibold text-red-600 mb-2">Error en la llamada</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">{error}</p>
          
          {error.includes('getUserMedia') || error.includes('navegador no soporta') ? (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>💡 Posibles soluciones:</strong>
                <br />• Usa un navegador moderno (Chrome, Firefox, Safari)
                <br />• Verifica que tengas cámara y/o micrófono conectados
                <br />• Asegúrate de estar usando HTTPS (no HTTP)
                <br />• Permite el acceso a cámara y micrófono cuando el navegador lo solicite
              </p>
            </div>
          ) : null}
          
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  if (isLoading || !call || !token) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999]">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="animate-spin w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full"></div>
            <span className="text-gray-700 dark:text-gray-300">Conectando a la llamada...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Modal Container */}
      <div className="bg-black rounded-xl shadow-2xl w-full h-full max-w-7xl max-h-[95vh] overflow-hidden relative border border-gray-700">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 bg-gray-900 bg-opacity-90 backdrop-blur-sm p-4 flex items-center justify-between z-[10001] border-b border-gray-700">
          <div>
            <h2 className="text-lg font-semibold text-white">
              {call.title || 'Llamada'}
            </h2>
            <p className="text-sm text-gray-300">
              {call.type === 'direct' 
                ? `Llamada directa${call.audioOnly ? ' (solo audio)' : ''}`
                : `Llamada de proyecto${call.audioOnly ? ' (solo audio)' : ''}`
              }
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
              🔴 En llamada
            </div>
            
            {/* Device status indicators */}
            {!isAudioEnabled && !isVideoEnabled && (
              <div className="text-xs text-blue-400 bg-blue-900/30 px-2 py-1 rounded">
                👂 Solo escucha
              </div>
            )}
            {!isAudioEnabled && isVideoEnabled && (
              <div className="text-xs text-yellow-400 bg-yellow-900/30 px-2 py-1 rounded">
                🔇 Sin micrófono
              </div>
            )}
            {isAudioEnabled && !isVideoEnabled && (
              <div className="text-xs text-green-400 bg-green-900/30 px-2 py-1 rounded">
                🎤 Solo audio
              </div>
            )}
            <button
              onClick={handleDisconnect}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Salir</span>
            </button>
          </div>
        </div>

        {/* LiveKit Room - takes up the modal space */}
        <div className="w-full h-full pt-20 livekit-spanish">
          <LiveKitRoom
            video={isVideoEnabled && !call.audioOnly}
            audio={isAudioEnabled}
            token={token}
            serverUrl={livekitUrl}
            data-lk-theme="default"
            style={{ 
              height: '100%', 
              width: '100%',
              borderRadius: '0 0 0.75rem 0.75rem'
            }}
            onDisconnected={handleDisconnect}
            onError={handleError}
            options={{
              adaptiveStream: true,
              dynacast: true,
            }}
          >
            {/* Video Conference UI with Spanish styling */}
            <VideoConference />
            
            {/* Audio Renderer - handles audio tracks automatically */}
            <RoomAudioRenderer />
          </LiveKitRoom>
        </div>

      </div>
    </div>
  );
};

export default VideoCallScreen; 
import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useDispatch } from 'react-redux';
import { addNotification } from '@/store/slices/notificationSlice';
import { SOCKET_URL } from '@/constants';
import { useAuth } from './useAuth';

let socketInstance = null;

export const useSocket = () => {
  const { token, isAuthenticated } = useAuth();
  const dispatch = useDispatch();
  const initialized = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !token || initialized.current) return;
    initialized.current = true;

    socketInstance = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketInstance.on('connect', () => console.log('🔌 Socket холбогдлоо'));
    socketInstance.on('disconnect', () => console.log('🔌 Socket салагдлаа'));
    socketInstance.on('notification:new', (payload) => {
      dispatch(addNotification(payload));
    });

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
        initialized.current = false;
      }
    };
  }, [isAuthenticated, token]);

  return socketInstance;
};

export const getSocket = () => socketInstance;

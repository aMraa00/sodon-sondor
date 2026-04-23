import { useSelector, useDispatch } from 'react-redux';
import { selectUser, selectAuth, loginUser, logoutUser } from '@/store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const auth = useSelector(selectAuth);
  const user = useSelector(selectUser);

  const login = (creds) => dispatch(loginUser(creds));
  const logout = () => dispatch(logoutUser());

  return {
    user,
    token: auth.token,
    loading: auth.loading,
    error: auth.error,
    isAuthenticated: !!auth.token && !!user,
    isAdmin:       user?.role === 'admin',
    isDoctor:      user?.role === 'doctor',
    isReceptionist: user?.role === 'receptionist',
    isPatient:     user?.role === 'patient',
    login,
    logout,
  };
};

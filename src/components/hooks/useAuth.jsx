import { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (redirectUrl = null) => {
    try {
      // Instead of using User.loginWithRedirect, handle it safely
      if (redirectUrl) {
        navigate(redirectUrl);
      } else {
        navigate('/Home');
      }
    } catch (error) {
      console.error('Login navigation error:', error);
      // Don't try window.location as fallback in iframe context
    }
  };

  const logout = async () => {
    try {
      await User.logout();
      setUser(null);
      navigate('/Home');
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
      navigate('/Home');
    }
  };

  return { user, loading, login, logout, checkAuth };
};
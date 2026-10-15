import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Loader from '@/components/Loader';
import { useAuth } from '@/context/AuthContext';

export default function LogoutPage() {
  const router = useRouter();
  const { logoutFun } = useAuth();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        await logoutFun();
      } catch (err) {
        console.error('Logout error:', err);
      } finally {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('adminInfo');
        }
        router.replace('/login');
      }
    };

    handleLogout();
  }, [router, logoutFun]);

  return <Loader message="Logging out of Swadhaar Admin..." minHeight="100vh" />;
}

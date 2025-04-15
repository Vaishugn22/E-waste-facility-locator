// components/withAuthRedirect.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';

const withAuthRedirect = (WrappedComponent) => {
  return (props) => {
    const router = useRouter();

    useEffect(() => {
      // Check if window is defined to ensure it's running on the client
      if (typeof window !== 'undefined') {
        const user = localStorage.getItem('user');
        if (user) {
          // If user is logged in, redirect to dashboard or home page
          router.replace('/'); // Change '/dashboard' to your desired route
        }
      }
    }, [router]);

    // Optionally, you can return null or a loading spinner while redirecting
    return <WrappedComponent {...props} />;
  };
};

export default withAuthRedirect;

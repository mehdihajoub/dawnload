import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';

export function Cancel() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to home after 5 seconds
    const timeout = setTimeout(() => {
      navigate('/');
    }, 5000);

    return () => clearTimeout(timeout);
  }, [navigate]);

  return (
    <div className="container py-16">
      <div className="max-w-md mx-auto text-center">
        <XCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-4">Payment Cancelled</h1>
        <p className="text-gray-600 mb-8">
          Your payment was cancelled. You will be redirected to the home page in a few seconds.
        </p>
        <Link to="/" className="btn-primary">
          Return to Home
        </Link>
      </div>
    </div>
  );
}
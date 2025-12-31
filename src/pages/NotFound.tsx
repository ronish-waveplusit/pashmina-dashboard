
import  { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Coffee, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cream-light p-4">
      <div className="text-center">
        <div className="mb-6 flex justify-center">
          <div className="bg-coffee-dark/10 p-4 rounded-full">
            <Coffee className="h-16 w-16 text-coffee" />
          </div>
        </div>
        <h1 className="text-6xl font-bold text-coffee-dark mb-2">404</h1>
        <h2 className="text-2xl font-medium mb-4">Page Not Found</h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          We couldn't find the page you were looking for. It might have been moved, deleted, or never existed.
        </p>
        <Link
          to="/"
          className="button-primary inline-flex items-center"
        >
          <Home className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;

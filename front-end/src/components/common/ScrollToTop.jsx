import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// This component will scroll the window to the top whenever the route changes
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to the top of the page whenever the pathname changes
    window.scrollTo(0, 0);
  }, [pathname]);

  // This component doesn't render anything
  return null;
};

export default ScrollToTop;
import { useMediaQuery } from 'react-responsive';

export default () => {
  const isMobile = useMediaQuery({ query: '(max-width: 600px)' });
  const isDesktop = useMediaQuery({ query: '(min-width: 1025px)' });
  
  return {
    isMobile,
    isDesktop,
  };
}

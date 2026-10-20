import React, {createContext, useContext, useEffect, useState} from 'react';
const RouterContext = createContext(null);
export const useRouter = () => useContext(RouterContext);
const currentPath = () => window.location.pathname.replace(/\/+$/, '') || '/';
export function Router({children}) {
  const [path, setPath] = useState(currentPath);
  useEffect(() => {
    const onPop = () => setPath(currentPath());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  useEffect(() => { window.scrollTo(0, 0);
    const main = document.querySelector('main');
    if (main) { main.setAttribute('tabindex', '-1'); main.focus({preventScroll:true}); } }, [path]);
  function navigate(to) {
    if (to !== currentPath()) window.history.pushState(null, '', to);
    setPath(currentPath());
  }
  return <RouterContext.Provider value={{path, navigate}}>{children}</RouterContext.Provider>;
}
export function Link({href, onClick, children, ...props}) {
  const {navigate} = useRouter();
  return <a {...props} href={href} onClick={event => {
    onClick?.(event);
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || props.target || props.download) return;
    event.preventDefault();
    navigate(href);
  }}>{children}</a>;
}

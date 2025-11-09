import { NavLink as RouterNavLink, NavLinkProps } from 'react-router-dom';

interface CustomNavLinkProps extends NavLinkProps {
  activeClassName?: string;
}

export function NavLink({ className, activeClassName, ...props }: CustomNavLinkProps) {
  return (
    <RouterNavLink
      {...props}
      className={({ isActive }) => {
        if (typeof className === 'function') {
          return className({ isActive, isPending: false, isTransitioning: false });
        }
        return `${className || ''} ${isActive && activeClassName ? activeClassName : ''}`.trim();
      }}
    />
  );
}

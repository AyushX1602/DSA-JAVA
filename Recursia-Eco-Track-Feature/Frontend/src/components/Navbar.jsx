import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu';
import { 
  NavigationMenu, 
  NavigationMenuContent, 
  NavigationMenuItem, 
  NavigationMenuLink, 
  NavigationMenuList, 
  NavigationMenuTrigger 
} from './ui/navigation-menu';
import { userAtom, logoutAtom, isAuthenticatedAtom, userRoleAtom } from '../store/authAtoms';
import { Leaf, User, Settings, LogOut, Bell, Shield, Truck } from 'lucide-react';

const Navbar = () => {
  const [user] = useAtom(userAtom);
  const [, logout] = useAtom(logoutAtom);
  const [isAuthenticated] = useAtom(isAuthenticatedAtom);
  const [userRole] = useAtom(userRoleAtom);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4" />;
      case 'driver':
        return <Truck className="h-4 w-4" />;
      case 'user':
        return <User className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-700';
      case 'driver':
        return 'bg-blue-100 text-blue-700';
      case 'user':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getNavigationLinks = () => {
    if (!user) return [];
    
    switch (user.role) {
      case 'admin':
        return [
          { href: '/admin', label: 'Dashboard' },
          { href: '/admin/pickups', label: 'Pickups' },
          { href: '/admin/drivers', label: 'Drivers' },
          { href: '/admin/analytics', label: 'Analytics' }
        ];
      case 'driver':
        return [
          { href: '/driver', label: 'Dashboard' },
          { href: '/driver/pickups', label: 'My Pickups' },
          { href: '/driver/notifications', label: 'Notifications' }
        ];
      case 'user':
        return [
          { href: '/dashboard', label: 'Dashboard' },
          { href: '/dashboard/history', label: 'History' }
        ];
      default:
        return [];
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo and Brand */}
        <Link to={isAuthenticated ? (user?.role === 'admin' ? '/admin' : user?.role === 'driver' ? '/driver' : '/dashboard') : '/'} className="flex items-center space-x-2">
          <div className="bg-green-600 p-2 rounded-lg">
            <Leaf className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">EcoTrack</span>
        </Link>

        {/* Navigation Links - Show different content based on authentication */}
        {isAuthenticated && user ? (
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              {getNavigationLinks().map((link) => (
                <NavigationMenuItem key={link.href}>
                  <NavigationMenuLink asChild>
                    <Link
                      to={link.href}
                      className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none disabled:pointer-events-none disabled:opacity-50"
                    >
                      {link.label}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        ) : (
          // Landing page navigation for unauthenticated users
          <div className="hidden md:flex items-center space-x-6">
            <Link to="#features" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
              Features
            </Link>
            <Link to="#about" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
              About
            </Link>
            <Link to="#contact" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
              Contact
            </Link>
          </div>
        )}

        {/* Right Side */}
        <div className="flex items-center space-x-4">
          {isAuthenticated && user ? (
            <>
              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                  3
                </Badge>
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.name || 'User'}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        {getRoleIcon(user.role)}
                        <Badge variant="secondary" className={getRoleColor(user.role)}>
                          {user.role}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 text-red-600">
                    <LogOut className="h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Get Started</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
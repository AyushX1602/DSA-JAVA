import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
import { userAtom, logoutAtom } from '../store/authAtoms';
import { 
  Leaf, 
  User, 
  Settings, 
  LogOut, 
  Bell, 
  Shield, 
  Truck, 
  Menu,
  BarChart3,
  Clock,
  CheckCircle,
  MapPin,
  Users,
  Navigation,
  Plus
} from 'lucide-react';

const DashboardTopbar = ({ showMobileMenu, setShowMobileMenu }) => {
  const [user] = useAtom(userAtom);
  const [, logout] = useAtom(logoutAtom);
  const navigate = useNavigate();
  const location = useLocation();

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

  const getDashboardTitle = () => {
    switch (user?.role) {
      case 'admin':
        return 'Admin Dashboard';
      case 'driver':
        return 'Driver Dashboard';
      case 'user':
        return 'User Dashboard';
      default:
        return 'Dashboard';
    }
  };

  const getQuickActions = () => {
    switch (user?.role) {
      case 'admin':
        return [
          { icon: BarChart3, label: 'Analytics', path: '/admin' },
          { icon: Users, label: 'Users', path: '/admin/users' },
          { icon: Truck, label: 'Drivers', path: '/admin/drivers' },
          { icon: MapPin, label: 'Pickups', path: '/admin/pickups' }
        ];
      case 'driver':
        return [
          { icon: MapPin, label: 'Dashboard', path: '/driver' },
          { icon: Clock, label: 'Pickups', path: '/driver/pickups' },
          { icon: Navigation, label: 'Navigate', path: '/driver/navigate' },
          { icon: CheckCircle, label: 'Completed', path: '/driver/completed' }
        ];
      case 'user':
        return [
          { icon: Plus, label: 'New Request', path: '/dashboard' },
          { icon: Clock, label: 'Pending', path: '/dashboard/pending' },
          { icon: CheckCircle, label: 'History', path: '/dashboard/history' },
          { icon: Bell, label: 'Notifications', path: '/dashboard/notifications' }
        ];
      default:
        return [];
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-40 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Left Side - Logo, Title, and Mobile Menu */}
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setShowMobileMenu?.(!showMobileMenu)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="bg-green-600 p-2 rounded-lg">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gray-900">EcoTrack</h1>
              <p className="text-sm text-gray-500 font-medium">{getDashboardTitle()}</p>
            </div>
          </div>
        </div>

        {/* Center - Quick Actions (Desktop only) */}
        <div className="hidden lg:flex items-center space-x-2">
          {getQuickActions().slice(0, 3).map((action) => {
            const Icon = action.icon;
            const isActive = location.pathname === action.path;
            return (
              <Button
                key={action.path}
                variant={isActive ? "default" : "ghost"}
                size="sm"
                asChild
                className={isActive ? "bg-green-600 hover:bg-green-700 text-white" : ""}
              >
                <Link to={action.path} className="flex items-center space-x-2">
                  <Icon className="h-4 w-4" />
                  <span className="hidden xl:block">{action.label}</span>
                </Link>
              </Button>
            );
          })}
        </div>

        {/* Right Side - Notifications and User Menu */}
        <div className="flex items-center space-x-3">
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-red-500 text-white">
              3
            </Badge>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback className="bg-green-100 text-green-700 font-semibold">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-3">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium text-sm">{user?.name || 'User'}</p>
                  <p className="text-xs text-muted-foreground truncate w-[180px]">
                    {user?.email}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    {getRoleIcon(user?.role)}
                    <Badge variant="secondary" className={`${getRoleColor(user?.role)} text-xs`}>
                      {user?.role}
                    </Badge>
                  </div>
                </div>
              </div>
              <DropdownMenuSeparator />
              
              {/* Quick Actions in Menu */}
              {getQuickActions().map((action) => {
                const Icon = action.icon;
                return (
                  <DropdownMenuItem key={action.path} asChild>
                    <Link to={action.path} className="flex items-center gap-2 cursor-pointer">
                      <Icon className="h-4 w-4" />
                      {action.label}
                    </Link>
                  </DropdownMenuItem>
                );
              })}
              
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                  <User className="h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings" className="flex items-center gap-2 cursor-pointer">
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleLogout} 
                className="flex items-center gap-2 text-red-600 cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default DashboardTopbar;
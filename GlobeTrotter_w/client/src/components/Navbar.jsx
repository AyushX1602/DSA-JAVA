import { Link, NavLink } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import { authUserAtom } from '@/lib/auth.atoms';
import LogoutButton from '@/components/Auth/LogoutButton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Shield, User } from 'lucide-react';

const Navbar = () => {
  const user = useAtomValue(authUserAtom);
  const isAdmin = user?.role === 'ADMIN';
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
    : (user?.email?.[0] || 'U').toUpperCase();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="font-semibold italic text-2xl ">
            GlobeTrotter
          </Link>

          {/* Admin Navigation */}
          {user && isAdmin && (
            <nav className="hidden md:flex items-center space-x-4">
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-100 text-slate-900'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                <Shield className="h-4 w-4" />
                <span>Admin</span>
              </NavLink>
            </nav>
          )}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <NavLink
                to="/community"
                className={({ isActive }) =>
                  `text-sm px-3 py-2 rounded-md transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`
                }
              >
                Community
              </NavLink>
              <NavLink
                to="/calendar"
                className={({ isActive }) =>
                  `text-sm px-3 py-2 rounded-md transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`
                }
              >
                Calendar
              </NavLink>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Avatar className="size-6">
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{user.email}</span>
                    {isAdmin && (
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                        Admin
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/admin">
                          <Shield className="mr-2 h-4 w-4" />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem asChild>
                    <LogoutButton />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm underline">
                Login
              </Link>
              <Button asChild size="sm">
                <Link to="/signup">Signup</Link>
              </Button>
            </div>
          )}
        </div>

        <div className="md:hidden flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                Menu
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 sm:w-80">
              <div className="py-2">
                <Link to="/" className="font-semibold">
                  GlobeTrotter
                </Link>
              </div>
              <Separator className="my-2" />
              {user ? (
                <div className="grid gap-2">
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    {user.email}
                    {isAdmin && (
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                        Admin
                      </span>
                    )}
                  </div>
                  <Link
                    to="/profile"
                    className="text-sm px-3 py-2 rounded-md transition-colors hover:bg-muted"
                  >
                    Profile
                  </Link>
                  {isAdmin && (
                    <>
                      <Separator className="my-2" />
                      <Link
                        to="/admin"
                        className="flex items-center space-x-2 text-sm hover:underline"
                      >
                        <Shield className="h-4 w-4" />
                        <span>Admin Dashboard</span>
                      </Link>
                      <Separator className="my-2" />
                    </>
                  )}
                  <Link
                    to="/community"
                    className="text-sm px-3 py-2 rounded-md transition-colors hover:bg-muted"
                  >
                    Community
                  </Link>
                  <Link
                    to="/calendar"
                    className="text-sm px-3 py-2 rounded-md transition-colors hover:bg-muted"
                  >
                    Calendar
                  </Link>
                  <LogoutButton />
                </div>
              ) : (
                <div className="grid gap-2">
                  <Link to="/login" className="text-sm underline">
                    Login
                  </Link>
                  <Button asChild size="sm">
                    <Link to="/signup">Signup</Link>
                  </Button>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

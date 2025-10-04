import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Map, Package, Users2, Heart, LogOut, Trophy } from "lucide-react";
import { useAuth } from "@/context/AuthContext"; 


export function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const location = useLocation();
  const { user, setUser, loading } = useAuth(); 


  // Show loading until session is verified
  if (loading) return <p className="text-center py-4">Loading...</p>;

  console.log("Current User:", user);

  // Logout function to clear session and update UI
  const handleLogout = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (res.ok) {
        setUser(null); // Update UI after logout
        window.location.href = "/sign-in"; // Redirect to login
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-white/10 backdrop-blur-lg shadow-md border-b border-white/20 z-[100]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Heart className="w-8 h-8 text-red-500" />
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-neutral-900">AaharSetu</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            <Link to="/volunteer/leaderboard">
              <Button variant="outline">
                <Trophy className="w-4 h-4 mr-2" />
                Leaderboard
              </Button>
            </Link>


            {(!user || (user?.role !== "volunteer" && user?.role !== "ngo" && user?.role !== "donor")) && (
              <>
                <Link to="/ngo" className={`text-neutral-700 hover:text-neutral-900 flex items-center ${location.pathname.startsWith("/ngo") ? "font-medium" : ""}`}>
                  <Users2 className="w-4 h-4 mr-2" />
                  NGOs
                </Link>
                <Link to="/volunteer" className={`text-neutral-700 hover:text-neutral-900 flex items-center ${location.pathname.startsWith("/volunteer") ? "font-medium" : ""}`}>
                  <Heart className="w-4 h-4 mr-2" />
                  Volunteers
                </Link>
              </>
            )}

            {user ? (
              <>
                {user.role === "volunteer" && (
                  <Link to="/volunteer/register">
                    <Button variant="secondary">Register as Volunteer</Button>
                  </Link>
                )}
                {user.role === "ngo" && (
                  <Link to="/ngo/register">
                    <Button variant="secondary">Register Your NGO</Button>
                  </Link>
                )}

                {user.role === "donor" && (
                  <Link to="/generate-certificate">
                    <Button variant="secondary">Generate Your Certificate</Button>
                  </Link>
                )}

                <Link to={`/${user.role}-dashboard`}>
                  <Button variant="outline">Dashboard</Button>
                </Link>
                <Button variant="destructive" onClick={handleLogout} className="ml-4">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <Link to="/sign-in">
                <Button variant="default">Sign In</Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="inline-flex items-center justify-center p-2 rounded-md text-neutral-700 hover:text-neutral-900 focus:outline-none">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/donor" className="flex items-center px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50">
              <Package className="w-4 h-4 mr-2" />
              For Donors
            </Link>
            <Link to="/ngo" className="flex items-center px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50">
              <Users2 className="w-4 h-4 mr-2" />
              For NGOs
            </Link>
            <Link to="/volunteer" className="flex items-center px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50">
              <Heart className="w-4 h-4 mr-2" />
              Volunteer
            </Link>
            <Link to="/map" className="flex items-center px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50">
              <Map className="w-4 h-4 mr-2" />
              Live Map
            </Link>

            {user ? (
              <div className="px-3 py-2">
                <Link to={`/${user.role}-dashboard`}>
                  <Button variant="outline" className="w-full">
                    Dashboard
                  </Button>
                </Link>
                <Button variant="destructive" className="w-full mt-2" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="px-3 py-2">
                <Link to="/sign-in">
                  <Button variant="default" className="w-full">
                    Sign In
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}


import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, Plus, User, LogOut, Menu, X, ShoppingBag, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate("/");
  };

  const handleProtectedClick = (path: string) => {
    if (!user) {
      navigate("/auth");
    } else {
      navigate(path);
    }
    setMobileOpen(false);
  };

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { name: "Buy Books", path: "/marketplace", icon: <ShoppingBag className="h-4 w-4" />, protected: false },
    { name: "Sell Books", path: "/add-listing", icon: <Plus className="h-4 w-4" />, protected: true },
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard className="h-4 w-4" />, protected: true },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo Section */}
        <Link to="/" className="group flex items-center gap-2.5 transition-transform active:scale-95">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20 transition-transform group-hover:rotate-12">
            <BookOpen className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight text-foreground">
            BookBazzar
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => link.protected ? handleProtectedClick(link.path) : navigate(link.path)}
              className={`relative px-4 py-2 text-sm font-medium transition-all duration-200 hover:text-primary ${
                isActive(link.path) ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {link.name}
              {isActive(link.path) && (
                <motion.div
                  layoutId="nav-underline"
                  className="absolute bottom-0 left-0 h-0.5 w-full bg-primary"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 md:flex">
            {user ? (
              <>
                <Button 
                  size="sm" 
                  className="rounded-full bg-primary px-5 font-semibold hover:shadow-md transition-all"
                  onClick={() => navigate("/add-listing")}
                >
                  <Plus className="mr-1.5 h-4 w-4" /> List a Book
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full hover:bg-accent transition-colors"
                  onClick={() => navigate("/dashboard")}
                >
                  <User className="h-5 w-5 text-foreground" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full hover:text-destructive transition-colors" 
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button 
                className="rounded-full px-6 font-semibold"
                onClick={() => navigate("/auth")}
              >
                Sign In
              </Button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t bg-card md:hidden"
          >
            <div className="flex flex-col gap-1 p-4">
              {navLinks.map((link, i) => (
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  key={link.path}
                >
                  <Button
                    variant={isActive(link.path) ? "secondary" : "ghost"}
                    className="w-full justify-start gap-3 rounded-xl py-6 text-base font-medium"
                    onClick={() => link.protected ? handleProtectedClick(link.path) : navigate(link.path)}
                  >
                    {link.icon}
                    {link.name}
                  </Button>
                </motion.div>
              ))}
              
              <hr className="my-2 border-muted" />
              
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {user ? (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <Button 
                      variant="outline" 
                      className="w-full rounded-xl py-6"
                      onClick={() => navigate("/dashboard")}
                    >
                      <User className="mr-2 h-4 w-4" /> Profile
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full rounded-xl py-6 text-destructive hover:bg-destructive/10"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" /> Logout
                    </Button>
                  </div>
                ) : (
                  <Button 
                    className="w-full rounded-xl py-6 text-lg font-bold"
                    onClick={() => navigate("/auth")}
                  >
                    Sign In
                  </Button>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;

import { Outlet, Link, useLocation } from "react-router";
import { Menu, X, Search, MessageSquare, User, Grid, Home, PlusCircle, Moon, Sun, BookOpen } from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "@/app/contexts/ThemeContext";
import { useChatStore } from "@/chat/chatStore";
import { FocusTrap } from "@/app/components/ui/FocusTrap";
import { BackendStatus } from "@/app/components/ui/BackendStatus";

export function RootLayout() {
  return <RootContent />;
}

function RootContent() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { themeVariant, setThemeVariant } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { conversations } = useChatStore();

  // Calculate total unread messages across all conversations
  const totalUnread = conversations.reduce((sum, conv) => sum + (conv.unread || 0), 0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const navLinks = [
    { path: "/", label: "Home", icon: Home },
    { path: "/browse", label: "Browse", icon: Grid },
    { path: "/dashboard", label: "Dashboard", icon: User },
    { path: "/exchanges", label: "Exchanges", icon: BookOpen },
    { path: "/messages", label: "Messages", icon: MessageSquare },
  ];

  // Handle mobile menu close on escape
  const handleMobileMenuClose = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ARIA Live Region for announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only" id="announcements" />
      
      {/* Skip to main content link for keyboard users */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg"
      >
        Skip to main content
      </a>

      {/* Header */}
      <header 
        className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        role="banner"
      >
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold">SS</span>
              </div>
              <span className="font-semibold text-lg hidden sm:inline">SkillSwap</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6" role="navigation" aria-label="Main navigation">
              {navLinks.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                    isActive(path)
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span>{label}</span>
                </Link>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3">
              <button className="p-2 rounded-md hover:bg-accent transition-colors flex items-center justify-center" aria-label="Search skills">
                <Search className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              </button>
              {mounted && (
                <button
                  className="p-2 rounded-md hover:bg-accent transition-colors flex items-center justify-center"
                  onClick={() => setThemeVariant(themeVariant === 'light' ? 'dark' : 'light')}
                  aria-label={themeVariant === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                >
                  {themeVariant === 'light' ? (
                    <Moon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <Sun className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  )}
                </button>
              )}
              <Link
                to="/create"
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <PlusCircle className="h-5 w-5 flex-shrink-0" />
                <span>Offer Skill</span>
              </Link>
              <Link
                to="/messages"
                className="p-2 rounded-md hover:bg-accent transition-colors relative flex items-center justify-center"
                aria-label={`Messages${totalUnread > 0 ? `, ${totalUnread} unread` : ""}`}
              >
                <MessageSquare className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                {totalUnread > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                    {totalUnread > 99 ? '99+' : totalUnread}
                  </span>
                )}
              </Link>
              <Link
                to="/dashboard"
                className="p-2 rounded-md hover:bg-accent transition-colors flex items-center justify-center"
                aria-label="Your profile"
              >
                <User className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-md hover:bg-accent transition-colors flex items-center justify-center touch-target"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X className="h-6 w-6 flex-shrink-0" /> : <Menu className="h-6 w-6 flex-shrink-0" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <FocusTrap isActive={mobileMenuOpen} onEscape={handleMobileMenuClose}>
            <div 
              id="mobile-menu"
              className="md:hidden border-t bg-background"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation menu"
            >
              <nav className="container mx-auto px-4 py-4 flex flex-col gap-2" role="navigation" aria-label="Mobile navigation">
              {navLinks.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                    isActive(path)
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span>{label}</span>
                </Link>
              ))}
              </nav>
              <div className="container mx-auto px-4 pb-4">
                <button
                  onClick={handleMobileMenuClose}
                  className="w-full py-3 text-center text-sm text-text-secondary hover:text-foreground"
                >
                  Close menu
                </button>
              </div>
            </div>
          </FocusTrap>
        )}
      </header>

      {/* Main Content */}
      <main id="main-content" className="flex-1" role="main" tabIndex={-1}>
        <BackendStatus />
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 mt-auto" role="contentinfo">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-6 w-6 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground text-xs font-bold">SS</span>
                </div>
                <span className="font-semibold">SkillSwap</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Connect, learn, and grow by exchanging skills with others.
              </p>
            </div>
            <nav aria-label="Platform links">
              <h4 className="mb-3">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/browse" className="hover:text-foreground">Browse Skills</Link></li>
                <li><Link to="/create" className="hover:text-foreground">Offer a Skill</Link></li>
                <li><Link to="/dashboard" className="hover:text-foreground">Dashboard</Link></li>
              </ul>
            </nav>
            <nav aria-label="Community links">
              <h4 className="mb-3">Community</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Guidelines</a></li>
                <li><a href="#" className="hover:text-foreground">Success Stories</a></li>
                <li><a href="#" className="hover:text-foreground">Blog</a></li>
              </ul>
            </nav>
            <nav aria-label="Support links">
              <h4 className="mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground">Contact Us</a></li>
                <li><a href="#" className="hover:text-foreground">Privacy Policy</a></li>
              </ul>
            </nav>
          </div>
          <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
            © 2026 SkillSwap. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

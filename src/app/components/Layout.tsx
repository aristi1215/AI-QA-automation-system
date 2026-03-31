import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router";
import { 
  LayoutDashboard, 
  FlaskConical, 
  ListChecks, 
  Bug, 
  History as HistoryIcon,
  Menu,
  X,
  ChevronRight
} from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "./ui/utils";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/testing", label: "Testing", icon: FlaskConical },
  { path: "/testcases", label: "Test Cases", icon: ListChecks },
  { path: "/bugs", label: "Bugs", icon: Bug },
  { path: "/history", label: "History", icon: HistoryIcon },
];

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex h-screen bg-[#f8f9fa]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#152340] transform transition-transform duration-200 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{
          boxShadow: '4px 0 24px rgba(21, 35, 64, 0.15)'
        }}
      >
        <div className="flex flex-col h-full">
          {/* Logo with gradient accent */}
          <div className="flex items-center justify-between h-20 px-6 border-b border-white/10 bg-gradient-to-r from-[#152340] to-[#1a2d4f]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-[#394273] to-[#5F6873] rounded-lg flex items-center justify-center shadow-lg">
                <FlaskConical className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-base font-bold text-white tracking-tight">QualityAI</h1>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Testing Platform</p>
              </div>
            </div>
            <button 
              className="lg:hidden text-gray-400 hover:text-white transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "group relative flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive 
                      ? "bg-gradient-to-r from-[#394273] to-[#4a5380] text-white shadow-lg shadow-[#394273]/30" 
                      : "text-gray-300 hover:bg-white/5 hover:text-white"
                  )}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
                  )}
                  <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-gray-400 group-hover:text-white")} />
                  <span className="flex-1">{item.label}</span>
                  {isActive && <ChevronRight className="w-4 h-4 opacity-50" />}
                </Link>
              );
            })}
          </nav>

          {/* Footer with gradient border */}
          <div className="px-4 py-5 border-t border-white/10 bg-gradient-to-t from-[#0f1a2d] to-transparent">
            <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="w-9 h-9 bg-gradient-to-br from-[#394273] to-[#5F6873] rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-md">
                QA
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">QA Engineer</p>
                <p className="text-xs text-gray-400 truncate">engineer@qa.io</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar with gradient */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 lg:px-6 shadow-sm">
          <button 
            className="lg:hidden mr-4 text-gray-600 hover:text-[#394273] transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex-1">
            <h2 className="text-xl font-bold bg-gradient-to-r from-[#152340] via-[#394273] to-[#5F6873] bg-clip-text text-transparent">
              {navItems.find(item => item.path === location.pathname)?.label || "Dashboard"}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#394273] to-[#5F6873] flex items-center justify-center text-white text-xs font-bold shadow-md">
              QA
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-[#f8f9fa]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
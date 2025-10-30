import { useAuth } from "../../contexts/AuthContext";
import {
  LayoutDashboard,
  FolderKanban,
  MessageSquare,
  FileText,
  DollarSign,
  Star,
  Bell,
  User,
  Settings,
  LogOut,
  Briefcase,
  Users,
  Database,
} from "lucide-react";
import clsx from "clsx";

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: number;
  roles?: ("freelancer" | "client" | "admin")[];
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: FolderKanban, label: "Projects", href: "/projects" },
  {
    icon: Users,
    label: "Browse Freelancers",
    href: "/freelancers",
    roles: ["client"],
  },
  {
    icon: Briefcase,
    label: "Proposals",
    href: "/proposals",
    roles: ["freelancer"],
  },
  { icon: MessageSquare, label: "Messages", href: "/messages" },
  { icon: FileText, label: "Invoices", href: "/invoices" },
  { icon: Star, label: "Reviews", href: "/reviews" },
  { icon: Bell, label: "Notifications", href: "/notifications" },
  { icon: User, label: "Profile", href: "/profile" },
  { icon: Database, label: "Populate Data", href: "/populate-data" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

interface SidebarProps {
  currentPath: string;
}

export function Sidebar({ currentPath }: SidebarProps) {
  const { profile, signOut } = useAuth();

  const filteredNavItems = navItems.filter((item) => {
    if (!item.roles) return true;
    return profile && item.roles.includes(profile.role);
  });

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-xl text-gray-900">ClientHub</h1>
            <p className="text-xs text-gray-500 capitalize">{profile?.role}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.href;

          return (
            <button
              key={item.href}
              onClick={() => {
                window.history.pushState({}, "", item.href);
                window.dispatchEvent(new PopStateEvent("popstate"));
              }}
              className={clsx(
                "w-full flex items-center space-x-3 px-6 py-3 transition-colors text-left",
                {
                  "bg-purple-50 text-purple-600 border-r-4 border-purple-600":
                    isActive,
                  "text-gray-700 hover:bg-gray-50": !isActive,
                }
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
              {item.badge && (
                <span className="ml-auto bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 px-3 py-2 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
            {profile?.full_name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {profile?.full_name}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {profile?.role === "freelancer" ? "Freelancer" : "Client"}
            </p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}

import { BarChart3, Users, TrendingUp, Calendar, Award, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

type AdminView = "dashboard" | "students" | "reports" | "agenda" | "grades" | "settings";

interface AdminSidebarProps {
  currentView: AdminView;
  onViewChange: (view: AdminView) => void;
}

export default function AdminSidebar({ currentView, onViewChange }: AdminSidebarProps) {
  const menuItems = [
    {
      key: "dashboard" as AdminView,
      label: "Dashboard",
      icon: BarChart3,
      testId: "nav-dashboard"
    },
    {
      key: "students" as AdminView,
      label: "Alunos",
      icon: Users,
      testId: "nav-students"
    },
    {
      key: "reports" as AdminView,
      label: "Relatórios",
      icon: TrendingUp,
      testId: "nav-reports"
    },
    {
      key: "agenda" as AdminView,
      label: "Agenda",
      icon: Calendar,
      testId: "nav-agenda"
    },
    {
      key: "grades" as AdminView,
      label: "Graduações",
      icon: Award,
      testId: "nav-grades"
    },
    {
      key: "settings" as AdminView,
      label: "Configurações",
      icon: Settings,
      testId: "nav-settings"
    }
  ];

  return (
    <div className="w-64 bg-white shadow-lg">
      <nav className="p-6 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.key;
          
          return (
            <Button
              key={item.key}
              variant="ghost"
              onClick={() => onViewChange(item.key)}
              className={`w-full justify-start space-x-3 h-12 ${
                isActive 
                  ? "bg-primary text-primary-foreground hover:bg-green-600" 
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              data-testid={item.testId}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Button>
          );
        })}
      </nav>
    </div>
  );
}

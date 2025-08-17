import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import AdminSidebar from "@/components/admin-sidebar";
import DashboardStats from "@/components/dashboard-stats";
import StudentManagement from "@/components/student-management";
import RecentCheckins from "@/components/recent-checkins";
import BirthdayCards from "@/components/birthday-cards";
import { Button } from "@/components/ui/button";
import { Shield, LogOut } from "lucide-react";

type AdminView = "dashboard" | "students" | "reports" | "agenda" | "grades" | "settings";

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const { user, logout } = useAuth();
  const [currentView, setCurrentView] = useState<AdminView>("dashboard");

  useEffect(() => {
    if (!user || !['professor', 'administrative', 'coordinator'].includes(user.role)) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user || !['professor', 'administrative', 'coordinator'].includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const renderContent = () => {
    switch (currentView) {
      case "students":
        return <StudentManagement />;
      case "reports":
        return (
          <div className="p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Relatórios</h2>
            <p className="text-gray-600">Funcionalidade em desenvolvimento.</p>
          </div>
        );
      case "agenda":
        return (
          <div className="p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Agenda</h2>
            <p className="text-gray-600">Funcionalidade em desenvolvimento.</p>
          </div>
        );
      case "grades":
        return (
          <div className="p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Graduações</h2>
            <p className="text-gray-600">Funcionalidade em desenvolvimento.</p>
          </div>
        );
      case "settings":
        return (
          <div className="p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Configurações</h2>
            <p className="text-gray-600">Funcionalidade em desenvolvimento.</p>
          </div>
        );
      default:
        return (
          <div className="p-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-800">Dashboard Geral</h2>
              <p className="text-gray-600">Visão geral das atividades da academia</p>
            </div>

            <DashboardStats />

            <BirthdayCards />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
              <RecentCheckins />
              
              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <div className="w-6 h-6 bg-primary rounded mr-2"></div>
                  Ações Rápidas
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={() => setCurrentView("students")}
                    className="bg-primary text-white p-4 rounded-lg hover:bg-green-600 transition-colors duration-200 h-auto flex-col"
                    data-testid="button-new-student"
                  >
                    <div className="text-2xl mb-2">👤</div>
                    <p className="text-sm font-medium">Gerenciar Alunos</p>
                  </Button>
                  <Button
                    onClick={() => setCurrentView("agenda")}
                    className="bg-secondary text-white p-4 rounded-lg hover:bg-green-500 transition-colors duration-200 h-auto flex-col"
                    data-testid="button-new-event"
                  >
                    <div className="text-2xl mb-2">📅</div>
                    <p className="text-sm font-medium">Agenda</p>
                  </Button>
                  <Button
                    onClick={() => setCurrentView("reports")}
                    className="bg-accent text-gray-800 p-4 rounded-lg hover:bg-yellow-400 transition-colors duration-200 h-auto flex-col"
                    data-testid="button-reports"
                  >
                    <div className="text-2xl mb-2">📊</div>
                    <p className="text-sm font-medium">Relatórios</p>
                  </Button>
                  <Button
                    onClick={() => setCurrentView("grades")}
                    className="bg-gray-600 text-white p-4 rounded-lg hover:bg-gray-700 transition-colors duration-200 h-auto flex-col"
                    data-testid="button-grades"
                  >
                    <div className="text-2xl mb-2">🥋</div>
                    <p className="text-sm font-medium">Graduações</p>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Navigation */}
      <nav className="bg-gray-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Shield className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Painel Administrativo</h1>
                <p className="text-sm text-gray-300" data-testid="text-admin-name">
                  {user.admin?.fullName || user.email}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span 
                className="text-sm bg-primary px-3 py-1 rounded-full capitalize" 
                data-testid="text-admin-role"
              >
                {user.role === 'coordinator' ? 'Coordenador' : 
                 user.role === 'professor' ? 'Professor' : 'Administrativo'}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-gray-300 hover:text-danger"
                data-testid="button-admin-logout"
              >
                <LogOut className="text-xl" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Admin Sidebar and Main Content */}
      <div className="flex min-h-screen">
        <AdminSidebar 
          currentView={currentView} 
          onViewChange={setCurrentView}
        />
        
        <div className="flex-1">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

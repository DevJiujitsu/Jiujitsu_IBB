import { Bold, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavigationProps {
  onStudentLogin: () => void;
  onAdminLogin: () => void;
}

export default function Navigation({ onStudentLogin, onAdminLogin }: NavigationProps) {
  return (
    <nav className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Bold className="text-white text-lg" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Jiu-Jitsu IBB</h1>
              <p className="text-xs text-gray-600">Igreja Batista do Bacacheri</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <a
              href="#home"
              data-testid="link-home"
              className="nav-link"
            >
              Início
            </a>
            <a
              href="#about"
              data-testid="link-about"
              className="nav-link"
            >
              Quem Somos
            </a>
            <a
              href="#donations"
              data-testid="link-donations"
              className="nav-link"
            >
              Doações
            </a>
            <div className="flex space-x-3">
              <Button
                data-testid="button-nav-student"
                className="btn-primary"
                onClick={onStudentLogin}
              >
                Área do Aluno
              </Button>
              <Button
                data-testid="button-nav-admin"
                className="bg-gray-800 text-white hover:bg-gray-700"
                onClick={onAdminLogin}
              >
                Área do Admin
              </Button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-gray-700"
            data-testid="button-mobile-menu"
          >
            <Menu className="text-xl" />
          </Button>
        </div>
      </div>
    </nav>
  );
}

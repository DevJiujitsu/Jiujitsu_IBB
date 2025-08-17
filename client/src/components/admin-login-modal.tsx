import { useState } from "react";
import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, UserPlus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { requestAdminAccess } from "@/lib/auth";

interface AdminLoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AdminLoginModal({ open, onOpenChange }: AdminLoginModalProps) {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestForm, setRequestForm] = useState({
    fullName: "",
    whatsapp: "",
    role: "professor" as "professor" | "administrative",
    email: "",
    password: "",
  });
  const { login, isLoading } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await login(email, password);
      onOpenChange(false);
      
      // Wait a bit for the user state to update, then navigate
      setTimeout(() => {
        navigate("/admin");
      }, 100);
      
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo à área administrativa.",
      });
    } catch (error) {
      toast({
        title: "Erro no login",
        description: "Email ou senha incorretos.",
        variant: "destructive",
      });
    }
  };

  const handleRequestAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await requestAdminAccess(
        {
          email: requestForm.email,
          password: requestForm.password,
        },
        {
          fullName: requestForm.fullName,
          whatsapp: requestForm.whatsapp,
          role: requestForm.role,
        }
      );
      
      setShowRequestForm(false);
      onOpenChange(false);
      toast({
        title: "Solicitação enviada!",
        description: "Sua solicitação de acesso foi enviada para aprovação.",
      });
    } catch (error) {
      toast({
        title: "Erro na solicitação",
        description: "Não foi possível enviar a solicitação.",
        variant: "destructive",
      });
    }
  };

  const handlePasswordRecovery = () => {
    toast({
      title: "Recuperação de senha",
      description: "Entre em contato com a coordenação para recuperar sua senha.",
    });
  };

  if (showRequestForm) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center">
                <UserPlus className="text-white text-2xl" />
              </div>
            </div>
            <DialogTitle className="text-center text-2xl font-bold text-gray-800">
              Solicitar Acesso
            </DialogTitle>
            <p className="text-center text-gray-600">Preencha os dados para solicitar acesso</p>
          </DialogHeader>

          <form onSubmit={handleRequestAccess} className="space-y-4">
            <div>
              <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                Nome Completo
              </Label>
              <Input
                id="fullName"
                type="text"
                value={requestForm.fullName}
                onChange={(e) => setRequestForm({ ...requestForm, fullName: e.target.value })}
                className="input-primary mt-1"
                data-testid="input-request-name"
                required
              />
            </div>

            <div>
              <Label htmlFor="whatsapp" className="text-sm font-medium text-gray-700">
                WhatsApp
              </Label>
              <Input
                id="whatsapp"
                type="tel"
                value={requestForm.whatsapp}
                onChange={(e) => setRequestForm({ ...requestForm, whatsapp: e.target.value })}
                placeholder="(41) 99999-9999"
                className="input-primary mt-1"
                data-testid="input-request-whatsapp"
                required
              />
            </div>

            <div>
              <Label htmlFor="role" className="text-sm font-medium text-gray-700">
                Função no Projeto
              </Label>
              <select
                id="role"
                value={requestForm.role}
                onChange={(e) => setRequestForm({ ...requestForm, role: e.target.value as any })}
                className="input-primary mt-1"
                data-testid="select-request-role"
                required
              >
                <option value="professor">Professor</option>
                <option value="administrative">Administrativo</option>
              </select>
            </div>

            <div>
              <Label htmlFor="requestEmail" className="text-sm font-medium text-gray-700">
                Email
              </Label>
              <Input
                id="requestEmail"
                type="email"
                value={requestForm.email}
                onChange={(e) => setRequestForm({ ...requestForm, email: e.target.value })}
                className="input-primary mt-1"
                data-testid="input-request-email"
                required
              />
            </div>

            <div>
              <Label htmlFor="requestPassword" className="text-sm font-medium text-gray-700">
                Senha
              </Label>
              <Input
                id="requestPassword"
                type="password"
                value={requestForm.password}
                onChange={(e) => setRequestForm({ ...requestForm, password: e.target.value })}
                className="input-primary mt-1"
                data-testid="input-request-password"
                required
              />
            </div>

            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setShowRequestForm(false)}
                data-testid="button-request-cancel"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gray-800 hover:bg-gray-700"
                data-testid="button-request-submit"
              >
                Solicitar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center">
              <Settings className="text-white text-2xl" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl font-bold text-gray-800">
            Área Administrativa
          </DialogTitle>
          <p className="text-center text-gray-600">Entre com suas credenciais de admin</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="adminEmail" className="text-sm font-medium text-gray-700">
              Email
            </Label>
            <Input
              id="adminEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@jiujitsuibb.com"
              className="input-primary mt-2"
              data-testid="input-admin-email"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="adminPassword" className="text-sm font-medium text-gray-700">
              Senha
            </Label>
            <Input
              id="adminPassword"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sua senha administrativa"
              className="input-primary mt-2"
              data-testid="input-admin-password"
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="link"
              className="text-sm text-gray-800 hover:text-gray-600 p-0"
              onClick={handlePasswordRecovery}
              data-testid="button-admin-password-recovery"
            >
              Recuperar senha
            </Button>
            <Button
              type="button"
              variant="link"
              className="text-sm text-primary hover:text-green-600 p-0"
              onClick={() => setShowRequestForm(true)}
              data-testid="button-request-access"
            >
              Solicitar acesso
            </Button>
          </div>

          <Button
            type="submit"
            className="w-full bg-gray-800 text-white hover:bg-gray-700"
            disabled={isLoading}
            data-testid="button-admin-login-submit"
          >
            {isLoading ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

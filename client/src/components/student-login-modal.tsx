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
import { User, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

interface StudentLoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function StudentLoginModal({ open, onOpenChange }: StudentLoginModalProps) {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await login(email, password);
      onOpenChange(false);
      
      // Wait a bit for the user state to update, then navigate
      setTimeout(() => {
        navigate("/student");
      }, 100);
      
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo à área do aluno.",
      });
    } catch (error) {
      toast({
        title: "Erro no login",
        description: "Email ou senha incorretos.",
        variant: "destructive",
      });
    }
  };

  const handlePasswordRecovery = () => {
    toast({
      title: "Recuperação de senha",
      description: "Entre em contato com a administração para recuperar sua senha.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <User className="text-white text-2xl" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl font-bold text-gray-800">
            Área do Aluno
          </DialogTitle>
          <p className="text-center text-gray-600">Entre com seu email e senha</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu.email@exemplo.com"
              className="input-primary mt-2"
              data-testid="input-student-email"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
              Senha
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sua senha"
              className="input-primary mt-2"
              data-testid="input-student-password"
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="link"
              className="text-sm text-primary hover:text-green-600 p-0"
              onClick={handlePasswordRecovery}
              data-testid="button-password-recovery"
            >
              Recuperar senha
            </Button>
          </div>

          <Button
            type="submit"
            className="w-full btn-primary"
            disabled={isLoading}
            data-testid="button-student-login-submit"
          >
            {isLoading ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

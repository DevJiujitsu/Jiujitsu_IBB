import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface StudentFormData {
  fullName: string;
  whatsapp: string;
  dateOfBirth: string;
  classType: "KIDS" | "FEMININA" | "MISTA";
  belt: string;
  degree: number;
  email: string;
}

interface StudentFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function StudentFormModal({ open, onOpenChange, onSuccess }: StudentFormModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm<StudentFormData>();

  const createStudentMutation = useMutation({
    mutationFn: async (data: StudentFormData) => {
      const response = await apiRequest("POST", "/api/admin/students", {
        user: {
          email: data.email,
          password: "Aluno123", // Default password
        },
        student: {
          fullName: data.fullName,
          whatsapp: data.whatsapp,
          dateOfBirth: data.dateOfBirth,
          classType: data.classType,
          belt: data.belt,
          degree: data.degree,
        }
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Aluno cadastrado!",
        description: "O aluno foi cadastrado com sucesso com a senha padrão 'Aluno123'.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/students"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard"] });
      reset();
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao cadastrar aluno",
        description: error.message || "Não foi possível cadastrar o aluno.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: StudentFormData) => {
    createStudentMutation.mutate(data);
  };

  const generateLogin = (fullName: string) => {
    const parts = fullName.toLowerCase().split(' ');
    if (parts.length >= 2) {
      const email = `${parts[0]}.${parts[parts.length - 1]}@jiujitsuibb.com`;
      setValue('email', email);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cadastrar Novo Aluno</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="fullName">Nome Completo *</Label>
              <Input
                id="fullName"
                {...register("fullName", { required: "Nome é obrigatório" })}
                onBlur={(e) => generateLogin(e.target.value)}
                placeholder="Nome completo do aluno"
                data-testid="input-student-fullname"
              />
              {errors.fullName && (
                <p className="text-sm text-danger mt-1">{errors.fullName.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="whatsapp">WhatsApp *</Label>
              <Input
                id="whatsapp"
                {...register("whatsapp", { required: "WhatsApp é obrigatório" })}
                placeholder="(41) 99999-9999"
                data-testid="input-student-whatsapp"
              />
              {errors.whatsapp && (
                <p className="text-sm text-danger mt-1">{errors.whatsapp.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="dateOfBirth">Data de Nascimento *</Label>
              <Input
                id="dateOfBirth"
                type="date"
                {...register("dateOfBirth", { required: "Data de nascimento é obrigatória" })}
                data-testid="input-student-birthdate"
              />
              {errors.dateOfBirth && (
                <p className="text-sm text-danger mt-1">{errors.dateOfBirth.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="classType">Turma *</Label>
              <Select onValueChange={(value) => setValue("classType", value as any)}>
                <SelectTrigger data-testid="select-student-class">
                  <SelectValue placeholder="Selecione a turma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KIDS">KIDS</SelectItem>
                  <SelectItem value="FEMININA">FEMININA</SelectItem>
                  <SelectItem value="MISTA">MISTA</SelectItem>
                </SelectContent>
              </Select>
              {errors.classType && (
                <p className="text-sm text-danger mt-1">Turma é obrigatória</p>
              )}
            </div>

            <div>
              <Label htmlFor="belt">Faixa *</Label>
              <Select onValueChange={(value) => setValue("belt", value)}>
                <SelectTrigger data-testid="select-student-belt">
                  <SelectValue placeholder="Selecione a faixa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="branca">Branca</SelectItem>
                  <SelectItem value="cinza">Cinza</SelectItem>
                  <SelectItem value="amarela">Amarela</SelectItem>
                  <SelectItem value="laranja">Laranja</SelectItem>
                  <SelectItem value="verde">Verde</SelectItem>
                  <SelectItem value="azul">Azul</SelectItem>
                  <SelectItem value="roxa">Roxa</SelectItem>
                  <SelectItem value="marrom">Marrom</SelectItem>
                  <SelectItem value="preta">Preta</SelectItem>
                </SelectContent>
              </Select>
              {errors.belt && (
                <p className="text-sm text-danger mt-1">Faixa é obrigatória</p>
              )}
            </div>

            <div>
              <Label htmlFor="degree">Grau *</Label>
              <Select onValueChange={(value) => setValue("degree", parseInt(value))}>
                <SelectTrigger data-testid="select-student-degree">
                  <SelectValue placeholder="Selecione o grau" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((degree) => (
                    <SelectItem key={degree} value={degree.toString()}>
                      {degree}º Grau
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.degree && (
                <p className="text-sm text-danger mt-1">Grau é obrigatório</p>
              )}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                {...register("email", { 
                  required: "Email é obrigatório",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Email inválido"
                  }
                })}
                placeholder="email@exemplo.com"
                data-testid="input-student-email"
              />
              {errors.email && (
                <p className="text-sm text-danger mt-1">{errors.email.message}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                A senha padrão será "Aluno123"
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
              data-testid="button-cancel-student"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createStudentMutation.isPending}
              className="btn-primary"
              data-testid="button-save-student"
            >
              {createStudentMutation.isPending ? "Salvando..." : "Cadastrar Aluno"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

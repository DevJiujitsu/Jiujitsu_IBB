import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Plus, Search, Filter } from "lucide-react";
import StudentFormModal from "@/components/student-form-modal";
import type { StudentProfile } from "@/types";

export default function StudentManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);

  const { data: students, isLoading } = useQuery<StudentProfile[]>({
    queryKey: ["/api/admin/students"],
  });

  const filteredStudents = students?.filter((student) => {
    const matchesSearch = student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = classFilter === "all" || student.classType === classFilter;
    
    return matchesSearch && matchesClass;
  }) || [];

  const getClassColor = (classType: string) => {
    switch (classType) {
      case "KIDS":
        return "bg-blue-500";
      case "FEMININA":
        return "bg-pink-500";
      case "MISTA":
        return "bg-primary";
      default:
        return "bg-gray-500";
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="bg-gray-200 animate-pulse rounded-xl h-96"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <Card className="card-elevated">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Users className="mr-2 text-primary" />
              Gerenciamento de Alunos
            </CardTitle>
            <Button
              onClick={() => setShowAddModal(true)}
              className="btn-primary"
              data-testid="button-add-student"
            >
              <Plus className="mr-2 h-4 w-4" />
              Novo Aluno
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-student-search"
              />
            </div>
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="w-full sm:w-48" data-testid="select-class-filter">
                <SelectValue placeholder="Filtrar por turma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as turmas</SelectItem>
                <SelectItem value="KIDS">KIDS</SelectItem>
                <SelectItem value="FEMININA">FEMININA</SelectItem>
                <SelectItem value="MISTA">MISTA</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Student List */}
          <div className="space-y-4">
            {filteredStudents.length === 0 ? (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  {searchTerm || classFilter !== "all" ? "Nenhum aluno encontrado" : "Nenhum aluno cadastrado"}
                </h3>
                <p className="mt-2 text-gray-500">
                  {searchTerm || classFilter !== "all" 
                    ? "Tente ajustar os filtros de busca" 
                    : "Comece adicionando o primeiro aluno"
                  }
                </p>
              </div>
            ) : (
              filteredStudents.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  data-testid={`student-item-${student.id}`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 ${getClassColor(student.classType)} rounded-full flex items-center justify-center text-white font-bold`}>
                      {student.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800" data-testid={`student-name-${student.id}`}>
                        {student.fullName}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span data-testid={`student-email-${student.id}`}>{student.user.email}</span>
                        <span>•</span>
                        <span data-testid={`student-class-${student.id}`}>Turma {student.classType}</span>
                        <span>•</span>
                        <span className="capitalize" data-testid={`student-belt-${student.id}`}>
                          {student.belt} {student.degree}º grau
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      data-testid={`button-edit-student-${student.id}`}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-danger border-danger hover:bg-danger hover:text-white"
                      data-testid={`button-delete-student-${student.id}`}
                    >
                      Excluir
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination would go here if needed */}
          {filteredStudents.length > 0 && (
            <div className="mt-6 flex justify-center">
              <p className="text-sm text-gray-500">
                Exibindo {filteredStudents.length} de {students?.length || 0} alunos
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <StudentFormModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onSuccess={() => setShowAddModal(false)}
      />
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCircle } from "lucide-react";
import type { StudentProfile } from "@/types";

interface StudentProfileProps {
  student: StudentProfile;
}

export default function StudentProfile({ student }: StudentProfileProps) {
  return (
    <Card className="card-elevated">
      <CardHeader>
        <CardTitle className="flex items-center">
          <UserCircle className="mr-2 text-primary" />
          Meu Perfil
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Nome Completo</label>
            <p className="text-gray-800 font-medium" data-testid="text-profile-name">
              {student.fullName}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">WhatsApp</label>
            <p className="text-gray-800" data-testid="text-profile-whatsapp">
              {student.whatsapp}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Email</label>
            <p className="text-gray-800" data-testid="text-profile-email">
              {student.user.email}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Turma</label>
            <p className="text-gray-800" data-testid="text-profile-class">
              {student.classType}
            </p>
          </div>
          <div className="flex space-x-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Faixa</label>
              <p className="text-gray-800 capitalize" data-testid="text-profile-belt">
                {student.belt}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Grau</label>
              <p className="text-gray-800" data-testid="text-profile-degree">
                {student.degree}º
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

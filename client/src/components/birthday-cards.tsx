import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cake } from "lucide-react";
import type { AdminDashboardData, StudentProfile } from "@/types";

interface BirthdayCardProps {
  title: string;
  students: StudentProfile[];
  bgColor: string;
}

function BirthdayCard({ title, students, bgColor }: BirthdayCardProps) {
  return (
    <Card className="card-elevated">
      <CardHeader>
        <CardTitle className="flex items-center text-lg font-semibold text-gray-800">
          <Cake className="text-accent mr-2" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {students.length === 0 ? (
          <p className="text-gray-500 text-sm">Nenhum aniversariante este mês</p>
        ) : (
          <div className="space-y-2">
            {students.map((student) => {
              const birthDate = new Date(student.dateOfBirth);
              const age = new Date().getFullYear() - birthDate.getFullYear();
              const initials = student.fullName.split(' ')
                .map(name => name[0])
                .join('')
                .slice(0, 2)
                .toUpperCase();
              
              return (
                <div key={student.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                  <div className={`w-8 h-8 ${bgColor} rounded-full flex items-center justify-center text-white text-sm font-bold`}>
                    {initials}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{student.fullName}</p>
                    <p className="text-xs text-gray-600">
                      {birthDate.getDate().toString().padStart(2, '0')}/{(birthDate.getMonth() + 1).toString().padStart(2, '0')} - {age} anos
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function BirthdayCards() {
  const { data: dashboardData, isLoading } = useQuery<AdminDashboardData>({
    queryKey: ["/api/admin/dashboard"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-200 animate-pulse rounded-xl h-48"></div>
        ))}
      </div>
    );
  }

  const getBirthdayStudents = (classType: string) => {
    return dashboardData?.birthdayStudents.find(b => b.classType === classType)?.students || [];
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <BirthdayCard
        title="Aniversariantes KIDS"
        students={getBirthdayStudents("KIDS")}
        bgColor="bg-blue-500"
      />
      
      <BirthdayCard
        title="Aniversariantes FEMININA"
        students={getBirthdayStudents("FEMININA")}
        bgColor="bg-pink-500"
      />
      
      <BirthdayCard
        title="Aniversariantes MISTA"
        students={getBirthdayStudents("MISTA")}
        bgColor="bg-primary"
      />
    </div>
  );
}

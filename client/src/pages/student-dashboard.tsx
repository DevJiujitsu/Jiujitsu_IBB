import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, MapPin, Calendar, History, Users, LogOut } from "lucide-react";
import CheckInButton from "@/components/check-in-button";
import StudentProfile from "@/components/student-profile";
import type { StudentProfile as StudentProfileType, CheckinData, ClassSchedule } from "@/types";

export default function StudentDashboard() {
  const [, navigate] = useLocation();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (!user || user.role !== 'student') {
      navigate('/');
    }
  }, [user, navigate]);

  const { data: studentProfile } = useQuery<StudentProfileType>({
    queryKey: ["/api/student/profile"],
    enabled: !!user && user.role === 'student',
  });

  const { data: attendance } = useQuery<CheckinData[]>({
    queryKey: ["/api/student/attendance"],
    enabled: !!user && user.role === 'student',
  });

  const { data: schedules } = useQuery<ClassSchedule[]>({
    queryKey: ["/api/student/schedules"],
    enabled: !!user && user.role === 'student',
  });

  const { data: familyMembers } = useQuery<StudentProfileType[]>({
    queryKey: ["/api/student/family"],
    enabled: !!user && user.role === 'student' && studentProfile && isAdult(studentProfile.dateOfBirth),
  });

  const isAdult = (dateOfBirth: string) => {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    return age >= 18;
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user || user.role !== 'student' || !studentProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const monthlyAttendance = attendance?.filter(checkin => {
    const checkinDate = new Date(checkin.checkinDate);
    const now = new Date();
    return checkinDate.getMonth() === now.getMonth() && 
           checkinDate.getFullYear() === now.getFullYear();
  }).length || 0;

  const getDayName = (dayOfWeek: number) => {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return days[dayOfWeek];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Student Navigation */}
      <nav className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <User className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-800">Área do Aluno</h1>
                <p className="text-sm text-gray-600" data-testid="text-student-name">
                  {studentProfile.fullName}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-gray-600 hover:text-danger"
              data-testid="button-logout"
            >
              <LogOut className="text-xl" />
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="gradient-primary p-6 text-white shadow-lg">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Check-in Rápido</h3>
                  <CheckInButton studentId={studentProfile.id} />
                </div>
                <MapPin className="text-3xl opacity-75" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-elevated p-6">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">Presença do Mês</h3>
                  <p className="text-2xl font-bold text-primary" data-testid="text-monthly-attendance">
                    {monthlyAttendance}
                  </p>
                  <p className="text-sm text-gray-600">aulas frequentadas</p>
                </div>
                <Calendar className="text-3xl text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-elevated p-6">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">Próxima Graduação</h3>
                  <p className="text-sm text-accent font-medium">Em breve</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className="bg-accent h-2 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                </div>
                <div className="text-3xl text-gray-400">🥋</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Student Profile and Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <StudentProfile student={studentProfile} />

          {/* Class Schedule and Recent Attendance */}
          <div className="lg:col-span-2 space-y-6">
            {/* Class Schedule */}
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 text-primary" />
                  Horários da Turma
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {schedules?.map((schedule) => (
                    <div key={schedule.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-800">
                          {getDayName(schedule.dayOfWeek)}
                        </h4>
                        <span className="text-sm bg-primary text-white px-2 py-1 rounded">
                          {schedule.startTime} - {schedule.endTime}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Turma {schedule.classType}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Attendance History */}
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <History className="mr-2 text-primary" />
                  Histórico de Presença
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Data</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Horário</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendance?.slice(0, 10).map((checkin) => (
                        <tr key={checkin.id} className="border-b border-gray-100">
                          <td className="py-3 px-4 text-gray-800">
                            {new Date(checkin.checkinDate).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {new Date(checkin.checkinTime).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="py-3 px-4">
                            <span className="badge-success">Presente</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Family Group Management (Only for 18+ students) */}
        {studentProfile && isAdult(studentProfile.dateOfBirth) && (
          <Card className="mt-8 card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 text-primary" />
                Grupo Familiar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {familyMembers?.map((member) => (
                  <div key={member.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-800">{member.fullName}</h4>
                        <p className="text-sm text-gray-600">
                          {new Date().getFullYear() - new Date(member.dateOfBirth).getFullYear()} anos
                        </p>
                        <p className="text-xs text-gray-500">Turma {member.classType}</p>
                      </div>
                      <CheckInButton
                        studentId={member.id}
                        variant="secondary"
                        size="sm"
                      />
                    </div>
                  </div>
                ))}

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-center">
                  <Button
                    variant="ghost"
                    className="text-gray-600 hover:text-primary transition-colors duration-200"
                    data-testid="button-add-family-member"
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">+</div>
                      <p className="text-sm">Adicionar Dependente</p>
                    </div>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

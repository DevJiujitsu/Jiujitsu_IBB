import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import type { CheckinWithStudent } from "@/types";

interface CheckinData {
  id: string;
  checkinTime: string;
  student: {
    fullName: string;
    classType: "KIDS" | "FEMININA" | "MISTA";
  };
}

export default function RecentCheckins() {
  const { data: checkins, isLoading } = useQuery<CheckinData[]>({
    queryKey: ["/api/admin/checkins/today"],
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          <Clock className="mr-2 text-primary" />
          Check-ins Recentes
        </h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-200 animate-pulse rounded-lg h-16"></div>
          ))}
        </div>
      </div>
    );
  }

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

  return (
    <Card className="card-elevated">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="mr-2 text-primary" />
          Check-ins Recentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!checkins || checkins.length === 0 ? (
          <p className="text-gray-500">Nenhum check-in hoje ainda</p>
        ) : (
          <div className="space-y-3">
            {checkins.slice(0, 8).map((checkin) => {
              const initials = checkin.student.fullName
                .split(' ')
                .map(name => name[0])
                .join('')
                .slice(0, 2)
                .toUpperCase();
              
              return (
                <div key={checkin.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 ${getClassColor(checkin.student.classType)} rounded-full flex items-center justify-center text-white font-bold`}>
                      {initials}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800" data-testid={`checkin-student-${checkin.id}`}>
                        {checkin.student.fullName}
                      </p>
                      <p className="text-sm text-gray-600">
                        Turma {checkin.student.classType}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500" data-testid={`checkin-time-${checkin.id}`}>
                    {new Date(checkin.checkinTime).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

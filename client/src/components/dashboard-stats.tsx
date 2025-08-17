import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Baby, Heart } from "lucide-react";
import type { AdminDashboardData } from "@/types";

interface StatsCardProps {
  title: string;
  total: number;
  checkins: number;
  color: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

function StatsCard({ title, total, checkins, color, icon, onClick }: StatsCardProps) {
  return (
    <Card 
      className={`${color} p-6 text-white shadow-lg cursor-pointer hover:shadow-xl transition-shadow duration-200`}
      onClick={onClick}
    >
      <CardContent className="p-0">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <p className="text-3xl font-bold" data-testid={`stats-${title.toLowerCase().replace(' ', '-')}-total`}>
              {total}
            </p>
            <p className="text-sm opacity-90">alunos matriculados</p>
            <div className="mt-3 bg-white bg-opacity-20 rounded-lg p-2">
              <p className="text-sm">
                Check-ins hoje: <span className="font-bold" data-testid={`stats-${title.toLowerCase().replace(' ', '-')}-checkins`}>{checkins}</span>
              </p>
            </div>
          </div>
          <div className="text-4xl opacity-75">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardStats() {
  const { data: dashboardData, isLoading } = useQuery<AdminDashboardData>({
    queryKey: ["/api/admin/dashboard"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-200 animate-pulse rounded-xl h-40"></div>
        ))}
      </div>
    );
  }

  const getClassStats = (classType: string) => {
    const count = dashboardData?.studentCounts.find(c => c.classType === classType)?.count || 0;
    let checkins = 0;
    
    if (classType === "KIDS") {
      checkins = dashboardData?.checkins.kids || 0;
    } else if (classType === "FEMININA") {
      checkins = dashboardData?.checkins.female || 0;
    } else if (classType === "MISTA") {
      checkins = dashboardData?.checkins.mixed || 0;
    }
    
    return { count, checkins };
  };

  const kidsStats = getClassStats("KIDS");
  const femaleStats = getClassStats("FEMININA");
  const mixedStats = getClassStats("MISTA");

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <StatsCard
        title="Turma KIDS"
        total={kidsStats.count}
        checkins={kidsStats.checkins}
        color="bg-gradient-to-br from-blue-500 to-blue-600"
        icon={<Baby className="h-10 w-10" />}
        onClick={() => {/* TODO: Filter by KIDS class */}}
      />

      <StatsCard
        title="Turma FEMININA"
        total={femaleStats.count}
        checkins={femaleStats.checkins}
        color="bg-gradient-to-br from-pink-500 to-pink-600"
        icon={<Heart className="h-10 w-10" />}
        onClick={() => {/* TODO: Filter by FEMININA class */}}
      />

      <StatsCard
        title="Turma MISTA"
        total={mixedStats.count}
        checkins={mixedStats.checkins}
        color="gradient-primary"
        icon={<Users className="h-10 w-10" />}
        onClick={() => {/* TODO: Filter by MISTA class */}}
      />
    </div>
  );
}

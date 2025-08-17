import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { CheckinResult } from "@/types";

interface CheckInButtonProps {
  studentId: string;
  variant?: "default" | "secondary";
  size?: "default" | "sm";
}

export default function CheckInButton({ 
  studentId, 
  variant = "default", 
  size = "default" 
}: CheckInButtonProps) {
  const { getCurrentPosition, isLoading: geoLoading } = useGeolocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const checkinMutation = useMutation({
    mutationFn: async ({ latitude, longitude }: { latitude: number; longitude: number }) => {
      const response = await apiRequest("POST", "/api/student/checkin", {
        studentId,
        latitude: latitude.toString(),
        longitude: longitude.toString(),
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Check-in realizado!",
        description: "Sua presença foi registrada com sucesso.",
      });
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/student/attendance"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/checkins/today"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro no check-in",
        description: error.message || "Não foi possível realizar o check-in.",
        variant: "destructive",
      });
    },
  });

  const handleCheckin = async () => {
    try {
      const position = await getCurrentPosition();
      checkinMutation.mutate({
        latitude: position.latitude,
        longitude: position.longitude,
      });
    } catch (error: any) {
      toast({
        title: "Erro de localização",
        description: error.message || "Não foi possível obter sua localização.",
        variant: "destructive",
      });
    }
  };

  const isLoading = geoLoading || checkinMutation.isPending;

  return (
    <Button
      onClick={handleCheckin}
      disabled={isLoading}
      variant={variant === "secondary" ? "secondary" : "default"}
      size={size}
      className={variant === "default" ? "bg-white text-primary hover:bg-gray-100" : ""}
      data-testid="button-checkin"
    >
      {isLoading ? (
        <div className="loading-spinner mr-2"></div>
      ) : (
        <MapPin className="mr-2 h-4 w-4" />
      )}
      {isLoading ? "Verificando..." : "Fazer Check-in"}
    </Button>
  );
}

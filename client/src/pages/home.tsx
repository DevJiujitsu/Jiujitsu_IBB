import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Navigation from "@/components/navigation";
import StudentLoginModal from "@/components/student-login-modal";
import AdminLoginModal from "@/components/admin-login-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bold, Heart, QrCode, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Settings } from "@/types";

export default function Home() {
  const [, navigate] = useLocation();
  const [studentLoginOpen, setStudentLoginOpen] = useState(false);
  const [adminLoginOpen, setAdminLoginOpen] = useState(false);
  const [pixCopied, setPixCopied] = useState(false);
  const { toast } = useToast();

  const { data: settings } = useQuery<Settings>({
    queryKey: ["/api/settings"],
  });

  const copyPixKey = async () => {
    if (settings?.pixKey) {
      try {
        await navigator.clipboard.writeText(settings.pixKey);
        setPixCopied(true);
        toast({
          title: "Chave PIX copiada!",
          description: "A chave PIX foi copiada para a área de transferência.",
        });
        setTimeout(() => setPixCopied(false), 2000);
      } catch (error) {
        toast({
          title: "Erro ao copiar",
          description: "Não foi possível copiar a chave PIX.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation
        onStudentLogin={() => setStudentLoginOpen(true)}
        onAdminLogin={() => setAdminLoginOpen(true)}
      />

      {/* Hero Section */}
      <section className="gradient-primary py-20 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Transformando vidas através do{" "}
                <span className="text-accent">Jiu-Jitsu</span>
              </h1>
              <p className="text-xl mb-8 text-green-100">
                Apoiando crianças e jovens em situação de vulnerabilidade social com disciplina, inclusão e oportunidades.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Button
                  data-testid="button-student-login"
                  className="btn-accent"
                  onClick={() => setStudentLoginOpen(true)}
                >
                  Entrar como Aluno
                </Button>
                <Button
                  data-testid="button-admin-login"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white hover:text-primary"
                  onClick={() => setAdminLoginOpen(true)}
                >
                  Área Administrativa
                </Button>
              </div>
            </div>
            <div className="hidden md:block animate-fade-in">
              <div className="w-full h-96 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20 flex items-center justify-center">
                <Bold className="w-32 h-32 text-white/50" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
              Quem Somos
            </h2>
            <div className="w-20 h-1 bg-primary mx-auto mb-8"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <div className="w-full h-96 bg-gray-100 rounded-xl flex items-center justify-center">
                <Bold className="w-32 h-32 text-gray-400" />
              </div>
            </div>
            <div className="animate-fade-in">
              <Card className="p-8">
                <CardContent className="p-0">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">Nossa Missão</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {settings?.aboutText || 
                      "O Jiu-Jitsu IBB nasceu da parceria da Igreja Batista do Bacacheri (IBB) com o projeto Jiu-Jitsu Para Todos da Gracie Barra Curitiba."
                    }
                  </p>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                      <Heart className="text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Transformação Social</h4>
                      <p className="text-sm text-gray-600">Através do esporte e da disciplina</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Donations Section */}
      <section id="donations" className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
              Apoie Nosso Projeto
            </h2>
            <p className="text-gray-600 mb-8">
              Sua doação ajuda a transformar vidas através do Jiu-Jitsu
            </p>
          </div>

          <Card className="card-elevated p-8">
            <CardContent className="p-0 text-center">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
                <QrCode className="text-gray-800 text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Chave PIX para Doações</h3>
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <p 
                  data-testid="text-pix-key"
                  className="text-lg font-mono text-gray-800 break-all"
                >
                  {settings?.pixKey || "jiujitsuibbadm@gmail.com"}
                </p>
                <Button
                  data-testid="button-copy-pix"
                  className="mt-4 btn-primary"
                  onClick={copyPixKey}
                >
                  {pixCopied ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copiar Chave PIX
                    </>
                  )}
                </Button>
              </div>
              <p className="text-sm text-gray-600">
                Toda doação é aplicada diretamente no projeto social
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <StudentLoginModal
        open={studentLoginOpen}
        onOpenChange={setStudentLoginOpen}
      />

      <AdminLoginModal
        open={adminLoginOpen}
        onOpenChange={setAdminLoginOpen}
      />
    </div>
  );
}

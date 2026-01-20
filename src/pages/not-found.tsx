/**
 * 404 Not Found page
 */

import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { useTranslation } from "@/hooks/use-translation";

export function NotFoundPage() {
  const navigate = useNavigate();
  const t = useTranslation();

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes glow {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.4; }
        }
        .float-animation {
          animation: float 3s ease-in-out infinite;
        }
        .glow-animation {
          animation: glow 2s ease-in-out infinite;
        }
      `}</style>
      <div className="max-w-2xl w-full text-center">
        {/* Animated 404 Illustration */}
        <div className="relative mb-8">
          <div className="inline-block">
            <div className="relative">
              {/* Main 404 Text with Animation */}
              <h1 className="text-9xl md:text-[12rem] font-bold text-primary/20 dark:text-primary/10 select-none float-animation">
                404
              </h1>

              {/* Floating Search Icon Animation */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="relative">
                  <Search
                    className="h-16 w-16 md:h-20 md:w-20 text-primary animate-bounce"
                    style={{ animationDuration: "2s" }}
                  />
                  {/* Pulsing ring effects */}
                  <div
                    className="absolute inset-0 -m-2 rounded-full border-2 border-primary/30 animate-ping"
                    style={{ animationDuration: "3s" }}
                  />
                  <div
                    className="absolute inset-0 -m-4 rounded-full border border-primary/20 animate-ping"
                    style={{ animationDuration: "4s", animationDelay: "0.5s" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-4 mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            {t('notFound.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            {t('notFound.description')}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            onClick={() => navigate(ROUTES.HOME)}
            size="lg"
            className="min-w-[160px]"
          >
            <Home className="mr-2 h-4 w-4" />
            {t('notFound.goToHome')}
          </Button>
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            size="lg"
            className="min-w-[160px]"
          >
            {t('notFound.goBack')}
          </Button>
        </div>

        {/* Decorative Elements */}
        <div className="mt-12 flex justify-center gap-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-2 w-2 rounded-full bg-primary/30 animate-pulse"
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: "1.5s",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

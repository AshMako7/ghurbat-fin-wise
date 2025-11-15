import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Landing from "./pages/Landing";
import Onboarding from "./pages/Onboarding";
import Auth from "./pages/Auth";
import Overview from "./pages/Overview";
import AddTransaction from "./pages/AddTransaction";
import Entries from "./pages/Entries";
import Goals from "./pages/Goals";
import NotFound from "./pages/NotFound";
import { useAuth } from "./contexts/AuthContext";
import BottomNav from "./components/BottomNav";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <div className="min-h-screen w-full">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/auth" element={<Auth />} />
              <Route
                path="/home"
                element={
                  <ProtectedRoute>
                    <>
                      <Overview />
                      <BottomNav />
                    </>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/add"
                element={
                  <ProtectedRoute>
                    <>
                      <AddTransaction />
                      <BottomNav />
                    </>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/entries"
                element={
                  <ProtectedRoute>
                    <>
                      <Entries />
                      <BottomNav />
                    </>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/goals"
                element={
                  <ProtectedRoute>
                    <>
                      <Goals />
                      <BottomNav />
                    </>
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

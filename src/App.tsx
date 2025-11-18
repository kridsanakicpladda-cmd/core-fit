import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { AuthProvider } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { CandidatesProvider } from "./contexts/CandidatesContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import JobApplication from "./pages/JobApplication";
import JobRequisitions from "./pages/JobRequisitions";
import Candidates from "./pages/Candidates";
import Interviews from "./pages/Interviews";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <NotificationProvider>
            <CandidatesProvider>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/" element={<ProtectedRoute><DashboardLayout><Dashboard /></DashboardLayout></ProtectedRoute>} />
                <Route path="/jobs" element={<ProtectedRoute><DashboardLayout><Jobs /></DashboardLayout></ProtectedRoute>} />
                <Route path="/job-application" element={<ProtectedRoute><DashboardLayout><JobApplication /></DashboardLayout></ProtectedRoute>} />
                <Route path="/job-requisitions" element={<ProtectedRoute><DashboardLayout><JobRequisitions /></DashboardLayout></ProtectedRoute>} />
                <Route path="/candidates" element={<ProtectedRoute><DashboardLayout><Candidates /></DashboardLayout></ProtectedRoute>} />
                <Route path="/interviews" element={<ProtectedRoute><DashboardLayout><Interviews /></DashboardLayout></ProtectedRoute>} />
                <Route path="/reports" element={<ProtectedRoute><DashboardLayout><Reports /></DashboardLayout></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><DashboardLayout><Settings /></DashboardLayout></ProtectedRoute>} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </CandidatesProvider>
          </NotificationProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

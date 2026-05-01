import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { Toaster } from "react-hot-toast";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Public Routes
import { LandingPage } from "./pages/LandingPage/LandingPage";
import { Signup } from "./pages/Auth/Signup";
import { Login } from "./pages/Auth/Login";
import { ForgotPassword } from "./pages/Auth/ForgotPassword";
import { ResetPassword } from "./pages/Auth/ResetPassword";

// Job Seeker Routes
import { JobSeekerDashboard } from "./pages/JobSeeker/JobSeekerDashboard";
import { JobDetails } from "./pages/JobSeeker/JobDetails";
import { SavedJobs } from "./pages/JobSeeker/SavedJobs";
import { UserProfile } from "./pages/JobSeeker/UserProfile";

// Employer Routes
import { EmployerDashboard } from "./pages/Employer/EmployerDashboard";
import { JobPostingForm } from "./pages/Employer/JobPostingForm";
import { ManageJobs } from "./pages/Employer/ManageJobs";
import { ApplicationViewer } from "./pages/Employer/ApplicationViewer";
import { EmployerProfilePage } from "./pages/Employer/EmployerProfilePage";

// Protected Routes
import ProtectedRoute from "./routes/ProtectedRoute";

const App = () => {
  return (
    <ErrorBoundary>
      <div>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Job Seeker Routes */}
            <Route path="/find-jobs" element={<JobSeekerDashboard />} />
            <Route path="/job/:jobId" element={<JobDetails />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<UserProfile />} />
            </Route>

            <Route element={<ProtectedRoute requiredRole="jobseeker" />}>
              <Route path="/saved-jobs" element={<SavedJobs />} />
              <Route path="/my-applications" element={<SavedJobs />} />
            </Route>

            {/* Protected Routes */}
            <Route element={<ProtectedRoute requiredRole="recruiter" />}>
              <Route
                path="/employer-dashboard"
                element={<EmployerDashboard />}
              />
              <Route path="/post-job" element={<JobPostingForm />} />
              <Route path="/manage-jobs" element={<ManageJobs />} />
              <Route path="/applicants" element={<ApplicationViewer />} />
              <Route
                path="/company-profile"
                element={<EmployerProfilePage />}
              />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>

        <Toaster
          toastOptions={{
            style: { fontSize: "16px" },
          }}
        />
      </div>
    </ErrorBoundary>
  );
};

export default App;

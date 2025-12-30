import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FcGoogle } from "react-icons/fc";
import { signIn } from "@/utils/auth/auth";
import { createUser, getUser } from "@/utils/firestore/users";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, loading, navigate]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render login form if already authenticated (redirect will happen)
  if (isAuthenticated) {
    return null;
  }

  const handleLogin = async () => {
    const firebaseUser = await signIn();

    if (!firebaseUser?.uid) {
      console.error("User ID is missing. Firebase may not be properly configured.");
      alert("Unable to sign in. Please check that Firebase is properly configured.");
      return;
    }

    const existingUser = await getUser(firebaseUser.uid);
    if (!existingUser) {
      await createUser(firebaseUser.uid, firebaseUser);
    }

    navigate("/dashboard");
  };

  return (
    <div className="container relative grid h-svh flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-6 w-6"
          >
            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
          </svg>
          Swasth Report
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome to Swasth Report
            </h1>
            <p className="text-sm text-muted-foreground">
              Sign in with your Google account to continue
            </p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Login</CardTitle>
              <CardDescription>
                Continue with Google to access your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleLogin}
                >
                  <FcGoogle className="mr-2 h-4 w-4" />
                  {"Sign in with Google"}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                By clicking continue, you agree to our{" "}
                <a
                  href="#"
                  className="underline underline-offset-4 hover:text-primary"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="#"
                  className="underline underline-offset-4 hover:text-primary"
                >
                  Privacy Policy
                </a>
                .
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


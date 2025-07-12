"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, GraduationCap } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { baseUrl } from "../../../constant";

const DEMO_USERS = [
  {
    email: "admin@school.edu",
    password: "admin123",
    role: "Admin",
    name: "Emily Rodriguez",
  },
  {
    email: "principal@school.edu",
    password: "principal123",
    role: "Principal",
    name: "David Thompson",
  },
  {
    email: "teacher@school.edu",
    password: "teacher123",
    role: "Teacher",
    name: "Sarah Johnson",
  },
  {
    email: "head@school.edu",
    password: "head123",
    role: "Head Teacher",
    name: "Michael Chen",
  },
];

// interface User {
//   email: string;
//   password: string;
//   role: "Admin" | "Principal" | "Teacher" | "Head Teacher";
//   name: string;
// }

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Simulate API call
      // await new Promise((resolve) => setTimeout(resolve, 1000));

      // const user = DEMO_USERS.find(
      //   (u) => u.email === email && u.password === password
      // ) as User | undefined;

      const response = await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const user = await response.json();

      console.log("Login response:", user);
      if (!user) {
        setError("Invalid email or password");
        return;
      }

      login(user.data);
      router.push("/");
    } catch (err) {
      console.log(err)
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <GraduationCap className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to your school management account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">Demo Accounts:</p>
            <div className="space-y-1 text-xs">
              {DEMO_USERS.map((user) => (
                <div key={user.email} className="flex justify-between">
                  <span>{user.role}:</span>
                  <span className="font-mono">{user.email}</span>
                </div>
              ))}
              <p className="text-muted-foreground mt-2">
                Password for all: respective role + 123
              </p>
            </div>
          </div> */}

              <div>
                <p className="text-sm text-muted-foreground mt-4">
                  Don&apos;t have an account?{" "}
                  <a
                    href="/register"
                    className="text-primary hover:underline"
                  >
                    Register here
                  </a>
                </p>
              </div>

        </CardContent>
      </Card>
    </div>
  );
}

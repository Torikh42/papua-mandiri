import AuthForm from "@/components/AuthForm";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";

const LoginPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="mb-4">
            <CardTitle className="text-center text-3xl text-[#4c7a6b]">Login</CardTitle>
        </CardHeader>

        <AuthForm type="login" />
      </Card>
    </div>
  );
};

export default LoginPage;

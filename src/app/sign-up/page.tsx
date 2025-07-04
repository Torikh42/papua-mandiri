import AuthForm from "@/components/AuthForm";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";

const SignUpPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-5xl shadow-2xl">
        <CardHeader className="mb-4">
          <CardTitle className="text-center text-3xl text-green-700">Daftarkan Akun</CardTitle>
        </CardHeader>

        <AuthForm type="sign up" />
      </Card>
    </div>
  );
};

export default SignUpPage;

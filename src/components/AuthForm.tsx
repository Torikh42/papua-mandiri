"use client";
import { useRouter } from "next/navigation";
import React, { useTransition } from "react";
import { toast } from "sonner";
import { CardContent, CardFooter } from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { loginAction, signUpAction, UserRole } from "@/action/userAction";

type Props = {
  type: "login" | "sign up";
};

const AuthForm = ({ type }: Props) => {
  const isLoginForm = type === "login";
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (FormData: FormData) => {
    startTransition(async () => {
      const email = FormData.get("email") as string;
      const password = FormData.get("password") as string;

      let errorMessage;

      if (isLoginForm) {
        errorMessage = (await loginAction(email, password)).errorMessage;
      } else {
        const fullName = FormData.get("fullName") as string;
        const role = FormData.get("role") as UserRole;
        const location = FormData.get("location") as string;
        errorMessage = (
          await signUpAction(fullName, email, password, role, location)
        ).errorMessage;
      }

      if (!errorMessage) {
        toast.success(
          isLoginForm
            ? "You have successfully logged in."
            : "You have successfully signed up."
        );
        router.replace("/");
      } else {
        console.log(errorMessage);
        toast.error(
          isLoginForm
            ? "An error occurred while logging in."
            : "An error occurred while signing up."
        );
      }
    });
  };

  return (
    <form action={handleSubmit}>
      <CardContent className="grid w-full items-center gap-4">
        {!isLoginForm && (
          <>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                placeholder="Enter your full name"
                type="text"
                required
                disabled={isPending}
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                name="role"
                required
                disabled={isPending}
                className="border rounded px-2 py-1"
                defaultValue=""
              >
                <option value="" disabled>
                  Select role
                </option>
                <option value="petani">petani</option>
                <option value="pengolah">pengolah</option>
                <option value="pembeli">pembeli</option>
                <option value="admin_komunitas">admin komunitas</option>
              </select>
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                placeholder="Enter your location"
                type="text"
                required
                disabled={isPending}
              />
            </div>
          </>
        )}
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            placeholder="Enter your email"
            type="email"
            required
            disabled={isPending}
          />
        </div>
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            placeholder="Enter your password"
            type="password"
            required
            disabled={isPending}
          />
        </div>
      </CardContent>
      <CardFooter className="mt-4 flex flex-col gap-6">
        <Button className="w-full">
          {isPending ? (
            <Loader2 className="animate-spin" />
          ) : isLoginForm ? (
            "Login"
          ) : (
            "Sign Up"
          )}
        </Button>
        <p className="text-xs">
          {isLoginForm ? "Don't have an account?" : "Already have an account?"}{" "}
          <Link
            href={isLoginForm ? "/sign-up" : "/login"}
            className={`text-blue-500 ${
              isPending ? "pointer-events-none opacity-50" : ""
            }`}
          >
            {isLoginForm ? "Sign Up" : "Login"}
          </Link>
        </p>
      </CardFooter>
    </form>
  );
};

export default AuthForm;

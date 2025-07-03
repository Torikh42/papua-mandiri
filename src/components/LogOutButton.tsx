"use client";
import React from "react";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { logoutAction } from "@/action/userAction";

const LogOutButton = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const handleLogOut = async () => {
    setLoading(true);
    const { errorMessage } = await logoutAction();

    if (!errorMessage) {
      toast.success("You have successfully logged out.");
      router.push("/");
    } else {
      toast.error("An error occurred while logging out.");
    }
    setLoading(false);
    console.log("Logging out...");
  };
  return (
    <Button
      variant="outline"
      onClick={handleLogOut}
      disabled={loading}
      className=" w-24 bg-transparent"
    >
      {loading ? <Loader2 className="animate-spin" /> : "Logout"}
    </Button>
  );
};
export default LogOutButton;

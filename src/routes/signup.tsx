import { SignupForm } from "@/components/auth";
import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/signup")({ component: SignupForm });

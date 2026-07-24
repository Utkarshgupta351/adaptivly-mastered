import { ForgotPasswordForm } from "@/components/auth";
import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/forgot-password")({ component: ForgotPasswordForm });

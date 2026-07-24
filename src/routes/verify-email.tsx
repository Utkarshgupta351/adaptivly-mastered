import { VerifyEmail } from "@/components/auth";
import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/verify-email")({ component: VerifyEmail });

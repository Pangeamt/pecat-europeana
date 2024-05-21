import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Use it in server contexts
export function auth(...args) {
  return getServerSession(...args, authOptions);
}

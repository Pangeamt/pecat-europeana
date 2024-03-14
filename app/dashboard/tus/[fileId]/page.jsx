"use client";
import { useParams } from "next/navigation";
import TusLits from "@/components/Tus/list";

export default function DashboardPage() {
  const { fileId } = useParams();

  return <TusLits fileId={fileId} />;
}

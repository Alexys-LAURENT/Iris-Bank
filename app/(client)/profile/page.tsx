import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Topbar } from "@/components/layout/Topbar";
import { ProfileForm } from "./ProfileForm";

export default async function ProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true, firstname: true, lastname: true, email: true,
      phone: true, address: true, birthdate: true, createdAt: true,
    },
  });

  if (!user) redirect("/login");

  return (
    <div className="flex flex-col h-full" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <Topbar title="Mon profil" />
      <div className="flex-1 p-8">
        <h1
          className="text-2xl font-bold mb-2"
          style={{ fontFamily: "'Cormorant Garant', serif", color: "#0f1f4b" }}
        >
          Mon profil
        </h1>
        <p className="text-sm mb-8" style={{ color: "#6b7280" }}>
          Gérez vos informations personnelles
        </p>
        <ProfileForm user={{
          firstname: user.firstname ?? "",
          lastname: user.lastname ?? "",
          email: user.email,
          phone: user.phone ?? "",
          address: user.address ?? "",
          birthdate: user.birthdate ? user.birthdate.toISOString().split("T")[0] : "",
        }} />
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { updateProfile } from "@/server_actions/auth/updateProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle } from "lucide-react";

const profileSchema = z.object({
  firstname: z.string().min(2, "Prénom requis"),
  lastname: z.string().min(2, "Nom requis"),
  phone: z.string().optional(),
  address: z.string().optional(),
  birthdate: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

interface Props {
  user: { firstname: string; lastname: string; email: string; phone: string; address: string; birthdate: string };
}

export function ProfileForm({ user }: Props) {
  const router = useRouter();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstname: user.firstname,
      lastname: user.lastname,
      phone: user.phone,
      address: user.address,
      birthdate: user.birthdate,
    },
  });

  const onSubmit = async (data: ProfileForm) => {
    setError(null);
    setSuccess(false);
    const result = await updateProfile(data);
    if (!result.success) { setError(result.error); return; }
    setSuccess(true);
    router.refresh();
  };

  const inputStyle = { background: "white", borderColor: "#e5e7eb", height: "44px" };

  return (
    <div className="max-w-lg">
      {success && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm mb-6">
          <CheckCircle size={16} /> Profil mis à jour avec succès
        </div>
      )}
      {error && (
        <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm mb-6">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border p-6 mb-4" style={{ borderColor: "#f0f0f0" }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#c9a84c" }}>
          Email
        </p>
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg" style={{ background: "#f8f7f4", border: "1px solid #e5e7eb" }}>
          <span className="text-sm" style={{ color: "#374151" }}>{user.email}</span>
          <span className="ml-auto text-xs px-2 py-0.5 rounded-full" style={{ background: "#eef2ff", color: "#1e3a8a" }}>
            Non modifiable
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl border p-6 space-y-5" style={{ borderColor: "#f0f0f0" }}>
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#c9a84c" }}>
          Informations personnelles
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label style={{ color: "#374151", fontSize: "0.8rem" }}>Prénom *</Label>
            <Input {...register("firstname")} style={inputStyle} />
            {errors.firstname && <p className="text-xs text-red-500">{errors.firstname.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label style={{ color: "#374151", fontSize: "0.8rem" }}>Nom *</Label>
            <Input {...register("lastname")} style={inputStyle} />
            {errors.lastname && <p className="text-xs text-red-500">{errors.lastname.message}</p>}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label style={{ color: "#374151", fontSize: "0.8rem" }}>Téléphone</Label>
          <Input {...register("phone")} placeholder="+33 6 00 00 00 00" style={inputStyle} />
        </div>

        <div className="space-y-1.5">
          <Label style={{ color: "#374151", fontSize: "0.8rem" }}>Adresse</Label>
          <Input {...register("address")} placeholder="12 rue de la Paix, 75001 Paris" style={inputStyle} />
        </div>

        <div className="space-y-1.5">
          <Label style={{ color: "#374151", fontSize: "0.8rem" }}>Date de naissance</Label>
          <Input type="date" {...register("birthdate")} style={inputStyle} />
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-11 text-sm font-semibold"
          style={{ background: "linear-gradient(135deg, #0f1f4b, #1e3a8a)", border: "none", color: "white", borderRadius: "0.5rem" }}
        >
          {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : "Enregistrer les modifications"}
        </Button>
      </form>
    </div>
  );
}

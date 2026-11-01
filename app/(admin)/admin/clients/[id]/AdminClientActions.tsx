"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { updateClient } from "@/server_actions/admin/updateClient";
import { deleteClient } from "@/server_actions/admin/deleteClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle, Trash2 } from "lucide-react";

const schema = z.object({
  firstname: z.string().min(1),
  lastname: z.string().min(1),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  clientId: string;
  client: { firstname: string; lastname: string; phone: string; address: string };
}

export function AdminClientActions({ clientId, client }: Props) {
  const router = useRouter();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { register, handleSubmit, formState: { isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: client,
  });

  const onSubmit = async (data: FormData) => {
    setError(null); setSuccess(false);
    const result = await updateClient({ userId: clientId, ...data });
    if (!result.success) { setError(result.error); return; }
    setSuccess(true);
    router.refresh();
  };

  const handleDelete = async () => {
    if (!deleteConfirm) { setDeleteConfirm(true); return; }
    setDeleting(true);
    const result = await deleteClient(clientId);
    setDeleting(false);
    if (!result.success) { setError(result.error); setDeleteConfirm(false); return; }
    router.push("/admin/clients");
    router.refresh();
  };

  const inputStyle = { background: "white", borderColor: "#e5e7eb", height: "40px" };

  return (
    <div className="bg-white rounded-xl border p-6" style={{ borderColor: "#f0f0f0" }}>
      <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#7c3aed" }}>
        Modifier le client
      </p>

      {success && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm mb-4">
          <CheckCircle size={14} /> Modifications enregistrées
        </div>
      )}
      {error && (
        <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-3 mb-6">
        <div className="space-y-1">
          <Label style={{ fontSize: "0.8rem", color: "#374151" }}>Prénom</Label>
          <Input {...register("firstname")} style={inputStyle} />
        </div>
        <div className="space-y-1">
          <Label style={{ fontSize: "0.8rem", color: "#374151" }}>Nom</Label>
          <Input {...register("lastname")} style={inputStyle} />
        </div>
        <div className="space-y-1">
          <Label style={{ fontSize: "0.8rem", color: "#374151" }}>Téléphone</Label>
          <Input {...register("phone")} style={inputStyle} />
        </div>
        <div className="space-y-1">
          <Label style={{ fontSize: "0.8rem", color: "#374151" }}>Adresse</Label>
          <Input {...register("address")} style={inputStyle} />
        </div>
        <div className="col-span-2 flex items-center justify-between pt-2">
          <Button type="submit" disabled={isSubmitting} className="h-9 text-sm" style={{ background: "linear-gradient(135deg, #1a0533, #2d1b54)", border: "none", color: "white", borderRadius: "0.5rem" }}>
            {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : "Enregistrer"}
          </Button>

          <div className="flex items-center gap-2">
            {deleteConfirm && (
              <button type="button" onClick={() => setDeleteConfirm(false)} className="text-xs text-gray-400">
                Annuler
              </button>
            )}
            <Button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              variant="outline"
              className="h-9 text-sm border-red-200 text-red-600 hover:bg-red-50"
            >
              {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              {deleteConfirm ? "Confirmer la suppression" : "Supprimer le client"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

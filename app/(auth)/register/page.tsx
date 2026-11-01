"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { signUp } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2 } from "lucide-react";

const registerSchema = z
  .object({
    firstname: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
    lastname: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    email: z.string().email("Adresse email invalide"),
    password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    confirmPassword: z.string(),
    phone: z.string().optional(),
    address: z.string().optional(),
    birthdate: z.string().optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-red-500 mt-1">{message}</p>;
}

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterForm) => {
    setServerError(null);
    const { error } = await signUp.email({
      name: `${data.firstname} ${data.lastname}`,
      email: data.email,
      password: data.password,
      firstname: data.firstname,
      lastname: data.lastname,
      phone: data.phone ?? "",
      address: data.address ?? "",
      birthdate: data.birthdate ? new Date(data.birthdate) : undefined,
    } as Parameters<typeof signUp.email>[0]);
    if (error) {
      const msg = error.message ?? "";
      if (msg.toLowerCase().includes("already")) setServerError("Cet email est déjà utilisé");
      else setServerError("Échec de l'inscription. Vérifiez vos informations.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  };

  const inputStyle = (hasError: boolean) => ({
    background: "white",
    borderColor: hasError ? "#ef4444" : "#e5e7eb",
    borderRadius: "0.5rem",
    height: "44px",
    fontSize: "0.9rem",
  });

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Left decorative panel */}
      <div
        className="hidden lg:flex lg:w-5/12 relative flex-col justify-between p-12 overflow-hidden"
        style={{ background: "linear-gradient(145deg, #0f1f4b 0%, #1e3a8a 55%, #1e40af 100%)" }}
      >
        <svg
          className="absolute inset-0 w-full h-full opacity-10"
          viewBox="0 0 600 600"
          preserveAspectRatio="xMidYMid slice"
        >
          {[0, 30, 60, 90, 120, 150].map((r, i) => (
            <ellipse
              key={i}
              cx="300"
              cy="300"
              rx="220"
              ry="80"
              fill="none"
              stroke="#c9a84c"
              strokeWidth="1"
              transform={`rotate(${r} 300 300)`}
            />
          ))}
          {[0, 45, 90, 135].map((r, i) => (
            <ellipse
              key={`b${i}`}
              cx="300"
              cy="300"
              rx="120"
              ry="40"
              fill="none"
              stroke="#e2c97e"
              strokeWidth="0.8"
              transform={`rotate(${r} 300 300)`}
            />
          ))}
          <circle cx="300" cy="300" r="8" fill="#c9a84c" opacity="0.6" />
        </svg>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🌸</span>
            <span
              className="text-2xl font-bold text-white"
              style={{ fontFamily: "'Cormorant Garant', serif", letterSpacing: "0.15em" }}
            >
              IRISBANK
            </span>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          {[
            { icon: "🔒", text: "Sécurité bancaire de niveau institutionnel" },
            { icon: "⚡", text: "Virements instantanés 24h/24" },
            { icon: "📊", text: "Suivi de vos comptes en temps réel" },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <span className="text-xl">{icon}</span>
              <span className="text-white/75 text-sm">{text}</span>
            </div>
          ))}
          <p className="text-white/30 text-xs tracking-widest uppercase pt-4">
            Banque privée · Depuis 2024
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 overflow-y-auto" style={{ background: "#f8f7f4" }}>
        <div className="min-h-full flex items-start justify-center p-8 py-12">
          <div className="w-full max-w-lg">
            {/* Mobile logo */}
            <div className="flex items-center gap-2 mb-8 lg:hidden">
              <span className="text-3xl">🌸</span>
              <span
                className="text-xl font-bold tracking-widest"
                style={{ fontFamily: "'Cormorant Garant', serif", color: "#0f1f4b", letterSpacing: "0.15em" }}
              >
                IRISBANK
              </span>
            </div>

            <div className="mb-8">
              <h1
                className="text-4xl font-bold mb-2"
                style={{ fontFamily: "'Cormorant Garant', serif", color: "#0f1f4b" }}
              >
                Créer un compte
              </h1>
              <p className="text-sm" style={{ color: "#6b7280" }}>
                Rejoignez IrisBank et gérez vos finances en toute confiance
              </p>
            </div>

            {serverError && (
              <div className="mb-6 px-4 py-3 rounded-lg text-sm border border-red-200 bg-red-50 text-red-700">
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Section: Identité */}
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-widest mb-3"
                  style={{ color: "#c9a84c" }}
                >
                  Identité
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="firstname" style={{ color: "#374151", fontSize: "0.8rem" }}>
                      Prénom *
                    </Label>
                    <Input
                      id="firstname"
                      placeholder="Jean"
                      {...register("firstname")}
                      style={inputStyle(!!errors.firstname)}
                      className="mt-1"
                    />
                    <FieldError message={errors.firstname?.message} />
                  </div>
                  <div>
                    <Label htmlFor="lastname" style={{ color: "#374151", fontSize: "0.8rem" }}>
                      Nom *
                    </Label>
                    <Input
                      id="lastname"
                      placeholder="Dupont"
                      {...register("lastname")}
                      style={inputStyle(!!errors.lastname)}
                      className="mt-1"
                    />
                    <FieldError message={errors.lastname?.message} />
                  </div>
                </div>
              </div>

              {/* Section: Connexion */}
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-widest mb-3"
                  style={{ color: "#c9a84c" }}
                >
                  Accès au compte
                </p>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="email" style={{ color: "#374151", fontSize: "0.8rem" }}>
                      Adresse email *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="jean.dupont@exemple.fr"
                      autoComplete="email"
                      {...register("email")}
                      style={inputStyle(!!errors.email)}
                      className="mt-1"
                    />
                    <FieldError message={errors.email?.message} />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="password" style={{ color: "#374151", fontSize: "0.8rem" }}>
                        Mot de passe *
                      </Label>
                      <div className="relative mt-1">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          {...register("password")}
                          style={{ ...inputStyle(!!errors.password), paddingRight: "2.5rem" }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                      <FieldError message={errors.password?.message} />
                    </div>

                    <div>
                      <Label htmlFor="confirmPassword" style={{ color: "#374151", fontSize: "0.8rem" }}>
                        Confirmer *
                      </Label>
                      <div className="relative mt-1">
                        <Input
                          id="confirmPassword"
                          type={showConfirm ? "text" : "password"}
                          placeholder="••••••••"
                          {...register("confirmPassword")}
                          style={{ ...inputStyle(!!errors.confirmPassword), paddingRight: "2.5rem" }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm(!showConfirm)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          tabIndex={-1}
                        >
                          {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                      <FieldError message={errors.confirmPassword?.message} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section: Informations facultatives */}
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-widest mb-3"
                  style={{ color: "#9ca3af" }}
                >
                  Informations complémentaires{" "}
                  <span className="normal-case font-normal">(facultatif)</span>
                </p>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="phone" style={{ color: "#374151", fontSize: "0.8rem" }}>
                        Téléphone
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+33 6 00 00 00 00"
                        {...register("phone")}
                        style={inputStyle(false)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="birthdate" style={{ color: "#374151", fontSize: "0.8rem" }}>
                        Date de naissance
                      </Label>
                      <Input
                        id="birthdate"
                        type="date"
                        {...register("birthdate")}
                        style={inputStyle(false)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address" style={{ color: "#374151", fontSize: "0.8rem" }}>
                      Adresse
                    </Label>
                    <Input
                      id="address"
                      placeholder="12 rue de la Paix, 75001 Paris"
                      {...register("address")}
                      style={inputStyle(false)}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 text-sm font-semibold tracking-wide mt-2"
                style={{
                  background: isSubmitting
                    ? "#6b7280"
                    : "linear-gradient(135deg, #0f1f4b, #1e3a8a)",
                  border: "none",
                  borderRadius: "0.5rem",
                  color: "white",
                }}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    Création en cours…
                  </span>
                ) : (
                  "Créer mon compte"
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm" style={{ color: "#6b7280" }}>
              Déjà un compte ?{" "}
              <Link
                href="/login"
                className="font-semibold hover:underline"
                style={{ color: "#1e3a8a" }}
              >
                Se connecter
              </Link>
            </p>

            <div className="mt-8 flex items-center justify-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span className="text-xs tracking-wide" style={{ color: "#9ca3af" }}>
                Connexion sécurisée 256-bit SSL
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

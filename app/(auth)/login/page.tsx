"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setServerError(null);
    const { error, data: session } = await signIn.email({ email: data.email, password: data.password });
    if (error) {
      setServerError("Email ou mot de passe incorrect");
      return;
    }
    const isAdmin = (session?.user as { isAdmin?: boolean } | null)?.isAdmin;
    router.push(isAdmin ? "/admin/dashboard" : "/dashboard");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Left panel — decorative */}
      <div
        className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden"
        style={{ background: "linear-gradient(145deg, #0f1f4b 0%, #1e3a8a 50%, #1e40af 100%)" }}
      >
        {/* Geometric iris SVG background */}
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

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🌸</span>
            <span
              className="text-2xl font-bold tracking-widest text-white"
              style={{ fontFamily: "'Cormorant Garant', serif", letterSpacing: "0.15em" }}
            >
              IRISBANK
            </span>
          </div>
        </div>

        {/* Tagline */}
        <div className="relative z-10">
          <blockquote
            className="text-white/80 text-lg leading-relaxed"
            style={{ fontFamily: "'Cormorant Garant', serif" }}
          >
            &ldquo;La confiance,
            <br />
            au cœur de chaque transaction.&rdquo;
          </blockquote>
          <p className="mt-4 text-white/40 text-sm tracking-widest uppercase">
            Banque privée · Depuis 2024
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div
        className="flex-1 flex items-center justify-center p-8"
        style={{ background: "#f8f7f4" }}
      >
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <span className="text-3xl">🌸</span>
            <span
              className="text-xl font-bold tracking-widest"
              style={{
                fontFamily: "'Cormorant Garant', serif",
                color: "#0f1f4b",
                letterSpacing: "0.15em",
              }}
            >
              IRISBANK
            </span>
          </div>

          {/* Heading */}
          <div className="mb-10">
            <h1
              className="text-4xl font-bold mb-2"
              style={{ fontFamily: "'Cormorant Garant', serif", color: "#0f1f4b" }}
            >
              Connexion
            </h1>
            <p className="text-sm" style={{ color: "#6b7280" }}>
              Accédez à votre espace personnel sécurisé
            </p>
          </div>

          {/* Error banner */}
          {serverError && (
            <div className="mb-6 px-4 py-3 rounded-lg text-sm border border-red-200 bg-red-50 text-red-700">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" style={{ color: "#374151", fontWeight: 500 }}>
                Adresse email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="vous@exemple.fr"
                autoComplete="email"
                {...register("email")}
                style={{
                  background: "white",
                  borderColor: errors.email ? "#ef4444" : "#e5e7eb",
                  borderRadius: "0.5rem",
                  height: "48px",
                  fontSize: "0.95rem",
                }}
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" style={{ color: "#374151", fontWeight: 500 }}>
                  Mot de passe
                </Label>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...register("password")}
                  style={{
                    background: "white",
                    borderColor: errors.password ? "#ef4444" : "#e5e7eb",
                    borderRadius: "0.5rem",
                    height: "48px",
                    fontSize: "0.95rem",
                    paddingRight: "3rem",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 text-sm font-semibold tracking-wide transition-all"
              style={{
                background: isSubmitting ? "#6b7280" : "linear-gradient(135deg, #0f1f4b, #1e3a8a)",
                border: "none",
                borderRadius: "0.5rem",
                color: "white",
              }}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Connexion en cours…
                </span>
              ) : (
                "Se connecter"
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="mt-8 flex items-center gap-4">
            <div className="flex-1 h-px" style={{ background: "#e5e7eb" }} />
            <span className="text-xs" style={{ color: "#9ca3af" }}>
              ou
            </span>
            <div className="flex-1 h-px" style={{ background: "#e5e7eb" }} />
          </div>

          {/* Register link */}
          <p className="mt-6 text-center text-sm" style={{ color: "#6b7280" }}>
            Pas encore de compte ?{" "}
            <Link
              href="/register"
              className="font-semibold hover:underline transition-colors"
              style={{ color: "#1e3a8a" }}
            >
              S&apos;inscrire
            </Link>
          </p>

          {/* Security badge */}
          <div className="mt-10 flex items-center justify-center gap-2">
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
  );
}

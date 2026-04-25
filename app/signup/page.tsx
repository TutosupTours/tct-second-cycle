"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FormField, Form } from "@/components/Form";
import Alert from "@/components/Alert";
import { validateEmail, sanitizeInput } from "@/lib/errors";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [alertType, setAlertType] = useState<'success' | 'error'>('error');
  const [registrationData, setRegistrationData] = useState<any>(null);

  const handleSubmit = async (data: Record<string, string>) => {
    // Validation
    if (!data.first_name || !data.last_name || !data.email || !data.promotion || !data.niveau) {
      setMessage("Tous les champs obligatoires doivent être remplis.");
      setAlertType('error');
      return;
    }

    if (!validateEmail(data.email)) {
      setMessage("Adresse email invalide.");
      setAlertType('error');
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/student-registration`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          apikey: SUPABASE_ANON_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: sanitizeInput(data.first_name),
          last_name: sanitizeInput(data.last_name),
          email: sanitizeInput(data.email).toLowerCase(),
          phone: data.phone ? sanitizeInput(data.phone) : undefined,
          promotion: sanitizeInput(data.promotion),
          niveau: sanitizeInput(data.niveau),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erreur lors de l'inscription");
      }

      setRegistrationData(result.data);
      setMessage("Inscription réussie ! Vos identifiants ont été générés.");
      setAlertType('success');

    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erreur d'inscription");
      setAlertType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fbf1df] p-4">
      <div className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#2c2f4a]">
            Inscription ECOS
          </h1>
          <p className="mt-2 text-gray-600">
            Créez votre compte pour accéder aux sessions d'examen
          </p>
        </div>

        {message && (
          <Alert
            type={alertType}
            message={message}
            onClose={() => setMessage("")}
          />
        )}

        {registrationData ? (
          <div className="space-y-4">
            <div className="rounded-lg bg-green-50 p-4">
              <h3 className="font-semibold text-green-800">Vos identifiants</h3>
              <div className="mt-2 space-y-1 text-sm text-green-700">
                <p><strong>Numéro étudiant :</strong> {registrationData.student_number}</p>
                <p><strong>PIN :</strong> {registrationData.pin}</p>
              </div>
              <p className="mt-2 text-xs text-green-600">
                Conservez ces informations précieusement. Ils vous serviront à vous connecter.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/login?role=student')}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Se connecter
              </button>
              <button
                onClick={() => setRegistrationData(null)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                Nouvelle inscription
              </button>
            </div>
          </div>
        ) : (
          <Form onSubmit={handleSubmit} submitLabel="S'inscrire" loading={loading}>
            <FormField
              label="Prénom"
              value=""
              onChange={() => {}}
              placeholder="Votre prénom"
              required
            />

            <FormField
              label="Nom"
              value=""
              onChange={() => {}}
              placeholder="Votre nom"
              required
            />

            <FormField
              label="Email"
              type="email"
              value=""
              onChange={() => {}}
              placeholder="votre.email@universite.fr"
              required
            />

            <FormField
              label="Téléphone"
              value=""
              onChange={() => {}}
              placeholder="06 12 34 56 78"
            />

            <FormField
              label="Promotion"
              value=""
              onChange={() => {}}
              placeholder="Ex: MED2024"
              required
            />

            <FormField
              label="Niveau"
              value=""
              onChange={() => {}}
              placeholder="Ex: DCEM1"
              required
            />
          </Form>
        )}

        <div className="text-center">
          <Link href="/" className="text-sm text-blue-600 hover:text-blue-800">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </main>
  );
}
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FormField, Form } from "@/components/Form";
import Alert from "@/components/Alert";
import { validateEmail, sanitizeInput } from "@/lib/errors";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

type AccountType = 'student' | 'examiner' | 'br' | 'faculty' | 'admin';

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [alertType, setAlertType] = useState<'success' | 'error'>('error');
  const [registrationData, setRegistrationData] = useState<any>(null);
  const [accountType, setAccountType] = useState<AccountType>('student');

  const accountTypeOptions = [
    { value: 'student', label: 'Étudiant' },
    { value: 'examiner', label: 'Examinateur' },
    { value: 'br', label: 'Bureau Régional (BR)' },
    { value: 'faculty', label: 'Faculté' },
    { value: 'admin', label: 'Administrateur' }
  ];

  const niveauOptions = [
    { value: 'L1', label: 'Licence 1' },
    { value: 'L2', label: 'Licence 2' },
    { value: 'L3', label: 'Licence 3' },
    { value: 'M1', label: 'Master 1' },
    { value: 'M2', label: 'Master 2' },
    { value: 'D1', label: 'Doctorat 1' },
    { value: 'D2', label: 'Doctorat 2' },
    { value: 'D3', label: 'Doctorat 3' }
  ];

  const handleAccountTypeChange = (value: string) => {
    setAccountType(value as AccountType);
  };

  const handleSubmit = async (data: Record<string, string>) => {
    // Validation de base
    if (!data.first_name || !data.last_name || !data.email) {
      setMessage("Le prénom, nom et email sont obligatoires.");
      setAlertType('error');
      return;
    }

    if (!validateEmail(data.email)) {
      setMessage("Adresse email invalide.");
      setAlertType('error');
      return;
    }

    // Validation spécifique selon le type de compte
    if (accountType === 'student' && !data.niveau) {
      setMessage("Le niveau est obligatoire pour les étudiants.");
      setAlertType('error');
      return;
    }

    if (accountType === 'examiner' && !data.category) {
      setMessage("La catégorie est obligatoire pour les examinateurs.");
      setAlertType('error');
      return;
    }

    if (accountType === 'br' && !data.region) {
      setMessage("La région est obligatoire pour le Bureau Régional.");
      setAlertType('error');
      return;
    }

    if (accountType === 'faculty' && !data.department) {
      setMessage("Le département est obligatoire pour la faculté.");
      setAlertType('error');
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const endpoint = accountType === 'student' ? 'student-registration' : 'staff-registration';
      const payload = {
        account_type: accountType,
        first_name: sanitizeInput(data.first_name),
        last_name: sanitizeInput(data.last_name),
        email: sanitizeInput(data.email).toLowerCase(),
        phone: data.phone ? sanitizeInput(data.phone) : undefined,
        ...(accountType === 'student' && {
          niveau: sanitizeInput(data.niveau),
        }),
        ...(accountType === 'examiner' && {
          category: sanitizeInput(data.category),
          specialty: data.specialty ? sanitizeInput(data.specialty) : undefined,
          grade: data.grade ? sanitizeInput(data.grade) : undefined,
        }),
        ...(accountType === 'br' && {
          region: sanitizeInput(data.region),
        }),
        ...(accountType === 'faculty' && {
          department: sanitizeInput(data.department),
          position: data.position ? sanitizeInput(data.position) : undefined,
        }),
      };

      const response = await fetch(`${SUPABASE_URL}/functions/v1/${endpoint}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          apikey: SUPABASE_ANON_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erreur lors de l'inscription");
      }

      setRegistrationData(result);
      setMessage(`Demande d'inscription envoyée avec succès ! Un email d'activation a été envoyé à ${data.email}.`);
      setAlertType('success');
    } catch (error: any) {
      setMessage(error.message || "Erreur lors de l'inscription");
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
            Demande d'inscription ECOS
          </h1>
          <p className="mt-2 text-gray-600">
            Créez votre compte pour accéder à la plateforme ECOS
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
              <h3 className="font-semibold text-green-800">Demande envoyée avec succès !</h3>
              <p className="mt-2 text-sm text-green-700">
                Un email d'activation a été envoyé à votre adresse email.
                Cliquez sur le lien dans l'email pour activer votre compte et créer votre PIN.
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/login"
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-center text-white hover:bg-blue-700"
              >
                Aller à la connexion
              </Link>
              <button
                onClick={() => setRegistrationData(null)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                Nouvelle demande
              </button>
            </div>
          </div>
        ) : (
          <Form onSubmit={handleSubmit} submitLabel="Envoyer la demande" loading={loading}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type de compte *
              </label>
              <select
                value={accountType}
                onChange={(e) => handleAccountTypeChange(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                required
              >
                {accountTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <FormField
              name="first_name"
              label="Prénom"
              placeholder="Votre prénom"
              required
            />

            <FormField
              name="last_name"
              label="Nom"
              placeholder="Votre nom"
              required
            />

            <FormField
              name="email"
              label="Email"
              type="email"
              placeholder="votre.email@universite.fr"
              required
            />

            <FormField
              name="phone"
              label="Téléphone"
              placeholder="06 12 34 56 78"
            />

            {accountType === 'student' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Niveau *
                </label>
                <select
                  name="niveau"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  required
                >
                  {niveauOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {accountType === 'examiner' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Catégorie *
                  </label>
                  <select
                    name="category"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                    required
                  >
                    <option value="junior">Junior</option>
                    <option value="senior">Senior</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
                <FormField
                  name="specialty"
                  label="Spécialité"
                  placeholder="Votre spécialité"
                />
                <FormField
                  name="grade"
                  label="Grade"
                  placeholder="Votre grade"
                />
              </>
            )}

            {accountType === 'br' && (
              <FormField
                name="region"
                label="Région"
                placeholder="Votre région"
                required
              />
            )}

            {accountType === 'faculty' && (
              <>
                <FormField
                  name="department"
                  label="Département"
                  placeholder="Votre département"
                  required
                />
                <FormField
                  name="position"
                  label="Poste"
                  placeholder="Votre poste"
                />
              </>
            )}
          </Form>
        )}

        <div className="text-center">
          <Link
            href="/login"
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Déjà un compte ? Se connecter
          </Link>
        </div>
      </div>
    </main>
  );
}
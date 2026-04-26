"use client";

import { useState } from "react";
import { FormField, Form } from "@/components/Form";
import Alert from "@/components/Alert";
import { sanitizeInput, validateEmail } from "@/lib/errors";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

type AccountType = "student" | "examiner" | "br" | "faculty" | "admin";

export default function SignupPage() {
  const [accountType, setAccountType] = useState<AccountType>("student");
  const [niveauEtudes, setNiveauEtudes] = useState("");
  const [formule, setFormule] = useState("");
  const [examSession, setExamSession] = useState("");
  const [message, setMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error">("error");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(data: Record<string, string>) {
    setMessage("");

    if (!data.first_name || !data.last_name || !data.email) {
      setMessage("Prénom, nom et email sont obligatoires.");
      setAlertType("error");
      return;
    }

    if (!validateEmail(data.email)) {
      setMessage("Adresse email invalide.");
      setAlertType("error");
      return;
    }

    if (accountType === "student" && (!niveauEtudes || !formule)) {
      setMessage("Merci de choisir le niveau d'études et la formule.");
      setAlertType("error");
      return;
    }

    if (accountType === "examiner" && !examSession) {
      setMessage("Merci de choisir le type de session.");
      setAlertType("error");
      return;
    }

    setLoading(true);

    try {
      const payload: any = {
        account_type: accountType,
        first_name: sanitizeInput(data.first_name),
        last_name: sanitizeInput(data.last_name),
        email: sanitizeInput(data.email).toLowerCase(),
        phone: data.phone ? sanitizeInput(data.phone) : null,
      };

      if (accountType === "student") {
        payload.niveau = niveauEtudes;
        payload.formule = formule;
      }

      if (accountType === "br") {
        payload.role_br = data.role_br;
      }

      if (accountType === "examiner") {
        payload.session_type = examSession;
        payload.niveau = data.niveau_examinateur;
        payload.category = data.category || null;
      }

      if (accountType === "faculty") {
        payload.position = "Faculté";
      }

      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/submit-registration-request`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            apikey: SUPABASE_ANON_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Erreur lors de l'inscription.");
      }

      setMessage("Demande d'inscription envoyée avec succès. Elle sera vérifiée par le BR.");
      setAlertType("success");
    } catch (error: any) {
      setMessage(error.message || "Erreur lors de l'inscription.");
      setAlertType("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fbf1df] p-4">
      <div className="w-full max-w-lg space-y-6 rounded-[28px] bg-white p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#2c2f4a]">
            Demande d'inscription ECOS
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Sélectionnez votre profil puis complétez les informations demandées.
          </p>
        </div>

        {message ? (
          <Alert
            type={alertType}
            message={message}
            onClose={() => setMessage("")}
          />
        ) : null}

        <Form onSubmit={handleSubmit} submitLabel="Envoyer la demande" loading={loading}>
          <label className="block text-sm font-medium text-gray-700">
            Type de compte *
            <select
              value={accountType}
              onChange={(e) => {
                setAccountType(e.target.value as AccountType);
                setNiveauEtudes("");
                setFormule("");
                setExamSession("");
              }}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
              required
            >
              <option value="student">Étudiant</option>
              <option value="examiner">Examinateur</option>
              <option value="br">BR - Bureau Restreint</option>
              <option value="faculty">Faculté</option>
              <option value="admin">Administrateur</option>
            </select>
          </label>

          <FormField name="first_name" label="Prénom" required />
          <FormField name="last_name" label="Nom" required />
          <FormField name="email" label="Email" type="email" required />
          <FormField name="phone" label="Téléphone" placeholder="06 12 34 56 78" />

          {accountType === "student" && (
            <>
              <label className="block text-sm font-medium text-gray-700">
                Niveau d'études *
                <select
                  value={niveauEtudes}
                  onChange={(e) => {
                    const value = e.target.value;
                    setNiveauEtudes(value);

                    if (value === "D2" || value === "D3") {
                      setFormule("ecos_proceduraux");
                    } else {
                      setFormule("");
                    }
                  }}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                  required
                >
                  <option value="">Choisir le niveau</option>
                  <option value="D2">D2</option>
                  <option value="D3">D3</option>
                  <option value="D4">D4</option>
                </select>
              </label>

              <label className="block text-sm font-medium text-gray-700">
                Formule choisie *
                <select
                  value={formule}
                  onChange={(e) => setFormule(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                  required
                >
                  <option value="">Choisir la formule</option>

                  {(niveauEtudes === "D2" || niveauEtudes === "D3") && (
                    <option value="ecos_proceduraux">ECOS procéduraux</option>
                  )}

                  {niveauEtudes === "D4" && (
                    <>
                      <option value="ecos_proceduraux">ECOS procéduraux</option>
                      <option value="projet_esee">Projet ESEE</option>
                    </>
                  )}
                </select>
              </label>
            </>
          )}

          {accountType === "br" && (
            <label className="block text-sm font-medium text-gray-700">
              Rôle au Bureau Restreint *
              <select
                name="role_br"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                required
              >
                <option value="">Choisir le rôle</option>
                <option value="prez">Prez</option>
                <option value="sex">Sex</option>
                <option value="trez">Trez</option>
              </select>
            </label>
          )}

          {accountType === "examiner" && (
            <>
              <label className="block text-sm font-medium text-gray-700">
                Session *
                <select
                  value={examSession}
                  onChange={(e) => setExamSession(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                  required
                >
                  <option value="">Choisir la session</option>
                  <option value="ecos_proceduraux">ECOS procéduraux</option>
                  <option value="projet_esee">Projet ESEE</option>
                </select>
              </label>

              {examSession === "ecos_proceduraux" && (
                <>
                  <label className="block text-sm font-medium text-gray-700">
                    Niveau d'études *
                    <select
                      name="niveau_examinateur"
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                      required
                    >
                      <option value="">Choisir le niveau</option>
                      <option value="D2">D2</option>
                      <option value="D4">D4</option>
                    </select>
                  </label>

                  <label className="block text-sm font-medium text-gray-700">
                    Catégorie *
                    <select
                      name="category"
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                      required
                    >
                      <option value="">Choisir la catégorie</option>
                      <option value="moniteur_niveau_1">Moniteur niveau 1</option>
                      <option value="moniteur_niveau_2">Moniteur niveau 2</option>
                    </select>
                  </label>
                </>
              )}

              {examSession === "projet_esee" && (
                <label className="block text-sm font-medium text-gray-700">
                  Niveau d'études *
                  <select
                    name="niveau_examinateur"
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                    required
                  >
                    <option value="">Choisir le niveau</option>
                    <option value="P2">P2</option>
                    <option value="D1">D1</option>
                    <option value="D2">D2</option>
                  </select>
                </label>
              )}
            </>
          )}

          {accountType === "faculty" && (
            <div className="rounded-xl bg-[#faf7f0] p-4 text-sm text-gray-600">
              Aucun département demandé pour la faculté.
            </div>
          )}

          {accountType === "admin" && (
            <div className="rounded-xl bg-[#faf7f0] p-4 text-sm text-gray-600">
              Compte administrateur.
            </div>
          )}
        </Form>
      </div>
    </main>
  );
}
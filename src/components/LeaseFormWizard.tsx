import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
import { supabase } from '../utils/supabaseClient';

// Types de props (adapter selon usage réel)
interface Property { id: number; titre: string; ville: string; }
interface Tenant { id: number; nom: string; property_id: number; }
interface Lease {
  id?: number;
  property_id: number;
  tenant_id: number;
  loyer: number;
  date_debut: string;
  frequence: string;
  payment_gateway?: string;
  gateway_price_id?: string;
  gateway_customer_id?: string;
  mandate_url?: string;
}

interface LeaseFormWizardProps {
  properties: Property[];
  tenants: Tenant[];
  lease?: Lease | null;
  onClose: () => void;
  onSave: (lease: Lease) => void;
}

const steps = ["Bien", "Locataire", "Détails", "Paiement", "Confirmation"];

export default function LeaseFormWizard({ properties, tenants, lease, onClose, onSave }: LeaseFormWizardProps) {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const { control, handleSubmit, watch, setValue, getValues } = useForm<Lease>({
    defaultValues: lease ?? {
      property_id: properties[0]?.id ?? 1,
      tenant_id: tenants[0]?.id ?? 1,
      loyer: 0,
      date_debut: '',
      frequence: 'Mensuel',
      payment_gateway: '',
      gateway_price_id: '',
      gateway_customer_id: '',
      mandate_url: '',
    }
  });

  // Filtrage dynamique des locataires selon le bien sélectionné
  const selectedPropertyId = watch("property_id");
  const filteredTenants = tenants.filter(t => t.property_id === selectedPropertyId);

  // Gestion du mode de paiement
  const paymentGateway = watch("payment_gateway");

  // Correction : compatibilité supabase-js v2 et React Query v5
  const queryClient = useQueryClient();
  const {
    mutateAsync,
    isLoading,
    isError,
    error,
  } = useMutation({
    mutationFn: async (newLease: Lease) => {
      // Délai minimal pour testabilité (optionnel, peut être réduit)
      await new Promise((resolve) => setTimeout(resolve, 50));
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) throw new Error('Utilisateur non authentifié');
      const { error } = await supabase.from('leases').upsert({
        ...newLease,
        owner_id: userData.user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leases'] });
      onClose();
    },
    onError: (err: Error) => {
      // Optionnel : log ou traitement d’erreur global
    },
  });

  // Handler de soumission : utilise mutateAsync(...).catch(...) pour éviter tout unhandled rejection
  const onFinalSubmit = (data: Lease) => {
    setSubmitting(true);
    mutateAsync(data)
      .catch(() => {
        // L’erreur est gérée par isError & error, aucune propagation
        // Ceci évite tout unhandled rejection dans les tests ou en prod
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  // Loading combiné : feedback instantané (submitting) + suivi mutation (isLoading)
  const loading = submitting || isLoading;
  const errorState = isError;

  const onNext = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const onBack = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow w-full max-w-lg">
        <div className="mb-4 text-xl font-bold">{lease ? "Modifier" : "Ajouter"} un contrat</div>
        <div className="mb-4 flex gap-2 text-sm">
          {steps.map((s, i) => (
            <span key={s} className={i === step ? "font-bold underline" : "text-gray-400"}>{s}</span>
          ))}
        </div>
        {/* Affichage unique du message d'erreur mutation : un seul bloc, pas de doublon */}
        {errorState && (
          <div className="mb-2 text-red-600">
            Erreur lors de l'enregistrement : {error?.message}
          </div>
        )}
        <form onSubmit={handleSubmit(onFinalSubmit)}>
          {step === 0 && (
            <div className="mb-4">
              <label className="block mb-1">Bien</label>
              <Controller
                name="property_id"
                control={control}
                render={({ field }) => (
                  <select {...field} className="border rounded px-2 py-1 w-full">
                    <option value="">Sélectionner un bien</option>
                    {properties.map((p) => (
                      <option key={p.id} value={p.id}>{p.titre} ({p.ville})</option>
                    ))}
                  </select>
                )}
              />
            </div>
          )}
          {step === 1 && (
            <div className="mb-4">
              <label className="block mb-1">Locataire</label>
              <Controller
                name="tenant_id"
                control={control}
                render={({ field }) => (
                  <select {...field} className="border p-1 rounded w-full">
                    {filteredTenants.length === 0 ? <option>Aucun locataire</option> :
                      filteredTenants.map((t) => (
                        <option key={t.id} value={t.id}>{t.nom}</option>
                      ))}
                  </select>
                )}
              />
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block mb-1">Montant du loyer (€)</label>
                <Controller
                  name="loyer"
                  control={control}
                  render={({ field }) => (
                    <input type="number" min={0} {...field} className="border p-1 rounded w-full" required />
                  )}
                />
              </div>
              <div>
                <label className="block mb-1">Date de début</label>
                <Controller
                  name="date_debut"
                  control={control}
                  render={({ field }) => (
                    <input type="date" {...field} className="border p-1 rounded w-full" required />
                  )}
                />
              </div>
              <div>
                <label className="block mb-1">Fréquence</label>
                <input value="Mensuel" disabled className="border p-1 rounded w-full bg-gray-100" />
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block mb-1">Mode de paiement</label>
                <Controller
                  name="payment_gateway"
                  control={control}
                  render={({ field }) => (
                    <div className="flex gap-4">
                      <label><input type="radio" value="Stripe" checked={field.value === "Stripe"} onChange={field.onChange} /> Stripe</label>
                      <label><input type="radio" value="GoCardless" checked={field.value === "GoCardless"} onChange={field.onChange} /> GoCardless</label>
                    </div>
                  )}
                />
              </div>
              {paymentGateway === "Stripe" && (
                <>
                  <div>
                    <label className="block mb-1">Publishable Key</label>
                    <Controller
                      name="gateway_price_id"
                      control={control}
                      render={({ field }) => (
                        <input {...field} className="border p-1 rounded w-full" placeholder="Price ID Stripe" />
                      )}
                    />
                  </div>
                </>
              )}
              {paymentGateway === "GoCardless" && (
                <>
                  <div>
                    <label className="block mb-1">Access Token</label>
                    <Controller
                      name="gateway_customer_id"
                      control={control}
                      render={({ field }) => (
                        <input {...field} className="border p-1 rounded w-full" placeholder="Access Token GoCardless" />
                      )}
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Mandate URL</label>
                    <Controller
                      name="mandate_url"
                      control={control}
                      render={({ field }) => (
                        <input {...field} className="border p-1 rounded w-full" placeholder="Mandate URL GoCardless" />
                      )}
                    />
                  </div>
                </>
              )}
            </div>
          )}
          {step === 4 && (
            <div className="space-y-2">
              <div><b>Bien :</b> {properties.find(p => p.id === getValues("property_id"))?.titre}</div>
              <div><b>Locataire :</b> {tenants.find(t => t.id === getValues("tenant_id"))?.nom}</div>
              <div><b>Loyer :</b> {getValues("loyer")} €</div>
              <div><b>Date de début :</b> {getValues("date_debut")}</div>
              <div><b>Fréquence :</b> Mensuel</div>
              <div><b>Mode de paiement :</b> {getValues("payment_gateway")}</div>
              {getValues("payment_gateway") === "Stripe" && (
                <div><b>Price ID Stripe :</b> {getValues("gateway_price_id")}</div>
              )}
              {getValues("payment_gateway") === "GoCardless" && (
                <>
                  <div><b>Access Token :</b> {getValues("gateway_customer_id")}</div>
                  <div><b>Mandate URL :</b> {getValues("mandate_url")}</div>
                </>
              )}
            </div>
          )}
          <div className="flex justify-between mt-6 gap-2">
            <button type="button" onClick={onClose} className="bg-gray-400 text-white px-3 py-1 rounded">Annuler</button>
            {step > 0 && step < 4 && (
              <button type="button" onClick={onBack} className="bg-gray-200 px-3 py-1 rounded">Précédent</button>
            )}
            {step < 4 && (
              <button type="button" onClick={onNext} className="bg-blue-600 text-white px-3 py-1 rounded">Suivant</button>
            )}
            {step === 4 && (
              // loading = submitting || isLoading : feedback instantané pour test et UX
              <button
                type="submit"
                disabled={loading}
                className={
                  loading
                    ? 'bg-gray-400 text-white px-4 py-2 rounded'
                    : 'bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700'
                }
              >
                {loading ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

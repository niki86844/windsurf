import React, { useState } from "react";
import LeaseFormWizard from "../components/LeaseFormWizard";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../utils/supabaseClient';

// Types
interface Property { id: number; titre: string; ville: string; }
interface Tenant { id: number; nom: string; property_id: number; }
interface Lease {
  id: number;
  property_id: number;
  tenant_id: number;
  loyer: number;
  date_debut: string;
  frequence: string;
  payment_gateway?: string;
  gateway_customer_id?: string;
  gateway_price_id?: string;
  mandate_url?: string;
  properties?: Property;
  tenants?: Tenant;
}

// Fetch leases + relations
const fetchLeases = async () => {
  const { data, error } = await supabase
    .from('leases')
    .select('*, properties(*), tenants(*)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Lease[];
};

export default function ParametrageLoyers() {
  const [openWizard, setOpenWizard] = useState(false);
  const [editLease, setEditLease] = useState<Lease | null>(null);
  const { data: leases = [], isLoading, isError, refetch } = useQuery(['leases'], fetchLeases);

  // Extraire propriétés et locataires uniques
  const properties = Array.from(
    new Map(leases.map(l => l.properties && [l.properties.id, l.properties])).values()
  ).filter(Boolean) as Property[];
  const tenants = Array.from(
    new Map(leases.map(l => l.tenants && [l.tenants.id, l.tenants])).values()
  ).filter(Boolean) as Tenant[];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Paramétrage des Loyers</h1>
      <div className="mb-4 flex justify-end">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-md font-semibold"
          onClick={() => { setEditLease(null); setOpenWizard(true); }}
        >
          + Ajouter un contrat
        </button>
      </div>
      {isLoading && <div>Chargement...</div>}
      {isError && <div className="text-red-600">Erreur lors du chargement des contrats.</div>}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow rounded">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2">Bien</th>
              <th className="p-2">Locataire</th>
              <th className="p-2">Montant</th>
              <th className="p-2">Date de début</th>
              <th className="p-2">Fréquence</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leases.map((lease) => (
              <tr key={lease.id}>
                <td className="p-2">{lease.properties?.titre}</td>
                <td className="p-2">{lease.tenants?.nom}</td>
                <td className="p-2">{lease.loyer} €</td>
                <td className="p-2">{lease.date_debut}</td>
                <td className="p-2">{lease.frequence}</td>
                <td className="p-2">
                  <button className="text-blue-600" onClick={() => { setEditLease(lease); setOpenWizard(true); }}>Modifier</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {openWizard && (
        <LeaseFormWizard
          properties={properties}
          tenants={tenants}
          lease={editLease}
          onClose={() => setOpenWizard(false)}
          onSave={() => { setOpenWizard(false); refetch(); }}
        />
      )}
    </div>
  );
}

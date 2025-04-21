import React, { useState } from 'react';
import ReajustementLetterEditor from "./components/ReajustementLetterEditor";
import LetterTemplatesPage from "./components/LetterTemplatesPage";
import TestPage from "./components/TestPage";

// Types
export type Bien = {
  id: number;
  titre: string;
  ville: string;
};
export type Locataire = {
  id: number;
  nom: string;
};
export type Contrat = {
  id: number;
  bienId: number;
  locataireId: number;
  montant: number;
  dateDebut: string;
  frequence: 'mensuel';
  modePaiement: string;
  stripeApiKey?: string;
  gocardlessApiKey?: string;
};

// Exemples de biens et locataires
const biensExemple: Bien[] = [
  { id: 1, titre: 'Appartement T2 centre-ville', ville: 'Paris' },
  { id: 2, titre: 'Maison avec jardin', ville: 'Lyon' },
];
const locatairesExemple: Locataire[] = [
  { id: 1, nom: 'Alice Dupont' },
  { id: 2, nom: 'Bob Martin' },
];

// Composant principal avec navigation simple
export default function App() {
  const [page, setPage] = useState<'biens'|'loyers'|'reajustement'|'templates'|'test'>('loyers');
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <nav className="mb-8 flex gap-4">
        <button onClick={() => setPage('biens')} className={page==='biens' ? 'font-bold underline' : ''}>Biens</button>
        <button onClick={() => setPage('loyers')} className={page==='loyers' ? 'font-bold underline' : ''}>Paramétrage des Loyers</button>
        <button onClick={() => setPage('reajustement')} className={page==='reajustement' ? 'font-bold underline' : ''}>Réajustement des Loyers</button>
        <button onClick={() => setPage('templates')} className={page==='templates' ? 'font-bold underline' : ''}>Modèles de lettre</button>
        <button onClick={() => setPage('test')} className={page==='test' ? 'font-bold underline' : ''}>TestPage</button>
      </nav>
      <div style={{ background: 'yellow', color: 'black', padding: '0.5rem' }}>
        DEBUG: NAVIGATION ACTIVE – page = {page}
      </div>
      {page === 'loyers' ? (
        <Loyers biens={biensExemple} locataires={locatairesExemple} />
      ) : page === 'biens' ? (
        <Biens />
      ) : page === 'reajustement' ? (
        <ReajustementLetterEditor />
      ) : page === 'templates' ? (
        <LetterTemplatesPage />
      ) : page === 'test' ? (
        <TestPage />
      ) : null}
    </div>
  );
}

// Page Biens (placeholder)
function Biens() {
  return <div>Gestion des biens (à compléter)</div>;
}

// Page Loyers (liste + bouton ajout)
function Loyers({ biens, locataires }: { biens: Bien[]; locataires: Locataire[] }) {
  const [contrats, setContrats] = useState<Contrat[]>([]);
  const [showWizard, setShowWizard] = useState(false);
  const [editContrat, setEditContrat] = useState<Contrat|null>(null);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Paramétrage des Loyers</h1>
        <button onClick={() => { setEditContrat(null); setShowWizard(true); }} className="bg-blue-600 text-white px-3 py-1 rounded">+ Ajouter un contrat</button>
      </div>
      <table className="w-full bg-white shadow rounded mb-8">
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
          {contrats.length === 0 ? (
            <tr><td colSpan={6} className="text-center p-4 text-gray-400">Aucun contrat</td></tr>
          ) : contrats.map((contrat) => (
            <tr key={contrat.id}>
              <td className="p-2">{biens.find(b=>b.id===contrat.bienId)?.titre}</td>
              <td className="p-2">{locataires.find(l=>l.id===contrat.locataireId)?.nom}</td>
              <td className="p-2">{contrat.montant} €</td>
              <td className="p-2">{contrat.dateDebut}</td>
              <td className="p-2">{contrat.frequence}</td>
              <td className="p-2">
                <button onClick={() => { setEditContrat(contrat); setShowWizard(true); }} className="text-blue-600">Modifier</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showWizard && (
        <WizardContrat
          biens={biens}
          locataires={locataires}
          contrat={editContrat}
          onClose={() => setShowWizard(false)}
          onSave={(contrat) => {
            setContrats((prev) => {
              if (contrat.id) {
                // update
                return prev.map(c => c.id === contrat.id ? contrat : c);
              } else {
                // create
                return [...prev, { ...contrat, id: prev.length ? Math.max(...prev.map(c=>c.id))+1 : 1 }];
              }
            });
            setShowWizard(false);
          }}
        />
      )}
    </div>
  );
}

// Wizard/Formulaire d'ajout/modif contrat (étape suivante)
function WizardContrat({ biens, locataires, contrat, onClose, onSave }: {
  biens: Bien[];
  locataires: Locataire[];
  contrat: Contrat|null;
  onClose: () => void;
  onSave: (contrat: Contrat) => void;
}) {
  const [form, setForm] = useState<Contrat>(
    contrat ?? {
      id: 0,
      bienId: biens[0]?.id ?? 1,
      locataireId: locataires[0]?.id ?? 1,
      montant: 0,
      dateDebut: '',
      frequence: 'mensuel',
      modePaiement: '',
      stripeApiKey: '',
      gocardlessApiKey: '',
    }
  );
  const isEdit = !!contrat;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === 'montant' ? Number(value) : value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(isEdit ? form : { ...form, id: 0 });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow w-full max-w-lg">
        <div className="mb-4 text-xl font-bold">{isEdit ? 'Modifier' : 'Ajouter'} un contrat</div>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm">Bien</label>
            <select name="bienId" value={form.bienId} onChange={handleChange} className="border p-1 rounded w-full">
              {biens.map((b) => (
                <option key={b.id} value={b.id}>{b.titre} ({b.ville})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm">Locataire</label>
            <select name="locataireId" value={form.locataireId} onChange={handleChange} className="border p-1 rounded w-full">
              {locataires.map((l) => (
                <option key={l.id} value={l.id}>{l.nom}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm">Montant du loyer (€)</label>
            <input name="montant" type="number" value={form.montant} onChange={handleChange} className="border p-1 rounded w-full" required />
          </div>
          <div>
            <label className="block text-sm">Date de début</label>
            <input name="dateDebut" type="date" value={form.dateDebut} onChange={handleChange} className="border p-1 rounded w-full" required />
          </div>
          <div>
            <label className="block text-sm">Fréquence</label>
            <select name="frequence" value={form.frequence} onChange={handleChange} className="border p-1 rounded w-full">
              <option value="mensuel">Mensuel</option>
            </select>
          </div>
          <div>
            <label className="block text-sm">Mode de paiement</label>
            <input name="modePaiement" value={form.modePaiement} onChange={handleChange} className="border p-1 rounded w-full" placeholder="ex: Virement, Stripe, GoCardless" required />
          </div>
          <div className="border-t pt-4 mt-4">
            <div className="font-semibold mb-2">Intégration API Stripe / GoCardless</div>
            <div className="mb-2">
              <label className="block text-sm">Clé API Stripe</label>
              <input name="stripeApiKey" value={form.stripeApiKey ?? ''} onChange={handleChange} className="border p-1 rounded w-full" placeholder="Clé API Stripe" />
            </div>
            <div>
              <label className="block text-sm">Clé API GoCardless</label>
              <input name="gocardlessApiKey" value={form.gocardlessApiKey ?? ''} onChange={handleChange} className="border p-1 rounded w-full" placeholder="Clé API GoCardless" />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button type="button" onClick={onClose} className="bg-gray-400 text-white px-3 py-1 rounded">Annuler</button>
            <button type="submit" className="bg-green-600 text-white px-3 py-1 rounded">Enregistrer</button>
          </div>
        </form>
      </div>
    </div>
  );
}


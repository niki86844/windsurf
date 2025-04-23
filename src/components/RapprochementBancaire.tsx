import React, { useState } from 'react';
import Papa from 'papaparse';

interface Operation {
  date: string;
  label: string;
  amount: number;
}

interface RapprochementResult {
  matched: Operation[];
  unmatchedBank: Operation[];
  unmatchedAccounting: Operation[];
}

function parseCSV(file: File): Promise<Operation[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data: Operation[] = (results.data as any[]).map(row => ({
          date: row.date,
          label: row.label,
          amount: parseFloat((row.amount || '').replace(',', '.')),
        }));
        resolve(data);
      },
      error: reject,
    });
  });
}

function reconcile(bankOps: Operation[], accountingOps: Operation[]): RapprochementResult {
  const matched: Operation[] = [];
  const unmatchedBank: Operation[] = [];
  const unmatchedAccounting: Operation[] = [...accountingOps];

  bankOps.forEach((bankOp) => {
    const idx = unmatchedAccounting.findIndex(
      (accOp) =>
        accOp.amount === bankOp.amount &&
        accOp.date === bankOp.date
    );
    if (idx !== -1) {
      matched.push(bankOp);
      unmatchedAccounting.splice(idx, 1);
    } else {
      unmatchedBank.push(bankOp);
    }
  });

  return { matched, unmatchedBank, unmatchedAccounting };
}

const RapprochementBancaire: React.FC = () => {
  const [bankFile, setBankFile] = useState<File | null>(null);
  const [comptaFile, setComptaFile] = useState<File | null>(null);
  const [result, setResult] = useState<RapprochementResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    if (!bankFile || !comptaFile) {
      setError('Merci de sélectionner les deux fichiers CSV.');
      return;
    }
    try {
      const [bankOps, comptaOps] = await Promise.all([
        parseCSV(bankFile),
        parseCSV(comptaFile),
      ]);
      setResult(reconcile(bankOps, comptaOps));
    } catch (err) {
      setError('Erreur lors du traitement des fichiers.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Rapprochement bancaire</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-semibold">Fichier banque (CSV)</label>
          <input type="file" accept=".csv" onChange={e => setBankFile(e.target.files?.[0] || null)} />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Fichier compta (CSV)</label>
          <input type="file" accept=".csv" onChange={e => setComptaFile(e.target.files?.[0] || null)} />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Lancer le rapprochement</button>
      </form>
      {error && <div className="mt-4 text-red-600">{error}</div>}
      {result && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-2">Résultats</h3>
          <div className="mb-4">
            <strong>Opérations rapprochées :</strong> {result.matched.length}
          </div>
          <div className="mb-4">
            <strong>Non rapprochées en banque :</strong>
            <ul className="list-disc ml-6">
              {result.unmatchedBank.map((op, i) => (
                <li key={i}>{op.date} | {op.label} | {op.amount}</li>
              ))}
            </ul>
          </div>
          <div>
            <strong>Non rapprochées en compta :</strong>
            <ul className="list-disc ml-6">
              {result.unmatchedAccounting.map((op, i) => (
                <li key={i}>{op.date} | {op.label} | {op.amount}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default RapprochementBancaire;

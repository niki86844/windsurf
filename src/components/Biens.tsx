import React, { useState } from 'react';
import type { Bien } from '../App';

export default function Biens() {
  // État local pour la liste des biens
  const [biens, setBiens] = useState<Bien[]>([]);
  const [showForm, setShowForm] = useState(false);

  // Ajout d’un bien avec incrément automatique de l’ID
  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const titre = (form.elements.namedItem('titre') as HTMLInputElement).value;
    const ville = (form.elements.namedItem('ville') as HTMLInputElement).value;
    const newId = biens.length ? Math.max(...biens.map(b => b.id)) + 1 : 1;
    setBiens([...biens, { id: newId, titre, ville }]);
    setShowForm(false);
    form.reset();
  };

  // Rendu fallback si aucun bien
  if (biens.length === 0) {
    return (
      <div className="max-w-xl mx-auto bg-white p-6 rounded shadow">
        <h2 className="text-lg font-bold text-blue-700 mb-4">Gestion des biens</h2>
        <div className="text-gray-400 p-4">Aucun bien enregistré</div>
        <button className="bg-blue-700 text-white px-3 py-1 rounded mt-4" onClick={() => setShowForm(true)}>+ Ajouter un bien</button>
        {showForm && (
          <form onSubmit={handleAdd} className="mt-4 flex gap-2 items-end">
            <input name="titre" placeholder="Titre" required className="border p-1 rounded" />
            <input name="ville" placeholder="Ville" required className="border p-1 rounded" />
            <button type="submit" className="bg-green-700 text-white px-3 py-1 rounded">Enregistrer</button>
          </form>
        )}
      </div>
    );
  }

  // Rendu liste des biens
  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-lg font-bold text-blue-700 mb-4">Gestion des biens</h2>
      <button className="bg-blue-700 text-white px-3 py-1 rounded mb-4" onClick={() => setShowForm(true)}>+ Ajouter un bien</button>
      {showForm && (
        <form onSubmit={handleAdd} className="mb-4 flex gap-2 items-end">
          <input name="titre" placeholder="Titre" required className="border p-1 rounded" />
          <input name="ville" placeholder="Ville" required className="border p-1 rounded" />
          <button type="submit" className="bg-green-700 text-white px-3 py-1 rounded">Enregistrer</button>
        </form>
      )}
      <ul className="divide-y">
        {biens.map(b => (
          <li key={b.id} className="py-2 flex gap-4 items-center">
            <span className="font-mono text-gray-500">#{b.id}</span>
            <span className="font-semibold">{b.titre}</span>
            <span className="text-gray-600">({b.ville})</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

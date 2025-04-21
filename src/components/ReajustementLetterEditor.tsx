import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

// 1. Prototype IRL – Champs date début, date +1 an, appel mock API IRL, affichage des indices
// 2. Formule de réajustement – calcul automatique du nouveau loyer
// 3. Editeur de lettre personnalisée (template dynamique)

const DEFAULT_TEMPLATE = `
<p>Objet : Révision annuelle du loyer</p>
<p>Madame, Monsieur {{nom}},</p>
<p>Conformément à la clause de révision annuelle prévue au contrat de location pour le bien situé au {{adresse_bien}}, nous vous informons que le loyer sera réajusté à compter du {{date_plus_un_an}}.</p>
<p>Loyer initial : <b>{{loyer_initial}} €</b><br />
IRL à la date de début du bail ({{date_debut}}) : <b>{{irl_t}}</b><br />
IRL à la date anniversaire ({{date_plus_un_an}}) : <b>{{irl_t1}}</b><br />
Nouveau loyer : <b>{{loyer_nouveau}} €</b></p>
<p>Nous restons à votre disposition pour toute question.</p>
<p>Cordialement,<br />La Gestion Immobilière</p>
`;

// Appel mock API IRL (à remplacer par un vrai fetch plus tard)
async function fetchIRL(date: string): Promise<number> {
  // Simule un index variant selon l'année/mois
  const base = 130;
  const d = new Date(date);
  return Promise.resolve(base + (d.getFullYear() - 2023) * 2 + d.getMonth() * 0.2);
}

export default function ReajustementLetterEditor() {
  const [dateDebut, setDateDebut] = useState("");
  const [datePlusUnAn, setDatePlusUnAn] = useState("");
  const [irlT, setIrlT] = useState<number|null>(null);
  const [irlT1, setIrlT1] = useState<number|null>(null);
  const [loyerInitial, setLoyerInitial] = useState("");
  const [loyerNouveau, setLoyerNouveau] = useState<string>("");
  const [nom, setNom] = useState("");
  const [adresseBien, setAdresseBien] = useState("");
  const [template, setTemplate] = useState(DEFAULT_TEMPLATE);
  const [loadingIRL, setLoadingIRL] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string|null>(null);

  // Calcule date +1 an automatiquement
  const handleDateDebutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDateDebut(value);
    if (value.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const d = new Date(value);
      d.setFullYear(d.getFullYear() + 1);
      setDatePlusUnAn(d.toISOString().slice(0, 10));
    }
  };

  // Appel mock pour récupérer les deux IRL
  const handleFetchIRL = async () => {
    setLoadingIRL(true);
    setErrorMsg(null);
    try {
      const [v1, v2] = await Promise.all([
        fetchIRL(dateDebut),
        fetchIRL(datePlusUnAn)
      ]);
      setIrlT(Number(v1.toFixed(2)));
      setIrlT1(Number(v2.toFixed(2)));
    } catch (err: any) {
      setErrorMsg("Erreur lors de la récupération des indices IRL");
    } finally {
      setLoadingIRL(false);
    }
  };

  // Calcule le nouveau loyer
  const handleCalculerLoyer = () => {
    if (!loyerInitial || !irlT || !irlT1) return;
    const nouveau = (parseFloat(loyerInitial) * (irlT1 / irlT));
    setLoyerNouveau(nouveau.toFixed(2));
  };

  // Remplacement dynamique des placeholders dans le template
  const getLetterHtml = () => {
    return template
      .replace(/{{nom}}/g, nom)
      .replace(/{{adresse_bien}}/g, adresseBien)
      .replace(/{{date_debut}}/g, dateDebut)
      .replace(/{{date_plus_un_an}}/g, datePlusUnAn)
      .replace(/{{irl_t}}/g, irlT ? irlT.toString() : "")
      .replace(/{{irl_t1}}/g, irlT1 ? irlT1.toString() : "")
      .replace(/{{loyer_initial}}/g, loyerInitial)
      .replace(/{{loyer_nouveau}}/g, loyerNouveau);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold text-blue-700 mb-4">Réajustement automatique du loyer</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="font-semibold">Nom du locataire</label>
          <input className="border rounded px-2 py-1 w-full" value={nom} onChange={e => setNom(e.target.value)} />
        </div>
        <div>
          <label className="font-semibold">Adresse du bien</label>
          <input className="border rounded px-2 py-1 w-full" value={adresseBien} onChange={e => setAdresseBien(e.target.value)} />
        </div>
        <div>
          <label className="font-semibold">Date de début de bail</label>
          <input type="date" className="border rounded px-2 py-1 w-full" value={dateDebut} onChange={handleDateDebutChange} />
        </div>
        <div>
          <label className="font-semibold">Date anniversaire (+1 an)</label>
          <input type="date" className="border rounded px-2 py-1 w-full" value={datePlusUnAn} onChange={e => setDatePlusUnAn(e.target.value)} />
        </div>
        <div>
          <label className="font-semibold">Loyer initial (€)</label>
          <input type="number" className="border rounded px-2 py-1 w-full" value={loyerInitial} onChange={e => setLoyerInitial(e.target.value)} />
        </div>
      </div>
      <div className="flex gap-2 mb-4">
        <button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={handleFetchIRL} disabled={loadingIRL || !dateDebut || !datePlusUnAn}>Calculer l’IRL</button>
        <button className="bg-blue-700 text-white px-3 py-1 rounded" onClick={handleCalculerLoyer} disabled={!irlT || !irlT1 || !loyerInitial}>Générer le loyer réajusté</button>
      </div>
      <div className="mb-4">
        {loadingIRL && <span className="text-blue-700">Chargement IRL…</span>}
        {irlT && irlT1 && <span className="text-green-700">IRL à t = <b>{irlT}</b> | IRL à t+1 = <b>{irlT1}</b></span>}
        {errorMsg && <span className="text-red-700 font-semibold">{errorMsg}</span>}
      </div>
      <div className="mb-4">
        <label className="font-semibold">Éditeur de lettre personnalisée</label>
        <ReactQuill theme="snow" value={template} onChange={setTemplate} className="mb-2 bg-white" />
      </div>
      <div className="mb-4">
        <button className="bg-blue-800 text-white px-4 py-2 rounded">Prévisualiser la lettre</button>
      </div>
      <div className="border-2 border-blue-400 rounded bg-white p-6 mb-4">
        <div dangerouslySetInnerHTML={{ __html: getLetterHtml() }} />
      </div>
      {/* PDF et upload à venir */}
    </div>
  );
}

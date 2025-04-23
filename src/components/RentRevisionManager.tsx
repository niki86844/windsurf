import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export type RentRevision = {
  id: string;
  property_id: string;
  old_rent: number;
  new_rent: number;
  revision_date: string;
  created_at: string;
};

export default function RentRevisionManager() {
  const [revisions, setRevisions] = useState<RentRevision[]>([]);
  const [form, setForm] = useState<Partial<RentRevision>>({});
  const [editingId, setEditingId] = useState<string|null>(null);
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState<{id:string,title:string}[]>([]);

  useEffect(() => {
    fetchRevisions();
    fetchProperties();
    const channel = supabase
      .channel('public:rent_revisions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rent_revisions' }, fetchRevisions)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  async function fetchProperties() {
    const { data } = await supabase.from('properties').select('id, title');
    setProperties(data || []);
  }

  async function fetchRevisions() {
    const { data } = await supabase.from('rent_revisions').select('*').order('created_at', { ascending: false });
    setRevisions(data || []);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    if (editingId) {
      await supabase.from('rent_revisions').update({
        property_id: form.property_id,
        old_rent: form.old_rent,
        new_rent: form.new_rent,
        revision_date: form.revision_date
      }).eq('id', editingId);
    } else {
      await supabase.from('rent_revisions').insert({
        property_id: form.property_id,
        old_rent: form.old_rent,
        new_rent: form.new_rent,
        revision_date: form.revision_date
      });
    }
    setForm({});
    setEditingId(null);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (window.confirm('Supprimer cette révision ?')) {
      await supabase.from('rent_revisions').delete().eq('id', id);
    }
  }

  function startEdit(rev: RentRevision) {
    setForm(rev);
    setEditingId(rev.id);
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Révisions de loyers</h2>
      <form onSubmit={handleSubmit} className="mb-4 flex flex-col gap-2 max-w-md">
        <select className="border p-1 rounded" value={form.property_id||''} onChange={e=>setForm(f=>({...f,property_id:e.target.value}))} required>
          <option value="">Sélectionner un bien</option>
          {properties.map(p=>(<option key={p.id} value={p.id}>{p.title}</option>))}
        </select>
        <input className="border p-1 rounded" type="number" placeholder="Ancien loyer (€)" value={form.old_rent||''} onChange={e=>setForm(f=>({...f,old_rent:Number(e.target.value)}))} required />
        <input className="border p-1 rounded" type="number" placeholder="Nouveau loyer (€)" value={form.new_rent||''} onChange={e=>setForm(f=>({...f,new_rent:Number(e.target.value)}))} required />
        <input className="border p-1 rounded" type="date" placeholder="Date de révision" value={form.revision_date||''} onChange={e=>setForm(f=>({...f,revision_date:e.target.value}))} required />
        <div className="flex gap-2">
          <button type="submit" className="bg-green-600 text-white px-3 py-1 rounded" disabled={loading}>{editingId ? 'Modifier' : 'Ajouter'}</button>
          {editingId && <button type="button" className="bg-gray-400 text-white px-3 py-1 rounded" onClick={()=>{setForm({});setEditingId(null);}}>Annuler</button>}
        </div>
      </form>
      <table className="w-full bg-white shadow rounded">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">Bien</th>
            <th className="p-2">Ancien loyer</th>
            <th className="p-2">Nouveau loyer</th>
            <th className="p-2">Date de révision</th>
            <th className="p-2">Créé le</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {revisions.length === 0 ? <tr><td colSpan={6} className="text-center p-4 text-gray-400">Aucune révision</td></tr> : revisions.map(r=>(
            <tr key={r.id}>
              <td className="p-2">{properties.find(p=>p.id===r.property_id)?.title||'-'}</td>
              <td className="p-2">{r.old_rent} €</td>
              <td className="p-2">{r.new_rent} €</td>
              <td className="p-2">{r.revision_date}</td>
              <td className="p-2">{new Date(r.created_at).toLocaleString()}</td>
              <td className="p-2">
                <button className="text-blue-600 mr-2" onClick={()=>startEdit(r)}>Modifier</button>
                <button className="text-red-600" onClick={()=>handleDelete(r.id)}>Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

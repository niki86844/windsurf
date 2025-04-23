import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export type Property = {
  id: string;
  title: string;
  city: string;
  address: string;
  created_at: string;
};

export default function PropertyManager() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [form, setForm] = useState<Partial<Property>>({});
  const [editingId, setEditingId] = useState<string|null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch and subscribe
  useEffect(() => {
    fetchProperties();
    const channel = supabase
      .channel('public:properties')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'properties' }, fetchProperties)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  async function fetchProperties() {
    const { data } = await supabase.from('properties').select('*').order('created_at', { ascending: false });
    setProperties(data || []);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    if (editingId) {
      await supabase.from('properties').update({
        title: form.title,
        city: form.city,
        address: form.address
      }).eq('id', editingId);
    } else {
      await supabase.from('properties').insert({
        title: form.title,
        city: form.city,
        address: form.address
      });
    }
    setForm({});
    setEditingId(null);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (window.confirm('Supprimer ce bien ?')) {
      await supabase.from('properties').delete().eq('id', id);
    }
  }

  function startEdit(property: Property) {
    setForm(property);
    setEditingId(property.id);
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Biens immobiliers</h2>
      <form onSubmit={handleSubmit} className="mb-4 flex flex-col gap-2 max-w-md">
        <input className="border p-1 rounded" placeholder="Titre" value={form.title||''} onChange={e=>setForm(f=>({...f,title:e.target.value}))} required />
        <input className="border p-1 rounded" placeholder="Ville" value={form.city||''} onChange={e=>setForm(f=>({...f,city:e.target.value}))} required />
        <input className="border p-1 rounded" placeholder="Adresse" value={form.address||''} onChange={e=>setForm(f=>({...f,address:e.target.value}))} required />
        <div className="flex gap-2">
          <button type="submit" className="bg-green-600 text-white px-3 py-1 rounded" disabled={loading}>{editingId ? 'Modifier' : 'Ajouter'}</button>
          {editingId && <button type="button" className="bg-gray-400 text-white px-3 py-1 rounded" onClick={()=>{setForm({});setEditingId(null);}}>Annuler</button>}
        </div>
      </form>
      <table className="w-full bg-white shadow rounded">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">Titre</th>
            <th className="p-2">Ville</th>
            <th className="p-2">Adresse</th>
            <th className="p-2">Créé le</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {properties.length === 0 ? <tr><td colSpan={5} className="text-center p-4 text-gray-400">Aucun bien</td></tr> : properties.map(p=>(
            <tr key={p.id}>
              <td className="p-2">{p.title}</td>
              <td className="p-2">{p.city}</td>
              <td className="p-2">{p.address}</td>
              <td className="p-2">{new Date(p.created_at).toLocaleString()}</td>
              <td className="p-2">
                <button className="text-blue-600 mr-2" onClick={()=>startEdit(p)}>Modifier</button>
                <button className="text-red-600" onClick={()=>handleDelete(p.id)}>Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

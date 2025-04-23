import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export type Tenant = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  created_at: string;
};

export default function TenantManager() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [form, setForm] = useState<Partial<Tenant>>({});
  const [editingId, setEditingId] = useState<string|null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTenants();
    const channel = supabase
      .channel('public:tenants')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tenants' }, fetchTenants)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  async function fetchTenants() {
    const { data } = await supabase.from('tenants').select('*').order('created_at', { ascending: false });
    setTenants(data || []);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    if (editingId) {
      await supabase.from('tenants').update({
        name: form.name,
        email: form.email,
        phone: form.phone
      }).eq('id', editingId);
    } else {
      await supabase.from('tenants').insert({
        name: form.name,
        email: form.email,
        phone: form.phone
      });
    }
    setForm({});
    setEditingId(null);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (window.confirm('Supprimer ce locataire ?')) {
      await supabase.from('tenants').delete().eq('id', id);
    }
  }

  function startEdit(tenant: Tenant) {
    setForm(tenant);
    setEditingId(tenant.id);
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Locataires</h2>
      <form onSubmit={handleSubmit} className="mb-4 flex flex-col gap-2 max-w-md">
        <input className="border p-1 rounded" placeholder="Nom" value={form.name||''} onChange={e=>setForm(f=>({...f,name:e.target.value}))} required />
        <input className="border p-1 rounded" placeholder="Email (optionnel)" value={form.email||''} onChange={e=>setForm(f=>({...f,email:e.target.value}))} />
        <input className="border p-1 rounded" placeholder="Téléphone (optionnel)" value={form.phone||''} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} />
        <div className="flex gap-2">
          <button type="submit" className="bg-green-600 text-white px-3 py-1 rounded" disabled={loading}>{editingId ? 'Modifier' : 'Ajouter'}</button>
          {editingId && <button type="button" className="bg-gray-400 text-white px-3 py-1 rounded" onClick={()=>{setForm({});setEditingId(null);}}>Annuler</button>}
        </div>
      </form>
      <table className="w-full bg-white shadow rounded">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">Nom</th>
            <th className="p-2">Email</th>
            <th className="p-2">Téléphone</th>
            <th className="p-2">Créé le</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tenants.length === 0 ? <tr><td colSpan={5} className="text-center p-4 text-gray-400">Aucun locataire</td></tr> : tenants.map(t=>(
            <tr key={t.id}>
              <td className="p-2">{t.name}</td>
              <td className="p-2">{t.email||'-'}</td>
              <td className="p-2">{t.phone||'-'}</td>
              <td className="p-2">{new Date(t.created_at).toLocaleString()}</td>
              <td className="p-2">
                <button className="text-blue-600 mr-2" onClick={()=>startEdit(t)}>Modifier</button>
                <button className="text-red-600" onClick={()=>handleDelete(t.id)}>Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

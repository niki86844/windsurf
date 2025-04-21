import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { PDFDownloadLink, Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";
import { supabase } from "../utils/supabaseClient";

const DEFAULT_DATA = {
  locataire: "Alice Martin",
  adresse: "12 rue des Fleurs, 75000 Paris",
  periode: "Mars 2025",
  montant: "900",
  date: new Date().toLocaleDateString("fr-FR"),
  signature: "N. Propriétaire",
};

function QuittanceForm({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div>
        <label className="block text-sm font-semibold mb-1">Locataire</label>
        <input className="border rounded px-2 py-1 w-full" value={data.locataire} onChange={e => onChange({ ...data, locataire: e.target.value })} />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1">Adresse</label>
        <input className="border rounded px-2 py-1 w-full" value={data.adresse} onChange={e => onChange({ ...data, adresse: e.target.value })} />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1">Période</label>
        <input className="border rounded px-2 py-1 w-full" value={data.periode} onChange={e => onChange({ ...data, periode: e.target.value })} />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1">Montant (€)</label>
        <input className="border rounded px-2 py-1 w-full" type="number" value={data.montant} onChange={e => onChange({ ...data, montant: e.target.value })} />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1">Date d'émission</label>
        <input className="border rounded px-2 py-1 w-full" value={data.date} onChange={e => onChange({ ...data, date: e.target.value })} />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1">Signature</label>
        <input className="border rounded px-2 py-1 w-full" value={data.signature} onChange={e => onChange({ ...data, signature: e.target.value })} />
      </div>
    </div>
  );
}

function QuittancePreview({ data, noteHtml }: { data: any; noteHtml: string }) {
  return (
    <div
      className="quittance-preview bg-white border-2 border-blue-400 rounded shadow p-8 max-w-lg mx-auto mb-8 relative"
      style={{
        fontFamily: 'Arial, sans-serif',
        minHeight: 420,
        margin: '0 auto',
        background: 'white',
        boxShadow: '0 2px 12px rgba(37,99,235,0.08)',
      }}
    >
      <div style={{ position: 'absolute', top: 18, left: 24 }}>
        <span style={{ color: '#2563eb', fontWeight: 700, fontSize: 22 }}>🏠</span>
      </div>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <span style={{ color: '#2563eb', fontWeight: 700, fontSize: 24 }}>Quittance de loyer</span>
      </div>
      <div className="quittance-body" style={{ color: '#222', fontSize: 16, lineHeight: 1.7 }}>
        <p>Locataire : <b>{data.locataire}</b></p>
        <p>Adresse : <b>{data.adresse}</b></p>
        <p>Période : <b>{data.periode}</b></p>
        <p>Montant : <b>{data.montant} €</b></p>
        <p>Date d'émission : <b>{data.date}</b></p>
        {noteHtml && <div className="mt-4" dangerouslySetInnerHTML={{ __html: noteHtml }} />}
      </div>
      <div style={{ marginTop: 36, textAlign: 'right', color: '#2563eb' }}>
        <span style={{ fontWeight: 600 }}>{data.signature}</span>
      </div>
    </div>
  );
}

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    padding: 32,
    fontSize: 14,
    color: '#222',
    backgroundColor: '#fff',
  },
  title: {
    color: '#2563eb',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  field: { marginBottom: 8 },
  label: { fontWeight: 'bold' },
  note: { marginTop: 16, fontSize: 12, color: '#444' },
  signature: { marginTop: 36, textAlign: 'right', color: '#2563eb', fontWeight: 'bold' },
});

function QuittancePDF({ data, noteText }: { data: any; noteText: string }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Quittance de loyer</Text>
        <View style={styles.field}><Text style={styles.label}>Locataire : </Text><Text>{data.locataire}</Text></View>
        <View style={styles.field}><Text style={styles.label}>Adresse : </Text><Text>{data.adresse}</Text></View>
        <View style={styles.field}><Text style={styles.label}>Période : </Text><Text>{data.periode}</Text></View>
        <View style={styles.field}><Text style={styles.label}>Montant : </Text><Text>{data.montant} €</Text></View>
        <View style={styles.field}><Text style={styles.label}>Date d'émission : </Text><Text>{data.date}</Text></View>
        {noteText && <View style={styles.note}><Text>{noteText}</Text></View>}
        <Text style={styles.signature}>{data.signature}</Text>
      </Page>
    </Document>
  );
}

export default function QuittanceEditor() {
  const [data, setData] = useState(DEFAULT_DATA);
  const [note, setNote] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const getNoteText = (html: string) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || '';
  };

  const handleUploadPdf = async () => {
    setUploading(true);
    setErrorMsg(null);
    setDownloadUrl(null);
    try {
      const { pdf } = await import("@react-pdf/renderer");
      const blob = await pdf(
        <QuittancePDF data={data} noteText={getNoteText(note)} />
      ).toBlob();
      const fileName = `quittance-${data.locataire.replace(/\s/g, "_")}-${data.periode.replace(/\s/g, "_")}.pdf`;
      const { data: uploadData, error } = await supabase.storage.from('quittances').upload(fileName, blob, {
        cacheControl: '3600',
        upsert: true,
        contentType: 'application/pdf',
      });
      if (error) throw error;
      const { data: urlData, error: urlError } = await supabase.storage.from('quittances').createSignedUrl(fileName, 60 * 60);
      if (urlError) throw urlError;
      setDownloadUrl(urlData.signedUrl);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erreur lors de la génération ou de l\'upload du PDF.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-blue-700">Éditeur de quittance</h1>
      <QuittanceForm data={data} onChange={setData} />
      <label className="block text-sm font-semibold mb-1">Note complémentaire (facultative, WYSIWYG)</label>
      <ReactQuill theme="snow" value={note} onChange={setNote} className="mb-6 bg-white" />
      <QuittancePreview data={data} noteHtml={note} />
      <div className="mb-6 flex flex-col gap-3">
        <PDFDownloadLink
          document={<QuittancePDF data={data} noteText={getNoteText(note)} />}
          fileName={`quittance-${data.locataire.replace(/\s/g, "_")}-${data.periode.replace(/\s/g, "_")}.pdf`}
        >
          {({ loading }) => (
            <button className={`px-4 py-2 rounded text-white ${loading ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'}`}
              disabled={loading}
            >
              {loading ? "Génération en cours..." : "Générer le PDF (local)"}
            </button>
          )}
        </PDFDownloadLink>
        <button
          className={`px-4 py-2 rounded text-white ${uploading ? 'bg-blue-300' : 'bg-blue-700 hover:bg-blue-800'}`}
          onClick={handleUploadPdf}
          disabled={uploading}
        >
          {uploading ? 'Envoi en cours...' : 'Générer et uploader sur Supabase'}
        </button>
        {downloadUrl && (
          <a
            href={downloadUrl}
            className="text-blue-700 underline mt-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            Télécharger la quittance PDF depuis Supabase
          </a>
        )}
        {errorMsg && <div className="text-red-600 font-semibold">{errorMsg}</div>}
      </div>
    </div>
  );
}

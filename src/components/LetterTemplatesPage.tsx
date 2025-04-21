import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { supabase } from "../utils/supabaseClient";

// Table: letter_templates (id, name, content_html, created_at, updated_at)

export type LetterTemplate = {
  id: number;
  name: string;
  content_html: string;
  created_at: string;
  updated_at: string;
};

function fetchTemplates(): Promise<LetterTemplate[]> {
  return supabase.from('letter_templates').select('*').order('created_at', { ascending: false })
    .then(({ data, error }) => {
      if (error) throw error;
      return data as LetterTemplate[];
    });
}

function upsertTemplate(template: Partial<LetterTemplate>): Promise<any> {
  return supabase.from('letter_templates').upsert(template).select().single()
    .then(({ data, error }) => {
      if (error) throw error;
      return data;
    });
}

function deleteTemplate(id: number): Promise<any> {
  return supabase.from('letter_templates').delete().eq('id', id);
}

export default function LetterTemplatesPage() {
  console.log("👉 LetterTemplatesPage mounted");
  return <div style={{ padding: '2rem' }}>🌟 LetterTemplatesPage OK 🌟</div>;
}

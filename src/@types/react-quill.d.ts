// src/@types/react-quill.d.ts
import { ComponentType } from 'react';

interface QuillProps {
  value?: string;
  onChange?: (content: string, delta: any, source: any, editor: any) => void;
  modules?: any;
  formats?: string[];
  placeholder?: string;
  readOnly?: boolean;
  theme?: string;
  style?: React.CSSProperties;
  className?: string;
  // ajoute d’autres props si besoin
}

const ReactQuill: ComponentType<QuillProps>;
export default ReactQuill;

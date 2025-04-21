/**
 * Plan d'itération pour la couverture de tests du wizard LeaseFormWizard.
 *
 * Correction : Import React et Testing Library AVANT tout mock, car le JSX a besoin de React en scope.
 * Les mocks (mockGetUser, mockUpsert, vi.mock) sont placés APRÈS les imports pour garantir que React est défini lors du parsing du JSX.
 *
 * Boucle : Patch → npm run test → Patch suivant jusqu'à 0 erreur.
 */

// --- IMPORTS FONDAMENTAUX ---
import React from 'react'; // Indispensable pour JSX (renderWithClient, <LeaseFormWizard ...>)
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// --- Déclaration de renderWithClient (utilisé pour fournir QueryClientProvider à chaque test) ---
const renderWithClient = (ui: React.ReactElement) => {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
};

// --- Déclaration des mocks (doivent précéder vi.mock) ---
let mockGetUser: () => any;
let mockUpsert: (...args: any[]) => Promise<any>;

// --- Bloc de mock de module supabase ---
vi.mock('../utils/supabaseClient', () => {
  return {
    supabase: {
      auth: { getUser: () => Promise.resolve({ data: { user: mockGetUser ? mockGetUser() : null } }) },
      from: () => ({ upsert: (...args: any[]) => mockUpsert(...args) })
    }
  };
});

// --- Imports du composant APRES le mock, mais React doit être importé avant tout ---
import { describe, it, vi, beforeEach, expect } from 'vitest';
import LeaseFormWizard from './LeaseFormWizard';

// Analyse rapide des props attendues :
// - properties: liste des biens
// - tenants: liste des locataires
// - lease: contrat à éditer (ou null)
// - onClose: callback fermeture
// - onSave: callback succès (non utilisé avec mutation réelle)
// Actions internes : useMutation (upsert), loading, error, success

const defaultProps = {
  properties: [{ id: 1, titre: 'Appartement', ville: 'Paris' }],
  tenants: [{ id: 1, nom: 'Alice', property_id: 1 }],
  lease: null,
  onClose: vi.fn(),
  onSave: vi.fn(),
};

beforeEach(() => {
  // Réinitialisation des mocks avant chaque test
  mockGetUser = () => ({ id: 'user-1' });
  mockUpsert = vi.fn().mockResolvedValue({ data: [{}], error: null });
  defaultProps.onClose.mockReset();
  defaultProps.onSave.mockReset();
});

describe('LeaseFormWizard', () => {
  // Test 1 – Submission réussie
  // Vérifie que le contrat est upserté, owner_id transmis, onClose appelé, query invalidée
  it('enregistre un contrat et ferme la modale en cas de succès', async () => {
    mockGetUser = () => ({ id: 'user-1' });
    mockUpsert = vi.fn().mockResolvedValue({ data: [{}], error: null });
    renderWithClient(<LeaseFormWizard {...defaultProps} />);
    // Aller à la dernière étape
    fireEvent.click(screen.getByText('Suivant'));
    fireEvent.click(screen.getByText('Suivant'));
    fireEvent.click(screen.getByText('Suivant'));
    fireEvent.click(screen.getByText('Suivant'));
    // Submit
    fireEvent.click(screen.getByText('Enregistrer'));
    await waitFor(() => {
      expect(mockUpsert).toHaveBeenCalled();
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
    // Vérifie owner_id présent
    const args = mockUpsert.mock.calls[0][0];
    expect(args.owner_id).toBe('user-1');
  });

  // Test 2 – Loading state
  // Vérifie que le bouton est désactivé et affiche "Enregistrement..." si loading
  it('désactive le bouton et affiche Enregistrement... en loading', async () => {
    renderWithClient(<LeaseFormWizard {...defaultProps} />);
    fireEvent.click(screen.getByText('Suivant'));
    fireEvent.click(screen.getByText('Suivant'));
    fireEvent.click(screen.getByText('Suivant'));
    fireEvent.click(screen.getByText('Suivant'));
    // Simule le submit
    fireEvent.click(screen.getByText('Enregistrer'));
    // Le bouton doit être désactivé pendant le loading (on attend un tick)
    await waitFor(() => {
      const btn = screen.getByRole('button', { name: /Enregistrement/ });
      expect(btn).toBeDisabled();
    });
  });

  // Test 3 – Erreur Supabase
  // Vérifie qu'un message d'erreur s'affiche si upsert échoue
  it('affiche une erreur si Supabase échoue', async () => {
    mockUpsert = vi.fn().mockResolvedValue({ data: null, error: { message: 'Échec' } });
    renderWithClient(<LeaseFormWizard {...defaultProps} />);
    fireEvent.click(screen.getByText('Suivant'));
    fireEvent.click(screen.getByText('Suivant'));
    fireEvent.click(screen.getByText('Suivant'));
    fireEvent.click(screen.getByText('Suivant'));
    fireEvent.click(screen.getByText('Enregistrer'));
    await waitFor(() => {
      expect(screen.getByText(/Erreur/)).toBeInTheDocument();
      expect(screen.getByText(/Échec/)).toBeInTheDocument();
    });
  });

  // Test 4 – Non-authentifié
  // Vérifie qu'une erreur est affichée si l'utilisateur n'est pas connecté
  it('affiche une erreur si non-authentifié', async () => {
    mockGetUser = () => null;
    renderWithClient(<LeaseFormWizard {...defaultProps} />);
    fireEvent.click(screen.getByText('Suivant'));
    fireEvent.click(screen.getByText('Suivant'));
    fireEvent.click(screen.getByText('Suivant'));
    fireEvent.click(screen.getByText('Suivant'));
    fireEvent.click(screen.getByText('Enregistrer'));
    await waitFor(() => {
      expect(screen.getByText(/authentifié/i)).toBeInTheDocument();
    });
    expect(mockUpsert).not.toHaveBeenCalled();
  });
});

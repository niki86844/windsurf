# gestion-immobiliere

## Nouvelles routes
- `/parametrage-loyers` : gestion des contrats de location (baux)

## Variables d'environnement
- `VITE_SUPABASE_URL` : URL de votre projet Supabase
- `VITE_SUPABASE_ANON_KEY` : clé anonyme Supabase
- `VITE_STRIPE_PUBLISHABLE_KEY` : clé publique Stripe (paiements)
- `STRIPE_SECRET_KEY` : clé secrète Stripe (backend)
- `GO_CARDLESS_ACCESS_TOKEN` : token GoCardless (backend)

## Fonctionnalités
- Paramétrage des loyers, gestion des paiements, édition et génération de quittances PDF.
- Wizard d'ajout/édition de contrat.
- Génération et stockage automatique des quittances PDF (Supabase Storage).

## Mode test
- L'Edge Function Stripe (`/functions/createStripeIntent.ts`) fonctionne en mode test.

## Tests unitaires (Vitest)

Le projet utilise **Vitest** et **Testing Library** pour tester les composants React (notamment LeaseFormWizard).

- **Configuration** :
  - `vitest.config.ts` : environnement jsdom, global, setupFiles (voir commentaires dans le fichier).
  - `vitest.setup.ts` : setup global pour jest-dom.
- **Lancer les tests** :

```sh
npm run test
```

- **Exemple de sortie réussie** :

```
PASS  src/components/LeaseFormWizard.test.tsx > LeaseFormWizard > enregistre un contrat et ferme la modale en cas de succès
PASS  src/components/LeaseFormWizard.test.tsx > LeaseFormWizard > désactive le bouton et affiche Enregistrement... en loading
PASS  src/components/LeaseFormWizard.test.tsx > LeaseFormWizard > affiche une erreur si Supabase échoue
PASS  src/components/LeaseFormWizard.test.tsx > LeaseFormWizard > affiche une erreur si non-authentifié

Test Files  1 passed (1)
      Tests  4 passed (4)
   Start at  ...
```

- **Stratégie de mock** :
  - Le client Supabase est mocké pour simuler tous les cas (succès, erreur, non-authentifié).
  - Le composant est rendu dans un QueryClientProvider.

- **Itération** :
  - En cas d’échec, lire l’erreur, corriger le test ou le composant, relancer jusqu’à 100% de réussite.

## Dossiers/fichiers ajoutés
- `src/pages/ParametrageLoyers.tsx`
- `src/components/LeaseFormWizard.tsx`
- `src/components/QuittanceEditor.tsx`
- `src/utils/pdf.ts`
- `functions/createStripeIntent.ts`
- `supabase/schema.sql`
- `.env.example`

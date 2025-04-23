-- Migration: Création des tables et policies RLS pour gestion immobilière

-- Table: properties
CREATE TABLE IF NOT EXISTS properties (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    titre text NOT NULL,
    ville text NOT NULL,
    surface numeric NOT NULL,
    type text NOT NULL,
    owner_id uuid NOT NULL
);

-- Table: tenants
CREATE TABLE IF NOT EXISTS tenants (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nom text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    owner_id uuid NOT NULL
);

-- Table: leases
CREATE TABLE IF NOT EXISTS leases (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
    tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
    montant numeric NOT NULL,
    date_debut date NOT NULL,
    frequence text NOT NULL,
    mode_paiement text NOT NULL,
    owner_id uuid NOT NULL
);

-- Table: irl_index
CREATE TABLE IF NOT EXISTS irl_index (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    date_reference text NOT NULL,
    valeur numeric NOT NULL,
    owner_id uuid NOT NULL
);

-- Table: letters
CREATE TABLE IF NOT EXISTS letters (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    lease_id uuid REFERENCES leases(id) ON DELETE CASCADE,
    type text NOT NULL CHECK (type IN ('quittance', 'reajustement')),
    contenu_html text NOT NULL,
    pdf_url text,
    created_at timestamp with time zone DEFAULT timezone('utc', now()),
    owner_id uuid NOT NULL
);

-- Enable RLS for all tables
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE leases ENABLE ROW LEVEL SECURITY;
ALTER TABLE irl_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE letters ENABLE ROW LEVEL SECURITY;

-- Policies: Only owner can access their rows
-- properties
CREATE POLICY select_properties ON properties FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY insert_properties ON properties FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY update_properties ON properties FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY delete_properties ON properties FOR DELETE USING (owner_id = auth.uid());

-- tenants
CREATE POLICY select_tenants ON tenants FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY insert_tenants ON tenants FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY update_tenants ON tenants FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY delete_tenants ON tenants FOR DELETE USING (owner_id = auth.uid());

-- leases
CREATE POLICY select_leases ON leases FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY insert_leases ON leases FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY update_leases ON leases FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY delete_leases ON leases FOR DELETE USING (owner_id = auth.uid());

-- irl_index
CREATE POLICY select_irl_index ON irl_index FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY insert_irl_index ON irl_index FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY update_irl_index ON irl_index FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY delete_irl_index ON irl_index FOR DELETE USING (owner_id = auth.uid());

-- letters
CREATE POLICY select_letters ON letters FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY insert_letters ON letters FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY update_letters ON letters FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY delete_letters ON letters FOR DELETE USING (owner_id = auth.uid());

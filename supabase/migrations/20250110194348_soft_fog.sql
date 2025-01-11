/*
  # Token System Implementation

  1. New Tables
    - `token_balances`: Tracks user token balances
      - `user_id` (uuid, references profiles)
      - `balance` (integer)
      - `updated_at` (timestamp)
    
    - `token_transactions`: Records all token operations
      - `id` (uuid)
      - `user_id` (uuid, references profiles)
      - `amount` (integer)
      - `type` (text: 'purchase', 'use', 'refund')
      - `description` (text)
      - `created_at` (timestamp)

  2. Functions
    - `get_user_balance`: Get current token balance
    - `purchase_tokens`: Add tokens to user balance
    - `use_tokens`: Deduct tokens from balance
    - `check_token_balance`: Check if user has enough tokens
*/

-- Create token_balances table
CREATE TABLE IF NOT EXISTS token_balances (
    user_id uuid PRIMARY KEY REFERENCES profiles(id),
    balance integer NOT NULL DEFAULT 0,
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT positive_balance CHECK (balance >= 0)
);

-- Create token_transactions table
CREATE TABLE IF NOT EXISTS token_transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES profiles(id) NOT NULL,
    amount integer NOT NULL,
    type text NOT NULL CHECK (type IN ('purchase', 'use', 'refund')),
    description text,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE token_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own balance"
    ON token_balances FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view own transactions"
    ON token_transactions FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Functions
CREATE OR REPLACE FUNCTION get_user_balance(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN COALESCE(
        (SELECT balance FROM token_balances WHERE user_id = p_user_id),
        0
    );
END;
$$;

CREATE OR REPLACE FUNCTION purchase_tokens(
    p_user_id uuid,
    p_amount integer,
    p_package_id text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Insert or update balance
    INSERT INTO token_balances (user_id, balance)
    VALUES (p_user_id, p_amount)
    ON CONFLICT (user_id)
    DO UPDATE SET
        balance = token_balances.balance + p_amount,
        updated_at = now();

    -- Record transaction
    INSERT INTO token_transactions (user_id, amount, type, description)
    VALUES (p_user_id, p_amount, 'purchase', 'Purchased ' || p_amount || ' tokens (' || p_package_id || ' package)');

    RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION use_tokens(
    p_user_id uuid,
    p_amount integer,
    p_description text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_balance integer;
BEGIN
    SELECT balance INTO current_balance
    FROM token_balances
    WHERE user_id = p_user_id
    FOR UPDATE;

    IF current_balance IS NULL OR current_balance < p_amount THEN
        RETURN false;
    END IF;

    -- Update balance
    UPDATE token_balances
    SET balance = balance - p_amount,
        updated_at = now()
    WHERE user_id = p_user_id;

    -- Record transaction
    INSERT INTO token_transactions (user_id, amount, type, description)
    VALUES (p_user_id, -p_amount, 'use', p_description);

    RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION check_token_balance(
    p_user_id uuid,
    p_required_amount integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN COALESCE(
        (SELECT balance >= p_required_amount
         FROM token_balances
         WHERE user_id = p_user_id),
        false
    );
END;
$$;
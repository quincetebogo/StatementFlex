-- Add transactions for account 10000000002
-- First, check if customer exists, if not create one

-- Step 1: Create customer if not exists (for testing purposes)
INSERT INTO "Customers" ("Id", "AccountNumber", "Email", "FirstName", "LastName", "HashPassword", "PhoneNumber", "DateCreated", "LastLogin")
VALUES
    ('f6a7b8c9-d0e1-4f5a-3b4c-5d6e7f8a9b0c', '10000000002', 'test.user@statementflex.com', 'Test', 'User', '$2a$11$hashed_password_placeholder', '+27823456789', NOW(), NULL)
ON CONFLICT ("AccountNumber") DO NOTHING;

-- Step 2: Get the customer ID for this account
-- We'll use a CTE to ensure we reference the right customer
WITH customer_info AS (
    SELECT "Id", "AccountNumber" FROM "Customers" WHERE "AccountNumber" = '10000000002'
)

-- Step 3: Insert transactions for account 10000000002
INSERT INTO "Transactions" ("TransactionId", "CustomerId", "AccountNumber", "TransactionType", "TransactionDate", "TransactionAmount", "Balance", "Reference", "Description")
SELECT
    gen_random_uuid(),
    ci."Id",
    '10000000002',
    CASE
        WHEN seq <= 2 THEN 1  -- Credits (deposits)
        ELSE 2  -- Debits (withdrawals)
    END as TransactionType,
    DATE_TRUNC('month', CURRENT_DATE) + (INTERVAL '1 day' * seq),
    CASE
        WHEN seq = 1 THEN 15000.00  -- Initial salary
        WHEN seq = 2 THEN 2500.00   -- Bonus
        WHEN seq = 3 THEN 350.25    -- Grocery Store
        WHEN seq = 4 THEN 125.99    -- Fuel
        WHEN seq = 5 THEN 45.50     -- Restaurant
        WHEN seq = 6 THEN 225.00    -- Online shopping
        WHEN seq = 7 THEN 500.00    -- Utility bill
        WHEN seq = 8 THEN 89.75     -- Insurance
        WHEN seq = 9 THEN 200.00    -- ATM withdrawal
        WHEN seq = 10 THEN 75.25    -- Coffee & misc
        WHEN seq = 11 THEN 150.00   -- Mobile & services
        WHEN seq = 12 THEN 320.00   -- Grocery Store
        WHEN seq = 13 THEN 95.50    -- Pharmacy
        WHEN seq = 14 THEN 1000.00  -- Rent deposit
        WHEN seq = 15 THEN 200.00   -- Investment transfer
        WHEN seq = 16 THEN 75.99    -- Restaurant
        WHEN seq = 17 THEN 425.00   -- Insurance
        WHEN seq = 18 THEN 185.25   -- Utilities
        WHEN seq = 19 THEN 450.00   -- Online shopping
        WHEN seq = 20 THEN 125.00   -- Gym membership
        ELSE 50.00
    END as TransactionAmount,
    CASE
        WHEN seq = 1 THEN 15000.00
        WHEN seq = 2 THEN 17500.00
        WHEN seq = 3 THEN 17149.75
        WHEN seq = 4 THEN 17024.76
        WHEN seq = 5 THEN 16979.26
        WHEN seq = 6 THEN 16754.26
        WHEN seq = 7 THEN 16254.26
        WHEN seq = 8 THEN 16164.51
        WHEN seq = 9 THEN 15964.51
        WHEN seq = 10 THEN 15889.26
        WHEN seq = 11 THEN 15739.26
        WHEN seq = 12 THEN 15419.26
        WHEN seq = 13 THEN 15323.76
        WHEN seq = 14 THEN 16323.76
        WHEN seq = 15 THEN 16123.76
        WHEN seq = 16 THEN 16047.77
        WHEN seq = 17 THEN 15622.77
        WHEN seq = 18 THEN 15437.52
        WHEN seq = 19 THEN 14987.52
        WHEN seq = 20 THEN 14862.52
        ELSE 14862.52
    END as Balance,
    'REF' || TO_CHAR(600000 + seq, '000000') as Reference,
    CASE
        WHEN seq = 1 THEN 'Monthly Salary Deposit'
        WHEN seq = 2 THEN 'Performance Bonus'
        WHEN seq = 3 THEN 'Grocery Store Purchase'
        WHEN seq = 4 THEN 'Fuel Station - Shell'
        WHEN seq = 5 THEN 'Restaurant - Local Bistro'
        WHEN seq = 6 THEN 'Online Shopping - Amazon'
        WHEN seq = 7 THEN 'Utility Bill Payment - Municipal'
        WHEN seq = 8 THEN 'Insurance Premium - Auto'
        WHEN seq = 9 THEN 'ATM Cash Withdrawal'
        WHEN seq = 10 THEN 'Coffee Shop & Sundries'
        WHEN seq = 11 THEN 'Mobile Recharge & Services'
        WHEN seq = 12 THEN 'Grocery Store Purchase'
        WHEN seq = 13 THEN 'Pharmacy - Health Supplies'
        WHEN seq = 14 THEN 'Rent Deposit Transfer'
        WHEN seq = 15 THEN 'Investment Fund Transfer'
        WHEN seq = 16 THEN 'Restaurant - Upmarket Dining'
        WHEN seq = 17 THEN 'Home Insurance Premium'
        WHEN seq = 18 THEN 'Internet & Utilities Bill'
        WHEN seq = 19 THEN 'Online Shopping - Clothing'
        WHEN seq = 20 THEN 'Gym Membership Annual'
        ELSE 'Miscellaneous Transaction'
    END as Description
FROM customer_info as ci
CROSS JOIN LATERAL generate_series(1, 20) as seq;

-- Step 4: Verification
SELECT
    c."FirstName" || ' ' || c."LastName" AS "Customer Name",
    c."AccountNumber",
    COUNT(t."TransactionId") AS "Transaction Count",
    SUM(CASE WHEN t."TransactionType" = 1 THEN t."TransactionAmount" ELSE 0 END) AS "Total Credits",
    SUM(CASE WHEN t."TransactionType" = 2 THEN t."TransactionAmount" ELSE 0 END) AS "Total Debits",
    (SUM(CASE WHEN t."TransactionType" = 1 THEN t."TransactionAmount" ELSE 0 END) -
     SUM(CASE WHEN t."TransactionType" = 2 THEN t."TransactionAmount" ELSE 0 END)) AS "Net Balance"
FROM "Customers" c
LEFT JOIN "Transactions" t ON c."Id" = t."CustomerId"
WHERE c."AccountNumber" = '10000000002'
GROUP BY c."Id", c."FirstName", c."LastName", c."AccountNumber";

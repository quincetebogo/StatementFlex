-- Seed Data Script for StatementFlex Database
-- Run this in pgAdmin to populate customers and transactions
-- Transactions are from the beginning of the current month

-- Insert Customers
INSERT INTO "Customers" ("Id", "AccountNumber", "Email", "FirstName", "LastName", "HashPassword", "DateCreated", "LastLogin")
VALUES
    ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', '12345678901', 'john.doe@example.com', 'John', 'Doe', '$2a$11$hashed_password_placeholder', NOW(), NULL),
    ('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', '12345678902', 'jane.smith@example.com', 'Jane', 'Smith', '$2a$11$hashed_password_placeholder', NOW(), NULL),
    ('c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', '12345678903', 'bob.johnson@example.com', 'Bob', 'Johnson', '$2a$11$hashed_password_placeholder', NOW(), NULL),
    ('d4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a', '12345678904', 'alice.williams@example.com', 'Alice', 'Williams', '$2a$11$hashed_password_placeholder', NOW(), NULL),
    ('e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b', '12345678905', 'charlie.brown@example.com', 'Charlie', 'Brown', '$2a$11$hashed_password_placeholder', NOW(), NULL);

-- Insert Transactions for John Doe (12345678901)
INSERT INTO "Transactions" ("TransactionId", "CustomerId", "AccountNumber", "TransactionType", "TransactionDate", "TransactionAmount", "Balance", "Reference", "Description")
VALUES
    (gen_random_uuid(), 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', '12345678901', 1, DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 day', 5000.00, 10000.00, 'REF100001', 'Salary Deposit'),
    (gen_random_uuid(), 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', '12345678901', 2, DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '2 days', 125.50, 9874.50, 'REF100002', 'Grocery Store Purchase'),
    (gen_random_uuid(), 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', '12345678901', 2, DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '3 days', 45.00, 9829.50, 'REF100003', 'Fuel Station'),
    (gen_random_uuid(), 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', '12345678901', 2, DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '5 days', 89.99, 9739.51, 'REF100004', 'Online Shopping - Amazon'),
    (gen_random_uuid(), 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', '12345678901', 2, DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '7 days', 250.00, 9489.51, 'REF100005', 'Utility Bill Payment'),
    (gen_random_uuid(), 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', '12345678901', 1, DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '8 days', 50.00, 9539.51, 'REF100006', 'Refund - Online Purchase'),
    (gen_random_uuid(), 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', '12345678901', 2, DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '10 days', 65.75, 9473.76, 'REF100007', 'Restaurant - Dining'),
    (gen_random_uuid(), 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', '12345678901', 2, DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '12 days', 35.20, 9438.56, 'REF100008', 'Pharmacy Purchase'),
    (gen_random_uuid(), 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', '12345678901', 2, DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '14 days', 150.00, 9288.56, 'REF100009', 'Insurance Premium'),
    (gen_random_uuid(), 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', '12345678901', 1, DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '15 days', 500.00, 9788.56, 'REF100010', 'Transfer from Savings');

-- Insert Transactions for Jane Smith (12345678902)
INSERT INTO "Transactions" ("TransactionId", "CustomerId", "AccountNumber", "TransactionType", "TransactionDate", "TransactionAmount", "Balance", "Reference", "Description")
VALUES
    (gen_random_uuid(), 'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', '12345678902', 1, DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 day', 4500.00, 9500.00, 'REF200001', 'Salary Deposit'),
    (gen_random_uuid(), 'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', '12345678902', 2, DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '2 days', 200.00, 9300.00, 'REF200002', 'ATM Withdrawal'),
    (gen_random_uuid(), 'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', '12345678902', 2, DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '4 days', 75.30, 9224.70, 'REF200003', 'Grocery Store Purchase'),
    (gen_random_uuid(), 'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', '12345678902', 2, DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '6 days', 120.50, 9104.20, 'REF200004', 'Online Shopping - Amazon'),
    (gen_random_uuid(), 'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', '12345678902', 2, DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '8 days', 45.00, 9059.20, 'REF200005', 'Fuel Station'),
    (gen_random_uuid(), 'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', '12345678902', 1, DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '10 days', 25.00, 9084.20, 'REF200006', 'Interest Payment'),
    (gen_random_uuid(), 'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', '12345678902', 2, DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '11 days', 85.99, 8998.21, 'REF200007', 'Restaurant - Dining'),
    (gen_random_uuid(), 'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', '12345678902', 2, DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '13 days', 15.00, 8983.21, 'REF200008', 'Subscription Service'),
    (gen_random_uuid(), 'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', '12345678902', 2, DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '15 days', 300.00, 8683.21, 'REF200009', 'Utility Bill Payment'),
    (gen_random_uuid(), 'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', '12345678902', 2, DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '16 days', 55.40, 8627.81, 'REF200010', 'Coffee Shop');

-- Insert Transactions for Bob Johnson (12345678903)
INSERT INTO "Transactions" ("TransactionId", "CustomerId", "AccountNumber", "TransactionType", "TransactionDate", "TransactionAmount", "Balance", "Reference", "Description")
VALUES
    (gen_random_uuid(), 'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', '12345678903', 1, DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 day', 6000.00, 11000.00, 'REF300001', 'Salary Deposit'),
    (gen_random_uuid(), 'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', '12345678903', 2, DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '3 days', 150.00, 10850.00, 'REF300002', 'Grocery Store Purchase'),
    (gen_random_uuid(), 'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', '12345678903', 2, DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '5 days', 60.00, 10790.00, 'REF300003', 'Fuel Station'),
    (gen_random_uuid(), 'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', '12345678903', 2, DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '7 days', 220.50, 10569.50, 'REF300004', 'Online Shopping - Amazon'),
    (gen_random_uuid(), 'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', '12345678903', 1, DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '9 days', 1000.00, 11569.50, 'REF300005', 'Bonus Payment'),
    (gen_random_uuid(), 'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', '12345678903', 2, DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '10 days', 95.25, 11474.25, 'REF300006', 'Restaurant - Dining'),
    (gen_random_uuid(), 'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', '12345678903', 2, DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '12 days', 400.00, 11074.25, 'REF300007', 'Utility Bill Payment'),
    (gen_random_uuid(), 'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', '12345678903', 2, DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '14 days', 180.00, 10894.25, 'REF300008', 'Insurance Premium'),
    (gen_random_uuid(), 'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', '12345678903', 2, DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '16 days', 25.50, 10868.75, 'REF300009', 'Mobile Recharge'),
    (gen_random_uuid(), 'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', '12345678903', 2, DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '18 days', 75.00, 10793.75, 'REF300010', 'Pharmacy Purchase');

-- Insert Transactions for Alice Williams (12345678904)
INSERT INTO "Transactions" ("TransactionId", "CustomerId", "AccountNumber", "TransactionType", "TransactionDate", "TransactionAmount", "Balance", "Reference", "Description")
VALUES
    (gen_random_uuid(), 'd4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a', '12345678904', 1, DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 day', 5500.00, 10500.00, 'REF400001', 'Salary Deposit'),
    (gen_random_uuid(), 'd4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a', '12345678904', 2, DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '2 days', 110.20, 10389.80, 'REF400002', 'Grocery Store Purchase'),
    (gen_random_uuid(), 'd4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a', '12345678904', 2, DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '4 days', 50.00, 10339.80, 'REF400003', 'Fuel Station'),
    (gen_random_uuid(), 'd4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a', '12345678904', 2, DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '6 days', 199.99, 10139.81, 'REF400004', 'Online Shopping - Amazon'),
    (gen_random_uuid(), 'd4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a', '12345678904', 1, DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '8 days', 75.00, 10214.81, 'REF400005', 'Refund - Online Purchase'),
    (gen_random_uuid(), 'd4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a', '12345678904', 2, DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '10 days', 120.00, 10094.81, 'REF400006', 'Restaurant - Dining'),
    (gen_random_uuid(), 'd4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a', '12345678904', 2, DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '11 days', 350.00, 9744.81, 'REF400007', 'Utility Bill Payment'),
    (gen_random_uuid(), 'd4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a', '12345678904', 2, DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '13 days', 20.00, 9724.81, 'REF400008', 'Subscription Service'),
    (gen_random_uuid(), 'd4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a', '12345678904', 2, DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '15 days', 45.30, 9679.51, 'REF400009', 'Coffee Shop'),
    (gen_random_uuid(), 'd4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a', '12345678904', 2, DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '17 days', 165.00, 9514.51, 'REF400010', 'Insurance Premium');

-- Insert Transactions for Charlie Brown (12345678905)
INSERT INTO "Transactions" ("TransactionId", "CustomerId", "AccountNumber", "TransactionType", "TransactionDate", "TransactionAmount", "Balance", "Reference", "Description")
VALUES
    (gen_random_uuid(), 'e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b', '12345678905', 1, DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 day', 4800.00, 9800.00, 'REF500001', 'Salary Deposit'),
    (gen_random_uuid(), 'e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b', '12345678905', 2, DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '3 days', 95.75, 9704.25, 'REF500002', 'Grocery Store Purchase'),
    (gen_random_uuid(), 'e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b', '12345678905', 2, DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '5 days', 40.00, 9664.25, 'REF500003', 'Fuel Station'),
    (gen_random_uuid(), 'e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b', '12345678905', 2, DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '7 days', 150.00, 9514.25, 'REF500004', 'Online Shopping - Amazon'),
    (gen_random_uuid(), 'e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b', '12345678905', 1, DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '9 days', 200.00, 9714.25, 'REF500005', 'Transfer from Savings'),
    (gen_random_uuid(), 'e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b', '12345678905', 2, DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '11 days', 80.50, 9633.75, 'REF500006', 'Restaurant - Dining'),
    (gen_random_uuid(), 'e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b', '12345678905', 2, DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '12 days', 275.00, 9358.75, 'REF500007', 'Utility Bill Payment'),
    (gen_random_uuid(), 'e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b', '12345678905', 2, DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '14 days', 30.00, 9328.75, 'REF500008', 'Mobile Recharge'),
    (gen_random_uuid(), 'e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b', '12345678905', 2, DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '16 days', 140.00, 9188.75, 'REF500009', 'Insurance Premium'),
    (gen_random_uuid(), 'e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b', '12345678905', 2, DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '18 days', 65.20, 9123.55, 'REF500010', 'Pharmacy Purchase');

-- Verification Queries
SELECT COUNT(*) AS "Total Customers" FROM "Customers";
SELECT COUNT(*) AS "Total Transactions" FROM "Transactions";
SELECT
    c."FirstName" || ' ' || c."LastName" AS "Customer Name",
    c."AccountNumber",
    COUNT(t."TransactionId") AS "Transaction Count",
    SUM(CASE WHEN t."TransactionType" = 1 THEN t."TransactionAmount" ELSE 0 END) AS "Total Credits",
    SUM(CASE WHEN t."TransactionType" = 2 THEN t."TransactionAmount" ELSE 0 END) AS "Total Debits"
FROM "Customers" c
LEFT JOIN "Transactions" t ON c."Id" = t."CustomerId"
GROUP BY c."Id", c."FirstName", c."LastName", c."AccountNumber"
ORDER BY c."AccountNumber";
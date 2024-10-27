-- Bands Table Insert (using UUIDs for "Id")
INSERT INTO public."Bands" ("Id", "Name", "Genre", "Founded")
VALUES
(gen_random_uuid(), 'Stray Kids', 1, '2018-05-25'),
(gen_random_uuid(), 'Ateez', 1, '2018-10-24'),
(gen_random_uuid(), 'Itzy', 1, '2019-02-12'),
(gen_random_uuid(), '(G)-IDLE', 1, '2018-05-02'),
(gen_random_uuid(), 'BTS', 1, '2013-06-13'),
(gen_random_uuid(), 'SEVENTEEN', 1, '2015-05-26'),
(gen_random_uuid(), 'TWICE', 1, '2015-10-20'),
(gen_random_uuid(), 'P1Harmony', 1, '2020-10-28'),
(gen_random_uuid(), 'NCT', 1, '2016-04-04'),
(gen_random_uuid(), 'NCT 127', 1, '2016-07-07'),
(gen_random_uuid(), 'NCT U', 1, '2016-04-04'),
(gen_random_uuid(), 'NCT Dream', 1, '2016-08-25'),
(gen_random_uuid(), 'Red Velvet', 1, '2014-08-01'),
(gen_random_uuid(), 'Mamamoo', 1, '2014-06-19'),
(gen_random_uuid(), 'Blackpink', 1, '2016-08-08'),
(gen_random_uuid(), 'TXT', 1, '2019-03-04');


-- Artists Table Insert (using UUIDs for "Id")
INSERT INTO public."Artists" ("Id", "Name", "Genre", "Description")
VALUES
(gen_random_uuid(), 'Miyeon', 1, 'Main Vocalist of (G)I-DLE'),
(gen_random_uuid(), 'Hwasa', 1, 'Vocalist and rapper of Mamamoo'),
(gen_random_uuid(), 'Solar', 1, 'Leader and vocalist of Mamamoo'),
(gen_random_uuid(), 'Jungkook', 1, 'Main vocalist of BTS'),
(gen_random_uuid(), 'Suga', 1, 'Rapper and producer of BTS'),
(gen_random_uuid(), 'Jimin', 1, 'Lead vocalist and dancer of BTS'),
(gen_random_uuid(), 'J-Hope', 1, 'Rapper and dancer of BTS'),
(gen_random_uuid(), 'Taeyong', 1, 'Leader and rapper of NCT'),
(gen_random_uuid(), 'Dpr Ian', 1, 'Solo artist'),
(gen_random_uuid(), 'Jihyo', 1, 'Leader and main vocalist of TWICE'),
(gen_random_uuid(), 'Nayeon', 1, 'Lead vocalist of TWICE'),
(gen_random_uuid(), 'Lisa', 1, 'Main dancer and rapper of Blackpink');


-- ArtistBand Table Insert (with UUID mappings)
INSERT INTO public."ArtistBand" ("BandsId", "MembersId")
VALUES
-- Miyeon in (G)-IDLE
('b4918321-a1f1-4727-88a7-dac9588b807c', '1c80b2ac-6814-495d-a1d3-53ca000b7753'),   
-- Hwasa in Mamamoo
('f0095c63-b232-455f-9a58-f7481144bb26', '7fec5c5a-dd0b-439c-b8fd-7088c3fecdb6'),    
-- Solar in Mamamoo
('f0095c63-b232-455f-9a58-f7481144bb26', '0300d407-03ba-4b63-835e-153c9f8f2c4c'),    
-- Jungkook in BTS
('0384fa81-a2f2-492d-ba24-3267ee1ec241', '9fa6041e-e4d5-4fd7-9d4b-af3ac4b473d4'),    
-- Suga in BTS
('0384fa81-a2f2-492d-ba24-3267ee1ec241', '6795e2eb-4417-42b1-9e75-682c24cd91ce'),    
-- Jimin in BTS
('0384fa81-a2f2-492d-ba24-3267ee1ec241', '7c012f33-5451-4da3-825f-271400f5129b'),    
-- J-Hope in BTS
('0384fa81-a2f2-492d-ba24-3267ee1ec241', 'c36cabf3-d74f-418e-8fe9-4c863f066e5f'),    
-- Taeyong in NCT
('eb8343a7-29fe-4ff8-80ae-55e856baa328', '59906e0d-90ab-435b-8477-a84312ee3759'),   
-- Taeyong in NCT 127
('f94915ca-873e-498b-aa23-2dfad151f814', '59906e0d-90ab-435b-8477-a84312ee3759'),  
-- Taeyong in NCT U
('152d550f-08e1-4c72-ba32-6db89ce15068', '59906e0d-90ab-435b-8477-a84312ee3759'),   
-- Jihyo in TWICE
('e266d472-3c90-4022-a992-bb5e18646d34', 'ef17bbe6-87eb-46ef-96ea-b85606c44e65'),    
-- Nayeon in TWICE
('e266d472-3c90-4022-a992-bb5e18646d34', 'd916800c-ad0e-4089-87d2-af243ca01def'),    
-- Lisa in Blackpink
('4ae15d03-84d3-4501-b5fd-1f3b67d97bd6', 'e541b55b-4975-4655-b926-64397f6e5435');


-- Bands Table Insert (using UUIDs for "Id")
select * from public."Artists"
select * from public."Bands"

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
-- Miyeon in (G)-IDLE
INSERT INTO public."ArtistBand" ("BandsId", "MembersId")
VALUES
('2a3bd98b-6a89-42fc-86bf-b6ce22788cdc', 'a8d90f1b-8615-445a-9aa9-85e5734f284b'),

-- Hwasa in Mamamoo
('251a847c-d64a-4245-96b9-cbfba18644dc', '85e03c48-ba0c-4d9d-94c7-9e7920c34d30'),

-- Solar in Mamamoo
('251a847c-d64a-4245-96b9-cbfba18644dc', '4b87c562-945d-4d00-8d6b-b009247463f6'),

-- Jungkook in BTS
('027866d7-182c-4575-9875-f3cd0f3af4bb', 'ab81060f-bd19-4b2c-aff4-9109488d652d'),

-- Suga in BTS
('027866d7-182c-4575-9875-f3cd0f3af4bb', 'df5bf141-6b11-476a-84a7-82b4504ffc87'),

-- Jimin in BTS
('027866d7-182c-4575-9875-f3cd0f3af4bb', 'e21874e6-3a07-46c4-8c4a-16e34997dfb1'),

-- J-Hope in BTS
('027866d7-182c-4575-9875-f3cd0f3af4bb', '51413f3c-7d82-4159-9446-d0a81f88a1f4'),

-- Taeyong in NCT
('b60cacc0-933f-4e0d-b181-a9bada40c805', 'b556b71d-edcb-4235-96ab-93802bd441ab'),

-- Taeyong in NCT 127
('fb2015da-1a90-4558-b91b-2a95e29fbbbf', 'b556b71d-edcb-4235-96ab-93802bd441ab'),

-- Taeyong in NCT U
('e355bde2-d7b3-4e6b-80b7-a1f5e9027e61', 'b556b71d-edcb-4235-96ab-93802bd441ab'),

-- Jihyo in TWICE
('6f312c25-c943-4c68-9e88-f31b5073dc6f', '90f1e8f7-c890-4c4c-9d1b-64666b2df16b'),

-- Nayeon in TWICE
('6f312c25-c943-4c68-9e88-f31b5073dc6f', '559f064c-4f0c-44eb-82ba-8d0536990e21'),

-- Lisa in Blackpink
('e7c9129e-1195-4d0c-9a3b-66da7db61613', '25c451aa-692e-42e9-b45c-61043420f384');

USE enginy_db;

-- 1. TAULA: usuaris
INSERT INTO usuaris (id, email, password, rol, ultim_acces) VALUES
(1, 'admin@ceb.cat', '$2b$10$oH9FPzGcSdBpViK2pRyc2uCmHIf3o/q2LdegjRvvJHcOPHnncxZ0q', 'ADMIN', NOW()), -- admin123
(2, 'coordinador@escola.cat', '$2b$10$U./hVxAhKe1Obgjz1nmIouewmYRjqp5E7VrX13PCM5xOU8NMnDmzC', 'CENTRE', NOW()), -- centre123
(3, 'profe.referent@escola.cat', '$2b$10$8A5bSwYukCAesP90N4pOJeUPsIup/viCDZN18vAHasnjFcFGI6zKa', 'PROFESSOR', NOW()), -- profe123
(5, 'pere.prof@la-presentacio.cat', '$2b$10$lZNp1kfUMKfbVqjkxIOa6O4/Uw6Ft2kt8X8LTE8h4.UyMQVZlVHe.', 'PROFESSOR', NOW()), -- pere123
(6, 'anna.prof@la-presentacio.cat', '$2b$10$xTRaeFUEuyDu5.u5uo.jl.vFAEJkEcx5g2ejEFe4ORxYXlFAZoc9W', 'PROFESSOR', NOW()); -- anna123


-- 2. TAULA: administradors
INSERT INTO administradors (user_id, nom, cognoms, carrec) VALUES
(1, 'Admin', 'Sistema ENGINY', 'Tècnic de Gestió Educativa');

-- 3. TAULA: centres
INSERT INTO centres (user_id, codi_centre, nom_centre, adreca, municipi, telefon, email_oficial, nom_coordinador, es_primera_vegada) VALUES
(2, '08000131', 'La Presentació', 'c. Pompeu Fabra, 2', 'Arenys de Mar', '937920241', 'a8000131@xtec.cat', 'Coordinador/a', 0),
(NULL, '08013110', 'Institut Pau Claris', 'pg. de Lluís Companys, 18', 'Barcelona', '932681555', 'a8013110@xtec.cat', 'Coordinador/a', 0);


-- 4. TAULA: professors
INSERT INTO professors (id, user_id, centre_id, nom, cognoms) VALUES
(1, 3, 1, 'Marta', 'Rovira'),
(2, 5, 1, 'Pere', 'López'),
(3, 6, 1, 'Anna', 'Garcia');


-- 5. TAULA: tallers
INSERT INTO tallers (titol, descripcio, sector, modalitat, trimestres_disponibles, places_maximes, places_restants, adreca, ubicacio) VALUES
('Robòtica i IA', 'Disseny i programació de sistemes autònoms.', 'Manufacturer', 'A', '1r, 2n, 3r', 12, 12, 'C/ Tecnologia 12', 'Laboratori 1'),
('Cuina Creativa', 'Taller de gastronomia i restauració.', 'Agroalimentari', 'C', '2n, 3r', 15, 15, 'Mercat de Sants', 'Cuina Central'),
('Energia Solar', 'Muntatge i manteniment de plaques fotovoltaiques.', 'Energètic', 'B', '2n', 10, 10, 'Instal·lacions del centre', 'Taller Extern'),
('Mecànica de Vehicles', 'Manteniment bàsic de motors elèctrics.', 'Manufacturer', 'A', '1r, 3r', 12, 12, 'C/ Motor 5', 'Taller 4'),
('Disseny de Moda', 'Confecció i patronatge industrial.', 'Manufacturer', 'C', '1r, 2n, 3r', 12, 12, 'C/ Estil 22', 'Aula de Disseny');

-- 6. TAULA: peticions
INSERT INTO peticions (id, centre_id) VALUES
(1, 1);

-- 7. TAULA: peticio_detalls
INSERT INTO peticio_detalls (id, peticio_id, taller_id, trimestre, num_participants, prioritat, es_preferencia_referent, estat, descripcio) VALUES
(1, 1, 1, '2n', 4, 2, 1, 'ASSIGNADA', 'Comentari de prova per al taller de Robòtica i IA'),
(2, 1, 2, '2n', 2, 6, 0, 'ASSIGNADA', 'Comentari de prova per al taller de Cuina Creativa');

-- 11. TAULA: referents_assignats
INSERT INTO referents_assignats (peticio_detall_id, professor_id) VALUES
(1, 1),
(2, 3);

-- 12. TAULA: sessions
INSERT INTO sessions (peticio_detall_id, ordre, data) VALUES
(1, 1, '2026-01-15'), (1, 2, '2026-01-22'), (1, 3, '2026-01-29'),
(1, 4, '2026-02-05'), (1, 5, '2026-02-12'), (1, 6, '2026-02-19'),
(1, 7, '2026-02-26'), (1, 8, '2026-03-05'), (1, 9, '2026-03-12'),
(1, 10, '2026-03-19');

-- 14. TAULA: checklist_config
INSERT INTO checklist_config (id, titol_pas, obligatori) VALUES
(1, 'Pujada de documents (Acord Pedagògic, Drets Imatge)', 1),
(2, 'Confirmació de recepció de places', 1),
(3, 'Verificació d horaris quadrats amb professorat', 1),
(4, 'Contacte amb el professorat referent del taller', 0);

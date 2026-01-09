USE enginy_db;

-- 1. TAULA: usuaris
INSERT INTO usuaris (id, email, password, rol, ultim_acces) VALUES
(1, 'admin@ceb.cat', '$2b$10$oH9FPzGcSdBpViK2pRyc2uCmHIf3o/q2LdegjRvvJHcOPHnncxZ0q', 'ADMIN', NOW()),
(2, 'coordinador@escola.cat', 'centre123', 'CENTRE', NOW()),
(3, 'profe.referent@escola.cat', 'profe123', 'PROFESSOR', NOW()),
(4, 'alumne.test@alumne.cat', 'alumne123', 'ALUMNE', NOW());

-- 2. TAULA: administradors
INSERT INTO administradors (user_id, nom, cognoms, carrec) VALUES
(1, 'Admin', 'Sistema ENGINY', 'Tècnic de Gestió Educativa');

-- 3. TAULA: centres
INSERT INTO centres (user_id, codi_centre, nom_centre, adreca, municipi, telefon, email_oficial, nom_coordinador, es_primera_vegada) VALUES
(NULL, '08000131', 'La Presentació', 'c. Pompeu Fabra, 2', 'Arenys de Mar', '937920241', 'a8000131@xtec.cat', 'Coordinador/a', 0),
(NULL, '08000143', 'Santuari de la Mare de Déu del Reboll', 'c. del Reboll, 1', 'Arenys de Mar', '937920152', 'a8000143@xtec.cat', 'Coordinador/a', 0),
(NULL, '08000155', 'Institut Els Tres Turons', 'Riera de la Torre, 45', 'Arenys de Mar', '937922262', 'a8000155@xtec.cat', 'Coordinador/a', 0),
(NULL, '08000210', 'Institut Domènec Perramon', 'av. de les Escoles, s/n', 'Arenys de Munt', '937937415', 'a8000210@xtec.cat', 'Coordinador/a', 0),
(NULL, '08000416', 'Institut de Badia del Vallès', 'av. de la Via Mil·lenària, s/n', 'Badia del Vallès', '937184000', 'a8000416@xtec.cat', 'Coordinador/a', 0),
(NULL, '08000428', 'Institut Federica Montseny', 'c. de l''Alcarria, s/n', 'Badia del Vallès', '937184462', 'a8000428@xtec.cat', 'Coordinador/a', 0),
(NULL, '08000477', 'Badalones', 'c. del Temple, 15', 'Badalona', '933894404', 'a8000477@xtec.cat', 'Coordinador/a', 0),
(NULL, '08000489', 'Col·legi Cultural', 'c. de la Creu, 44', 'Badalona', '933842111', 'a8000489@xtec.cat', 'Coordinador/a', 0),
(NULL, '08000519', 'Dominiques Badalona', 'c. de la Creu, 50', 'Badalona', '933843511', 'a8000519@xtec.cat', 'Coordinador/a', 0),
(NULL, '08000520', 'Escola Gitanjali', 'c. de l''Ermita de Sant de la Salut, s/n', 'Badalona', '933835612', 'a8000520@xtec.cat', 'Coordinador/a', 0),
(NULL, '08000544', 'Escola Jungfrau', 'c. de Baldomer Sola, 58', 'Badalona', '933877960', 'a8000544@xtec.cat', 'Coordinador/a', 0),
(NULL, '08000568', 'Maristes Champagnat', 'c. de la Riera de Mataró, 6', 'Badalona', '933843011', 'a8000568@xtec.cat', 'Coordinador/a', 0),
(NULL, '08000581', 'Col·legi Mare de Déu de l''Assumpció', 'c. de l''Olivera de Sistrells, 19', 'Badalona', '933877855', 'a8000581@xtec.cat', 'Coordinador/a', 0),
(NULL, '08000593', 'Mare de Déu del Roser', 'c. de Sant Bru, 107', 'Badalona', '933841662', 'a8000593@xtec.cat', 'Coordinador/a', 0),
(NULL, '08000601', 'Minguella', 'c. de l''Esglesia, 71', 'Badalona', '933842361', 'a8000601@xtec.cat', 'Coordinador/a', 0),
(NULL, '08000623', 'Nostra Senyora de Montserrat', 'c. de Sant Bru, 31', 'Badalona', '933841202', 'a8000623@xtec.cat', 'Coordinador/a', 0),
(NULL, '08000647', 'Escola Planas i Casals', 'c. de l''Olivera de Sistrells, 34', 'Badalona', '933833211', 'a8000647@xtec.cat', 'Coordinador/a', 0),
(NULL, '08000660', 'Sant Andreu', 'c. de la Riera de Mataró, 2', 'Badalona', '933843361', 'a8000660@xtec.cat', 'Coordinador/a', 0),
(NULL, '08000684', 'Sant Benet', 'c. de Quintana Alta, 1', 'Badalona', '933890855', 'a8000684@xtec.cat', 'Coordinador/a', 0),
(NULL, '08000696', 'Santíssima Trinitat', 'c. de Guifré, 276', 'Badalona', '933880461', 'a8000696@xtec.cat', 'Coordinador/a', 0),
(NULL, '08000726', 'Institut Isaac Albéniz', 'av. de Martí Pujol, 42', 'Badalona', '933845612', 'a8000726@xtec.cat', 'Coordinador/a', 0),
(NULL, '08000738', 'Institut La Llauna', 'c. de Sagunt, 5', 'Badalona', '933840715', 'a8000738@xtec.cat', 'Coordinador/a', 0),
(NULL, '08000741', 'Institut Eugeni d''Ors', 'av. de la Mare de Déu de Lorda, s/n', 'Badalona', '933833511', 'a8000741@xtec.cat', 'Coordinador/a', 0),
(NULL, '08000751', 'Institut Pompeu Fabra', 'c. de l''Olivera de Sistrells, 44', 'Badalona', '933887011', 'a8000751@xtec.cat', 'Coordinador/a', 0),
(NULL, '08000763', 'Institut Pau Casals', 'av. de la Cerdanya, s/n', 'Badalona', '933878700', 'a8000763@xtec.cat', 'Coordinador/a', 0),
(NULL, '08000842', 'Institut Badalona VII', 'av. de la Cerdanya, s/n', 'Badalona', '933873315', 'a8000842@xtec.cat', 'Coordinador/a', 0),
(NULL, '08000854', 'Institut Barres i Ones', 'av. de la Cerdanya, s/n', 'Badalona', '933830951', 'a8000854@xtec.cat', 'Coordinador/a', 0),
(NULL, '08000866', 'Institut La Riera', 'c. de la Riera de Mataró, s/n', 'Badalona', '933874751', 'a8000866@xtec.cat', 'Coordinador/a', 0),
(NULL, '08000921', 'Institut Llavaneres', 'c. de l''Olivera de Sistrells, s/n', 'Sant Andreu de Llavaneres', '937926152', 'a8000921@xtec.cat', 'Coordinador/a', 0),
(NULL, '08000933', 'Institut d''Argentona', 'c. del Torrent de la Pólvora, s/n', 'Argentona', '937971052', 'a8000933@xtec.cat', 'Coordinador/a', 0),
(NULL, '08001317', 'La Presentació', 'c. de la Riera de Mataró, 2', 'Arenys de Mar', '937920152', 'a8001317@xtec.cat', 'Coordinador/a', 0),
(NULL, '08001408', 'Institut El Vern', 'c. de la Pau, s/n', 'Lliçà de Vall', '938445011', 'a8001408@xtec.cat', 'Coordinador/a', 0),
(NULL, '08001421', 'Institut de Llinars del Vallès', 'av. de las Escolas, s/n', 'Llinars del Vallès', '938411011', 'a8001421@xtec.cat', 'Coordinador/a', 0),
(NULL, '08001433', 'Institut El Castell', 'c. de l''Olivera, s/n', 'Esparreguera', '937775011', 'a8001433@xtec.cat', 'Coordinador/a', 0),
(NULL, '08001500', 'Institut de Malgrat de Mar', 'av. de las Escolas, s/n', 'Malgrat de Mar', '937610011', 'a8001500@xtec.cat', 'Coordinador/a', 0),
(NULL, '08001524', 'Institut de Martorell', 'av. de la Via Mil·lenària, s/n', 'Martorell', '937750011', 'a8001524@xtec.cat', 'Coordinador/a', 0),
(NULL, '08001536', 'Institut Joan Oró', 'av. de las Escolas, s/n', 'Martorell', '937750111', 'a8001536@xtec.cat', 'Coordinador/a', 0),
(NULL, '08001548', 'Institut Pompeu Fabra', 'av. de las Escolas, s/n', 'Martorell', '937750211', 'a8001548@xtec.cat', 'Coordinador/a', 0),
(NULL, '08002012', 'Institut de Masquefa', 'av. de las Escolas, s/n', 'Masquefa', '937725011', 'a8002012@xtec.cat', 'Coordinador/a', 0),
(NULL, '08002115', 'Institut Miquel Biada', 'av. de las Escolas, s/n', 'Mataró', '937905011', 'a8002115@xtec.cat', 'Coordinador/a', 0),
(NULL, '08002127', 'Institut Alexandre Satorras', 'av. de las Escolas, s/n', 'Mataró', '937905111', 'a8002127@xtec.cat', 'Coordinador/a', 0),
(NULL, '08002139', 'Institut Josep Puig i Cadafalch', 'av. de las Escolas, s/n', 'Mataró', '937905211', 'a8002139@xtec.cat', 'Coordinador/a', 0),
(NULL, '08002140', 'Institut Damià Campeny', 'av. de las Escolas, s/n', 'Mataró', '937905311', 'a8002140@xtec.cat', 'Coordinador/a', 0),
(NULL, '08013110', 'Institut Pau Claris', 'pg. de Lluís Companys, 18', 'Barcelona', '932681555', 'a8013110@xtec.cat', 'Coordinador/a', 0),
(NULL, '08013122', 'Institut Jaume Balmes', 'c. de Pau Claris, 121', 'Barcelona', '934870000', 'a8013122@xtec.cat', 'Coordinador/a', 0),
(NULL, '08013134', 'Institut Milà i Fontanals', 'c. del Carme, 40', 'Barcelona', '934410111', 'a8013134@xtec.cat', 'Coordinador/a', 0),
(NULL, '08013146', 'Institut Verdaguer', 'c. de Pujades, 1', 'Barcelona', '932210111', 'a8013146@xtec.cat', 'Coordinador/a', 0),
(NULL, '08013158', 'Institut Ernest Lluch', 'c. de Diputació, 11', 'Barcelona', '934230111', 'a8013158@xtec.cat', 'Coordinador/a', 0),
(NULL, '08013160', 'Institut Joan d''Àustria', 'c. de la Selva de Mar, 177', 'Barcelona', '932660111', 'a8013160@xtec.cat', 'Coordinador/a', 0),
(NULL, '08013172', 'Institut Infanta Isabel d''Aragó', 'c. de la Selva de Mar, 175', 'Barcelona', '932660211', 'a8013172@xtec.cat', 'Coordinador/a', 0),
(NULL, '08013214', 'Institut Sant Andreu', 'c. de la Riera de Sant Andreu, 55', 'Barcelona', '933110111', 'a8013214@xtec.cat', 'Coordinador/a', 0),
(NULL, '08013226', 'Institut L''Alzina', 'c. de la Riera de Sant Andreu, 57', 'Barcelona', '933110211', 'a8013226@xtec.cat', 'Coordinador/a', 0),
(NULL, '08013238', 'Institut Francisco de Goya', 'c. de Pintor Alsamora, 13', 'Barcelona', '933500111', 'a8013238@xtec.cat', 'Coordinador/a', 0),
(NULL, '08013240', 'Institut Vall d''Hebron', 'pg. de la Vall d''Hebron, 93', 'Barcelona', '934270111', 'a8013240@xtec.cat', 'Coordinador/a', 0),
(NULL, '08013252', 'Institut Narcís Monturiol', 'c. de Menorca, 1', 'Barcelona', '933070111', 'a8013252@xtec.cat', 'Coordinador/a', 0),
(NULL, '08013264', 'Institut Josep Pla', 'c. de Torrent de Can Carabassa, 31', 'Barcelona', '934270211', 'a8013264@xtec.cat', 'Coordinador/a', 0),
(NULL, '08013276', 'Institut Joan Coromines', 'c. de la Carretera de Ribes, s/n', 'Barcelona', '933590111', 'a8013276@xtec.cat', 'Coordinador/a', 0),
(NULL, '08013288', 'Institut Ferran Tallada', 'c. de Gran Vista, 54', 'Barcelona', '932100111', 'a8013288@xtec.cat', 'Coordinador/a', 0),
(NULL, '08013290', 'Institut Lluís Vives', 'c. de Canalejas, 107', 'Barcelona', '933310111', 'a8013290@xtec.cat', 'Coordinador/a', 0),
(NULL, '08013306', 'Institut Les Corts', 'c. de Travessera de les Corts, 131', 'Barcelona', '934900111', 'a8013306@xtec.cat', 'Coordinador/a', 0),
(NULL, '08013318', 'Institut Montserrat', 'c. de Copèrnic, 84', 'Barcelona', '932010111', 'a8013318@xtec.cat', 'Coordinador/a', 0),
(NULL, '08013320', 'Institut Menéndez y Pelayo', 'via Augusta, 140', 'Barcelona', '932010211', 'a8013320@xtec.cat', 'Coordinador/a', 0),
(NULL, '08013332', 'Institut Vila de Gràcia', 'c. de la Riera de Sant Miquel, 29', 'Barcelona', '932180111', 'a8013332@xtec.cat', 'Coordinador/a', 0),
(NULL, '08013344', 'Institut Baldiri Guilera', 'av. de las Escolas, s/n', 'El Prat de Llobregat', '933700111', 'a8013344@xtec.cat', 'Coordinador/a', 0),
(NULL, '08013356', 'Institut Estany de la Ricarda', 'av. de las Escolas, s/n', 'El Prat de Llobregat', '933700211', 'a8013356@xtec.cat', 'Coordinador/a', 0),
(NULL, '08013368', 'Institut Salvador Dalí', 'av. de las Escolas, s/n', 'El Prat de Llobregat', '933700311', 'a8013368@xtec.cat', 'Coordinador/a', 0),
(NULL, '08013370', 'Institut Ribera Baixa', 'av. de las Escolas, s/n', 'El Prat de Llobregat', '933700411', 'a8013370@xtec.cat', 'Coordinador/a', 0),
(NULL, '08013382', 'Institut Les Salines', 'av. de las Escolas, s/n', 'El Prat de Llobregat', '933700511', 'a8013382@xtec.cat', 'Coordinador/a', 0),
(NULL, '08013394', 'Institut Torre del Palau', 'av. de las Escolas, s/n', 'Terrassa', '937880111', 'a8013394@xtec.cat', 'Coordinador/a', 0),
(NULL, '08013400', 'Institut Blanxart', 'av. de las Escolas, s/n', 'Terrassa', '937880211', 'a8013400@xtec.cat', 'Coordinador/a', 0),
(NULL, '08013412', 'Institut Montserrat Roig', 'av. de las Escolas, s/n', 'Terrassa', '937880311', 'a8013412@xtec.cat', 'Coordinador/a', 0),
(NULL, '08013424', 'Institut Nicolau Copèrnic', 'av. de las Escolas, s/n', 'Terrassa', '937880411', 'a8013424@xtec.cat', 'Coordinador/a', 0),
(NULL, '08013436', 'Institut Terrassa', 'av. de las Escolas, s/n', 'Terrassa', '937880511', 'a8013436@xtec.cat', 'Coordinador/a', 0),
(NULL, '08013448', 'Institut Can Jofresa', 'av. de las Escolas, s/n', 'Terrassa', '937880611', 'a8013448@xtec.cat', 'Coordinador/a', 0),
(NULL, '08013450', 'Institut Ègara', 'av. de las Escolas, s/n', 'Terrassa', '937880711', 'a8013450@xtec.cat', 'Coordinador/a', 0),
(NULL, '08013461', 'Institut Cavall Bernat', 'av. de las Escolas, s/n', 'Terrassa', '937880811', 'a8013461@xtec.cat', 'Coordinador/a', 0),
(NULL, '08013473', 'Institut Investigador Blanxart', 'av. de las Escolas, s/n', 'Terrassa', '937880911', 'a8013473@xtec.cat', 'Coordinador/a', 0),
(NULL, '08013485', 'Institut Les Aimerigues', 'av. de las Escolas, s/n', 'Terrassa', '937881011', 'a8013485@xtec.cat', 'Coordinador/a', 0),
(NULL, '08013497', 'Institut Can Roca', 'av. de las Escolas, s/n', 'Terrassa', '937881111', 'a8013497@xtec.cat', 'Coordinador/a', 0),
(NULL, '08013503', 'Institut Mont Perdut', 'av. de las Escolas, s/n', 'Terrassa', '937881211', 'a8013503@xtec.cat', 'Coordinador/a', 0),
(NULL, '08013515', 'Institut Viladecavalls', 'av. de las Escolas, s/n', 'Viladecavalls', '937885011', 'a8013515@xtec.cat', 'Coordinador/a', 0),
(NULL, '08013527', 'Institut de Viladecans', 'av. de las Escolas, s/n', 'Viladecans', '936580111', 'a8013527@xtec.cat', 'Coordinador/a', 0),
(NULL, '08013539', 'Institut Torre Roja', 'av. de las Escolas, s/n', 'Viladecans', '936580211', 'a8013539@xtec.cat', 'Coordinador/a', 0),
(NULL, '08013540', 'Institut Sales de Viladecans', 'av. de las Escolas, s/n', 'Viladecans', '936580311', 'a8013540@xtec.cat', 'Coordinador/a', 0),
(NULL, '08013552', 'Institut Miramar', 'av. de las Escolas, s/n', 'Viladecans', '936580411', 'a8013552@xtec.cat', 'Coordinador/a', 0),
(NULL, '08013564', 'Institut Josefina Castellví', 'av. de las Escolas, s/n', 'Viladecans', '936580511', 'a8013564@xtec.cat', 'Coordinador/a', 0),
(NULL, '08013576', 'Institut de Vilanova i la Geltrú', 'av. de las Escolas, s/n', 'Vilanova i la Geltrú', '938930111', 'a8013576@xtec.cat', 'Coordinador/a', 0),
(NULL, '08013588', 'Institut Manuel de Cabanyes', 'av. de las Escolas, s/n', 'Vilanova i la Geltrú', '938930211', 'a8013588@xtec.cat', 'Coordinador/a', 0),
(NULL, '08013590', 'Institut Joaquim Mir', 'av. de las Escolas, s/n', 'Vilanova i la Geltrú', '938930311', 'a8013590@xtec.cat', 'Coordinador/a', 0),
(NULL, '08013606', 'Institut Lluch i Rafecas', 'av. de las Escolas, s/n', 'Vilanova i la Geltrú', '938930411', 'a8013606@xtec.cat', 'Coordinador/a', 0),
(NULL, '08013618', 'Institut Baix a Mar', 'av. de las Escolas, s/n', 'Vilanova i la Geltrú', '938930511', 'a8013618@xtec.cat', 'Coordinador/a', 0),
(NULL, '08013620', 'Institut Viladecans IV', 'av. de las Escolas, s/n', 'Viladecans', '936580611', 'a8013620@xtec.cat', 'Coordinador/a', 0);

-- 4. TAULA: professors
INSERT INTO professors (user_id, centre_id, nom, cognoms) VALUES
(3, 1, 'Marta', 'Rovira');

-- 5. TAULA: tallers
INSERT INTO tallers (titol, descripcio, sector, modalitat, trimestres_disponibles, places_maximes, adreca, ubicacio) VALUES
('Robòtica i IA', 'Disseny i programació de sistemes autònoms.', 'Manufacturer', 'A', '1r, 2n, 3r', 12, 'C/ Tecnologia 12', 'Laboratori 1'),
('Cuina Creativa', 'Taller de gastronomia i restauració.', 'Agroalimentari', 'C', '2n, 3r', 15, 'Mercat de Sants', 'Cuina Central'),
('Energia Solar', 'Muntatge i manteniment de plaques fotovoltaiques.', 'Energètic', 'B', '2n', 10, 'Instal·lacions del centre', 'Taller Extern'),
('Mecànica de Vehicles', 'Manteniment bàsic de motors elèctrics.', 'Manufacturer', 'A', '1r, 3r', 12, 'C/ Motor 5', 'Taller 4'),
('Disseny de Moda', 'Confecció i patronatge industrial.', 'Manufacturer', 'C', '1r, 2n, 3r', 12, 'C/ Estil 22', 'Aula de Disseny');

-- 6. TAULA: peticions
INSERT INTO peticions (id, centre_id, trimestre, disponibilitat_dimarts, estat) VALUES
(1, 1, '2n', 1, 'ASSIGNADA');

-- 7. TAULA: peticio_detalls
INSERT INTO peticio_detalls (peticio_id, taller_id, num_alumnes, es_preferencia_referent) VALUES
(1, 1, 4, 1),
(1, 2, 2, 0);

-- 8. TAULA: assignacions_tallers
INSERT INTO assignacions_tallers (id, taller_id, trimestre, curs_academic, torn, estat) VALUES
(1, 1, '2n', '2025-2026', 'Mati 1', 'ACTIU');

-- 9. TAULA: alumnes
INSERT INTO alumnes (id, idalu, nom, cognoms, centre_id, curs_actual) VALUES
(1, 'ALU001', 'Marc', 'Vila', 1, '3r ESO'),
(2, 'ALU002', 'Laia', 'Sanz', 1, '4t ESO');

-- 10. TAULA: assignacions_alumnes
INSERT INTO assignacions_alumnes (alumne_id, assignacio_taller_id) VALUES
(1, 1),
(2, 1);

-- 11. TAULA: referents_assignats
INSERT INTO referents_assignats (assignacio_taller_id, professor_id) VALUES
(1, 1);

-- 12. TAULA: sessions
INSERT INTO sessions (assignacio_taller_id, ordre, data) VALUES
(1, 1, '2026-01-15'), (1, 2, '2026-01-22'), (1, 3, '2026-01-29'),
(1, 4, '2026-02-05'), (1, 5, '2026-02-12'), (1, 6, '2026-02-19'),
(1, 7, '2026-02-26'), (1, 8, '2026-03-05'), (1, 9, '2026-03-12'),
(1, 10, '2026-03-19');

-- 14. TAULA: checklist_config
INSERT INTO checklist_config (titol_pas, obligatori) VALUES
('Pujada de documents (Acord Pedagògic, Drets Imatge)', 1),
('Confirmació de recepció de places', 1),
('Verificació d horaris quadrats amb professorat', 1),
('Contacte amb el professorat referent del taller', 0);

-- 16. TAULA: enquestes
INSERT INTO enquestes (titol, destinatari) VALUES
('Avaluació Final Alumne', 'ALUMNE'),
('Avaluació Professor sobre Alumnat', 'PROFESSOR'),
('Satisfacció del Centre', 'CENTRE');

-- 17. TAULA: preguntes
INSERT INTO preguntes (enquesta_id, text_pregunta, tipus) VALUES
(1, 'Valora la teva satisfacció general del taller del 1 al 10.', 'LIKERT_1_10'),
(1, 'T ha ajudat el taller a decidir el teu itinerari futur?', 'OBERTA'),
(2, 'Valora la puntualitat de l alumne.', 'LIKERT_1_10'),
(2, 'Capacitat de treball en equipo observada.', 'LIKERT_1_10'),
(3, 'L organització logística del Consorci ha estat correcta?', 'MULTIPLE');

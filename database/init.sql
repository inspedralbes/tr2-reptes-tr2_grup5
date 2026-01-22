-- Estructura de la base de datos para MySQL

CREATE DATABASE IF NOT EXISTS enginy_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE enginy_db;

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Taula: usuaris
CREATE TABLE IF NOT EXISTS usuaris (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol ENUM('ADMIN', 'CENTRE', 'PROFESSOR') NOT NULL,
    magic_token VARCHAR(255) NULL,
    ultim_acces DATETIME NULL
) ENGINE=InnoDB;

-- 2. Taula: administradors
CREATE TABLE IF NOT EXISTS administradors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    nom VARCHAR(100),
    cognoms VARCHAR(100),
    carrec VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES usuaris(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. Taula: centres
CREATE TABLE IF NOT EXISTS centres (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    codi_centre VARCHAR(50) UNIQUE NOT NULL,
    nom_centre VARCHAR(255) NOT NULL,
    adreca VARCHAR(255),
    municipi VARCHAR(100),
    telefon VARCHAR(20),
    email_oficial VARCHAR(255),
    nom_coordinador VARCHAR(255),
    es_primera_vegada TINYINT(1) DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES usuaris(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 4. Taula: professors
CREATE TABLE IF NOT EXISTS professors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    centre_id INT NOT NULL,
    nom VARCHAR(100),
    cognoms VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES usuaris(id) ON DELETE CASCADE,
    FOREIGN KEY (centre_id) REFERENCES centres(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. Taula: tallers
CREATE TABLE IF NOT EXISTS tallers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titol VARCHAR(255) NOT NULL,
    descripcio TEXT,
    sector VARCHAR(100),
    modalitat ENUM('A', 'B', 'C'),
    trimestres_disponibles VARCHAR(50),
    places_maximes INT DEFAULT 12,
    places_restants INT DEFAULT 12,
    adreca VARCHAR(255),
    ubicacio VARCHAR(255),
    actiu TINYINT(1) DEFAULT 1
) ENGINE=InnoDB;

-- 6. Taula: peticions
CREATE TABLE IF NOT EXISTS peticions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    centre_id INT NOT NULL,
    trimestre ENUM('2n', '3r'),
    disponibilitat_dimarts TINYINT(1) DEFAULT 0,
    comentaris TEXT NULL,
    data_creacio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (centre_id) REFERENCES centres(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. Taula: peticio_detalls (Ara actua com a Assignació)
CREATE TABLE IF NOT EXISTS peticio_detalls (
    id INT AUTO_INCREMENT PRIMARY KEY,
    peticio_id INT NOT NULL,
    taller_id INT NOT NULL,
    num_participants INT NOT NULL,
    prioritat INT CHECK (prioritat IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10)),
    es_preferencia_referent TINYINT(1) DEFAULT 0,
    docent_nom VARCHAR(255),
    docent_email VARCHAR(255),
    estat ENUM('PENDENT', 'ASSIGNADA', 'REBUTJADA') DEFAULT 'PENDENT',
    UNIQUE KEY (peticio_id, taller_id),
    FOREIGN KEY (peticio_id) REFERENCES peticions(id) ON DELETE CASCADE,
    FOREIGN KEY (taller_id) REFERENCES tallers(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 11. Taula: referents_assignats (Vinculats al detall de petició)
CREATE TABLE IF NOT EXISTS referents_assignats (
    peticio_detall_id INT NOT NULL,
    professor_id INT NOT NULL,
    PRIMARY KEY (peticio_detall_id, professor_id),
    FOREIGN KEY (peticio_detall_id) REFERENCES peticio_detalls(id) ON DELETE CASCADE,
    FOREIGN KEY (professor_id) REFERENCES professors(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 12. Taula: sessions (Vinculades al detall de petició)
CREATE TABLE IF NOT EXISTS sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    peticio_detall_id INT NOT NULL,
    ordre INT,
    data DATE,
    FOREIGN KEY (peticio_detall_id) REFERENCES peticio_detalls(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 13. Taula: checklist_config
CREATE TABLE IF NOT EXISTS checklist_config (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titol_pas VARCHAR(255) NOT NULL,
    obligatori TINYINT(1) DEFAULT 1
) ENGINE=InnoDB;

-- 14. Taula: checklist_respostes (Vinculades al detall de petició)
CREATE TABLE IF NOT EXISTS checklist_respostes (
    peticio_detall_id INT NOT NULL,
    checklist_config_id INT NOT NULL,
    completat TINYINT(1) DEFAULT 0,
    PRIMARY KEY (peticio_detall_id, checklist_config_id),
    FOREIGN KEY (peticio_detall_id) REFERENCES peticio_detalls(id) ON DELETE CASCADE,
    FOREIGN KEY (checklist_config_id) REFERENCES checklist_config(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 15. Taula: logs_auditoria
CREATE TABLE IF NOT EXISTS logs_auditoria (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuari_id INT NULL,
    accio VARCHAR(255),
    taula_afectada VARCHAR(100),
    valor_anterior TEXT NULL,
    valor_nou TEXT NULL,
    data_registre TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuari_id) REFERENCES usuaris(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 21. Taula: solicituds_registre
CREATE TABLE IF NOT EXISTS solicituds_registre (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codi_centre VARCHAR(50),
    nom_centre ENUM('Institut Pedralbes', 'Institut Tecnològic de Barcelona', 'Institut TIC de Barcelona', 'Altres') DEFAULT 'Altres',
    nom_centre_manual VARCHAR(255),
    password VARCHAR(255),
    adreca VARCHAR(255),
    municipi VARCHAR(100),
    telefon VARCHAR(20),
    email_centre VARCHAR(255),
    nom_coordinador VARCHAR(255),
    email_coordinador VARCHAR(255),
    es_primera_vegada TINYINT(1) DEFAULT 0,
    estat ENUM('pendent', 'acceptada', 'rebutjada') DEFAULT 'pendent',
    data_enviament TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;

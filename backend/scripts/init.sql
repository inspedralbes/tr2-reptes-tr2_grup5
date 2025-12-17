CREATE DATABASE IF NOT EXISTS enginy_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE enginy_db;

SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS Tallers (
    id_taller INT AUTO_INCREMENT PRIMARY KEY,
    titol VARCHAR(255) NOT NULL,
    descripcio TEXT,
    ambit VARCHAR(100),
    modalitat ENUM('A', 'B', 'C') NOT NULL,
    places_min INT DEFAULT 0,
    places_max INT DEFAULT 0,
    adreca_realitzacio VARCHAR(255),
    imatge_url VARCHAR(255)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Centres (
    id_centre INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    id_responsable INT,
    correu VARCHAR(255),
    ubicacio VARCHAR(255),
    es_primera_vegada BOOLEAN DEFAULT FALSE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Usuaris (
    id_usuari INT AUTO_INCREMENT PRIMARY KEY,
    id_centre INT,
    nom VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol ENUM('Admin', 'Centre', 'Professor') NOT NULL,
    imatge_url VARCHAR(255),
    CONSTRAINT fk_usuaris_centre FOREIGN KEY (id_centre)
        REFERENCES Centres(id_centre) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Sollicituds (
    id_sollicitud INT AUTO_INCREMENT PRIMARY KEY,
    id_centre INT NOT NULL,
    id_taller INT NOT NULL,
    data_peticio DATE DEFAULT (CURRENT_DATE),
    trimestre ENUM('1r', '2n', '3r'),
    num_alumnes INT DEFAULT 0,
    es_preferencia_referent BOOLEAN DEFAULT FALSE,
    dia_preferencia VARCHAR(50),
    data_execucio DATE,
    estat ENUM('Pendent', 'Assignada', 'Rebutjada', 'Realitzada') DEFAULT 'Pendent',
    comentaris TEXT,
    checklist_validacio VARCHAR(255),
    CONSTRAINT fk_sollicituds_centre FOREIGN KEY (id_centre)
        REFERENCES Centres(id_centre) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_sollicituds_taller FOREIGN KEY (id_taller)
        REFERENCES Tallers(id_taller) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Assignacions (
    id_assignacio INT AUTO_INCREMENT PRIMARY KEY,
    id_sollicitud INT NOT NULL,
    id_professor INT NOT NULL,
    CONSTRAINT fk_assignacions_sollicitud FOREIGN KEY (id_sollicitud)
        REFERENCES Sollicituds(id_sollicitud) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_assignacions_professor FOREIGN KEY (id_professor)
        REFERENCES Usuaris(id_usuari) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Avaluacions (
    id_avaluacio INT AUTO_INCREMENT PRIMARY KEY,
    id_sollicitud INT NOT NULL,
    id_usuari INT NOT NULL,
    respostes_enquesta JSON,
    CONSTRAINT fk_avaluacions_sollicitud FOREIGN KEY (id_sollicitud)
        REFERENCES Sollicituds(id_sollicitud) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_avaluacions_usuari FOREIGN KEY (id_usuari)
        REFERENCES Usuaris(id_usuari) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

ALTER TABLE Centres
ADD CONSTRAINT fk_centres_responsable
    FOREIGN KEY (id_responsable)
    REFERENCES Usuaris(id_usuari)
    ON DELETE SET NULL
    ON UPDATE CASCADE;

SET FOREIGN_KEY_CHECKS = 1;
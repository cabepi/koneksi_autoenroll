CREATE SCHEMA IF NOT EXISTS koneksi_autoenroll;

CREATE TABLE koneksi_autoenroll.medical_specialties (
 slug varchar(128) NOT NULL,
 fallback_name varchar(128) NOT NULL,
 enabled bool NOT NULL,
 created_at timestamp DEFAULT (now() at time zone 'America/Santo_Domingo') NOT NULL,
 created_by varchar(128) NOT NULL,
 updated_at timestamp NULL,
 updated_by varchar(128) NULL,
 CONSTRAINT medical_specialties_pk PRIMARY KEY (slug)
);
CREATE UNIQUE INDEX medical_specialties_idx_1 ON koneksi_autoenroll.medical_specialties USING btree (fallback_name);

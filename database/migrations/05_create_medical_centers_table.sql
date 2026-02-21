CREATE TABLE koneksi_autoenroll.medical_centers (
	id bigserial NOT NULL,
	province varchar(50) NOT NULL,
	name varchar(150) NOT NULL,
	address varchar(150) NOT NULL,
	phone varchar(150) NULL,
	city varchar(150) NULL,
	sector varchar(150) NULL,
	"uuid" uuid NULL,
	CONSTRAINT medical_centers_pkey PRIMARY KEY (id),
	CONSTRAINT medical_centers_province_name_address_key UNIQUE (province, name, address)
);

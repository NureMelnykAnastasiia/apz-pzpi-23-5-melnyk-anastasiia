--
-- PostgreSQL database dump
--

\restrict vuejXAT6h0IDzqKLqLjJ1vRSH1Bnouw41rLOFRw3rwbzOXgxvxZBVLBSe9N0b56

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: plant_health_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.plant_health_status AS ENUM (
    'HEALTHY',
    'NEEDS_ATTENTION',
    'CRITICAL'
);


ALTER TYPE public.plant_health_status OWNER TO postgres;

--
-- Name: reading_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.reading_type AS ENUM (
    'SOIL_MOISTURE',
    'AIR_TEMPERATURE',
    'AIR_HUMIDITY',
    'LIGHT_INTENSITY',
    'BATTERY_LEVEL'
);


ALTER TYPE public.reading_type OWNER TO postgres;

--
-- Name: task_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.task_status AS ENUM (
    'PENDING',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
    'SKIPPED'
);


ALTER TYPE public.task_status OWNER TO postgres;

--
-- Name: task_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.task_type AS ENUM (
    'WATERING',
    'FERTILIZING',
    'LIGHT_ADJUSTMENT',
    'PEST_CONTROL',
    'CLEANING'
);


ALTER TYPE public.task_type OWNER TO postgres;

--
-- Name: user_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_role AS ENUM (
    'ADMIN',
    'OFFICE_MANAGER',
    'FLORIST',
    'CLEANER'
);


ALTER TYPE public.user_role OWNER TO postgres;

--
-- Name: complete_task_on_log(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.complete_task_on_log() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.task_id IS NOT NULL THEN
        UPDATE care_tasks
        SET status = 'COMPLETED',
            updated_at = NOW()
        WHERE id = NEW.task_id;
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.complete_task_on_log() OWNER TO postgres;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: care_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.care_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    task_id uuid,
    plant_id uuid NOT NULL,
    type public.task_type NOT NULL,
    performed_by_user_id uuid,
    notes text,
    verified_by_scan boolean DEFAULT false,
    performed_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.care_logs OWNER TO postgres;

--
-- Name: care_tasks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.care_tasks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    plant_id uuid,
    required_role public.user_role NOT NULL,
    type public.task_type NOT NULL,
    priority integer DEFAULT 1,
    description text,
    due_date timestamp with time zone,
    status public.task_status DEFAULT 'PENDING'::public.task_status,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.care_tasks OWNER TO postgres;

--
-- Name: iot_sensors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.iot_sensors (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    mac_address character varying(50) NOT NULL,
    plant_id uuid,
    sensor_model character varying(50),
    firmware_version character varying(20),
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.iot_sensors OWNER TO postgres;

--
-- Name: locations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.locations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    floor_number integer,
    description text,
    map_image_url text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.locations OWNER TO postgres;

--
-- Name: plant_species; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.plant_species (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    scientific_name character varying(150) NOT NULL,
    common_name character varying(150) NOT NULL,
    description text,
    min_soil_moisture double precision NOT NULL,
    max_soil_moisture double precision NOT NULL,
    min_temperature double precision,
    max_temperature double precision,
    min_light_lux double precision,
    max_light_lux double precision,
    watering_frequency_days integer,
    fertilizing_frequency_days integer,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.plant_species OWNER TO postgres;

--
-- Name: plants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.plants (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100),
    qr_code_id character varying(100) NOT NULL,
    species_id uuid,
    location_id uuid,
    map_x_coordinate integer,
    map_y_coordinate integer,
    health_status public.plant_health_status DEFAULT 'HEALTHY'::public.plant_health_status,
    photo_url text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.plants OWNER TO postgres;

--
-- Name: sensor_readings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sensor_readings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    sensor_id uuid,
    type public.reading_type NOT NULL,
    value numeric(10,2) NOT NULL,
    recorded_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.sensor_readings OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    full_name character varying(100) NOT NULL,
    role public.user_role DEFAULT 'CLEANER'::public.user_role,
    telegram_chat_id character varying(50),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Data for Name: care_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.care_logs (id, task_id, plant_id, type, performed_by_user_id, notes, verified_by_scan, performed_at) FROM stdin;
43f49b5d-ad61-4c2b-b889-0e10d83e065a	0b218465-0a7c-4dc8-8fce-87736ffcdf49	a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d	WATERING	d5e6f7a8-b9c0-1d2e-3f4a-5b6c7d8e9f0a	\N	f	2025-12-31 17:04:09.09+02
\.


--
-- Data for Name: care_tasks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.care_tasks (id, plant_id, required_role, type, priority, description, due_date, status, created_at, updated_at) FROM stdin;
0b218465-0a7c-4dc8-8fce-87736ffcdf49	a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d	CLEANER	WATERING	3	⚠️ ТЕПЛОВИЙ УДАР! Температура 45.5°C вище норми (28°C). Рослина перегрівається.	2025-12-31 16:07:01.714+02	COMPLETED	2025-12-31 16:07:01.717679+02	2025-12-31 17:04:09.089958+02
\.


--
-- Data for Name: iot_sensors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.iot_sensors (id, mac_address, plant_id, sensor_model, firmware_version, is_active, created_at) FROM stdin;
6f3d2c8e-4c6a-4c9e-9b0e-0a4c7f5a91d1	AA:00:00:00:00:01	a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d	Soil-Probe-X1	\N	t	2025-12-31 15:14:25.762359+02
a91b7d44-1b8e-42ff-8a67-2f1f3e6c0c52	AA:00:00:00:00:02	a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d	Air-Temp-Pro	\N	t	2025-12-31 15:14:25.762359+02
d2e8c6b1-9f4a-47d9-9c53-7a2b0e4f8d6e	AA:00:00:00:00:03	a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d	Humid-Sensor-V2	\N	t	2025-12-31 15:14:25.762359+02
4b7f9e12-3c8a-4f6e-b2a1-9e5d0c7a8f34	AA:00:00:00:00:04	a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d	Lux-Meter-3000	\N	t	2025-12-31 15:14:25.762359+02
\.


--
-- Data for Name: locations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.locations (id, name, floor_number, description, map_image_url, created_at, updated_at) FROM stdin;
4f9b8d20-5c6a-4d3b-9e1f-2a8c7d6b5e4a	Open Space South	3	Сонячна сторона	http://maps.com/floor3.jpg	2025-12-31 15:14:25.762359+02	2025-12-31 15:14:25.762359+02
\.


--
-- Data for Name: plant_species; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.plant_species (id, scientific_name, common_name, description, min_soil_moisture, max_soil_moisture, min_temperature, max_temperature, min_light_lux, max_light_lux, watering_frequency_days, fertilizing_frequency_days, created_at) FROM stdin;
b1c2d3e4-f5a6-7b8c-9d0e-1f2a3b4c5d6e	Ficus elastica	Фікус Каучуконосний	\N	30	70	15	28	1000	5000	7	30	2025-12-31 15:14:25.762359+02
\.


--
-- Data for Name: plants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.plants (id, name, qr_code_id, species_id, location_id, map_x_coordinate, map_y_coordinate, health_status, photo_url, created_at, updated_at) FROM stdin;
a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d	Великий Фікус (Test Plant)	QR-001	b1c2d3e4-f5a6-7b8c-9d0e-1f2a3b4c5d6e	4f9b8d20-5c6a-4d3b-9e1f-2a8c7d6b5e4a	\N	\N	HEALTHY	\N	2025-12-31 15:14:25.762359+02	2025-12-31 15:14:25.762359+02
\.


--
-- Data for Name: sensor_readings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sensor_readings (id, sensor_id, type, value, recorded_at) FROM stdin;
7287078c-7509-411a-a2da-f80f4e506592	a91b7d44-1b8e-42ff-8a67-2f1f3e6c0c52	AIR_TEMPERATURE	45.50	2025-12-31 15:57:51.361+02
a96abe6c-f783-4c4f-b937-179f66523805	a91b7d44-1b8e-42ff-8a67-2f1f3e6c0c52	AIR_TEMPERATURE	45.50	2025-12-31 15:59:51.361+02
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, password_hash, full_name, role, telegram_chat_id, created_at, updated_at) FROM stdin;
aa076514-a670-4a6b-83c5-52e6e1efa455	user@eco.com	$2b$10$IMbE6xvHASS3Qb9slyJndO1Me9UZTdTXNMbo65kU5p6asI.pljtee	John Doe	CLEANER	\N	2025-12-31 15:05:50.213713+02	2025-12-31 15:05:50.213713+02
d5e6f7a8-b9c0-1d2e-3f4a-5b6c7d8e9f0a	admin@eco.com	$2b$10$IMbE6xvHASS3Qb9slyJndO1Me9UZTdTXNMbo65kU5p6asI.pljtee	Super Admin	ADMIN	\N	2025-12-31 15:04:29.525109+02	2025-12-31 15:06:15.739974+02
e6f7a8b9-c0d1-2e3f-4a5b-6c7d8e9f0a1b	florist@eco.com	$2b$10$IMbE6xvHASS3Qb9slyJndO1Me9UZTdTXNMbo65kU5p6asI.pljtee	Anna Florist	FLORIST	\N	2025-12-31 15:04:29.525109+02	2025-12-31 15:06:15.739974+02
f7a8b9c0-d1e2-3f4a-5b6c-7d8e9f0a1b2c	cleaner@eco.com	$2b$10$IMbE6xvHASS3Qb9slyJndO1Me9UZTdTXNMbo65kU5p6asI.pljtee	John Cleaner	CLEANER	\N	2025-12-31 15:04:29.525109+02	2025-12-31 15:06:15.739974+02
\.


--
-- Name: care_logs care_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.care_logs
    ADD CONSTRAINT care_logs_pkey PRIMARY KEY (id);


--
-- Name: care_tasks care_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.care_tasks
    ADD CONSTRAINT care_tasks_pkey PRIMARY KEY (id);


--
-- Name: iot_sensors iot_sensors_mac_address_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.iot_sensors
    ADD CONSTRAINT iot_sensors_mac_address_key UNIQUE (mac_address);


--
-- Name: iot_sensors iot_sensors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.iot_sensors
    ADD CONSTRAINT iot_sensors_pkey PRIMARY KEY (id);


--
-- Name: locations locations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_pkey PRIMARY KEY (id);


--
-- Name: plant_species plant_species_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plant_species
    ADD CONSTRAINT plant_species_pkey PRIMARY KEY (id);


--
-- Name: plants plants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plants
    ADD CONSTRAINT plants_pkey PRIMARY KEY (id);


--
-- Name: plants plants_qr_code_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plants
    ADD CONSTRAINT plants_qr_code_id_key UNIQUE (qr_code_id);


--
-- Name: sensor_readings sensor_readings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sensor_readings
    ADD CONSTRAINT sensor_readings_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_readings_sensor_type_time; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_readings_sensor_type_time ON public.sensor_readings USING btree (sensor_id, type, recorded_at DESC);


--
-- Name: care_logs trg_complete_task_after_log; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_complete_task_after_log AFTER INSERT ON public.care_logs FOR EACH ROW EXECUTE FUNCTION public.complete_task_on_log();


--
-- Name: plants update_plants_modtime; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_plants_modtime BEFORE UPDATE ON public.plants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: care_tasks update_tasks_modtime; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_tasks_modtime BEFORE UPDATE ON public.care_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: users update_users_modtime; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_users_modtime BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: care_logs care_logs_performed_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.care_logs
    ADD CONSTRAINT care_logs_performed_by_user_id_fkey FOREIGN KEY (performed_by_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: care_logs care_logs_plant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.care_logs
    ADD CONSTRAINT care_logs_plant_id_fkey FOREIGN KEY (plant_id) REFERENCES public.plants(id) ON DELETE CASCADE;


--
-- Name: care_logs care_logs_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.care_logs
    ADD CONSTRAINT care_logs_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.care_tasks(id) ON DELETE SET NULL;


--
-- Name: care_tasks care_tasks_plant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.care_tasks
    ADD CONSTRAINT care_tasks_plant_id_fkey FOREIGN KEY (plant_id) REFERENCES public.plants(id) ON DELETE CASCADE;


--
-- Name: iot_sensors iot_sensors_plant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.iot_sensors
    ADD CONSTRAINT iot_sensors_plant_id_fkey FOREIGN KEY (plant_id) REFERENCES public.plants(id) ON DELETE SET NULL;


--
-- Name: plants plants_location_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plants
    ADD CONSTRAINT plants_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.locations(id) ON DELETE SET NULL;


--
-- Name: plants plants_species_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plants
    ADD CONSTRAINT plants_species_id_fkey FOREIGN KEY (species_id) REFERENCES public.plant_species(id) ON DELETE RESTRICT;


--
-- Name: sensor_readings sensor_readings_sensor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sensor_readings
    ADD CONSTRAINT sensor_readings_sensor_id_fkey FOREIGN KEY (sensor_id) REFERENCES public.iot_sensors(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict vuejXAT6h0IDzqKLqLjJ1vRSH1Bnouw41rLOFRw3rwbzOXgxvxZBVLBSe9N0b56


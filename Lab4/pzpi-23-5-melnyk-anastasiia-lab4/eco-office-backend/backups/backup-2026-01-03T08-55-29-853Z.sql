--
-- PostgreSQL database dump
--

\restrict G11Y4bm0rVgboUxDd763xHvoDCdgwmlqbhIzrjcHaIUL7gAq1LQFWALvU9Gxkyf

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
-- Name: drizzle; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA drizzle;


ALTER SCHEMA drizzle OWNER TO postgres;

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
-- Name: __drizzle_migrations; Type: TABLE; Schema: drizzle; Owner: postgres
--

CREATE TABLE drizzle.__drizzle_migrations (
    id integer NOT NULL,
    hash text NOT NULL,
    created_at bigint
);


ALTER TABLE drizzle.__drizzle_migrations OWNER TO postgres;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE; Schema: drizzle; Owner: postgres
--

CREATE SEQUENCE drizzle.__drizzle_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNER TO postgres;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: drizzle; Owner: postgres
--

ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNED BY drizzle.__drizzle_migrations.id;


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
-- Name: __drizzle_migrations id; Type: DEFAULT; Schema: drizzle; Owner: postgres
--

ALTER TABLE ONLY drizzle.__drizzle_migrations ALTER COLUMN id SET DEFAULT nextval('drizzle.__drizzle_migrations_id_seq'::regclass);


--
-- Data for Name: __drizzle_migrations; Type: TABLE DATA; Schema: drizzle; Owner: postgres
--

COPY drizzle.__drizzle_migrations (id, hash, created_at) FROM stdin;
\.


--
-- Data for Name: care_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.care_logs (id, task_id, plant_id, type, performed_by_user_id, notes, verified_by_scan, performed_at) FROM stdin;
43f49b5d-ad61-4c2b-b889-0e10d83e065a	\N	a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d	WATERING	d5e6f7a8-b9c0-1d2e-3f4a-5b6c7d8e9f0a	\N	f	2025-12-31 17:04:09.09+02
ea976684-b804-4722-933d-fcb6b431634f	204c31f9-7dcf-455b-9270-5602a0f401cd	a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d	LIGHT_ADJUSTMENT	bf3b81a7-417c-4d98-b1ca-ff4be2a043a3	some text	t	2026-01-03 12:49:02.448+02
\.


--
-- Data for Name: care_tasks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.care_tasks (id, plant_id, required_role, type, priority, description, due_date, status, created_at, updated_at) FROM stdin;
35217de5-be89-47d0-b85f-ce4e521950dd	a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d	CLEANER	WATERING	3	HEAT STRESS! Temperature 40°C is above the norm (28°C). The plant is overheating.	2026-01-03 10:53:04.117+02	COMPLETED	2026-01-03 10:53:04.118156+02	2026-01-03 10:53:54.223877+02
9a7708cf-024c-414b-9952-c0d361e4b8c2	a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d	FLORIST	PEST_CONTROL	1	High VPD (2.87 kPa). Air is too dry. High risk of spider mites. Increase humidity.	2026-01-03 10:53:04.128+02	COMPLETED	2026-01-03 10:53:04.129143+02	2026-01-03 10:53:54.23765+02
204c31f9-7dcf-455b-9270-5602a0f401cd	a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d	FLORIST	LIGHT_ADJUSTMENT	2	TOO DARK! During daytime only 0 lux (Min: 1000 lux). The plant lacks energy.	2026-01-03 10:17:13.259+02	COMPLETED	2026-01-03 10:17:13.261303+02	2026-01-03 10:54:48.605831+02
\.


--
-- Data for Name: iot_sensors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.iot_sensors (id, mac_address, plant_id, sensor_model, firmware_version, is_active, created_at) FROM stdin;
4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	40:C2:BA:AC:45:2A	a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d	SomeSensor	\N	t	2025-12-31 21:37:39.655429+02
14eb787d-17e5-4ba8-9b3d-8894a003cfcc	AA:BB:CC:11:22:33	aec540a3-296a-49c7-8891-d6d1987203ce	ESP32-Soil-V2	1.0.0	t	2026-01-02 22:42:09.337563+02
\.


--
-- Data for Name: locations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.locations (id, name, floor_number, description, map_image_url, created_at, updated_at) FROM stdin;
4f9b8d20-5c6a-4d3b-9e1f-2a8c7d6b5e4a	Open Space South	3	Сонячна сторона	http://maps.com/floor3.jpg	2025-12-31 15:14:25.762359+02	2025-12-31 15:14:25.762359+02
4e4813e1-8c58-431f-8528-152793237560	Open Space 3	3	Main relaxation area	https://example.com/maps/floor3.jpg	2026-01-02 22:16:40.622375+02	2026-01-02 22:16:40.622375+02
bf6af206-bc3b-4502-a894-dcd51cc9d48c	Open Space 5	5	Main relaxation area	https://example.com/maps/floor3.jpg	2026-01-02 22:39:24.301512+02	2026-01-02 22:39:24.301512+02
\.


--
-- Data for Name: plant_species; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.plant_species (id, scientific_name, common_name, description, min_soil_moisture, max_soil_moisture, min_temperature, max_temperature, min_light_lux, max_light_lux, watering_frequency_days, fertilizing_frequency_days, created_at) FROM stdin;
b1c2d3e4-f5a6-7b8c-9d0e-1f2a3b4c5d6e	Ficus elastica	Фікус Каучуконосний	\N	30	70	15	28	1000	5000	7	30	2025-12-31 15:14:25.762359+02
0e3fd2a9-7b35-42e1-8222-3444d5679ae5	Троянда звичайна	Троянда	\N	30	60	\N	\N	\N	\N	\N	\N	2026-01-02 22:40:50.204111+02
\.


--
-- Data for Name: plants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.plants (id, name, qr_code_id, species_id, location_id, map_x_coordinate, map_y_coordinate, health_status, photo_url, created_at, updated_at) FROM stdin;
a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d	Великий Фікус (Test Plant)	QR-001	b1c2d3e4-f5a6-7b8c-9d0e-1f2a3b4c5d6e	4f9b8d20-5c6a-4d3b-9e1f-2a8c7d6b5e4a	\N	\N	HEALTHY	\N	2025-12-31 15:14:25.762359+02	2025-12-31 15:14:25.762359+02
aec540a3-296a-49c7-8891-d6d1987203ce	Мій новий фікус	QR-14325	b1c2d3e4-f5a6-7b8c-9d0e-1f2a3b4c5d6e	bf6af206-bc3b-4502-a894-dcd51cc9d48c	100	200	HEALTHY	https://example.com/plant.jpg	2026-01-02 22:40:09.459329+02	2026-01-02 22:40:09.459329+02
\.


--
-- Data for Name: sensor_readings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sensor_readings (id, sensor_id, type, value, recorded_at) FROM stdin;
e86947dd-0c37-4194-8067-235a13d21785	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.98	2025-12-31 22:02:43.632+02
8568c291-146a-467b-b807-d783248f23b4	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	21.79	2025-12-31 22:02:43.663+02
d4ddf39f-c755-4da3-b459-ed7af0757fbc	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	60.55	2025-12-31 22:02:43.74+02
ffa09e3b-9be3-4b4a-92d4-4b1fd5888f15	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	0.00	2025-12-31 22:02:43.815+02
3126c5dc-6957-4992-924f-2ecb013d6f0f	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	100.00	2025-12-31 22:02:43.912+02
19868e7c-a13e-4f1e-beaf-87949e1d585b	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.95	2025-12-31 22:02:49.014+02
fa21319a-ff27-4b87-8aaf-db020ec63c6d	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	21.59	2025-12-31 22:02:49.115+02
743421ea-fc25-4884-9772-53c69b7c340f	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	60.16	2025-12-31 22:02:49.23+02
85b3e0bb-2fd8-4102-a514-8b57852e1ac2	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	0.00	2025-12-31 22:02:49.341+02
c567c980-4e0c-44be-ac7d-e121ac3a1050	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	100.00	2025-12-31 22:02:49.421+02
e6695944-d61b-4a53-a8c0-bdb5a76d074d	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.93	2025-12-31 22:02:54.536+02
bdb64257-a313-41fb-a823-1eff66ec9881	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	21.38	2025-12-31 22:02:54.621+02
a1bd7aae-ff52-4716-9e46-417c25e5bea6	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	61.00	2025-12-31 22:02:54.731+02
70c52b28-1dd6-4b02-bbdf-a026a3cd56e2	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	0.00	2025-12-31 22:02:54.842+02
babc7766-38e1-4a58-a5f6-2352f510bf6b	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	99.99	2025-12-31 22:02:54.944+02
083d80ca-e721-4351-9074-2eb8a02afe63	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.91	2025-12-31 22:03:00.07+02
b8c63163-15c6-4d00-93fe-5612d01c0bde	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	21.16	2025-12-31 22:03:00.142+02
615318a4-69c3-4e51-b9fd-8d4bd773f3f8	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	61.08	2025-12-31 22:03:00.236+02
515c85b6-2fdd-4a95-9621-1cd1660b5112	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	0.00	2025-12-31 22:03:00.365+02
25b3937e-33b9-4a3d-baea-2df72d2b57fb	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	99.99	2025-12-31 22:03:00.456+02
d2a0ed3d-9039-4e06-877d-38d79af5fd7d	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.89	2025-12-31 22:03:05.562+02
e86b27de-31bc-4967-bc29-00028220541b	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	20.91	2025-12-31 22:03:05.634+02
4176a8e2-be56-4075-a558-684acc9769e3	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	61.10	2025-12-31 22:03:05.754+02
5bf3defa-52dd-429f-a656-e314895f237f	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	0.00	2025-12-31 22:03:05.859+02
26b33cec-eb25-4ab9-b5d1-6ae4733797e0	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	99.99	2025-12-31 22:03:05.958+02
051664b8-288e-4be5-a798-2c625ad9bd0a	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.87	2025-12-31 22:03:11.036+02
722c1437-53c1-49bb-821e-795b175362c6	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	20.77	2025-12-31 22:03:11.146+02
6ed65cbd-4c2c-425a-9790-9d9774903692	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	61.09	2025-12-31 22:03:11.243+02
bbd89360-56ad-442b-bade-32c1bb30eab7	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	0.00	2025-12-31 22:03:11.354+02
092d0b4e-d93f-42cc-962c-f0a82f84f304	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	99.99	2025-12-31 22:03:11.477+02
1d222169-6bcb-4195-b04e-717f3a1b8588	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.84	2025-12-31 22:03:16.55+02
4eedf1ce-644d-493f-8a82-f1311568db89	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	20.61	2025-12-31 22:03:16.647+02
bb314c35-10dc-4fad-884d-28467f47acb9	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	61.10	2025-12-31 22:03:16.76+02
ca64596a-5c23-4040-bc35-490d990ef985	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	0.00	2025-12-31 22:03:16.884+02
1285ca19-6700-4068-bb8c-e393fbb2cfed	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	99.99	2025-12-31 22:03:16.95+02
d551b007-f8cb-4686-9c90-23d54e56c71a	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.82	2025-12-31 22:03:22.068+02
caa23976-f89a-4b87-97fb-8565279060ba	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	20.51	2025-12-31 22:03:22.155+02
04c5ad7c-5864-463a-9031-310a1232e283	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	61.21	2025-12-31 22:03:22.288+02
040dfec6-a4df-47f1-8441-6018892c48c3	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	103.61	2025-12-31 22:03:22.378+02
03f83ac1-a8fa-44fc-994e-c7b7513f74a2	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	99.98	2025-12-31 22:03:22.464+02
e3a40291-a6d1-44a9-8768-e58922bd4d70	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.78	2025-12-31 22:03:27.563+02
618a7768-ba46-46da-b93a-f5065dc395c8	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	20.51	2025-12-31 22:03:27.67+02
1f5535d4-b8fd-4063-87d7-9ecd0035a62b	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	61.49	2025-12-31 22:03:27.772+02
1ca61773-79fc-48bd-b705-15cbf87b17c8	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	257.31	2025-12-31 22:03:27.865+02
dd15e3f0-38c4-4733-b717-d4548f08baa3	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	99.98	2025-12-31 22:03:27.998+02
bf165155-289d-4dbf-a29b-80cfc174d5c1	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.73	2025-12-31 22:03:33.085+02
4a817169-161b-4b66-8393-bb5df82bb845	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	20.54	2025-12-31 22:03:33.197+02
939e960a-6dbd-41b5-be2d-b9fdf753a781	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	62.62	2025-12-31 22:03:33.277+02
0640fa56-206e-429f-b614-f7542b840ed7	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	563.77	2025-12-31 22:03:33.383+02
8eebbbb6-47e5-4c50-87fc-2c7d7eadba83	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	99.98	2025-12-31 22:03:33.476+02
9c73ea08-2326-4fba-b7b2-06f95399b942	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.68	2025-12-31 22:03:38.595+02
ed188f36-1c58-4fe7-a6ca-2fc433cd57d7	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	20.62	2025-12-31 22:03:38.681+02
ecb60edd-c1f8-40c7-8030-cf1b37adaf68	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	63.50	2025-12-31 22:03:38.795+02
d93d94f3-150e-4b0c-95ff-092844c2af66	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	713.43	2025-12-31 22:03:38.891+02
27f48efb-c361-4567-908e-6c154fb0df9c	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	99.98	2025-12-31 22:03:38.998+02
99612e97-1478-4d95-ba33-ea3147baae0c	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.62	2025-12-31 22:03:44.088+02
ca6f8f79-9ae3-4efc-a9dc-ff7ed7f7e185	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	20.75	2025-12-31 22:03:44.199+02
d671cb9a-ad4c-4bb0-80a8-1436f1a7df68	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	63.52	2025-12-31 22:03:44.289+02
0fb39a90-387a-45a5-ad24-aa9fad9e9542	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	671.82	2025-12-31 22:03:44.408+02
0803e95b-40e0-47ba-9fd1-c0d4d3db51db	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	99.98	2025-12-31 22:03:44.519+02
05d171d7-feda-4c18-afb2-1871f67abc30	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.56	2025-12-31 22:03:49.595+02
bd6f703b-18b3-496d-a112-99022339a5bf	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	20.93	2025-12-31 22:03:49.693+02
accde5bb-c245-4f2c-a95f-bcc85227d657	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	64.05	2025-12-31 22:03:49.832+02
ad3d72c2-2b3b-4b83-9f1d-95926a2dcdbe	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	806.52	2025-12-31 22:03:49.92+02
50f8b678-9180-47d2-804d-1f39f7fff1c2	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	99.97	2025-12-31 22:03:50.008+02
0ee35eb5-55d6-42e7-80b8-62ac67daece1	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.49	2025-12-31 22:03:55.097+02
855d3d62-b121-4f69-9ce6-0fb8f3c78d81	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	21.14	2025-12-31 22:03:55.197+02
16bd7a30-a37c-4633-b349-3f328dcdc76b	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	64.30	2025-12-31 22:03:55.297+02
bddfc30a-e88a-4150-ac47-8e4810b03e85	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	1030.60	2025-12-31 22:03:55.41+02
e405311f-b598-47cf-bb0b-b5fd54c58c7a	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	99.97	2025-12-31 22:03:55.52+02
3a267233-e44a-4a84-95e2-3b248b4f5f44	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.42	2025-12-31 22:04:00.622+02
c8526c6a-cba0-417d-905c-7d2fa368925f	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	21.42	2025-12-31 22:04:00.71+02
be3e7423-d4c0-491c-977e-62e7266beb3a	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	64.94	2025-12-31 22:04:00.809+02
c72033c4-9302-46c7-96e2-be9794360eee	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	863.41	2025-12-31 22:04:00.923+02
07b6789d-607f-4823-8bd5-e52baba42d0a	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	99.97	2025-12-31 22:04:01.012+02
a5ad8bd8-30bb-4ee3-9d44-1eabf458f80d	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.34	2025-12-31 22:04:06.132+02
cc00afad-f231-4028-ba9b-300bace217e0	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	21.68	2025-12-31 22:04:06.21+02
ddaa37c5-9a90-448a-8fdb-bd1f0663f80c	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	64.50	2025-12-31 22:04:06.314+02
066c1f2d-d739-42f0-9ce0-c1ddd6092129	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	1153.74	2025-12-31 22:04:06.425+02
9674a1b0-18ab-434d-b9fd-14f998171339	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	99.97	2025-12-31 22:04:06.519+02
42e79302-4a4c-4cb2-9d3b-bc68859fc4f0	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.27	2025-12-31 22:04:11.665+02
3f9ee33e-5c6c-4cbb-be66-33cccdb515c8	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	21.94	2025-12-31 22:04:11.764+02
574f9089-67fb-45d0-85e7-fb0721aca6b3	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	63.40	2025-12-31 22:04:11.846+02
d6bcf463-e1c4-4511-a1ea-478356d9c376	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	936.35	2025-12-31 22:04:11.921+02
70cf8cbb-09b1-43b5-8727-345f81540f2b	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	99.97	2025-12-31 22:04:12.022+02
58a9ef10-705d-4f10-958a-e3e5363bbc13	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.20	2025-12-31 22:04:17.133+02
92b97c3a-1e51-43c6-a6eb-7431dc3796a6	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	22.17	2025-12-31 22:04:17.23+02
9a47ffd1-f426-4d64-8932-24955bdfa5d4	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	63.60	2025-12-31 22:04:17.34+02
df7f2b77-bf36-4c44-aada-720647316f6f	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	850.16	2025-12-31 22:04:17.452+02
a0ed09c7-40d4-4b3f-a4df-d857f1f980d3	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	99.96	2025-12-31 22:04:17.561+02
beb3118b-b064-481c-916d-360b09c56afd	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.15	2025-12-31 22:04:22.642+02
0262f300-66b4-45fe-954e-f89e70dbb73c	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	22.42	2025-12-31 22:04:22.74+02
0a76bebf-ab32-4af0-9206-e4170467909c	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	63.35	2025-12-31 22:04:22.858+02
016e8ce7-588c-4c16-aadf-00053c8ba550	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	682.37	2025-12-31 22:04:22.941+02
88592e29-d72b-46ed-a9a0-e4d0130bca43	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	99.96	2025-12-31 22:04:23.07+02
730e3bc6-d4c6-4ecf-9703-e9e527123a22	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.09	2025-12-31 22:04:28.144+02
c8e855ff-fd2a-40ca-9001-1b083f2138b9	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	22.64	2025-12-31 22:04:28.249+02
51046495-61a4-4cf5-8dea-c1c69a9d9ebe	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	63.07	2025-12-31 22:04:28.347+02
8f2a9fb5-53e4-4233-be98-c89c6602f2d6	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	608.10	2025-12-31 22:04:28.458+02
7627025a-dc76-4d94-8c09-d1253f343d8e	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	99.96	2025-12-31 22:04:28.554+02
a40c4ba9-6d28-4347-99f5-80a4dc340752	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.05	2025-12-31 22:04:33.653+02
1b9e6468-dc4f-42b6-b137-289221bf033e	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	22.80	2025-12-31 22:04:33.774+02
12bba7f2-cbc6-4d95-bbcf-9fd1d8de631a	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	62.70	2025-12-31 22:04:33.869+02
7ff61260-7a44-4b8e-ae49-24d523bb99ba	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	311.23	2025-12-31 22:04:33.972+02
8994dab9-90d8-4fea-a759-bf3a42cb4068	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	99.96	2025-12-31 22:04:34.086+02
551b4d9a-e330-493d-9092-0093176223e9	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.98	2026-01-01 16:07:28.264+02
c1dd6d05-6944-4420-be12-27816572ec33	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	21.80	2026-01-01 16:07:28.389+02
34cf8652-769b-44c4-becc-5a607bae04c1	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	60.98	2026-01-01 16:07:28.415+02
48672eed-8233-436d-a994-c5bad5ea5a34	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	0.00	2026-01-01 16:07:28.436+02
133f425c-43ae-422a-973c-3641f0f0da1f	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	100.00	2026-01-01 16:07:28.457+02
159052ed-83b9-4cee-bd9c-47e538f71a0a	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.95	2026-01-01 16:07:33.645+02
3b9bafd1-76ad-488f-bd26-12ebc9107ed7	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	21.60	2026-01-01 16:07:33.66+02
d8f489f9-18c4-4cb1-a45e-0a91f914fbde	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	61.10	2026-01-01 16:07:33.851+02
1b20160c-4834-4b61-ba6f-d511362eeac1	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	0.00	2026-01-01 16:07:33.861+02
a3a6bca9-5dd5-43bf-a451-415a2cf20e1c	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	100.00	2026-01-01 16:07:34.07+02
71c54670-749b-4a65-b3ff-9386075f158e	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.93	2026-01-01 16:07:38.977+02
cd7400e3-0969-4082-b953-15e804b4be49	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	21.34	2026-01-01 16:07:39.068+02
2b5a9573-7863-43c7-808b-a6b996f7b482	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	61.50	2026-01-01 16:07:39.172+02
dae861c1-7941-4449-a227-fc2cdc5491d0	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	0.00	2026-01-01 16:07:39.288+02
594a81de-d07a-41d0-bd57-c6bd58a11935	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	99.99	2026-01-01 16:07:39.374+02
201795d6-4ebb-40d0-b79b-47b3af268fac	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.91	2026-01-01 16:07:44.493+02
70c372d6-48ea-4634-9ba9-96507a852875	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	21.11	2026-01-01 16:07:44.595+02
f2e8b4d7-04bb-450a-b849-cf580498b8b9	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	61.50	2026-01-01 16:07:44.717+02
c8516aae-1934-4b67-b133-f65f9f43b03f	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	0.00	2026-01-01 16:07:44.791+02
3fd48603-85e2-48dd-b7ce-1679c5367aac	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	99.99	2026-01-01 16:07:44.894+02
63b8cc73-bfb5-44bd-900b-b2a7aa52454f	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.89	2026-01-01 16:07:50.334+02
b4f06316-0c2e-4905-8980-ced838ffb363	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	20.95	2026-01-01 16:07:50.421+02
1d778cf3-aaec-4d66-a5a3-17f2c8467c8d	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	62.86	2026-01-01 16:07:50.438+02
2d32235e-2e40-4746-98cc-1a37243c189f	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	0.00	2026-01-01 16:07:50.456+02
86cb9029-1db3-41f9-bde0-33b9c5f697aa	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	99.99	2026-01-01 16:07:50.572+02
af0e7778-2e02-419c-8605-ec007127571f	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.87	2026-01-01 16:07:55.519+02
f3d44d4b-3bd2-402f-a15c-78bd332a78da	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	20.79	2026-01-01 16:07:55.611+02
bc766d3e-8cea-4016-b6cb-5d773e3f0662	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	63.57	2026-01-01 16:07:55.734+02
4c9f030c-1f4a-46f7-9ff3-791bac681ad9	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	0.00	2026-01-01 16:07:55.87+02
eeed08c2-a3aa-44ef-8be1-118e9ef867e8	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	99.99	2026-01-01 16:07:55.939+02
58b7f9f0-e6e6-45e9-af98-25d9e6791c83	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.84	2026-01-01 16:08:01.128+02
f4786900-3e4a-4305-a033-b6e9c4424ee2	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	20.68	2026-01-01 16:08:01.152+02
ada5fa28-783d-4809-9ea4-b39be824c2bd	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	63.33	2026-01-01 16:08:01.66+02
a51077a6-ceda-4f4b-9c13-6be2300bc67b	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	0.00	2026-01-01 16:08:01.757+02
935bff46-7918-4a7d-94ee-07ddca234277	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	99.99	2026-01-01 16:08:01.776+02
27eef7ba-6ff9-4335-b014-86b54e8f3830	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.82	2026-01-01 16:08:06.763+02
5b68bbcf-93d9-4261-8395-b5b62c463540	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	20.60	2026-01-01 16:08:06.788+02
36569285-b357-4215-8bda-8bb1fc4727f6	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	63.21	2026-01-01 16:08:06.81+02
49bf01da-6ba6-4126-836a-f633511efe1c	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	88.87	2026-01-01 16:08:06.852+02
9384feea-3881-4584-af79-97fb5937f026	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	99.98	2026-01-01 16:08:06.94+02
5f0ed8f7-709a-4110-9485-5ecbf9a5faf6	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.78	2026-01-01 16:08:12.057+02
2eaefbcd-3762-45bc-a712-9dcdf1d03176	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	20.52	2026-01-01 16:08:12.156+02
a06a6f5b-5e21-462b-944a-199fb10ccaa6	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	62.88	2026-01-01 16:08:12.278+02
8dc183f0-1c51-495a-848f-fbaa3e5ebb83	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	302.49	2026-01-01 16:08:12.358+02
790c7fb7-bfa7-4010-a317-d482516ea4c9	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	99.98	2026-01-01 16:08:12.499+02
3c253701-48e5-413d-a6a1-31f9395d311d	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.74	2026-01-01 16:08:17.551+02
9c0ad8a4-6cce-4e49-b4f2-e5d37bc54317	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	20.54	2026-01-01 16:08:17.651+02
e3f02565-240b-41ef-84d2-14d07d8dee2c	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	62.71	2026-01-01 16:08:17.759+02
4b931877-5e88-4976-be51-2f31f03a9629	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	405.61	2026-01-01 16:08:17.883+02
e4c5e0f8-904f-4676-bfef-244bf41deca6	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	99.98	2026-01-01 16:08:17.955+02
1d14d10c-185f-4181-86f6-c471419b0080	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.68	2026-01-01 16:08:23.166+02
052d8653-a737-424a-9c8b-9015d0e5b961	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	20.62	2026-01-01 16:08:23.234+02
683a1885-fe1c-4a0d-9eb9-bf5f3e783cde	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	64.00	2026-01-01 16:08:23.269+02
82d30c07-adfe-4c30-8219-936045e075c7	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	775.30	2026-01-01 16:08:23.403+02
61d5a8d2-1868-4f3c-ac30-df5e87c01f87	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	99.98	2026-01-01 16:08:23.454+02
5f41b868-42f3-4694-8fb1-1b6f0b9ab722	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.62	2026-01-01 16:08:28.607+02
11115589-3d15-4387-a116-5b056b202120	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	20.72	2026-01-01 16:08:28.918+02
ef8f815c-388b-4fec-a85e-e63fba0d80aa	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	64.06	2026-01-01 16:08:28.933+02
b9a6029f-f0e1-43b6-b9d3-a891dca72cb3	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	787.67	2026-01-01 16:08:28.944+02
1fc1b7b6-b96d-48cd-9647-09e14d5a4e66	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	99.98	2026-01-01 16:08:29.18+02
f9cd2b45-8d30-413a-b046-4cdfbd60ab08	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.56	2026-01-01 16:08:34.159+02
6bb4559f-922d-473a-b525-67b8c4f17d32	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	20.89	2026-01-01 16:08:34.267+02
acee52c9-bb6a-4d7a-a4f7-8c68ed695c9e	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	65.03	2026-01-01 16:08:34.318+02
acfccfac-551d-4acd-a3f9-5e3afd5c7dfc	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	776.42	2026-01-01 16:08:34.376+02
cdc9ad62-d860-4f29-845e-75c6a6c48088	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	99.97	2026-01-01 16:08:34.492+02
69b2e223-a38b-48fb-a537-b865f8936baa	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.50	2026-01-01 16:08:39.592+02
7944cf2d-22f6-4a95-917c-0a1e344625be	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	21.08	2026-01-01 16:08:39.711+02
75326f22-83c2-44a3-b6c4-7f82797202f4	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	64.32	2026-01-01 16:08:39.832+02
1344df71-6b04-4e23-b3da-23bc36b34bb1	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	799.36	2026-01-01 16:08:39.9+02
0fc1e2c6-6131-4ef3-98db-a287cf452d21	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	99.97	2026-01-01 16:08:40.071+02
58973964-87d8-4f9f-aae8-38e5837df7c8	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.42	2026-01-01 16:08:45.099+02
20c9eabb-848b-4380-9a16-0e451ada3657	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	21.31	2026-01-01 16:08:45.252+02
3f815b35-50e8-4d66-bd1c-5fa7bd8e2865	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	63.74	2026-01-01 16:08:45.315+02
2c0a85d7-527b-444e-a918-91b2b44e0980	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	1061.23	2026-01-01 16:08:45.388+02
31a3f274-1078-47ae-afc4-a703123806f5	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	99.97	2026-01-01 16:08:45.533+02
44f7348f-d3c9-4150-987e-1fec9e62dee3	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.35	2026-01-01 16:08:50.627+02
8b2685d3-3e3f-4932-b3b0-f2c97d80be3c	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	21.55	2026-01-01 16:08:50.787+02
eb32aa4c-9dbb-4166-a2d9-481b10d236af	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	63.58	2026-01-01 16:08:50.863+02
26a5d5dc-5586-4ef7-8275-310f93c6c0da	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	946.78	2026-01-01 16:08:51.257+02
6a1e622e-0faa-4e10-bc42-950b622dc7c3	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	99.97	2026-01-01 16:08:51.284+02
3c450a09-8c1d-4589-a6e5-f01239e1bee1	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.29	2026-01-01 16:08:56.142+02
7e09639d-34d1-436e-a1dd-204f6240cd35	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	21.79	2026-01-01 16:08:56.309+02
c900b466-c0c6-4113-9982-382b34257f2d	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	62.54	2026-01-01 16:08:56.342+02
665e8828-acae-4792-a8d8-05a9320345ca	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	764.02	2026-01-01 16:08:56.559+02
a36886ff-acb1-41b8-a032-b5ae193f25e5	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	99.97	2026-01-01 16:08:56.574+02
366757c8-7bcd-48a9-b381-103fb979b85e	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.23	2026-01-01 16:09:01.617+02
63a9dd18-798c-4998-b522-23f67ed300f6	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	22.05	2026-01-01 16:09:01.727+02
3693b226-06a6-4932-8aef-a7a5241b47fc	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	63.09	2026-01-01 16:09:01.858+02
03c0ed06-a18b-46c0-b39a-9eca401e67d5	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	708.68	2026-01-01 16:09:01.913+02
ba544f97-4515-4026-8bba-317693cb384d	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	99.96	2026-01-01 16:09:02.045+02
362805af-3a0d-464b-a9af-6c75be275244	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.17	2026-01-01 16:09:07.56+02
a973d73d-fec1-4399-b59b-cd75c76b25df	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	22.24	2026-01-01 16:09:07.643+02
40b0a514-b56b-497b-9c62-bea44c3b46df	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	63.61	2026-01-01 16:09:07.652+02
fb5f9ba4-b7ba-452d-b0f5-0594e5678471	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	752.02	2026-01-01 16:09:07.723+02
da40c0db-7a93-4f26-9496-dff938314be8	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	99.96	2026-01-01 16:09:07.741+02
8a1b5aa3-746f-48c2-98fa-430f878005d1	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.98	2026-01-01 16:09:22.701+02
36278574-ed85-4a8c-87c4-ad1a4939dbca	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	21.83	2026-01-01 16:09:22.737+02
03f60cc9-7e40-405e-9ff0-3c2e2b6d3c68	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	59.97	2026-01-01 16:09:22.831+02
a974e3e3-ce16-4717-b46b-d21476677bfb	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	0.00	2026-01-01 16:09:22.932+02
3b5a8639-d8f7-4f68-981a-d14e9901830c	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	100.00	2026-01-01 16:09:23.102+02
3366e806-3c1d-4e6a-93e3-bce0e29a4f04	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.95	2026-01-01 16:09:28.232+02
ffde8c39-7355-4c61-81df-4f9dba2c6a00	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	21.62	2026-01-01 16:09:28.312+02
bd28d3a8-9810-402d-9981-af1981f93536	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	60.79	2026-01-01 16:09:28.356+02
01fe6d0a-ab66-4787-bf1e-564e0a0b0b1e	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	0.00	2026-01-01 16:09:28.449+02
5c0634d2-0301-426b-92da-7b57dfad6a00	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	100.00	2026-01-01 16:09:28.56+02
d916da00-60a6-4793-9fb4-cfcea7f5d11e	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.93	2026-01-01 16:09:33.657+02
144835be-b59d-450b-9da3-19f5d98061e4	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	21.45	2026-01-01 16:09:33.753+02
e77469c4-e879-4b8f-a302-293b0f05b130	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	61.15	2026-01-01 16:09:33.881+02
ef596e63-4e00-44c9-bacd-83d7e22e1ed0	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	0.00	2026-01-01 16:09:34.014+02
946669ea-5316-4cfe-9564-32aed2db8d04	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	99.99	2026-01-01 16:09:34.021+02
4bd8b596-c8a4-42f7-9bb4-c4ec7bcc9a77	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.91	2026-01-01 16:09:39.158+02
8c3d9ea6-3d23-4ff4-bcfd-da33f4fe8f79	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	21.24	2026-01-01 16:09:39.246+02
1d6e7fbd-1b70-4a64-a351-316e22e58918	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	62.26	2026-01-01 16:09:39.429+02
85c118e9-37ad-44a5-a7d7-2961a45f088d	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	0.00	2026-01-01 16:09:39.449+02
9d936571-f59a-4f2e-905e-018f85c3ce1b	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	99.99	2026-01-01 16:09:39.555+02
083bb124-a019-4b7e-a19c-c714d63db1c3	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.89	2026-01-01 16:09:45.045+02
ad320fa8-05d8-46da-a644-236cc2977374	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	21.07	2026-01-01 16:09:45.119+02
629a9f22-001f-4489-b049-89461048e5ef	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	61.88	2026-01-01 16:09:45.14+02
51a6f01b-2d01-4c19-8a21-9459128e6e9e	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	0.00	2026-01-01 16:09:45.159+02
15b34334-3c23-4984-b80c-7ed52aad3f97	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	99.99	2026-01-01 16:09:45.181+02
e4ddcc1f-3d6c-410e-9e63-6b8bc7039499	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.87	2026-01-01 16:09:50.204+02
802ee3d7-3b08-4dfa-978a-602343872c72	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	20.84	2026-01-01 16:09:50.255+02
1f2c4f2f-bc02-490b-9c96-6424726e60ec	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	63.13	2026-01-01 16:09:50.356+02
4c36c2be-1463-49a4-9257-e48948398282	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	0.00	2026-01-01 16:09:50.465+02
22df4680-26a5-4ae5-9b59-8d065bf56016	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	99.99	2026-01-01 16:09:50.579+02
383bf59a-3f78-4cb3-a730-0acd9df5ec9d	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.98	2026-01-01 16:09:57.958+02
d8860c53-6c40-4907-be77-d56bf6b1e113	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	21.82	2026-01-01 16:09:58.063+02
7d8edca6-bc80-4f8f-854f-556baf435c8b	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	60.65	2026-01-01 16:09:58.139+02
c44d3368-7360-4ce5-bbc0-e0de98b18760	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	0.00	2026-01-01 16:09:58.254+02
9c70d279-edb3-496b-873d-54c00ba197cb	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	100.00	2026-01-01 16:09:58.341+02
69e3658f-0488-4d94-8b56-8d072ab517c1	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.95	2026-01-01 16:10:03.587+02
addd0d14-c016-4573-a431-09032cdb8888	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	21.63	2026-01-01 16:10:03.615+02
fc5d763f-bbc4-4aa6-819c-51ccadb3fbf6	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	61.10	2026-01-01 16:10:03.667+02
255cbade-8e2a-4587-8b23-606a971fa4ab	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	0.00	2026-01-01 16:10:03.762+02
c5429f60-c3f6-45ad-9b3b-c79b005aa499	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	100.00	2026-01-01 16:10:03.936+02
d04cf116-d872-4e2e-8db1-2ee94b89d20a	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.93	2026-01-01 16:10:08.977+02
487a02b0-5ccc-43df-ab49-6297fe2640f1	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	21.37	2026-01-01 16:10:09.065+02
0a32806b-4279-4520-ac0d-0017c5f05b79	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	61.92	2026-01-01 16:10:09.167+02
9732fbb9-c9ce-43f5-b57b-f18fd98b1262	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	0.00	2026-01-01 16:10:09.274+02
13f56203-8b9c-452b-be7c-42792cc040d9	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	99.99	2026-01-01 16:10:09.36+02
94afc974-9425-49b7-8281-4b877ec6dd44	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.91	2026-01-01 16:10:14.98+02
318e85a5-6488-43ca-9793-367d2757e166	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	21.11	2026-01-01 16:10:15.061+02
04615f85-137d-4a32-8fac-00e7967f7217	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	62.17	2026-01-01 16:10:15.07+02
54c0e567-7690-4a68-9b4f-3747a31a8143	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	0.00	2026-01-01 16:10:15.087+02
2554e670-b2f0-4d70-8664-b24316c4edbd	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	99.99	2026-01-01 16:10:15.097+02
74967238-42d8-4144-9f75-aadeea452c53	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.89	2026-01-01 16:10:20.257+02
45fc3216-c58b-4d31-82f3-d5c74d6c039a	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	20.94	2026-01-01 16:10:20.269+02
dad07f7a-fabf-490e-b03a-c63467ca7ca9	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	61.94	2026-01-01 16:10:20.278+02
f53f10d8-5327-4e98-b5c2-007a6032a1bd	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	0.00	2026-01-01 16:10:20.296+02
c6d41326-5878-4d12-bef6-db6714dfb28c	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	99.99	2026-01-01 16:10:20.561+02
f0f7f675-2a3a-4d30-b088-e49eafa455b9	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.87	2026-01-01 16:10:25.576+02
57345495-54e6-429a-b146-c611f1331ad3	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	20.80	2026-01-01 16:10:25.592+02
9ebe31f7-8b41-45e5-a399-e532538ab318	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	62.56	2026-01-01 16:10:25.67+02
495151a3-d4b0-4b03-9462-b5488685dc15	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	0.00	2026-01-01 16:10:25.852+02
adc8da08-4fcc-479c-af77-baa3e620d368	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	99.99	2026-01-01 16:10:25.919+02
689abcd0-7d79-4d8e-9d8c-9c1cdba8e2a3	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.84	2026-01-01 16:10:31.693+02
051d8fd2-1749-4b88-8478-96d8bdda12c4	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	20.63	2026-01-01 16:10:31.709+02
83958712-c9fa-4ad2-bd9a-9d4d2c259114	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	62.58	2026-01-01 16:10:31.715+02
3e3472e8-f828-494b-be1a-1dd11dca2192	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	0.00	2026-01-01 16:10:31.723+02
19971586-5ae4-4d16-9cf7-58f296164538	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	99.99	2026-01-01 16:10:31.735+02
051a6ad8-3283-4f4d-9822-c1ed065636a1	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.82	2026-01-01 16:10:36.601+02
ffc46f05-784f-4c24-a158-4475cca9ce60	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	20.51	2026-01-01 16:10:36.625+02
348d8c5b-e6de-4a5a-b4f5-8aebd362431b	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	62.27	2026-01-01 16:10:36.756+02
786e0d04-cdbb-4302-a08b-510d47f5fed2	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	78.90	2026-01-01 16:10:36.79+02
02a88980-6485-41e6-9620-200a5a619ac6	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	99.98	2026-01-01 16:10:36.908+02
6c2bf1a9-fa28-4a04-b7fb-6bb8ed760fac	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.98	2026-01-01 16:10:44.634+02
16b94a40-43f3-425f-a0c2-2cfff4fdf3ad	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	21.78	2026-01-01 16:10:44.737+02
e30b7b13-0637-4284-b18a-dad580e4cbed	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	61.21	2026-01-01 16:10:44.875+02
7f5bcf14-ab92-48ea-9df5-edc5b09c1c64	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	0.00	2026-01-01 16:10:44.897+02
3781c8e1-2427-490d-8e98-3271477bf720	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	100.00	2026-01-01 16:10:45.035+02
ad858498-8ba5-4205-a278-3bf092ac6053	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.95	2026-01-01 16:10:50.13+02
11ed5ef6-e995-4244-8df6-36485f606e4c	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	21.57	2026-01-01 16:10:50.224+02
d3cf4781-236d-4a13-8685-3fc2048f8139	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	61.05	2026-01-01 16:10:50.358+02
2254e79d-cb5f-4806-8048-5e5d89d1e8b5	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	0.00	2026-01-01 16:10:50.419+02
a6464b96-1ee4-4c4e-a3dd-61f85d974368	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	100.00	2026-01-01 16:10:50.535+02
46ed8023-4b0e-483a-8921-b214eea33903	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.93	2026-01-01 16:10:55.622+02
c137a165-c15f-441c-b834-7e2803450d29	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	21.33	2026-01-01 16:10:55.765+02
56cf257d-cbd7-4c09-a9c3-e0f1b3424148	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	62.36	2026-01-01 16:10:55.846+02
01d45a64-ae71-40a1-8247-59968037d3dc	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	0.00	2026-01-01 16:10:55.951+02
26f9450e-b7e4-4252-ba25-89b6602ac9b8	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	99.99	2026-01-01 16:10:56.057+02
a6653173-f6f5-49f0-9128-99fd427c5908	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.91	2026-01-01 16:11:01.152+02
7b1126b7-cb1f-4f43-b3aa-d543060cadf7	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	21.10	2026-01-01 16:11:01.244+02
9f5ccc64-6fef-4a43-b09a-66704621f939	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	63.32	2026-01-01 16:11:01.359+02
a17c7cef-eac6-468b-a8b8-6fdcb879d253	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	0.00	2026-01-01 16:11:01.467+02
193a55d8-852d-4a39-8b4e-4981fce92fa8	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	99.99	2026-01-01 16:11:01.576+02
5dfd2051-5d40-497f-b211-7c20f113f24c	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.89	2026-01-01 16:11:06.657+02
5d751b97-1bef-47a3-9fb8-f9a37effe367	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	20.94	2026-01-01 16:11:06.74+02
2891ed66-4363-462b-b86b-04fa88c1fd1e	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	63.94	2026-01-01 16:11:06.863+02
7e0cf397-7e39-4eda-b471-8748b459b87f	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	0.00	2026-01-01 16:11:06.987+02
72b51cbd-6cf0-471e-8759-d88451d205de	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	99.99	2026-01-01 16:11:07.071+02
16835b40-7d39-4770-9bf1-604f510db020	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.87	2026-01-01 16:11:12.191+02
0ca1c893-bf28-4263-8166-20ccab598143	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	20.75	2026-01-01 16:11:12.253+02
9ea4462c-b5c3-44c5-89f1-c2208611296d	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	63.53	2026-01-01 16:11:12.394+02
316b2a54-54b7-4989-9dae-97060db3ed17	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	0.00	2026-01-01 16:11:12.461+02
ecd3cd76-8346-4e55-b6aa-23724f1cb897	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	99.99	2026-01-01 16:11:12.577+02
ac2032f4-0156-4ed9-a2b3-99a9aa244589	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.84	2026-01-01 16:11:17.862+02
50591ccd-d1a5-4e64-bb17-470b2d4e62b1	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	20.58	2026-01-01 16:11:17.893+02
bd0b15fe-b124-4e79-9dc2-47726ede0d4e	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	64.18	2026-01-01 16:11:17.983+02
b0d0ef05-34d7-44b9-aef4-a89005b3b565	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	0.00	2026-01-01 16:11:18.136+02
c557c564-38c5-4c53-9980-3056e81494f5	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	99.99	2026-01-01 16:11:18.148+02
0ead01e5-069a-4d20-9f53-8303f0fccb30	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.82	2026-01-01 16:11:23.38+02
d88c7d85-f353-4ce2-b503-7b1afa2acf80	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	20.48	2026-01-01 16:11:23.394+02
d1362fd6-68ee-4c2e-bbcd-97bafe1a05b7	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	63.46	2026-01-01 16:11:23.402+02
8fb9f725-d882-431a-847f-aae7bfb3ac24	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	82.71	2026-01-01 16:11:23.722+02
37585308-38a2-4cab-9371-7182c6f688f7	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	99.98	2026-01-01 16:11:23.748+02
1c44db71-f6e3-4a6c-a2bb-7d73b8755c84	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.78	2026-01-01 16:11:28.75+02
1279b472-0252-4ead-93e8-b823ead96ca3	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	20.42	2026-01-01 16:11:28.761+02
48617eab-fcc5-49cb-9cdf-6020a62376e1	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	62.77	2026-01-01 16:11:28.895+02
861c6c20-3deb-42a4-b5f6-3c7a367b9488	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	347.35	2026-01-01 16:11:29.151+02
1363bc53-9da3-4939-be4b-f9f0c92b3934	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	99.98	2026-01-01 16:11:29.166+02
eecb225a-0a6c-43a6-92d7-c4260b233903	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.74	2026-01-01 16:11:34.662+02
815a1a21-67d7-4457-b425-764c236f8ba8	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	20.45	2026-01-01 16:11:34.674+02
7bbcd4ef-9a5f-4f2f-9727-8878a35c4ec2	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	62.71	2026-01-01 16:11:34.681+02
322ef014-df9f-49bc-a129-019c7641ad7e	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	415.52	2026-01-01 16:11:34.69+02
e10d5147-6300-4546-b8b4-344d1b3c5219	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	99.98	2026-01-01 16:11:34.696+02
862c2228-4b59-40fd-af8b-430292dbe9d6	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.69	2026-01-01 16:11:39.877+02
3b7ad3fb-fe8c-4f07-afe4-c11e8ef6fc5e	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	20.56	2026-01-01 16:11:39.906+02
5326044a-d262-4b95-bbd1-20009ef0f9c5	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	63.36	2026-01-01 16:11:39.917+02
7eb005dd-fa83-4e8c-a162-df101678df3a	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	618.34	2026-01-01 16:11:40.441+02
c35d0ef8-37a2-402c-8849-38d872df5497	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	99.98	2026-01-01 16:11:40.456+02
1aa73992-e0e8-4ccd-ac5d-42ff102002c4	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.63	2026-01-01 16:11:45.366+02
5cdbfaa0-9964-4585-9219-0eeadfd88eff	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	20.70	2026-01-01 16:11:45.374+02
ca12e6e9-80c3-4751-92ab-0169658720ec	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	63.65	2026-01-01 16:11:45.432+02
c028d720-aa25-4f62-95dc-aa388dd45819	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	662.68	2026-01-01 16:11:45.515+02
fe9aaf0d-829a-4d6f-804e-3f6a2bc968a3	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	99.98	2026-01-01 16:11:45.627+02
2d4a573b-d00e-476b-97f5-785e478a0ecb	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.98	2026-01-01 16:37:33.819+02
6471fdcb-0b05-4edb-b13e-893c2e5b4aef	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	21.86	2026-01-01 16:37:33.851+02
829864fd-0e0e-4e08-a3ee-7528733c31a6	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	61.06	2026-01-01 16:37:33.874+02
c7f1da31-aad8-4a22-92ba-13b87619a8a3	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	0.00	2026-01-01 16:37:33.945+02
e10b874c-fbdd-456c-8d11-b0638e6efaff	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	100.00	2026-01-01 16:37:33.955+02
697c22c8-db58-4546-b592-7acb3b35f537	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.95	2026-01-01 16:37:38.973+02
0615f4d3-3fdb-4124-a03a-fe681fff5213	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	21.62	2026-01-01 16:37:39.055+02
cd891802-40c6-4d0b-937c-8803e6e335be	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	60.35	2026-01-01 16:37:39.182+02
2a9037c1-71a8-4d27-a7af-6a60429ed42b	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	0.00	2026-01-01 16:37:39.257+02
33600555-2da6-43fd-a5e5-83515569787a	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	100.00	2026-01-01 16:37:39.393+02
f647d815-ba33-4457-9628-95915b664fc9	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.93	2026-01-01 16:37:44.462+02
4bffabe4-e644-46ee-90fd-e52299d0ce92	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	21.40	2026-01-01 16:37:44.564+02
670b720c-ab07-4f80-be92-60a1e250a23e	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	60.51	2026-01-01 16:37:44.667+02
955b2daa-eee6-41de-9c87-6bd6ed980640	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	0.00	2026-01-01 16:37:44.779+02
5e0dcf45-b92b-4f54-98d9-c9bff87d4785	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	99.99	2026-01-01 16:37:44.88+02
7c09baf5-e074-410b-a195-a78635b9f94a	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.91	2026-01-01 16:37:50.098+02
03ce713a-8681-4ad0-8303-28d9c22f4cad	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	21.15	2026-01-01 16:37:50.126+02
94e3b468-eeb7-44dc-a21f-b6372c366d57	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	60.71	2026-01-01 16:37:50.255+02
4ad8dee1-65b4-49a2-9723-7713aef7f248	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	0.00	2026-01-01 16:37:50.278+02
56acd86f-9808-48fa-bb63-19d3fdcb1e40	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	99.99	2026-01-01 16:37:50.424+02
191ab774-cdb3-4826-97f6-853e28ccf0c7	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.89	2026-01-01 16:37:55.493+02
48cd2563-c3f9-4f26-aa29-c6236951dbe9	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	20.91	2026-01-01 16:37:55.642+02
77e030e1-eed1-4288-9e87-800a790a711b	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	61.84	2026-01-01 16:37:55.697+02
612d6b67-417e-4de8-8dcd-5a3230375af8	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	0.00	2026-01-01 16:37:55.783+02
bd65a1c3-13b4-4b89-bec4-4fc03cbf0e2d	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	99.99	2026-01-01 16:37:55.914+02
2760d8d8-c89c-424f-904f-7af5193ef32b	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.87	2026-01-01 16:38:01.352+02
346ca613-12a5-45ba-948d-0c3a469cbdf8	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	20.77	2026-01-01 16:38:01.376+02
81b91a73-4283-48f5-8ac9-7818afa591e2	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	62.02	2026-01-01 16:38:01.395+02
e38eeb39-0574-4770-9e92-23ac64832793	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	0.00	2026-01-01 16:38:01.407+02
03df943f-ca04-4ed2-a2c3-53fa5e0b82d2	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	99.99	2026-01-01 16:38:01.586+02
7d628172-1fc6-40ec-96f3-b2d9cb109a01	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.84	2026-01-01 16:38:06.502+02
65c12c19-46d8-44cb-9a15-529ddcc465e1	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	20.59	2026-01-01 16:38:06.602+02
123e713b-7b58-4604-b80e-8c860731e6cd	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	62.75	2026-01-01 16:38:06.704+02
fa1a184d-15d6-4d81-8363-4e2b574d1284	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	0.00	2026-01-01 16:38:06.829+02
4a0853d7-949a-4371-b8f6-9e9a37256177	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	99.99	2026-01-01 16:38:06.926+02
32b071d4-5ae3-41db-8923-b645c19df12b	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.82	2026-01-01 16:38:12.027+02
614e3fb2-ddba-47c0-9fe6-6f671eae42ff	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	20.50	2026-01-01 16:38:12.124+02
f5a2b766-930e-4256-b657-0b05de8d6333	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	62.93	2026-01-01 16:38:12.253+02
3f216b9b-88d3-4de6-99da-4de400da3ecc	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	91.81	2026-01-01 16:38:12.33+02
379798fc-1861-4d31-bb16-64a979ca757a	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	99.98	2026-01-01 16:38:12.464+02
56dab3fd-e9be-4cb9-95fd-5ce6661ea75b	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.78	2026-01-01 16:38:17.534+02
fdbbb2f3-fd6b-4df9-8ae4-664030be8131	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	20.45	2026-01-01 16:38:17.623+02
c89c80b9-ce35-47ac-967a-05cb34ab9d6a	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	63.58	2026-01-01 16:38:17.715+02
9057dba9-e700-4bd7-9b0f-b97541009334	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	304.12	2026-01-01 16:38:17.873+02
5fd83f73-6f73-488e-a572-bceb092ea23c	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	99.98	2026-01-01 16:38:17.958+02
4dfa1c10-87d5-40f2-b951-eeefcf72c6ce	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.74	2026-01-01 16:38:23.056+02
a7eaf04d-365e-4b66-a052-1b36c7709f16	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	20.50	2026-01-01 16:38:23.171+02
bdb83fc7-0892-44aa-a97b-00a656d9cfc3	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	63.17	2026-01-01 16:38:23.289+02
e7503278-e87e-48ac-a412-6ed550bcb769	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	508.80	2026-01-01 16:38:23.443+02
a425c522-2a8e-4e9a-8f22-2785d2824835	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	99.98	2026-01-01 16:38:23.452+02
3d6d61af-afa5-49ea-a8ca-02eddd1b14ad	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.68	2026-01-01 16:38:28.553+02
24fdddcd-1bd0-4995-af40-95dad7bce428	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	20.56	2026-01-01 16:38:28.654+02
d0ff4d1a-cb1d-4f72-af42-aeaad11736f3	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	62.74	2026-01-01 16:38:28.739+02
e6a30eb1-e429-424d-913b-be4fdf714cd3	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	586.92	2026-01-01 16:38:28.855+02
3978d2db-e756-40b4-97ed-23ff497ea262	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	99.98	2026-01-01 16:38:28.96+02
f81e6e3d-0219-405a-9e8f-cd503c87c65e	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.63	2026-01-01 16:38:34.27+02
2c55c542-89c3-4faf-895d-85347cc36088	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	20.71	2026-01-01 16:38:34.354+02
2307ba0b-c78f-4cb0-bfa8-3d6bf844c012	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	62.47	2026-01-01 16:38:34.364+02
3fbdb8d0-e723-4413-ad70-653682710076	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	681.06	2026-01-01 16:38:34.565+02
ed8d96f1-451c-451d-90f6-91f23006cf73	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	99.98	2026-01-01 16:38:34.577+02
989edae4-d8f2-4df0-8f54-d9450c0f2c05	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.57	2026-01-01 16:38:39.546+02
8c05fa62-294b-45db-9e01-47e81ef5f39d	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	20.89	2026-01-01 16:38:39.68+02
99426586-65eb-48e1-91db-0e41ac8f5740	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	63.10	2026-01-01 16:38:39.813+02
678f2248-0e11-4743-8074-b70b9af6f3b2	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	739.28	2026-01-01 16:38:40.242+02
47c9e0c6-594d-41b1-bb5d-3a601bfc53c8	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	21.14	2026-01-01 16:38:45.238+02
22e1153a-b819-4f5b-8c6c-be0ea6faedc3	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	63.41	2026-01-01 16:38:45.261+02
c69eb249-55f2-4d9e-b5e3-5ec87bfd2e64	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	1014.38	2026-01-01 16:38:45.368+02
2280260a-0264-432b-840a-526e66500410	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	99.97	2026-01-01 16:38:45.466+02
1e6520ef-49c9-433e-be0d-fb6c2c74bc15	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.42	2026-01-01 16:38:50.657+02
25265e7d-600a-45a8-af9b-829b28e313ac	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	99.97	2026-01-01 16:38:40.254+02
4fe92c34-2e19-455c-8625-4bf2af957d46	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.50	2026-01-01 16:38:45.23+02
4011399f-ac1c-444d-b285-852244e08fb0	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	21.34	2026-01-01 16:38:50.67+02
6d5ec2b9-bcf6-4c06-836a-24c341257b12	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	63.32	2026-01-01 16:38:50.777+02
30d8d8bb-289c-4b70-baa5-dc7c9187ffea	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	1109.15	2026-01-01 16:38:50.904+02
f4f2ae90-818e-4a99-b7c5-eecf5aeebaec	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	99.97	2026-01-01 16:38:51.026+02
1fc92128-2048-468d-ace7-1887fe8f8195	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.98	2026-01-01 16:43:07.716+02
334b1d8e-039f-48bc-b93f-6bed75add2e2	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	21.79	2026-01-01 16:43:07.811+02
87ec9990-96ef-44d6-ad58-ed808d5c59d0	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	59.55	2026-01-01 16:43:07.833+02
4b21edf7-3835-4b04-8a07-86c5646c4d15	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	0.00	2026-01-01 16:43:07.908+02
15295676-2170-454f-a5f5-13c5ac965281	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	100.00	2026-01-01 16:43:08+02
7a864f27-4b5e-4bfd-b7d5-ab8d39cc88b6	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.95	2026-01-01 16:43:13.105+02
6df8f91c-9195-42dd-9848-04e22e2724c4	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	21.58	2026-01-01 16:43:13.275+02
7c839e1b-86d8-4ac4-a43a-ae0bc177f0b3	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	59.02	2026-01-01 16:43:13.437+02
44731b21-82cd-47e1-afb0-6355e3e5a17b	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	0.00	2026-01-01 16:43:13.444+02
a1023883-8299-485e-a9c3-711636b8b6b2	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	100.00	2026-01-01 16:43:13.664+02
ede44871-6b7c-4dc3-9ea6-9c55061be021	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.93	2026-01-01 16:43:18.617+02
d1c8dcfd-899d-48f8-9a6f-95985b8cdd45	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	21.32	2026-01-01 16:43:18.737+02
2fd3084f-84ae-4e7c-9958-ea3a1a0b64cf	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	59.66	2026-01-01 16:43:18.847+02
f81c36e2-c5bb-4063-8e9f-c716d05bda76	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	0.00	2026-01-01 16:43:18.939+02
1f71a717-c5a1-4754-85da-d5080050bdcb	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	99.99	2026-01-01 16:43:19.011+02
aaef16c2-9989-42cd-8407-e99f553b19b0	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.98	2026-01-01 16:43:32.134+02
1bcbb2ba-1d8c-4fee-a5c8-c1aefeb670a8	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	21.83	2026-01-01 16:43:32.198+02
e465d709-a263-45ba-8f39-0ec9ecd632b8	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	59.40	2026-01-01 16:43:32.206+02
2d1a6787-a2f2-437f-aaf6-f692043bd014	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	0.00	2026-01-01 16:43:32.289+02
eb57b2bb-3163-41d9-b232-c2baff66d6f4	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	100.00	2026-01-01 16:43:32.329+02
06abc531-3bb5-4c5c-9808-f2d53c6318d9	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.95	2026-01-01 16:43:37.362+02
35a081b6-6d24-4c57-b12a-b9050bebcb2d	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	21.59	2026-01-01 16:43:37.534+02
f8dcb4fe-d4f9-4283-a748-46f11c75c362	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	60.71	2026-01-01 16:43:37.633+02
17abb36e-2c03-4a87-a142-640d4de018e3	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	0.00	2026-01-01 16:43:37.682+02
e4ddc0c1-62f2-43b5-ae1a-21d0e1fe55d9	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	100.00	2026-01-01 16:43:37.772+02
e61bab9b-891f-4cc5-a898-a2ca87518132	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.98	2026-01-02 12:43:52.952+02
37d1987b-17d3-432e-bab3-f940861b557c	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	21.83	2026-01-02 12:43:53.053+02
d459ba0a-25ee-421f-8f11-f094dc551635	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	60.52	2026-01-02 12:43:53.063+02
0ecf2d5c-05d9-4956-b37b-744d088c71fa	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	0.00	2026-01-02 12:43:53.15+02
98a4b329-8154-466d-9b2f-a1e825d61637	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	100.00	2026-01-02 12:43:53.159+02
522ebc13-dd46-48d6-aaa3-3269dc84e9aa	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.95	2026-01-02 12:43:58.239+02
dd23bc35-f0fc-442c-879f-e0c2fabe556d	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	21.65	2026-01-02 12:43:58.326+02
21fd600d-4dd8-45af-a56b-4efa4e1cf18f	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	59.84	2026-01-02 12:43:58.418+02
32b6e082-d725-45a6-8790-cf6739c8cb77	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	0.00	2026-01-02 12:43:58.52+02
83b0c0e0-fcb7-466b-b31a-a26403fe2736	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	100.00	2026-01-02 12:43:58.623+02
511d6b21-15a7-4db3-9295-f33b66008d1b	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.98	2026-01-02 16:03:11.802+02
6ad47b1c-bea7-4aa7-bbcf-20117bb35fbc	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	21.80	2026-01-02 16:03:11.917+02
43012ec5-2a7b-4341-adf5-972373e39f36	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	60.76	2026-01-02 16:03:11.926+02
f56dc050-04b2-47de-924d-bd8b43b45853	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	0.00	2026-01-02 16:03:11.994+02
695d7d21-4208-46b6-96d8-f9d642291c16	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	100.00	2026-01-02 16:03:12.091+02
e3067803-83a8-4de7-b51e-4966eef22d29	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.95	2026-01-02 16:03:17.183+02
a8027ab5-29d7-4c75-9029-4bf647cc28eb	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	21.61	2026-01-02 16:03:17.292+02
1742e7a9-7cbf-4ee1-96bd-7b80c645b05a	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	61.98	2026-01-02 16:03:17.398+02
394b4061-f98b-442e-9c8c-cb24108e0112	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	0.00	2026-01-02 16:03:17.503+02
a0188496-d7c6-405c-ae88-0ceb33da182e	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	100.00	2026-01-02 16:03:17.601+02
6a8a235c-c920-4cc7-9a47-f2b455c2406f	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.98	2026-01-02 16:14:04.342+02
30d3f89b-20bb-4cbe-a02b-98a9f031732a	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	21.79	2026-01-02 16:14:04.421+02
9819ce88-4f18-4c2b-b598-5ef6db95b71b	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	61.02	2026-01-02 16:14:04.43+02
552540a9-d64d-480e-a15f-523983d889b4	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	0.00	2026-01-02 16:14:04.458+02
6798fa99-1eaf-4af3-87bf-d21ce4b7b7fc	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	100.00	2026-01-02 16:14:04.559+02
45f3844e-a3d7-4b6e-903f-0a25ea648240	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.95	2026-01-02 16:14:09.663+02
bd274889-e466-4138-8dee-4766ed58c1ef	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	21.61	2026-01-02 16:14:09.782+02
de2269b8-12a0-4ee1-918f-5bfe01465431	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	60.36	2026-01-02 16:14:09.88+02
57034ed9-1ef0-4339-95b5-a24e09b1f120	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	0.00	2026-01-02 16:14:09.977+02
150e0858-0057-4653-b948-0d80db13474d	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	100.00	2026-01-02 16:14:10.085+02
92ccf836-0655-4fee-8217-4d74f3f2af0c	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	SOIL_MOISTURE	59.93	2026-01-02 16:14:15.174+02
24d26f65-d74a-4737-8ff4-cdfaea06caf2	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	21.39	2026-01-02 16:14:15.275+02
85e73fcf-5439-4668-8714-fe6b1ff96fbc	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_HUMIDITY	61.03	2026-01-02 16:14:15.395+02
baf89bee-dc18-48a6-8ede-d701e08a8bf4	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	LIGHT_INTENSITY	0.00	2026-01-02 16:14:15.487+02
dc03c10f-2b88-4c95-9b2a-df093828602d	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	BATTERY_LEVEL	99.99	2026-01-02 16:14:15.576+02
f8f8446c-5e0a-4f13-a695-e430ebd13a99	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	45.50	2026-01-03 12:14:15.576+02
6b4dd867-136f-4e49-a985-4d54940f39c3	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	20.00	2026-01-03 12:14:15.576+02
ce059767-14d8-4bcd-9406-4d47be642072	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	20.00	2026-01-03 12:16:15.576+02
4478723c-74b3-4838-b083-d415fefc2ece	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	40.00	2026-01-03 12:18:15.576+02
549ffd66-2a19-4eaf-8463-3229f19fb6cb	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	40.00	2026-01-03 12:28:15.576+02
f14593d3-e3a6-4fe9-9766-ec1dc46454d4	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	20.00	2026-01-03 12:28:15.576+02
3720249b-94c5-4fb0-aca5-1d662a21329c	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	20.00	2026-01-03 12:28:15.576+02
c7023dac-ed69-4f12-accf-76f24a26e5a5	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	50.00	2026-01-03 12:28:15.576+02
1a71514a-c3f3-4612-9bdc-0e108123cd29	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	20.00	2026-01-03 12:38:15.576+02
a4e11a53-42ab-4cb5-8e2f-23e2653f4e9c	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	40.00	2026-01-03 12:38:15.576+02
a277c85e-1858-47c3-a0cd-0a3e8fd7240d	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	40.00	2026-01-03 12:48:15.576+02
63a3c15c-ec08-4b83-abce-05a9fec73087	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	20.00	2026-01-03 12:49:15.576+02
387934e5-444e-4d79-aa28-91f437d5dacc	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	40.00	2026-01-03 12:59:15.576+02
e4dc4f36-7f56-455b-acbe-904eecbb7962	4b7f9e12-3c8a-4f6e-b2a1-8a5d0cfa8f34	AIR_TEMPERATURE	20.00	2026-01-03 13:59:15.576+02
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, password_hash, full_name, role, telegram_chat_id, created_at, updated_at) FROM stdin;
aa076514-a670-4a6b-83c5-52e6e1efa455	user@eco.com	$2b$10$IMbE6xvHASS3Qb9slyJndO1Me9UZTdTXNMbo65kU5p6asI.pljtee	John Doe	CLEANER	\N	2025-12-31 15:05:50.213713+02	2025-12-31 15:05:50.213713+02
d5e6f7a8-b9c0-1d2e-3f4a-5b6c7d8e9f0a	admin@eco.com	$2b$10$IMbE6xvHASS3Qb9slyJndO1Me9UZTdTXNMbo65kU5p6asI.pljtee	Super Admin	ADMIN	\N	2025-12-31 15:04:29.525109+02	2025-12-31 15:06:15.739974+02
e6f7a8b9-c0d1-2e3f-4a5b-6c7d8e9f0a1b	florist@eco.com	$2b$10$IMbE6xvHASS3Qb9slyJndO1Me9UZTdTXNMbo65kU5p6asI.pljtee	Anna Florist	FLORIST	\N	2025-12-31 15:04:29.525109+02	2025-12-31 15:06:15.739974+02
f7a8b9c0-d1e2-3f4a-5b6c-7d8e9f0a1b2c	cleaner@eco.com	$2b$10$IMbE6xvHASS3Qb9slyJndO1Me9UZTdTXNMbo65kU5p6asI.pljtee	John Cleaner	CLEANER	\N	2025-12-31 15:04:29.525109+02	2025-12-31 15:06:15.739974+02
d8a72c68-2b45-4185-81f9-a42193a3cc92	user2@eco.com	$2b$10$YZjTmZ7uwmCoLbVTvlsw5u34FYO5DTrCunVyVain1PtzuszMR96Kq	John Doe	ADMIN	\N	2026-01-02 21:38:27.687386+02	2026-01-02 21:38:27.687386+02
bf3b81a7-417c-4d98-b1ca-ff4be2a043a3	user3@eco.com	$2b$10$XwNGxf.h7SkkGGHF3W.etOvuGe7H/.EHIKzF.6BmaniwDJvD01moO	John Doe	ADMIN	\N	2026-01-02 22:38:27.784396+02	2026-01-02 22:38:27.784396+02
9129fb7f-c921-4f15-8de6-0e5d131f858c	user4@eco.com	$2b$10$sMYHsvHolNi565ltUIs.Nu6.186kide5MgXwt7qhCv7mITFNkS3oG	John Doe	CLEANER	\N	2026-01-03 09:55:56.017155+02	2026-01-03 09:55:56.017155+02
\.


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE SET; Schema: drizzle; Owner: postgres
--

SELECT pg_catalog.setval('drizzle.__drizzle_migrations_id_seq', 1, false);


--
-- Name: __drizzle_migrations __drizzle_migrations_pkey; Type: CONSTRAINT; Schema: drizzle; Owner: postgres
--

ALTER TABLE ONLY drizzle.__drizzle_migrations
    ADD CONSTRAINT __drizzle_migrations_pkey PRIMARY KEY (id);


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

\unrestrict G11Y4bm0rVgboUxDd763xHvoDCdgwmlqbhIzrjcHaIUL7gAq1LQFWALvU9Gxkyf


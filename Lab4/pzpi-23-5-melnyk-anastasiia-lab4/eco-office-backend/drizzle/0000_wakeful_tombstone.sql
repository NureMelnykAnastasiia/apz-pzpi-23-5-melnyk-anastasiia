CREATE TYPE "public"."plant_health_status" AS ENUM('HEALTHY', 'NEEDS_ATTENTION', 'CRITICAL');--> statement-breakpoint
CREATE TYPE "public"."reading_type" AS ENUM('SOIL_MOISTURE', 'AIR_TEMPERATURE', 'AIR_HUMIDITY', 'LIGHT_INTENSITY', 'BATTERY_LEVEL');--> statement-breakpoint
CREATE TYPE "public"."task_status" AS ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'SKIPPED');--> statement-breakpoint
CREATE TYPE "public"."task_type" AS ENUM('WATERING', 'FERTILIZING', 'LIGHT_ADJUSTMENT', 'PEST_CONTROL', 'CLEANING');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('ADMIN', 'OFFICE_MANAGER', 'FLORIST', 'CLEANER');--> statement-breakpoint
CREATE TABLE "care_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" uuid,
	"plant_id" uuid NOT NULL,
	"type" "task_type" NOT NULL,
	"performed_by_user_id" uuid,
	"notes" text,
	"verified_by_scan" boolean DEFAULT false,
	"performed_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "care_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plant_id" uuid,
	"required_role" "user_role" NOT NULL,
	"type" "task_type" NOT NULL,
	"priority" integer DEFAULT 1,
	"description" text,
	"due_date" timestamp with time zone,
	"status" "task_status" DEFAULT 'PENDING',
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "iot_sensors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mac_address" varchar(50) NOT NULL,
	"plant_id" uuid,
	"sensor_model" varchar(50),
	"firmware_version" varchar(20),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "iot_sensors_mac_address_unique" UNIQUE("mac_address")
);
--> statement-breakpoint
CREATE TABLE "locations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"floor_number" integer,
	"description" text,
	"map_image_url" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "plant_species" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scientific_name" varchar(150) NOT NULL,
	"common_name" varchar(150) NOT NULL,
	"description" text,
	"min_soil_moisture" real NOT NULL,
	"max_soil_moisture" real NOT NULL,
	"min_temperature" real,
	"max_temperature" real,
	"min_light_lux" real,
	"max_light_lux" real,
	"watering_frequency_days" integer,
	"fertilizing_frequency_days" integer,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "plants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100),
	"qr_code_id" varchar(100) NOT NULL,
	"species_id" uuid,
	"location_id" uuid,
	"map_x_coordinate" integer,
	"map_y_coordinate" integer,
	"health_status" "plant_health_status" DEFAULT 'HEALTHY',
	"photo_url" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "plants_qr_code_id_unique" UNIQUE("qr_code_id")
);
--> statement-breakpoint
CREATE TABLE "sensor_readings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sensor_id" uuid,
	"type" "reading_type" NOT NULL,
	"value" numeric(10, 2) NOT NULL,
	"recorded_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"full_name" varchar(100) NOT NULL,
	"role" "user_role" DEFAULT 'CLEANER' NOT NULL,
	"telegram_chat_id" varchar(50),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "care_logs" ADD CONSTRAINT "care_logs_task_id_care_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."care_tasks"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "care_logs" ADD CONSTRAINT "care_logs_plant_id_plants_id_fk" FOREIGN KEY ("plant_id") REFERENCES "public"."plants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "care_logs" ADD CONSTRAINT "care_logs_performed_by_user_id_users_id_fk" FOREIGN KEY ("performed_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "care_tasks" ADD CONSTRAINT "care_tasks_plant_id_plants_id_fk" FOREIGN KEY ("plant_id") REFERENCES "public"."plants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iot_sensors" ADD CONSTRAINT "iot_sensors_plant_id_plants_id_fk" FOREIGN KEY ("plant_id") REFERENCES "public"."plants"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plants" ADD CONSTRAINT "plants_species_id_plant_species_id_fk" FOREIGN KEY ("species_id") REFERENCES "public"."plant_species"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plants" ADD CONSTRAINT "plants_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sensor_readings" ADD CONSTRAINT "sensor_readings_sensor_id_iot_sensors_id_fk" FOREIGN KEY ("sensor_id") REFERENCES "public"."iot_sensors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_readings_sensor_type_time" ON "sensor_readings" USING btree ("sensor_id","type","recorded_at");
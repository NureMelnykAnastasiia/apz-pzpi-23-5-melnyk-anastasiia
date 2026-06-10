import { pgTable, uuid, varchar, text, integer, real, boolean, timestamp, pgEnum, numeric, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';


export const userRoleEnum = pgEnum('user_role', ['ADMIN', 'OFFICE_MANAGER', 'FLORIST', 'CLEANER']);
export const taskStatusEnum = pgEnum('task_status', ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'SKIPPED']);
export const taskTypeEnum = pgEnum('task_type', ['WATERING', 'FERTILIZING', 'LIGHT_ADJUSTMENT', 'PEST_CONTROL', 'CLEANING']);
export const plantHealthStatusEnum = pgEnum('plant_health_status', ['HEALTHY', 'NEEDS_ATTENTION', 'CRITICAL']);
export const readingTypeEnum = pgEnum('reading_type', ['SOIL_MOISTURE', 'AIR_TEMPERATURE', 'AIR_HUMIDITY', 'LIGHT_INTENSITY', 'BATTERY_LEVEL']);

export const locations = pgTable('locations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  floorNumber: integer('floor_number'),
  description: text('description'),
  mapImageUrl: text('map_image_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const plantSpecies = pgTable('plant_species', {
  id: uuid('id').primaryKey().defaultRandom(),
  scientificName: varchar('scientific_name', { length: 150 }).notNull(),
  commonName: varchar('common_name', { length: 150 }).notNull(),
  description: text('description'),
 
  minSoilMoisture: real('min_soil_moisture').notNull(),
  maxSoilMoisture: real('max_soil_moisture').notNull(),
  minTemperature: real('min_temperature'),
  maxTemperature: real('max_temperature'),
  minLightLux: real('min_light_lux'),
  maxLightLux: real('max_light_lux'),
  
  wateringFrequencyDays: integer('watering_frequency_days'),
  fertilizingFrequencyDays: integer('fertilizing_frequency_days'),
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  fullName: varchar('full_name', { length: 100 }).notNull(),
  role: userRoleEnum('role').default('CLEANER').notNull(),
  telegramChatId: varchar('telegram_chat_id', { length: 50 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const plants = pgTable('plants', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }),
  qrCodeId: varchar('qr_code_id', { length: 100 }).unique().notNull(),
  
  speciesId: uuid('species_id').references(() => plantSpecies.id, { onDelete: 'restrict' }),
  locationId: uuid('location_id').references(() => locations.id, { onDelete: 'set null' }),
  
  mapXCoordinate: integer('map_x_coordinate'),
  mapYCoordinate: integer('map_y_coordinate'),
  
  healthStatus: plantHealthStatusEnum('health_status').default('HEALTHY'),
  photoUrl: text('photo_url'),
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const iotSensors = pgTable('iot_sensors', {
  id: uuid('id').primaryKey().defaultRandom(),
  macAddress: varchar('mac_address', { length: 50 }).unique().notNull(),
  plantId: uuid('plant_id').references(() => plants.id, { onDelete: 'set null' }),
  
  sensorModel: varchar('sensor_model', { length: 50 }),
  firmwareVersion: varchar('firmware_version', { length: 20 }),
  isActive: boolean('is_active').default(true),
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const sensorReadings = pgTable('sensor_readings', {
  id: uuid('id').primaryKey().defaultRandom(),
  sensorId: uuid('sensor_id').references(() => iotSensors.id, { onDelete: 'cascade' }),
  type: readingTypeEnum('type').notNull(),
  value: numeric('value', { precision: 10, scale: 2 }).notNull(),
  recordedAt: timestamp('recorded_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  idxReadingsSensorTypeTime: index('idx_readings_sensor_type_time').on(table.sensorId, table.type, table.recordedAt),
}));

export const careTasks = pgTable('care_tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  plantId: uuid('plant_id').references(() => plants.id, { onDelete: 'cascade' }),
  
  requiredRole: userRoleEnum('required_role').notNull(),
  type: taskTypeEnum('type').notNull(),
  priority: integer('priority').default(1),
  
  description: text('description'),
  dueDate: timestamp('due_date', { withTimezone: true }),
  status: taskStatusEnum('status').default('PENDING'),
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const careLogs = pgTable('care_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  taskId: uuid('task_id').references(() => careTasks.id, { onDelete: 'set null' }),
  plantId: uuid('plant_id').references(() => plants.id, { onDelete: 'cascade' }).notNull(),
  type: taskTypeEnum('type').notNull(),
  
  performedByUserId: uuid('performed_by_user_id').references(() => users.id, { onDelete: 'set null' }),
  
  notes: text('notes'),
  verifiedByScan: boolean('verified_by_scan').default(false),
  performedAt: timestamp('performed_at', { withTimezone: true }).defaultNow(),
});


export const locationsRelations = relations(locations, ({ many }) => ({
  plants: many(plants),
}));

export const plantSpeciesRelations = relations(plantSpecies, ({ many }) => ({
  plants: many(plants),
}));

export const usersRelations = relations(users, ({ many }) => ({
  performedLogs: many(careLogs),
}));

export const plantsRelations = relations(plants, ({ one, many }) => ({
  species: one(plantSpecies, {
    fields: [plants.speciesId],
    references: [plantSpecies.id],
  }),
  location: one(locations, {
    fields: [plants.locationId],
    references: [locations.id],
  }),
  sensors: many(iotSensors),
  tasks: many(careTasks),
  logs: many(careLogs),
}));

export const iotSensorsRelations = relations(iotSensors, ({ one, many }) => ({
  plant: one(plants, {
    fields: [iotSensors.plantId],
    references: [plants.id],
  }),
  readings: many(sensorReadings),
}));

export const sensorReadingsRelations = relations(sensorReadings, ({ one }) => ({
  sensor: one(iotSensors, {
    fields: [sensorReadings.sensorId],
    references: [iotSensors.id],
  }),
}));

export const careTasksRelations = relations(careTasks, ({ one, many }) => ({
  plant: one(plants, {
    fields: [careTasks.plantId],
    references: [plants.id],
  }),
  logs: many(careLogs), 
}));

export const careLogsRelations = relations(careLogs, ({ one }) => ({
  task: one(careTasks, {
    fields: [careLogs.taskId],
    references: [careTasks.id],
  }),
  plant: one(plants, {
    fields: [careLogs.plantId],
    references: [plants.id],
  }),
  performedBy: one(users, {
    fields: [careLogs.performedByUserId],
    references: [users.id],
  }),
}));
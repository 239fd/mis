-- ============================================================
-- БД: Аналитическое приложение для автоматизации записи
-- пациентов на приём в поликлинике Республики Беларусь
-- СУБД: PostgreSQL
-- ID: UUID (gen_random_uuid())
-- Нормализация: 3НФ
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUM-ТИПЫ (заменены на VARCHAR для совместимости с Hibernate 6+)
-- Допустимые значения проверяются на уровне приложения
-- ============================================================
-- Gender: 'MALE', 'FEMALE'
-- ExceptionType: 'VACATION', 'SICK_LEAVE', 'DAY_OFF', 'DISMISSAL', 'OTHER'
-- AppointmentStatus: 'WAITING', 'IN_PROGRESS', 'COMPLETED', 'NO_SHOW', 'CANCELLED', 'RESCHEDULED'
-- AppointmentSource: 'ONLINE', 'PHONE', 'WALK_IN'
-- Relationship: 'SELF', 'CHILD', 'SPOUSE', 'PARENT', 'RELATIVE'

-- ============================================================
-- 1. СПРАВОЧНИК РОЛЕЙ
-- (нормативно-справочная таблица)
-- ============================================================
CREATE TABLE roles
(
    id          UUID      DEFAULT gen_random_uuid() PRIMARY KEY,
    name        VARCHAR(50)                         NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ============================================================
-- 2. ПОЛЬЗОВАТЕЛИ СИСТЕМЫ
-- (оперативная таблица)
-- ============================================================
CREATE TABLE users
(
    id            UUID      DEFAULT gen_random_uuid() PRIMARY KEY,
    role_id       UUID                                NOT NULL,
    login         VARCHAR(100)                        NOT NULL UNIQUE,
    password_hash VARCHAR(256)                        NOT NULL,
    email         VARCHAR(150),
    phone         VARCHAR(20),
    is_active     BOOLEAN   DEFAULT TRUE              NOT NULL,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles (id)
);

-- ============================================================
-- 3. СПРАВОЧНИК МЕДИЦИНСКИХ СПЕЦИАЛЬНОСТЕЙ
-- (нормативно-справочная таблица)
-- ============================================================
CREATE TABLE medical_specialties
(
    id          UUID      DEFAULT gen_random_uuid() PRIMARY KEY,
    name        VARCHAR(150)                        NOT NULL UNIQUE,
    description VARCHAR(500),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ============================================================
-- 4. СОТРУДНИКИ ПОЛИКЛИНИКИ
-- (оперативная таблица)
-- ============================================================
CREATE TABLE employees
(
    id             UUID      DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id        UUID                                NOT NULL UNIQUE,
    specialty_id   UUID, -- NULL для не-врачей
    last_name      VARCHAR(100)                        NOT NULL,
    first_name     VARCHAR(100)                        NOT NULL,
    middle_name    VARCHAR(100),
    position       VARCHAR(150)                        NOT NULL,
    cabinet        VARCHAR(20),
    hire_date      DATE                                NOT NULL,
    dismissal_date DATE,
    is_active      BOOLEAN   DEFAULT TRUE              NOT NULL,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_employees_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_employees_specialty FOREIGN KEY (specialty_id) REFERENCES medical_specialties (id)
);

-- ============================================================
-- 5. ПАЦИЕНТЫ
-- (оперативная таблица)
--
-- ЛОГИКА ПРИВЯЗКИ К АККАУНТУ:
-- При записи через регистратуру/телефон сотрудник создаёт
-- пациента по паспорту — поле user_id остаётся NULL.
-- Когда гражданин регистрируется в системе, по паспортным
-- данным находится существующая запись пациента и
-- проставляется user_id (или создаётся связь в user_patients).
-- ============================================================
CREATE TABLE patients
(
    id              UUID      DEFAULT gen_random_uuid() PRIMARY KEY,
    last_name       VARCHAR(100)                        NOT NULL,
    first_name      VARCHAR(100)                        NOT NULL,
    middle_name     VARCHAR(100),
    gender          VARCHAR(10)                         NOT NULL,
    birth_date      DATE                                NOT NULL,
    passport_series VARCHAR(10)                         NOT NULL,
    passport_number VARCHAR(20)                         NOT NULL,
    phone           VARCHAR(20),
    email           VARCHAR(150),
    address         VARCHAR(500),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_patient_passport UNIQUE (passport_series, passport_number)
);

-- ============================================================
-- 6. СВЯЗЬ ПОЛЬЗОВАТЕЛЕЙ И ПАЦИЕНТОВ (M:N)
--
-- При регистрации пользователя система ищет пациентов
-- по паспортным данным и автоматически создаёт связь
-- с relationship = 'SELF'.
-- Пользователь может добавить родственников/детей —
-- по их паспорту ищется или создаётся запись в patients,
-- а здесь фиксируется связь.
-- Один пациент может быть привязан к нескольким пользователям.
-- ============================================================
CREATE TABLE user_patients
(
    id           UUID              DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id      UUID                                        NOT NULL,
    patient_id   UUID                                        NOT NULL,
    relationship VARCHAR(20)       DEFAULT 'SELF'            NOT NULL,
    created_at   TIMESTAMP         DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_up_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_up_patient FOREIGN KEY (patient_id) REFERENCES patients (id),
    CONSTRAINT uq_user_patient UNIQUE (user_id, patient_id)
);

CREATE UNIQUE INDEX uq_user_self_relationship
    ON user_patients (user_id)
    WHERE relationship = 'SELF';

-- ============================================================
-- 7. СПРАВОЧНИК УСЛУГ
-- (нормативно-справочная таблица)
-- ============================================================
CREATE TABLE services
(
    id          UUID      DEFAULT gen_random_uuid() PRIMARY KEY,
    name        VARCHAR(250)                        NOT NULL UNIQUE,
    description VARCHAR(500),
    is_active   BOOLEAN   DEFAULT TRUE              NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ============================================================
-- 8. НОРМЫ ДЛИТЕЛЬНОСТИ УСЛУГ
-- (нормативно-справочная таблица)
-- ============================================================
CREATE TABLE service_durations
(
    id             UUID      DEFAULT gen_random_uuid() PRIMARY KEY,
    service_id     UUID                                NOT NULL,
    duration_min   INTEGER                             NOT NULL,
    effective_from DATE                                NOT NULL,
    effective_to   DATE, -- NULL = бессрочно
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_sd_service FOREIGN KEY (service_id) REFERENCES services (id)
);

-- ============================================================
-- 9. СВЯЗЬ ВРАЧЕЙ И УСЛУГ (M:N)
-- (нормативно-справочная таблица)
-- ============================================================
CREATE TABLE doctor_services
(
    id          UUID      DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID                                NOT NULL,
    service_id  UUID                                NOT NULL,
    is_active   BOOLEAN   DEFAULT TRUE              NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_ds_employee FOREIGN KEY (employee_id) REFERENCES employees (id),
    CONSTRAINT fk_ds_service FOREIGN KEY (service_id) REFERENCES services (id),
    CONSTRAINT uq_doctor_service UNIQUE (employee_id, service_id)
);

-- ============================================================
-- 10. ГРАФИК РАБОТЫ ВРАЧА
-- (оперативная таблица)
-- ============================================================
CREATE TABLE doctor_schedules
(
    id              UUID      DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id     UUID                                NOT NULL,
    day_of_week     INTEGER                             NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
    start_time      TIME                                NOT NULL,
    end_time        TIME                                NOT NULL,
    paid_start_time TIME,
    paid_end_time   TIME,
    cabinet         VARCHAR(20),
    effective_from  DATE                                NOT NULL,
    effective_to    DATE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_ds_employee_schedule FOREIGN KEY (employee_id) REFERENCES employees (id)
);

-- ============================================================
-- 11. ИСКЛЮЧЕНИЯ ИЗ ГРАФИКА ВРАЧА
-- (оперативная таблица)
-- ============================================================
CREATE TABLE schedule_exceptions
(
    id             UUID      DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id    UUID                                NOT NULL,
    exception_type VARCHAR(20)                         NOT NULL,
    date_from      DATE                                NOT NULL,
    date_to        DATE                                NOT NULL,
    reason         VARCHAR(500),
    created_by     UUID                                NOT NULL,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_se_employee FOREIGN KEY (employee_id) REFERENCES employees (id),
    CONSTRAINT fk_se_created_by FOREIGN KEY (created_by) REFERENCES users (id)
);

-- ============================================================
-- 12. ЗАПИСИ НА ПРИЁМ
-- (основная оперативная таблица)
--
-- created_by может быть NULL если запись создана регистратурой
-- для пациента без аккаунта — в этом случае created_by
-- ссылается на пользователя-сотрудника регистратуры.
-- ============================================================
CREATE TABLE appointments
(
    id               UUID                    DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id       UUID                                              NOT NULL,
    employee_id      UUID                                              NOT NULL,
    service_id       UUID                                              NOT NULL,
    schedule_id      UUID,
    appointment_date DATE                                              NOT NULL,
    start_time       TIMESTAMP                                         NOT NULL,
    end_time         TIMESTAMP                                         NOT NULL,
    is_paid          BOOLEAN                 DEFAULT FALSE             NOT NULL,
    status           VARCHAR(20)             DEFAULT 'WAITING'         NOT NULL,
    source           VARCHAR(20)             DEFAULT 'ONLINE'          NOT NULL,
    created_by       UUID                                              NOT NULL,
    cancel_reason    VARCHAR(500),
    created_at       TIMESTAMP               DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at       TIMESTAMP               DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_app_patient FOREIGN KEY (patient_id) REFERENCES patients (id),
    CONSTRAINT fk_app_employee FOREIGN KEY (employee_id) REFERENCES employees (id),
    CONSTRAINT fk_app_service FOREIGN KEY (service_id) REFERENCES services (id),
    CONSTRAINT fk_app_schedule FOREIGN KEY (schedule_id) REFERENCES doctor_schedules (id),
    CONSTRAINT fk_app_created_by FOREIGN KEY (created_by) REFERENCES users (id)
);

-- ============================================================
-- 13. ИСТОРИЯ СТАТУСОВ ЗАПИСЕЙ
-- (оперативная таблица)
-- ============================================================
CREATE TABLE appointment_status_history
(
    id             UUID      DEFAULT gen_random_uuid() PRIMARY KEY,
    appointment_id UUID                                NOT NULL,
    old_status     VARCHAR(20),
    new_status     VARCHAR(20)                         NOT NULL,
    changed_by     UUID                                NOT NULL,
    change_reason  VARCHAR(500),
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_ash_appointment FOREIGN KEY (appointment_id) REFERENCES appointments (id),
    CONSTRAINT fk_ash_changed_by FOREIGN KEY (changed_by) REFERENCES users (id)
);

-- ============================================================
-- ИНДЕКСЫ
-- ============================================================
CREATE INDEX idx_users_role ON users (role_id);
CREATE INDEX idx_employees_specialty ON employees (specialty_id);
CREATE INDEX idx_employees_user ON employees (user_id);
CREATE INDEX idx_up_user ON user_patients (user_id);
CREATE INDEX idx_up_patient ON user_patients (patient_id);
CREATE INDEX idx_sd_service ON service_durations (service_id);
CREATE INDEX idx_ds_employee ON doctor_services (employee_id);
CREATE INDEX idx_ds_service ON doctor_services (service_id);
CREATE INDEX idx_sched_employee ON doctor_schedules (employee_id);
CREATE INDEX idx_se_employee ON schedule_exceptions (employee_id);
CREATE INDEX idx_app_patient ON appointments (patient_id);
CREATE INDEX idx_app_employee ON appointments (employee_id);
CREATE INDEX idx_app_date ON appointments (appointment_date);
CREATE INDEX idx_app_status ON appointments (status);
CREATE INDEX idx_ash_appointment ON appointment_status_history (appointment_id);
CREATE INDEX idx_patients_passport ON patients (passport_series, passport_number);

-- ============================================================
-- ЗАПОЛНЕНИЕ СПРАВОЧНИКОВ
-- ============================================================

-- ---------- ROLES ----------
INSERT INTO roles (name, description)
VALUES ('ADMIN', 'Системный администратор поликлиники'),
       ('PATIENT', 'Пациент (гражданин)'),
       ('DOCTOR', 'Врач'),
       ('RECEPTIONIST', 'Сотрудник регистратуры'),
       ('MANAGER', 'Руководитель (заведующий)');

-- ---------- ADMIN USER ----------
-- Логин: admin, Пароль: admin123
INSERT INTO users (login, password_hash, email, phone, is_active, role_id)
SELECT 'admin',
       '$2a$10$24yI.EqeKqP0yDquf3r.e.NkFjf7dnkF6aFMDmZMKAH/W4GuuRlnW',
       'admin@clinic.by',
       '+375290000000',
       TRUE,
       r.id
FROM roles r WHERE r.name = 'ADMIN';

-- ---------- MEDICAL_SPECIALTIES ----------
INSERT INTO medical_specialties (name, description)
VALUES ('Терапия', 'Врач-терапевт участковый'),
       ('Хирургия', 'Врач-хирург'),
       ('Офтальмология', 'Врач-офтальмолог'),
       ('Кардиология', 'Врач-кардиолог'),
       ('Неврология', 'Врач-невролог'),
       ('Оториноларингология', 'Врач-оториноларинголог (ЛОР)');

-- ---------- SERVICES ----------
INSERT INTO services (name, description)
VALUES ('Приём терапевта первичный', 'Первичная консультация врача-терапевта'),
       ('Приём терапевта повторный', 'Повторная консультация врача-терапевта'),
       ('Приём хирурга первичный', 'Первичная консультация врача-хирурга'),
       ('Приём офтальмолога', 'Консультация врача-офтальмолога'),
       ('Приём кардиолога', 'Консультация врача-кардиолога'),
       ('ЭКГ', 'Электрокардиография'),
       ('Приём невролога', 'Консультация врача-невролога'),
       ('Приём ЛОР', 'Консультация врача-оториноларинголога');

-- ---------- SERVICE_DURATIONS (нормы длительности услуг) ----------
INSERT INTO service_durations (service_id, duration_min, effective_from)
SELECT id, 20, '2024-01-01' FROM services WHERE name = 'Приём терапевта первичный'
UNION ALL
SELECT id, 15, '2024-01-01' FROM services WHERE name = 'Приём терапевта повторный'
UNION ALL
SELECT id, 30, '2024-01-01' FROM services WHERE name = 'Приём хирурга первичный'
UNION ALL
SELECT id, 20, '2024-01-01' FROM services WHERE name = 'Приём офтальмолога'
UNION ALL
SELECT id, 25, '2024-01-01' FROM services WHERE name = 'Приём кардиолога'
UNION ALL
SELECT id, 15, '2024-01-01' FROM services WHERE name = 'ЭКГ'
UNION ALL
SELECT id, 25, '2024-01-01' FROM services WHERE name = 'Приём невролога'
UNION ALL
SELECT id, 20, '2024-01-01' FROM services WHERE name = 'Приём ЛОР';

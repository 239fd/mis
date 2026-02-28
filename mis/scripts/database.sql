CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE roles
(
    id          UUID      DEFAULT gen_random_uuid() PRIMARY KEY,
    name        VARCHAR(50)                         NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

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

CREATE TABLE medical_specialties
(
    id          UUID      DEFAULT gen_random_uuid() PRIMARY KEY,
    name        VARCHAR(150)                        NOT NULL UNIQUE,
    description VARCHAR(500),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE employees
(
    id             UUID      DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id        UUID                                NOT NULL UNIQUE,
    specialty_id   UUID,
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

CREATE TABLE user_patients
(
    id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id      UUID                                  NOT NULL,
    patient_id   UUID                                  NOT NULL,
    relationship VARCHAR(20) DEFAULT 'SELF'            NOT NULL,
    created_at   TIMESTAMP   DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_up_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_up_patient FOREIGN KEY (patient_id) REFERENCES patients (id),
    CONSTRAINT uq_user_patient UNIQUE (user_id, patient_id)
);

CREATE UNIQUE INDEX uq_user_self_relationship
    ON user_patients (user_id) WHERE relationship = 'SELF';

CREATE TABLE services
(
    id          UUID      DEFAULT gen_random_uuid() PRIMARY KEY,
    name        VARCHAR(250)                        NOT NULL UNIQUE,
    description VARCHAR(500),
    is_active   BOOLEAN   DEFAULT TRUE              NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE service_durations
(
    id             UUID      DEFAULT gen_random_uuid() PRIMARY KEY,
    service_id     UUID                                NOT NULL,
    duration_min   INTEGER                             NOT NULL,
    effective_from DATE                                NOT NULL,
    effective_to   DATE,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_sd_service FOREIGN KEY (service_id) REFERENCES services (id)
);

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

CREATE TABLE appointments
(
    id               UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id       UUID                                  NOT NULL,
    employee_id      UUID                                  NOT NULL,
    service_id       UUID                                  NOT NULL,
    schedule_id      UUID,
    appointment_date DATE                                  NOT NULL,
    start_time       TIMESTAMP                             NOT NULL,
    end_time         TIMESTAMP                             NOT NULL,
    is_paid          BOOLEAN     DEFAULT FALSE             NOT NULL,
    status           VARCHAR(20) DEFAULT 'WAITING'         NOT NULL,
    source           VARCHAR(20) DEFAULT 'ONLINE'          NOT NULL,
    created_by       UUID                                  NOT NULL,
    cancel_reason    VARCHAR(500),
    created_at       TIMESTAMP   DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at       TIMESTAMP   DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_app_patient FOREIGN KEY (patient_id) REFERENCES patients (id),
    CONSTRAINT fk_app_employee FOREIGN KEY (employee_id) REFERENCES employees (id),
    CONSTRAINT fk_app_service FOREIGN KEY (service_id) REFERENCES services (id),
    CONSTRAINT fk_app_schedule FOREIGN KEY (schedule_id) REFERENCES doctor_schedules (id),
    CONSTRAINT fk_app_created_by FOREIGN KEY (created_by) REFERENCES users (id)
);

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

INSERT INTO roles (name, description)
VALUES ('ADMIN', 'Системный администратор поликлиники'),
       ('PATIENT', 'Пациент (гражданин)'),
       ('DOCTOR', 'Врач'),
       ('RECEPTIONIST', 'Сотрудник регистратуры'),
       ('MANAGER', 'Руководитель (заведующий)');

INSERT INTO users (login, password_hash, email, phone, is_active, role_id)
SELECT 'admin',
       '$2a$10$24yI.EqeKqP0yDquf3r.e.NkFjf7dnkF6aFMDmZMKAH/W4GuuRlnW',
       'admin@clinic.by',
       '+375290000000',
       TRUE,
       r.id
FROM roles r
WHERE r.name = 'ADMIN';

INSERT INTO medical_specialties (name, description)
VALUES ('Терапия', 'Врач-терапевт участковый'),
       ('Хирургия', 'Врач-хирург'),
       ('Офтальмология', 'Врач-офтальмолог'),
       ('Кардиология', 'Врач-кардиолог'),
       ('Неврология', 'Врач-невролог'),
       ('Оториноларингология', 'Врач-оториноларинголог (ЛОР)');

INSERT INTO services (name, description)
VALUES ('Приём терапевта первичный', 'Первичная консультация врача-терапевта'),
       ('Приём терапевта повторный', 'Повторная консультация врача-терапевта'),
       ('Приём хирурга первичный', 'Первичная консультация врача-хирурга'),
       ('Приём офтальмолога', 'Консультация врача-офтальмолога'),
       ('Приём кардиолога', 'Консультация врача-кардиолога'),
       ('ЭКГ', 'Электрокардиография'),
       ('Приём невролога', 'Консультация врача-невролога'),
       ('Приём ЛОР', 'Консультация врача-оториноларинголога');

INSERT INTO service_durations (service_id, duration_min, effective_from)
SELECT id, 20, '2024-01-01'::DATE
FROM services
WHERE name = 'Приём терапевта первичный'
UNION ALL
SELECT id, 15, '2024-01-01'::DATE
FROM services
WHERE name = 'Приём терапевта повторный'
UNION ALL
SELECT id, 30, '2024-01-01'::DATE
FROM services
WHERE name = 'Приём хирурга первичный'
UNION ALL
SELECT id, 20, '2024-01-01'::DATE
FROM services
WHERE name = 'Приём офтальмолога'
UNION ALL
SELECT id, 25, '2024-01-01'::DATE
FROM services
WHERE name = 'Приём кардиолога'
UNION ALL
SELECT id, 15, '2024-01-01'::DATE
FROM services
WHERE name = 'ЭКГ'
UNION ALL
SELECT id, 15, '2024-01-01'::DATE
FROM services
WHERE name = 'Приём невролога'
UNION ALL
SELECT id, 20, '2024-01-01'::DATE
FROM services
WHERE name = 'Приём ЛОР';

INSERT INTO users (login, password_hash, email, phone, is_active, role_id)
SELECT 'ivanov.doc',
       '$2a$10$24yI.EqeKqP0yDquf3r.e.NkFjf7dnkF6aFMDmZMKAH/W4GuuRlnW',
       'ivanov@clinic.by',
       '+375291111111',
       TRUE,
       r.id
FROM roles r
WHERE r.name = 'DOCTOR';

INSERT INTO users (login, password_hash, email, phone, is_active, role_id)
SELECT 'petrova.doc',
       '$2a$10$24yI.EqeKqP0yDquf3r.e.NkFjf7dnkF6aFMDmZMKAH/W4GuuRlnW',
       'petrova@clinic.by',
       '+375291111112',
       TRUE,
       r.id
FROM roles r
WHERE r.name = 'DOCTOR';

INSERT INTO users (login, password_hash, email, phone, is_active, role_id)
SELECT 'sidorov.doc',
       '$2a$10$24yI.EqeKqP0yDquf3r.e.NkFjf7dnkF6aFMDmZMKAH/W4GuuRlnW',
       'sidorov@clinic.by',
       '+375291111113',
       TRUE,
       r.id
FROM roles r
WHERE r.name = 'DOCTOR';

INSERT INTO users (login, password_hash, email, phone, is_active, role_id)
SELECT 'kuznetsova.doc',
       '$2a$10$24yI.EqeKqP0yDquf3r.e.NkFjf7dnkF6aFMDmZMKAH/W4GuuRlnW',
       'kuznetsova@clinic.by',
       '+375291111114',
       TRUE,
       r.id
FROM roles r
WHERE r.name = 'DOCTOR';

INSERT INTO users (login, password_hash, email, phone, is_active, role_id)
SELECT 'morozov.doc',
       '$2a$10$24yI.EqeKqP0yDquf3r.e.NkFjf7dnkF6aFMDmZMKAH/W4GuuRlnW',
       'morozov@clinic.by',
       '+375291111115',
       TRUE,
       r.id
FROM roles r
WHERE r.name = 'DOCTOR';

INSERT INTO users (login, password_hash, email, phone, is_active, role_id)
SELECT 'volkova.doc',
       '$2a$10$24yI.EqeKqP0yDquf3r.e.NkFjf7dnkF6aFMDmZMKAH/W4GuuRlnW',
       'volkova@clinic.by',
       '+375291111116',
       TRUE,
       r.id
FROM roles r
WHERE r.name = 'DOCTOR';

INSERT INTO users (login, password_hash, email, phone, is_active, role_id)
SELECT 'smirnova.reg',
       '$2a$10$24yI.EqeKqP0yDquf3r.e.NkFjf7dnkF6aFMDmZMKAH/W4GuuRlnW',
       'smirnova@clinic.by',
       '+375292222221',
       TRUE,
       r.id
FROM roles r
WHERE r.name = 'RECEPTIONIST';

INSERT INTO users (login, password_hash, email, phone, is_active, role_id)
SELECT 'kozlova.reg',
       '$2a$10$24yI.EqeKqP0yDquf3r.e.NkFjf7dnkF6aFMDmZMKAH/W4GuuRlnW',
       'kozlova@clinic.by',
       '+375292222222',
       TRUE,
       r.id
FROM roles r
WHERE r.name = 'RECEPTIONIST';

INSERT INTO users (login, password_hash, email, phone, is_active, role_id)
SELECT 'fedorov.mgr',
       '$2a$10$24yI.EqeKqP0yDquf3r.e.NkFjf7dnkF6aFMDmZMKAH/W4GuuRlnW',
       'fedorov@clinic.by',
       '+375293333331',
       TRUE,
       r.id
FROM roles r
WHERE r.name = 'MANAGER';

INSERT INTO users (login, password_hash, email, phone, is_active, role_id)
SELECT 'novikov.pat',
       '$2a$10$24yI.EqeKqP0yDquf3r.e.NkFjf7dnkF6aFMDmZMKAH/W4GuuRlnW',
       'novikov@mail.by',
       '+375294444441',
       TRUE,
       r.id
FROM roles r
WHERE r.name = 'PATIENT';

INSERT INTO users (login, password_hash, email, phone, is_active, role_id)
SELECT 'sokolova.pat',
       '$2a$10$24yI.EqeKqP0yDquf3r.e.NkFjf7dnkF6aFMDmZMKAH/W4GuuRlnW',
       'sokolova@mail.by',
       '+375294444442',
       TRUE,
       r.id
FROM roles r
WHERE r.name = 'PATIENT';

INSERT INTO users (login, password_hash, email, phone, is_active, role_id)
SELECT 'lebedev.pat',
       '$2a$10$24yI.EqeKqP0yDquf3r.e.NkFjf7dnkF6aFMDmZMKAH/W4GuuRlnW',
       'lebedev@mail.by',
       '+375294444443',
       TRUE,
       r.id
FROM roles r
WHERE r.name = 'PATIENT';

INSERT INTO users (login, password_hash, email, phone, is_active, role_id)
SELECT 'komarova.pat',
       '$2a$10$24yI.EqeKqP0yDquf3r.e.NkFjf7dnkF6aFMDmZMKAH/W4GuuRlnW',
       'komarova@mail.by',
       '+375294444444',
       TRUE,
       r.id
FROM roles r
WHERE r.name = 'PATIENT';

INSERT INTO users (login, password_hash, email, phone, is_active, role_id)
SELECT 'orlov.pat',
       '$2a$10$24yI.EqeKqP0yDquf3r.e.NkFjf7dnkF6aFMDmZMKAH/W4GuuRlnW',
       'orlov@mail.by',
       '+375294444445',
       TRUE,
       r.id
FROM roles r
WHERE r.name = 'PATIENT';

INSERT INTO employees (user_id, specialty_id, last_name, first_name, middle_name, position, cabinet, hire_date,
                       is_active)
SELECT u.id,
       ms.id,
       'Иванов',
       'Алексей',
       'Михайлович',
       'Врач-терапевт участковый',
       '101',
       '2020-03-15',
       TRUE
FROM users u,
     medical_specialties ms
WHERE u.login = 'ivanov.doc'
  AND ms.name = 'Терапия';

INSERT INTO employees (user_id, specialty_id, last_name, first_name, middle_name, position, cabinet, hire_date,
                       is_active)
SELECT u.id,
       ms.id,
       'Петрова',
       'Елена',
       'Сергеевна',
       'Врач-хирург',
       '205',
       '2019-09-01',
       TRUE
FROM users u,
     medical_specialties ms
WHERE u.login = 'petrova.doc'
  AND ms.name = 'Хирургия';

INSERT INTO employees (user_id, specialty_id, last_name, first_name, middle_name, position, cabinet, hire_date,
                       is_active)
SELECT u.id,
       ms.id,
       'Сидоров',
       'Дмитрий',
       'Андреевич',
       'Врач-офтальмолог',
       '312',
       '2021-06-10',
       TRUE
FROM users u,
     medical_specialties ms
WHERE u.login = 'sidorov.doc'
  AND ms.name = 'Офтальмология';

INSERT INTO employees (user_id, specialty_id, last_name, first_name, middle_name, position, cabinet, hire_date,
                       is_active)
SELECT u.id,
       ms.id,
       'Кузнецова',
       'Ольга',
       'Владимировна',
       'Врач-кардиолог',
       '208',
       '2018-01-20',
       TRUE
FROM users u,
     medical_specialties ms
WHERE u.login = 'kuznetsova.doc'
  AND ms.name = 'Кардиология';

INSERT INTO employees (user_id, specialty_id, last_name, first_name, middle_name, position, cabinet, hire_date,
                       is_active)
SELECT u.id,
       ms.id,
       'Морозов',
       'Игорь',
       'Петрович',
       'Врач-невролог',
       '315',
       '2022-02-14',
       TRUE
FROM users u,
     medical_specialties ms
WHERE u.login = 'morozov.doc'
  AND ms.name = 'Неврология';

INSERT INTO employees (user_id, specialty_id, last_name, first_name, middle_name, position, cabinet, hire_date,
                       is_active)
SELECT u.id,
       ms.id,
       'Волкова',
       'Марина',
       'Николаевна',
       'Врач-оториноларинголог',
       '310',
       '2020-11-03',
       TRUE
FROM users u,
     medical_specialties ms
WHERE u.login = 'volkova.doc'
  AND ms.name = 'Оториноларингология';

INSERT INTO employees (user_id, specialty_id, last_name, first_name, middle_name, position, cabinet, hire_date,
                       is_active)
SELECT u.id,
       NULL,
       'Смирнова',
       'Анна',
       'Ивановна',
       'Регистратор',
       NULL,
       '2021-04-01',
       TRUE
FROM users u
WHERE u.login = 'smirnova.reg';

INSERT INTO employees (user_id, specialty_id, last_name, first_name, middle_name, position, cabinet, hire_date,
                       is_active)
SELECT u.id,
       NULL,
       'Козлова',
       'Татьяна',
       'Дмитриевна',
       'Регистратор',
       NULL,
       '2023-01-15',
       TRUE
FROM users u
WHERE u.login = 'kozlova.reg';

INSERT INTO employees (user_id, specialty_id, last_name, first_name, middle_name, position, cabinet, hire_date,
                       is_active)
SELECT u.id,
       ms.id,
       'Фёдоров',
       'Виктор',
       'Александрович',
       'Заведующий терапевтическим отделением',
       '100',
       '2015-08-01',
       TRUE
FROM users u,
     medical_specialties ms
WHERE u.login = 'fedorov.mgr'
  AND ms.name = 'Терапия';

INSERT INTO patients (last_name, first_name, middle_name, gender, birth_date, passport_series, passport_number, phone,
                      email, address)
VALUES ('Новиков', 'Артём', 'Игоревич', 'MALE', '1990-05-12', 'MP', '3456789', '+375294444441', 'novikov@mail.by',
        'г. Минск, ул. Немига, д. 5, кв. 12');

INSERT INTO patients (last_name, first_name, middle_name, gender, birth_date, passport_series, passport_number, phone,
                      email, address)
VALUES ('Соколова', 'Ирина', 'Владимировна', 'FEMALE', '1985-11-23', 'MP', '4567890', '+375294444442',
        'sokolova@mail.by', 'г. Минск, пр. Независимости, д. 45, кв. 78');

INSERT INTO patients (last_name, first_name, middle_name, gender, birth_date, passport_series, passport_number, phone,
                      email, address)
VALUES ('Лебедев', 'Павел', 'Николаевич', 'MALE', '1978-02-08', 'MP', '5678901', '+375294444443', 'lebedev@mail.by',
        'г. Минск, ул. Сурганова, д. 15, кв. 3');

INSERT INTO patients (last_name, first_name, middle_name, gender, birth_date, passport_series, passport_number, phone,
                      email, address)
VALUES ('Комарова', 'Наталья', 'Сергеевна', 'FEMALE', '1995-07-30', 'MP', '6789012', '+375294444444',
        'komarova@mail.by', 'г. Минск, ул. Якубовского, д. 22, кв. 56');

INSERT INTO patients (last_name, first_name, middle_name, gender, birth_date, passport_series, passport_number, phone,
                      email, address)
VALUES ('Орлов', 'Денис', 'Владимирович', 'MALE', '1988-12-01', 'MP', '7890123', '+375294444445', 'orlov@mail.by',
        'г. Минск, ул. Калиновского, д. 8, кв. 101');

INSERT INTO patients (last_name, first_name, middle_name, gender, birth_date, passport_series, passport_number, phone,
                      email, address)
VALUES ('Новикова', 'Мария', 'Артёмовна', 'FEMALE', '2018-03-25', 'MP', '8901234', NULL, NULL,
        'г. Минск, ул. Немига, д. 5, кв. 12');

INSERT INTO patients (last_name, first_name, middle_name, gender, birth_date, passport_series, passport_number, phone,
                      email, address)
VALUES ('Жуковский', 'Олег', 'Викторович', 'MALE', '1972-09-18', 'MP', '9012345', '+375291234567', NULL,
        'г. Минск, ул. Маяковского, д. 14, кв. 7');

INSERT INTO patients (last_name, first_name, middle_name, gender, birth_date, passport_series, passport_number, phone,
                      email, address)
VALUES ('Белова', 'Светлана', 'Петровна', 'FEMALE', '1965-04-10', 'MP', '0123456', '+375297654321', NULL,
        'г. Минск, ул. Притыцкого, д. 60, кв. 33');

INSERT INTO user_patients (user_id, patient_id, relationship)
SELECT u.id, p.id, 'SELF'
FROM users u,
     patients p
WHERE u.login = 'novikov.pat'
  AND p.passport_series = 'MP'
  AND p.passport_number = '3456789';

INSERT INTO user_patients (user_id, patient_id, relationship)
SELECT u.id, p.id, 'CHILD'
FROM users u,
     patients p
WHERE u.login = 'novikov.pat'
  AND p.passport_series = 'MP'
  AND p.passport_number = '8901234';

INSERT INTO user_patients (user_id, patient_id, relationship)
SELECT u.id, p.id, 'SELF'
FROM users u,
     patients p
WHERE u.login = 'sokolova.pat'
  AND p.passport_series = 'MP'
  AND p.passport_number = '4567890';

INSERT INTO user_patients (user_id, patient_id, relationship)
SELECT u.id, p.id, 'SELF'
FROM users u,
     patients p
WHERE u.login = 'lebedev.pat'
  AND p.passport_series = 'MP'
  AND p.passport_number = '5678901';

INSERT INTO user_patients (user_id, patient_id, relationship)
SELECT u.id, p.id, 'SELF'
FROM users u,
     patients p
WHERE u.login = 'komarova.pat'
  AND p.passport_series = 'MP'
  AND p.passport_number = '6789012';

INSERT INTO user_patients (user_id, patient_id, relationship)
SELECT u.id, p.id, 'SELF'
FROM users u,
     patients p
WHERE u.login = 'orlov.pat'
  AND p.passport_series = 'MP'
  AND p.passport_number = '7890123';

INSERT INTO doctor_services (employee_id, service_id, is_active)
SELECT e.id, s.id, TRUE
FROM employees e,
     services s
WHERE e.last_name = 'Иванов'
  AND e.first_name = 'Алексей'
  AND s.name = 'Приём терапевта первичный';

INSERT INTO doctor_services (employee_id, service_id, is_active)
SELECT e.id, s.id, TRUE
FROM employees e,
     services s
WHERE e.last_name = 'Иванов'
  AND e.first_name = 'Алексей'
  AND s.name = 'Приём терапевта повторный';

INSERT INTO doctor_services (employee_id, service_id, is_active)
SELECT e.id, s.id, TRUE
FROM employees e,
     services s
WHERE e.last_name = 'Петрова'
  AND e.first_name = 'Елена'
  AND s.name = 'Приём хирурга первичный';

INSERT INTO doctor_services (employee_id, service_id, is_active)
SELECT e.id, s.id, TRUE
FROM employees e,
     services s
WHERE e.last_name = 'Сидоров'
  AND e.first_name = 'Дмитрий'
  AND s.name = 'Приём офтальмолога';

INSERT INTO doctor_services (employee_id, service_id, is_active)
SELECT e.id, s.id, TRUE
FROM employees e,
     services s
WHERE e.last_name = 'Кузнецова'
  AND e.first_name = 'Ольга'
  AND s.name = 'Приём кардиолога';

INSERT INTO doctor_services (employee_id, service_id, is_active)
SELECT e.id, s.id, TRUE
FROM employees e,
     services s
WHERE e.last_name = 'Кузнецова'
  AND e.first_name = 'Ольга'
  AND s.name = 'ЭКГ';

INSERT INTO doctor_services (employee_id, service_id, is_active)
SELECT e.id, s.id, TRUE
FROM employees e,
     services s
WHERE e.last_name = 'Морозов'
  AND e.first_name = 'Игорь'
  AND s.name = 'Приём невролога';

INSERT INTO doctor_services (employee_id, service_id, is_active)
SELECT e.id, s.id, TRUE
FROM employees e,
     services s
WHERE e.last_name = 'Волкова'
  AND e.first_name = 'Марина'
  AND s.name = 'Приём ЛОР';

INSERT INTO doctor_schedules (employee_id, day_of_week, start_time, end_time, paid_start_time, paid_end_time, cabinet,
                              effective_from)
SELECT e.id,
       1,
       '08:00',
       '14:00',
       '14:00',
       '16:00',
       '101',
       '2025-01-01'
FROM employees e
WHERE e.last_name = 'Иванов'
  AND e.first_name = 'Алексей';

INSERT INTO doctor_schedules (employee_id, day_of_week, start_time, end_time, paid_start_time, paid_end_time, cabinet,
                              effective_from)
SELECT e.id,
       3,
       '08:00',
       '14:00',
       '14:00',
       '16:00',
       '101',
       '2025-01-01'
FROM employees e
WHERE e.last_name = 'Иванов'
  AND e.first_name = 'Алексей';

INSERT INTO doctor_schedules (employee_id, day_of_week, start_time, end_time, paid_start_time, paid_end_time, cabinet,
                              effective_from)
SELECT e.id,
       5,
       '08:00',
       '14:00',
       '14:00',
       '16:00',
       '101',
       '2025-01-01'
FROM employees e
WHERE e.last_name = 'Иванов'
  AND e.first_name = 'Алексей';

INSERT INTO doctor_schedules (employee_id, day_of_week, start_time, end_time, paid_start_time, paid_end_time, cabinet,
                              effective_from)
SELECT e.id,
       2,
       '14:00',
       '20:00',
       NULL,
       NULL,
       '101',
       '2025-01-01'
FROM employees e
WHERE e.last_name = 'Иванов'
  AND e.first_name = 'Алексей';

INSERT INTO doctor_schedules (employee_id, day_of_week, start_time, end_time, paid_start_time, paid_end_time, cabinet,
                              effective_from)
SELECT e.id,
       4,
       '14:00',
       '20:00',
       NULL,
       NULL,
       '101',
       '2025-01-01'
FROM employees e
WHERE e.last_name = 'Иванов'
  AND e.first_name = 'Алексей';

INSERT INTO doctor_schedules (employee_id, day_of_week, start_time, end_time, paid_start_time, paid_end_time, cabinet,
                              effective_from)
SELECT e.id,
       dow,
       '09:00',
       '15:00',
       '15:00',
       '17:00',
       '205',
       '2025-01-01'
FROM employees e,
     generate_series(1, 5) AS dow
WHERE e.last_name = 'Петрова'
  AND e.first_name = 'Елена';

INSERT INTO doctor_schedules (employee_id, day_of_week, start_time, end_time, paid_start_time, paid_end_time, cabinet,
                              effective_from)
SELECT e.id,
       dow,
       '08:30',
       '13:30',
       NULL,
       NULL,
       '312',
       '2025-01-01'
FROM employees e,
     (VALUES (1), (3), (5)) AS d(dow)
WHERE e.last_name = 'Сидоров'
  AND e.first_name = 'Дмитрий';

INSERT INTO doctor_schedules (employee_id, day_of_week, start_time, end_time, paid_start_time, paid_end_time, cabinet,
                              effective_from)
SELECT e.id,
       dow,
       '08:00',
       '14:00',
       '14:00',
       '16:00',
       '208',
       '2025-01-01'
FROM employees e,
     generate_series(1, 4) AS dow
WHERE e.last_name = 'Кузнецова'
  AND e.first_name = 'Ольга';

INSERT INTO doctor_schedules (employee_id, day_of_week, start_time, end_time, paid_start_time, paid_end_time, cabinet,
                              effective_from)
SELECT e.id,
       dow,
       '09:00',
       '16:00',
       NULL,
       NULL,
       '315',
       '2025-01-01'
FROM employees e,
     (VALUES (2), (4)) AS d(dow)
WHERE e.last_name = 'Морозов'
  AND e.first_name = 'Игорь';

INSERT INTO doctor_schedules (employee_id, day_of_week, start_time, end_time, paid_start_time, paid_end_time, cabinet,
                              effective_from)
SELECT e.id,
       dow,
       '10:00',
       '16:00',
       NULL,
       NULL,
       '310',
       '2025-01-01'
FROM employees e,
     (VALUES (1), (3), (5)) AS d(dow)
WHERE e.last_name = 'Волкова'
  AND e.first_name = 'Марина';

INSERT INTO schedule_exceptions (employee_id, exception_type, date_from, date_to, reason, created_by)
SELECT e.id, 'VACATION', '2026-01-12', '2026-01-25', 'Ежегодный трудовой отпуск', u.id
FROM employees e,
     users u
WHERE e.last_name = 'Иванов'
  AND e.first_name = 'Алексей'
  AND u.login = 'fedorov.mgr';

INSERT INTO schedule_exceptions (employee_id, exception_type, date_from, date_to, reason, created_by)
SELECT e.id, 'SICK_LEAVE', '2026-02-03', '2026-02-05', 'Больничный лист (ОРВИ)', u.id
FROM employees e,
     users u
WHERE e.last_name = 'Петрова'
  AND e.first_name = 'Елена'
  AND u.login = 'smirnova.reg';

INSERT INTO schedule_exceptions (employee_id, exception_type, date_from, date_to, reason, created_by)
SELECT e.id, 'DAY_OFF', '2026-02-14', '2026-02-14', 'Отгул по семейным обстоятельствам', u.id
FROM employees e,
     users u
WHERE e.last_name = 'Сидоров'
  AND e.first_name = 'Дмитрий'
  AND u.login = 'fedorov.mgr';

INSERT INTO appointments (patient_id, employee_id, service_id, schedule_id, appointment_date, start_time, end_time,
                          is_paid, status, source, created_by)
SELECT p.id,
       e.id,
       s.id,
       (SELECT ds.id FROM doctor_schedules ds WHERE ds.employee_id = e.id AND ds.day_of_week = 1 LIMIT 1),
       '2026-02-02', '2026-02-02 08:00:00', '2026-02-02 08:20:00', FALSE, 'COMPLETED', 'ONLINE', u.id
FROM patients p, employees e, services s, users u
WHERE p.passport_number = '3456789'
  AND e.last_name = 'Иванов'
  AND e.first_name = 'Алексей'
  AND s.name = 'Приём терапевта первичный'
  AND u.login = 'novikov.pat';

INSERT INTO appointments (patient_id, employee_id, service_id, schedule_id, appointment_date, start_time, end_time,
                          is_paid, status, source, created_by)
SELECT p.id,
       e.id,
       s.id,
       (SELECT ds.id FROM doctor_schedules ds WHERE ds.employee_id = e.id AND ds.day_of_week = 1 LIMIT 1),
       '2026-02-02', '2026-02-02 08:00:00', '2026-02-02 08:25:00', FALSE, 'COMPLETED', 'ONLINE', u.id
FROM patients p, employees e, services s, users u
WHERE p.passport_number = '4567890'
  AND e.last_name = 'Кузнецова'
  AND e.first_name = 'Ольга'
  AND s.name = 'Приём кардиолога'
  AND u.login = 'sokolova.pat';

INSERT INTO appointments (patient_id, employee_id, service_id, schedule_id, appointment_date, start_time, end_time,
                          is_paid, status, source, created_by)
SELECT p.id,
       e.id,
       s.id,
       (SELECT ds.id FROM doctor_schedules ds WHERE ds.employee_id = e.id AND ds.day_of_week = 4 LIMIT 1),
       '2026-02-05', '2026-02-05 09:00:00', '2026-02-05 09:25:00', FALSE, 'COMPLETED', 'PHONE', u_reg.id
FROM patients p, employees e, services s, users u_reg
WHERE p.passport_number = '5678901'
  AND e.last_name = 'Морозов'
  AND e.first_name = 'Игорь'
  AND s.name = 'Приём невролога'
  AND u_reg.login = 'smirnova.reg';

INSERT INTO appointments (patient_id, employee_id, service_id, schedule_id, appointment_date, start_time, end_time,
                          is_paid, status, source, created_by)
SELECT p.id,
       e.id,
       s.id,
       (SELECT ds.id FROM doctor_schedules ds WHERE ds.employee_id = e.id AND ds.day_of_week = 3 LIMIT 1),
       '2026-02-04', '2026-02-04 08:20:00', '2026-02-04 08:40:00', FALSE, 'COMPLETED', 'WALK_IN', u_reg.id
FROM patients p, employees e, services s, users u_reg
WHERE p.passport_number = '9012345'
  AND e.last_name = 'Иванов'
  AND e.first_name = 'Алексей'
  AND s.name = 'Приём терапевта первичный'
  AND u_reg.login = 'kozlova.reg';

INSERT INTO appointments (patient_id, employee_id, service_id, schedule_id, appointment_date, start_time, end_time,
                          is_paid, status, source, created_by)
SELECT p.id,
       e.id,
       s.id,
       (SELECT ds.id FROM doctor_schedules ds WHERE ds.employee_id = e.id AND ds.day_of_week = 2 LIMIT 1),
       '2026-02-10', '2026-02-10 14:00:00', '2026-02-10 14:15:00', TRUE, 'COMPLETED', 'PHONE', u_reg.id
FROM patients p, employees e, services s, users u_reg
WHERE p.passport_number = '0123456'
  AND e.last_name = 'Кузнецова'
  AND e.first_name = 'Ольга'
  AND s.name = 'ЭКГ'
  AND u_reg.login = 'smirnova.reg';

INSERT INTO appointments (patient_id, employee_id, service_id, schedule_id, appointment_date, start_time, end_time,
                          is_paid, status, source, created_by)
SELECT p.id,
       e.id,
       s.id,
       (SELECT ds.id FROM doctor_schedules ds WHERE ds.employee_id = e.id AND ds.day_of_week = 3 LIMIT 1),
       '2026-02-11', '2026-02-11 10:00:00', '2026-02-11 10:20:00', FALSE, 'COMPLETED', 'ONLINE', u.id
FROM patients p, employees e, services s, users u
WHERE p.passport_number = '6789012'
  AND e.last_name = 'Волкова'
  AND e.first_name = 'Марина'
  AND s.name = 'Приём ЛОР'
  AND u.login = 'komarova.pat';

INSERT INTO appointments (patient_id, employee_id, service_id, schedule_id, appointment_date, start_time, end_time,
                          is_paid, status, source, created_by)
SELECT p.id,
       e.id,
       s.id,
       (SELECT ds.id FROM doctor_schedules ds WHERE ds.employee_id = e.id AND ds.day_of_week = 1 LIMIT 1),
       '2026-02-09', '2026-02-09 09:00:00', '2026-02-09 09:30:00', FALSE, 'COMPLETED', 'ONLINE', u.id
FROM patients p, employees e, services s, users u
WHERE p.passport_number = '7890123'
  AND e.last_name = 'Петрова'
  AND e.first_name = 'Елена'
  AND s.name = 'Приём хирурга первичный'
  AND u.login = 'orlov.pat';

INSERT INTO appointments (patient_id, employee_id, service_id, schedule_id, appointment_date, start_time, end_time,
                          is_paid, status, source, created_by)
SELECT p.id,
       e.id,
       s.id,
       (SELECT ds.id FROM doctor_schedules ds WHERE ds.employee_id = e.id AND ds.day_of_week = 3 LIMIT 1),
       '2026-02-11', '2026-02-11 08:00:00', '2026-02-11 08:15:00', FALSE, 'COMPLETED', 'ONLINE', u.id
FROM patients p, employees e, services s, users u
WHERE p.passport_number = '3456789'
  AND e.last_name = 'Иванов'
  AND e.first_name = 'Алексей'
  AND s.name = 'Приём терапевта повторный'
  AND u.login = 'novikov.pat';

INSERT INTO appointments (patient_id, employee_id, service_id, schedule_id, appointment_date, start_time, end_time,
                          is_paid, status, source, created_by)
SELECT p.id,
       e.id,
       s.id,
       (SELECT ds.id FROM doctor_schedules ds WHERE ds.employee_id = e.id AND ds.day_of_week = 3 LIMIT 1),
       '2026-02-11', '2026-02-11 08:00:00', '2026-02-11 08:15:00', FALSE, 'COMPLETED', 'ONLINE', u.id
FROM patients p, employees e, services s, users u
WHERE p.passport_number = '4567890'
  AND e.last_name = 'Кузнецова'
  AND e.first_name = 'Ольга'
  AND s.name = 'ЭКГ'
  AND u.login = 'sokolova.pat';

INSERT INTO appointments (patient_id, employee_id, service_id, schedule_id, appointment_date, start_time, end_time,
                          is_paid, status, source, created_by)
SELECT p.id,
       e.id,
       s.id,
       (SELECT ds.id FROM doctor_schedules ds WHERE ds.employee_id = e.id AND ds.day_of_week = 5 LIMIT 1),
       '2026-03-06', '2026-03-06 08:30:00', '2026-03-06 08:50:00', FALSE, 'WAITING', 'ONLINE', u.id
FROM patients p, employees e, services s, users u
WHERE p.passport_number = '8901234'
  AND e.last_name = 'Сидоров'
  AND e.first_name = 'Дмитрий'
  AND s.name = 'Приём офтальмолога'
  AND u.login = 'novikov.pat';

INSERT INTO appointments (patient_id, employee_id, service_id, schedule_id, appointment_date, start_time, end_time,
                          is_paid, status, source, created_by)
SELECT p.id,
       e.id,
       s.id,
       (SELECT ds.id FROM doctor_schedules ds WHERE ds.employee_id = e.id AND ds.day_of_week = 5 LIMIT 1),
       '2026-03-06', '2026-03-06 08:00:00', '2026-03-06 08:20:00', FALSE, 'WAITING', 'ONLINE', u.id
FROM patients p, employees e, services s, users u
WHERE p.passport_number = '6789012'
  AND e.last_name = 'Иванов'
  AND e.first_name = 'Алексей'
  AND s.name = 'Приём терапевта первичный'
  AND u.login = 'komarova.pat';

INSERT INTO appointments (patient_id, employee_id, service_id, schedule_id, appointment_date, start_time, end_time,
                          is_paid, status, source, created_by)
SELECT p.id,
       e.id,
       s.id,
       (SELECT ds.id FROM doctor_schedules ds WHERE ds.employee_id = e.id AND ds.day_of_week = 4 LIMIT 1),
       '2026-03-05', '2026-03-05 09:25:00', '2026-03-05 09:50:00', FALSE, 'WAITING', 'PHONE', u_reg.id
FROM patients p, employees e, services s, users u_reg
WHERE p.passport_number = '7890123'
  AND e.last_name = 'Морозов'
  AND e.first_name = 'Игорь'
  AND s.name = 'Приём невролога'
  AND u_reg.login = 'kozlova.reg';

INSERT INTO appointments (patient_id, employee_id, service_id, schedule_id, appointment_date, start_time, end_time,
                          is_paid, status, source, created_by, cancel_reason)
SELECT p.id,
       e.id,
       s.id,
       (SELECT ds.id FROM doctor_schedules ds WHERE ds.employee_id = e.id AND ds.day_of_week = 5 LIMIT 1),
       '2026-02-13', '2026-02-13 08:40:00', '2026-02-13 09:00:00', FALSE, 'CANCELLED', 'ONLINE', u.id, 'Не смогу прийти по личным обстоятельствам'
FROM patients p, employees e, services s, users u
WHERE p.passport_number = '5678901'
  AND e.last_name = 'Иванов'
  AND e.first_name = 'Алексей'
  AND s.name = 'Приём терапевта первичный'
  AND u.login = 'lebedev.pat';

INSERT INTO appointments (patient_id, employee_id, service_id, schedule_id, appointment_date, start_time, end_time,
                          is_paid, status, source, created_by)
SELECT p.id,
       e.id,
       s.id,
       (SELECT ds.id FROM doctor_schedules ds WHERE ds.employee_id = e.id AND ds.day_of_week = 2 LIMIT 1),
       '2026-02-17', '2026-02-17 09:30:00', '2026-02-17 10:00:00', FALSE, 'NO_SHOW', 'WALK_IN', u_reg.id
FROM patients p, employees e, services s, users u_reg
WHERE p.passport_number = '9012345'
  AND e.last_name = 'Петрова'
  AND e.first_name = 'Елена'
  AND s.name = 'Приём хирурга первичный'
  AND u_reg.login = 'smirnova.reg';

INSERT INTO appointments (patient_id, employee_id, service_id, schedule_id, appointment_date, start_time, end_time,
                          is_paid, status, source, created_by)
SELECT p.id,
       e.id,
       s.id,
       (SELECT ds.id FROM doctor_schedules ds WHERE ds.employee_id = e.id AND ds.day_of_week = 1 LIMIT 1),
       '2026-03-02', '2026-03-02 10:20:00', '2026-03-02 10:40:00', FALSE, 'WAITING', 'PHONE', u_reg.id
FROM patients p, employees e, services s, users u_reg
WHERE p.passport_number = '0123456'
  AND e.last_name = 'Волкова'
  AND e.first_name = 'Марина'
  AND s.name = 'Приём ЛОР'
  AND u_reg.login = 'kozlova.reg';

INSERT INTO appointment_status_history (appointment_id, old_status, new_status, changed_by, change_reason, created_at)
SELECT a.id, NULL, 'WAITING', u.id, 'Запись создана пациентом онлайн', '2026-01-28 14:30:00'
FROM appointments a
         JOIN patients p ON a.patient_id = p.id
         JOIN employees e ON a.employee_id = e.id
         JOIN users u ON u.login = 'novikov.pat'
WHERE p.passport_number = '3456789'
  AND e.last_name = 'Иванов'
  AND a.appointment_date = '2026-02-02'
  AND a.status = 'COMPLETED'
  AND a.start_time = '2026-02-02 08:00:00';

INSERT INTO appointment_status_history (appointment_id, old_status, new_status, changed_by, change_reason, created_at)
SELECT a.id, 'WAITING', 'IN_PROGRESS', u.id, 'Пациент на приёме', '2026-02-02 08:02:00'
FROM appointments a
         JOIN patients p ON a.patient_id = p.id
         JOIN employees e ON a.employee_id = e.id
         JOIN users u ON u.login = 'ivanov.doc'
WHERE p.passport_number = '3456789'
  AND e.last_name = 'Иванов'
  AND a.appointment_date = '2026-02-02'
  AND a.status = 'COMPLETED'
  AND a.start_time = '2026-02-02 08:00:00';

INSERT INTO appointment_status_history (appointment_id, old_status, new_status, changed_by, change_reason, created_at)
SELECT a.id, 'IN_PROGRESS', 'COMPLETED', u.id, 'Приём завершён', '2026-02-02 08:18:00'
FROM appointments a
         JOIN patients p ON a.patient_id = p.id
         JOIN employees e ON a.employee_id = e.id
         JOIN users u ON u.login = 'ivanov.doc'
WHERE p.passport_number = '3456789'
  AND e.last_name = 'Иванов'
  AND a.appointment_date = '2026-02-02'
  AND a.status = 'COMPLETED'
  AND a.start_time = '2026-02-02 08:00:00';

INSERT INTO appointment_status_history (appointment_id, old_status, new_status, changed_by, change_reason, created_at)
SELECT a.id, NULL, 'WAITING', u.id, 'Запись создана пациентом онлайн', '2026-02-10 10:00:00'
FROM appointments a
         JOIN patients p ON a.patient_id = p.id
         JOIN employees e ON a.employee_id = e.id
         JOIN users u ON u.login = 'lebedev.pat'
WHERE p.passport_number = '5678901'
  AND e.last_name = 'Иванов'
  AND a.status = 'CANCELLED';

INSERT INTO appointment_status_history (appointment_id, old_status, new_status, changed_by, change_reason, created_at)
SELECT a.id, 'WAITING', 'CANCELLED', u.id, 'Отменено пациентом: не смогу прийти', '2026-02-12 17:45:00'
FROM appointments a
         JOIN patients p ON a.patient_id = p.id
         JOIN employees e ON a.employee_id = e.id
         JOIN users u ON u.login = 'lebedev.pat'
WHERE p.passport_number = '5678901'
  AND e.last_name = 'Иванов'
  AND a.status = 'CANCELLED';

INSERT INTO appointment_status_history (appointment_id, old_status, new_status, changed_by, change_reason, created_at)
SELECT a.id, NULL, 'WAITING', u.id, 'Запись создана регистратурой', '2026-02-14 11:00:00'
FROM appointments a
         JOIN patients p ON a.patient_id = p.id
         JOIN employees e ON a.employee_id = e.id
         JOIN users u ON u.login = 'smirnova.reg'
WHERE p.passport_number = '9012345'
  AND e.last_name = 'Петрова'
  AND a.status = 'NO_SHOW';

INSERT INTO appointment_status_history (appointment_id, old_status, new_status, changed_by, change_reason, created_at)
SELECT a.id, 'WAITING', 'NO_SHOW', u.id, 'Пациент не явился на приём', '2026-02-17 10:05:00'
FROM appointments a
         JOIN patients p ON a.patient_id = p.id
         JOIN employees e ON a.employee_id = e.id
         JOIN users u ON u.login = 'petrova.doc'
WHERE p.passport_number = '9012345'
  AND e.last_name = 'Петрова'
  AND a.status = 'NO_SHOW';

CREATE TABLE IF NOT EXISTS metaappback.contact (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    kind INTEGER NOT NULL DEFAULT 0
);

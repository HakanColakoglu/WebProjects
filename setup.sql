-- setup.sql
CREATE DATABASE blog;
CREATE ROLE <user> WITH LOGIN PASSWORD <'password'>;
GRANT ALL PRIVILEGES ON DATABASE "blog" TO <user>;

\c blog

CREATE TABLE blogposts (
    id SERIAL PRIMARY KEY,
    blogheader VARCHAR(255) NOT NULL,
    blogbody TEXT NOT NULL,
    blogauthor VARCHAR(100) NOT NULL
);

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE blogposts TO <user>;
GRANT USAGE, SELECT ON SEQUENCE blogposts_id_seq TO <user>;
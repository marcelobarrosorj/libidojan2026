CREATE TABLE test_users (user_id text primary key);
CREATE TABLE test_posts (id uuid, user_id uuid);
ALTER TABLE test_posts ADD CONSTRAINT test_fk FOREIGN KEY (user_id) REFERENCES test_users(user_id);

-- Dump de todos os schemas
-- Gerado: 2026-11-04 13:23

-- [auth] email()
CREATE OR REPLACE FUNCTION auth.email()
 RETURNS text
 LANGUAGE sql
 STABLE
AS $function$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$function$;

-- [auth] jwt()
CREATE OR REPLACE FUNCTION auth.jwt()
 RETURNS jsonb
 LANGUAGE sql
 STABLE
AS $function$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$function$;

-- [auth] role()
CREATE OR REPLACE FUNCTION auth.role()
 RETURNS text
 LANGUAGE sql
 STABLE
AS $function$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$function$;

-- [auth] uid()
CREATE OR REPLACE FUNCTION auth.uid()
 RETURNS uuid
 LANGUAGE sql
 STABLE
AS $function$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$function$;

-- [cron] alter_job(job_id bigint, schedule text, command text, database text, username text, active boolean)
CREATE OR REPLACE FUNCTION cron.alter_job(job_id bigint, schedule text DEFAULT NULL::text, command text DEFAULT NULL::text, database text DEFAULT NULL::text, username text DEFAULT NULL::text, active boolean DEFAULT NULL::boolean)
 RETURNS void
 LANGUAGE c
AS '$libdir/pg_cron', $function$cron_alter_job$function$;

-- [cron] job_cache_invalidate()
CREATE OR REPLACE FUNCTION cron.job_cache_invalidate()
 RETURNS trigger
 LANGUAGE c
AS '$libdir/pg_cron', $function$cron_job_cache_invalidate$function$;

-- [cron] schedule(job_name text, schedule text, command text)
CREATE OR REPLACE FUNCTION cron.schedule(job_name text, schedule text, command text)
 RETURNS bigint
 LANGUAGE c
AS '$libdir/pg_cron', $function$cron_schedule_named$function$;

-- [cron] schedule(schedule text, command text)
CREATE OR REPLACE FUNCTION cron.schedule(schedule text, command text)
 RETURNS bigint
 LANGUAGE c
 STRICT
AS '$libdir/pg_cron', $function$cron_schedule$function$;

-- [cron] schedule_in_database(job_name text, schedule text, command text, database text, username text, active boolean)
CREATE OR REPLACE FUNCTION cron.schedule_in_database(job_name text, schedule text, command text, database text, username text DEFAULT NULL::text, active boolean DEFAULT true)
 RETURNS bigint
 LANGUAGE c
AS '$libdir/pg_cron', $function$cron_schedule_named$function$;

-- [cron] unschedule(job_id bigint)
CREATE OR REPLACE FUNCTION cron.unschedule(job_id bigint)
 RETURNS boolean
 LANGUAGE c
 STRICT
AS '$libdir/pg_cron', $function$cron_unschedule$function$;

-- [cron] unschedule(job_name text)
CREATE OR REPLACE FUNCTION cron.unschedule(job_name text)
 RETURNS boolean
 LANGUAGE c
 STRICT
AS '$libdir/pg_cron', $function$cron_unschedule_named$function$;

-- [extensions] armor(bytea)
CREATE OR REPLACE FUNCTION extensions.armor(bytea)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_armor$function$;

-- [extensions] armor(bytea, text[], text[])
CREATE OR REPLACE FUNCTION extensions.armor(bytea, text[], text[])
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_armor$function$;

-- [extensions] crypt(text, text)
CREATE OR REPLACE FUNCTION extensions.crypt(text, text)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_crypt$function$;

-- [extensions] dearmor(text)
CREATE OR REPLACE FUNCTION extensions.dearmor(text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_dearmor$function$;

-- [extensions] decrypt(bytea, bytea, text)
CREATE OR REPLACE FUNCTION extensions.decrypt(bytea, bytea, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_decrypt$function$;

-- [extensions] decrypt_iv(bytea, bytea, bytea, text)
CREATE OR REPLACE FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_decrypt_iv$function$;

-- [extensions] digest(bytea, text)
CREATE OR REPLACE FUNCTION extensions.digest(bytea, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_digest$function$;

-- [extensions] digest(text, text)
CREATE OR REPLACE FUNCTION extensions.digest(text, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_digest$function$;

-- [extensions] encrypt(bytea, bytea, text)
CREATE OR REPLACE FUNCTION extensions.encrypt(bytea, bytea, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_encrypt$function$;

-- [extensions] encrypt_iv(bytea, bytea, bytea, text)
CREATE OR REPLACE FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_encrypt_iv$function$;

-- [extensions] gen_random_bytes(integer)
CREATE OR REPLACE FUNCTION extensions.gen_random_bytes(integer)
 RETURNS bytea
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_random_bytes$function$;

-- [extensions] gen_random_uuid()
CREATE OR REPLACE FUNCTION extensions.gen_random_uuid()
 RETURNS uuid
 LANGUAGE c
 PARALLEL SAFE
AS '$libdir/pgcrypto', $function$pg_random_uuid$function$;

-- [extensions] gen_salt(text)
CREATE OR REPLACE FUNCTION extensions.gen_salt(text)
 RETURNS text
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_gen_salt$function$;

-- [extensions] gen_salt(text, integer)
CREATE OR REPLACE FUNCTION extensions.gen_salt(text, integer)
 RETURNS text
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_gen_salt_rounds$function$;

-- [extensions] grant_pg_cron_access()
CREATE OR REPLACE FUNCTION extensions.grant_pg_cron_access()
 RETURNS event_trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
    revoke trigger on cron.job_run_details from postgres;
  END IF;
END;
$function$;

-- [extensions] grant_pg_graphql_access()
CREATE OR REPLACE FUNCTION extensions.grant_pg_graphql_access()
 RETURNS event_trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
begin
    if not exists (
        select 1
        from pg_catalog.pg_event_trigger_ddl_commands() ev
        join pg_catalog.pg_extension e on ev.objid = e.oid
        where e.extname = 'pg_graphql'
    ) then
        return;
    end if;

    drop function if exists graphql_public.graphql;
    create or replace function graphql_public.graphql(
        "operationName" text default null,
        query text default null,
        variables jsonb default null,
        extensions jsonb default null
    )
        returns jsonb
        language sql
    as $$
        select graphql.resolve(
            query := query,
            variables := coalesce(variables, '{}'),
            "operationName" := "operationName",
            extensions := extensions
        );
    $$;

    -- Attach the wrapper to the extension so DROP EXTENSION cascades to it,
    -- which in turn triggers set_graphql_placeholder to reinstall the "not enabled" stub.
    alter extension pg_graphql add function graphql_public.graphql(text, text, jsonb, jsonb);

    grant usage on schema graphql to postgres, anon, authenticated, service_role;
    grant execute on function graphql.resolve to postgres, anon, authenticated, service_role;
    grant usage on schema graphql to postgres with grant option;
    grant usage on schema graphql_public to postgres with grant option;
end;
$function$;

-- [extensions] grant_pg_net_access()
CREATE OR REPLACE FUNCTION extensions.grant_pg_net_access()
 RETURNS event_trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_roles
      WHERE rolname = 'supabase_functions_admin'
    )
    THEN
      CREATE USER supabase_functions_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
    END IF;

    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    IF EXISTS (
      SELECT FROM pg_extension
      WHERE extname = 'pg_net'
      -- all versions in use on existing projects as of 2025-02-20
      -- version 0.12.0 onwards don't need these applied
      AND extversion IN ('0.2', '0.6', '0.7', '0.7.1', '0.8.0', '0.10.0', '0.11.0')
    ) THEN
      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

      REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
      REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

      GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    END IF;
  END IF;
END;
$function$;

-- [extensions] hmac(bytea, bytea, text)
CREATE OR REPLACE FUNCTION extensions.hmac(bytea, bytea, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_hmac$function$;

-- [extensions] hmac(text, text, text)
CREATE OR REPLACE FUNCTION extensions.hmac(text, text, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_hmac$function$;

-- [extensions] pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone)
CREATE OR REPLACE FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone)
 RETURNS SETOF record
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pg_stat_statements', $function$pg_stat_statements_1_11$function$;

-- [extensions] pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone)
CREATE OR REPLACE FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone)
 RETURNS record
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pg_stat_statements', $function$pg_stat_statements_info$function$;

-- [extensions] pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean)
CREATE OR REPLACE FUNCTION extensions.pg_stat_statements_reset(userid oid DEFAULT 0, dbid oid DEFAULT 0, queryid bigint DEFAULT 0, minmax_only boolean DEFAULT false)
 RETURNS timestamp with time zone
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pg_stat_statements', $function$pg_stat_statements_reset_1_11$function$;

-- [extensions] pgp_armor_headers(text, OUT key text, OUT value text)
CREATE OR REPLACE FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text)
 RETURNS SETOF record
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_armor_headers$function$;

-- [extensions] pgp_key_id(bytea)
CREATE OR REPLACE FUNCTION extensions.pgp_key_id(bytea)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_key_id_w$function$;

-- [extensions] pgp_pub_decrypt(bytea, bytea)
CREATE OR REPLACE FUNCTION extensions.pgp_pub_decrypt(bytea, bytea)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_pub_decrypt_text$function$;

-- [extensions] pgp_pub_decrypt(bytea, bytea, text)
CREATE OR REPLACE FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_pub_decrypt_text$function$;

-- [extensions] pgp_pub_decrypt(bytea, bytea, text, text)
CREATE OR REPLACE FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_pub_decrypt_text$function$;

-- [extensions] pgp_pub_decrypt_bytea(bytea, bytea)
CREATE OR REPLACE FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_pub_decrypt_bytea$function$;

-- [extensions] pgp_pub_decrypt_bytea(bytea, bytea, text)
CREATE OR REPLACE FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_pub_decrypt_bytea$function$;

-- [extensions] pgp_pub_decrypt_bytea(bytea, bytea, text, text)
CREATE OR REPLACE FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_pub_decrypt_bytea$function$;

-- [extensions] pgp_pub_encrypt(text, bytea)
CREATE OR REPLACE FUNCTION extensions.pgp_pub_encrypt(text, bytea)
 RETURNS bytea
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_pub_encrypt_text$function$;

-- [extensions] pgp_pub_encrypt(text, bytea, text)
CREATE OR REPLACE FUNCTION extensions.pgp_pub_encrypt(text, bytea, text)
 RETURNS bytea
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_pub_encrypt_text$function$;

-- [extensions] pgp_pub_encrypt_bytea(bytea, bytea)
CREATE OR REPLACE FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea)
 RETURNS bytea
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_pub_encrypt_bytea$function$;

-- [extensions] pgp_pub_encrypt_bytea(bytea, bytea, text)
CREATE OR REPLACE FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text)
 RETURNS bytea
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_pub_encrypt_bytea$function$;

-- [extensions] pgp_sym_decrypt(bytea, text)
CREATE OR REPLACE FUNCTION extensions.pgp_sym_decrypt(bytea, text)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_sym_decrypt_text$function$;

-- [extensions] pgp_sym_decrypt(bytea, text, text)
CREATE OR REPLACE FUNCTION extensions.pgp_sym_decrypt(bytea, text, text)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_sym_decrypt_text$function$;

-- [extensions] pgp_sym_decrypt_bytea(bytea, text)
CREATE OR REPLACE FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_sym_decrypt_bytea$function$;

-- [extensions] pgp_sym_decrypt_bytea(bytea, text, text)
CREATE OR REPLACE FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_sym_decrypt_bytea$function$;

-- [extensions] pgp_sym_encrypt(text, text)
CREATE OR REPLACE FUNCTION extensions.pgp_sym_encrypt(text, text)
 RETURNS bytea
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_sym_encrypt_text$function$;

-- [extensions] pgp_sym_encrypt(text, text, text)
CREATE OR REPLACE FUNCTION extensions.pgp_sym_encrypt(text, text, text)
 RETURNS bytea
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_sym_encrypt_text$function$;

-- [extensions] pgp_sym_encrypt_bytea(bytea, text)
CREATE OR REPLACE FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text)
 RETURNS bytea
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_sym_encrypt_bytea$function$;

-- [extensions] pgp_sym_encrypt_bytea(bytea, text, text)
CREATE OR REPLACE FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text)
 RETURNS bytea
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_sym_encrypt_bytea$function$;

-- [extensions] pgrst_ddl_watch()
CREATE OR REPLACE FUNCTION extensions.pgrst_ddl_watch()
 RETURNS event_trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $function$;

-- [extensions] pgrst_drop_watch()
CREATE OR REPLACE FUNCTION extensions.pgrst_drop_watch()
 RETURNS event_trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $function$;

-- [extensions] set_graphql_placeholder()
CREATE OR REPLACE FUNCTION extensions.set_graphql_placeholder()
 RETURNS event_trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
            set search_path to ''
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$function$;

-- [extensions] uuid_generate_v1()
CREATE OR REPLACE FUNCTION extensions.uuid_generate_v1()
 RETURNS uuid
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_generate_v1$function$;

-- [extensions] uuid_generate_v1mc()
CREATE OR REPLACE FUNCTION extensions.uuid_generate_v1mc()
 RETURNS uuid
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_generate_v1mc$function$;

-- [extensions] uuid_generate_v3(namespace uuid, name text)
CREATE OR REPLACE FUNCTION extensions.uuid_generate_v3(namespace uuid, name text)
 RETURNS uuid
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_generate_v3$function$;

-- [extensions] uuid_generate_v4()
CREATE OR REPLACE FUNCTION extensions.uuid_generate_v4()
 RETURNS uuid
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_generate_v4$function$;

-- [extensions] uuid_generate_v5(namespace uuid, name text)
CREATE OR REPLACE FUNCTION extensions.uuid_generate_v5(namespace uuid, name text)
 RETURNS uuid
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_generate_v5$function$;

-- [extensions] uuid_nil()
CREATE OR REPLACE FUNCTION extensions.uuid_nil()
 RETURNS uuid
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_nil$function$;

-- [extensions] uuid_ns_dns()
CREATE OR REPLACE FUNCTION extensions.uuid_ns_dns()
 RETURNS uuid
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_ns_dns$function$;

-- [extensions] uuid_ns_oid()
CREATE OR REPLACE FUNCTION extensions.uuid_ns_oid()
 RETURNS uuid
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_ns_oid$function$;

-- [extensions] uuid_ns_url()
CREATE OR REPLACE FUNCTION extensions.uuid_ns_url()
 RETURNS uuid
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_ns_url$function$;

-- [extensions] uuid_ns_x500()
CREATE OR REPLACE FUNCTION extensions.uuid_ns_x500()
 RETURNS uuid
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_ns_x500$function$;

-- [graphql_public] graphql("operationName" text, query text, variables jsonb, extensions jsonb)
CREATE OR REPLACE FUNCTION graphql_public.graphql("operationName" text DEFAULT NULL::text, query text DEFAULT NULL::text, variables jsonb DEFAULT NULL::jsonb, extensions jsonb DEFAULT NULL::jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $function$;

-- [information_schema] _pg_char_max_length(typid oid, typmod integer)
CREATE OR REPLACE FUNCTION information_schema._pg_char_max_length(typid oid, typmod integer)
 RETURNS integer
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT
RETURN CASE WHEN (typmod = '-1'::integer) THEN NULL::integer WHEN (typid = ANY (ARRAY[(1042)::oid, (1043)::oid])) THEN (typmod - 4) WHEN (typid = ANY (ARRAY[(1560)::oid, (1562)::oid])) THEN typmod ELSE NULL::integer END;

-- [information_schema] _pg_char_octet_length(typid oid, typmod integer)
CREATE OR REPLACE FUNCTION information_schema._pg_char_octet_length(typid oid, typmod integer)
 RETURNS integer
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT
RETURN CASE WHEN (typid = ANY (ARRAY[(25)::oid, (1042)::oid, (1043)::oid])) THEN CASE WHEN (typmod = '-1'::integer) THEN (((2)::double precision ^ (30)::double precision))::integer ELSE (information_schema._pg_char_max_length(typid, typmod) * pg_encoding_max_length((SELECT pg_database.encoding FROM pg_database WHERE (pg_database.datname = current_database())))) END ELSE NULL::integer END;

-- [information_schema] _pg_datetime_precision(typid oid, typmod integer)
CREATE OR REPLACE FUNCTION information_schema._pg_datetime_precision(typid oid, typmod integer)
 RETURNS integer
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT
RETURN CASE WHEN (typid = (1082)::oid) THEN 0 WHEN (typid = ANY (ARRAY[(1083)::oid, (1114)::oid, (1184)::oid, (1266)::oid])) THEN CASE WHEN (typmod < 0) THEN 6 ELSE typmod END WHEN (typid = (1186)::oid) THEN CASE WHEN ((typmod < 0) OR ((typmod & 65535) = 65535)) THEN 6 ELSE (typmod & 65535) END ELSE NULL::integer END;

-- [information_schema] _pg_expandarray(anyarray, OUT x anyelement, OUT n integer)
CREATE OR REPLACE FUNCTION information_schema._pg_expandarray(anyarray, OUT x anyelement, OUT n integer)
 RETURNS SETOF record
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT ROWS 100 SUPPORT array_unnest_support
AS $function$SELECT * FROM pg_catalog.unnest($1) WITH ORDINALITY$function$;

-- [information_schema] _pg_index_position(oid, smallint)
CREATE OR REPLACE FUNCTION information_schema._pg_index_position(oid, smallint)
 RETURNS integer
 LANGUAGE sql
 STABLE STRICT
BEGIN ATOMIC
 SELECT (ss.a).n AS n
    FROM ( SELECT information_schema._pg_expandarray(pg_index.indkey) AS a
            FROM pg_index
           WHERE (pg_index.indexrelid = $1)) ss
   WHERE ((ss.a).x = $2);
END;

-- [information_schema] _pg_interval_type(typid oid, mod integer)
CREATE OR REPLACE FUNCTION information_schema._pg_interval_type(typid oid, mod integer)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT
RETURN CASE WHEN (typid = (1186)::oid) THEN upper(SUBSTRING(format_type(typid, mod) SIMILAR 'interval[()0-9]* #"%#"'::text ESCAPE '#'::text)) ELSE NULL::text END;

-- [information_schema] _pg_numeric_precision(typid oid, typmod integer)
CREATE OR REPLACE FUNCTION information_schema._pg_numeric_precision(typid oid, typmod integer)
 RETURNS integer
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT
RETURN CASE typid WHEN 21 THEN 16 WHEN 23 THEN 32 WHEN 20 THEN 64 WHEN 1700 THEN CASE WHEN (typmod = '-1'::integer) THEN NULL::integer ELSE (((typmod - 4) >> 16) & 65535) END WHEN 700 THEN 24 WHEN 701 THEN 53 ELSE NULL::integer END;

-- [information_schema] _pg_numeric_precision_radix(typid oid, typmod integer)
CREATE OR REPLACE FUNCTION information_schema._pg_numeric_precision_radix(typid oid, typmod integer)
 RETURNS integer
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT
RETURN CASE WHEN (typid = ANY (ARRAY[(21)::oid, (23)::oid, (20)::oid, (700)::oid, (701)::oid])) THEN 2 WHEN (typid = (1700)::oid) THEN 10 ELSE NULL::integer END;

-- [information_schema] _pg_numeric_scale(typid oid, typmod integer)
CREATE OR REPLACE FUNCTION information_schema._pg_numeric_scale(typid oid, typmod integer)
 RETURNS integer
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT
RETURN CASE WHEN (typid = ANY (ARRAY[(21)::oid, (23)::oid, (20)::oid])) THEN 0 WHEN (typid = (1700)::oid) THEN CASE WHEN (typmod = '-1'::integer) THEN NULL::integer ELSE ((typmod - 4) & 65535) END ELSE NULL::integer END;

-- [information_schema] _pg_truetypid(pg_attribute, pg_type)
CREATE OR REPLACE FUNCTION information_schema._pg_truetypid(pg_attribute, pg_type)
 RETURNS oid
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT
RETURN CASE WHEN (($2).typtype = 'd'::"char") THEN ($2).typbasetype ELSE ($1).atttypid END;

-- [information_schema] _pg_truetypmod(pg_attribute, pg_type)
CREATE OR REPLACE FUNCTION information_schema._pg_truetypmod(pg_attribute, pg_type)
 RETURNS integer
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT
RETURN CASE WHEN (($2).typtype = 'd'::"char") THEN ($2).typtypmod ELSE ($1).atttypmod END;

-- [net] _await_response(request_id bigint)
CREATE OR REPLACE FUNCTION net._await_response(request_id bigint)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
declare
    rec net._http_response;
begin
    while rec is null loop
        select *
        into rec
        from net._http_response
        where id = request_id;

        if rec is null then
            -- Wait 50 ms before checking again
            perform pg_sleep(0.05);
        end if;
    end loop;

    return true;
end;
$function$;

-- [net] _encode_url_with_params_array(url text, params_array text[])
CREATE OR REPLACE FUNCTION net._encode_url_with_params_array(url text, params_array text[])
 RETURNS text
 LANGUAGE c
 IMMUTABLE
AS 'pg_net', $function$_encode_url_with_params_array$function$;

-- [net] _http_collect_response(request_id bigint, async boolean)
CREATE OR REPLACE FUNCTION net._http_collect_response(request_id bigint, async boolean DEFAULT true)
 RETURNS net.http_response_result
 LANGUAGE plpgsql
AS $function$
declare
    rec net._http_response;
    req_exists boolean;
begin

    if not async then
        perform net._await_response(request_id);
    end if;

    select *
    into rec
    from net._http_response
    where id = request_id;

    if rec is null or rec.error_msg is not null then
        -- The request is either still processing or the request_id provided does not exist

        -- TODO: request in progress is indistinguishable from request that doesn't exist

        -- No request matching request_id found
        return (
            'ERROR',
            coalesce(rec.error_msg, 'request matching request_id not found'),
            null
        )::net.http_response_result;

    end if;

    -- Return a valid, populated http_response_result
    return (
        'SUCCESS',
        'ok',
        (
            rec.status_code,
            rec.headers,
            rec.content
        )::net.http_response
    )::net.http_response_result;
end;
$function$;

-- [net] _urlencode_string(string character varying)
CREATE OR REPLACE FUNCTION net._urlencode_string(string character varying)
 RETURNS text
 LANGUAGE c
 IMMUTABLE
AS 'pg_net', $function$_urlencode_string$function$;

-- [net] check_worker_is_up()
CREATE OR REPLACE FUNCTION net.check_worker_is_up()
 RETURNS void
 LANGUAGE plpgsql
AS $function$
begin
  if not exists (select pid from pg_stat_activity where backend_type ilike '%pg_net%') then
    raise exception using
      message = 'the pg_net background worker is not up'
    , detail  = 'the pg_net background worker is down due to an internal error and cannot process requests'
    , hint    = 'make sure that you didn''t modify any of pg_net internal tables';
  end if;
end
$function$;

-- [net] http_collect_response(request_id bigint, async boolean)
CREATE OR REPLACE FUNCTION net.http_collect_response(request_id bigint, async boolean DEFAULT true)
 RETURNS net.http_response_result
 LANGUAGE plpgsql
AS $function$
begin
  raise notice 'The net.http_collect_response function is deprecated.';
  select net._http_collect_response(request_id, async);
end;
$function$;

-- [net] http_delete(url text, params jsonb, headers jsonb, timeout_milliseconds integer, body jsonb)
CREATE OR REPLACE FUNCTION net.http_delete(url text, params jsonb DEFAULT '{}'::jsonb, headers jsonb DEFAULT '{}'::jsonb, timeout_milliseconds integer DEFAULT 5000, body jsonb DEFAULT NULL::jsonb)
 RETURNS bigint
 LANGUAGE plpgsql
AS $function$
declare
    request_id bigint;
    params_array text[];
begin
    select coalesce(array_agg(net._urlencode_string(key) || '=' || net._urlencode_string(value)), '{}')
    into params_array
    from jsonb_each_text(params);

    -- Add to the request queue
    insert into net.http_request_queue(method, url, headers, body, timeout_milliseconds)
    values (
        'DELETE',
        net._encode_url_with_params_array(url, params_array),
        headers,
        convert_to(body::text, 'UTF8'),
        timeout_milliseconds
    )
    returning id
    into request_id;

    perform net.wake();

    return request_id;
end
$function$;

-- [net] http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer)
CREATE OR REPLACE FUNCTION net.http_get(url text, params jsonb DEFAULT '{}'::jsonb, headers jsonb DEFAULT '{}'::jsonb, timeout_milliseconds integer DEFAULT 5000)
 RETURNS bigint
 LANGUAGE plpgsql
AS $function$
declare
    request_id bigint;
    params_array text[];
begin
    select coalesce(array_agg(net._urlencode_string(key) || '=' || net._urlencode_string(value)), '{}')
    into params_array
    from jsonb_each_text(params);

    -- Add to the request queue
    insert into net.http_request_queue(method, url, headers, timeout_milliseconds)
    values (
        'GET',
        net._encode_url_with_params_array(url, params_array),
        headers,
        timeout_milliseconds
    )
    returning id
    into request_id;

    perform net.wake();

    return request_id;
end
$function$;

-- [net] http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer)
CREATE OR REPLACE FUNCTION net.http_post(url text, body jsonb DEFAULT '{}'::jsonb, params jsonb DEFAULT '{}'::jsonb, headers jsonb DEFAULT '{"Content-Type": "application/json"}'::jsonb, timeout_milliseconds integer DEFAULT 5000)
 RETURNS bigint
 LANGUAGE plpgsql
AS $function$
declare
    request_id bigint;
    params_array text[];
    content_type text;
begin

    -- Exctract the content_type from headers
    select
        header_value into content_type
    from
        jsonb_each_text(coalesce(headers, '{}'::jsonb)) r(header_name, header_value)
    where
        lower(header_name) = 'content-type'
    limit
        1;

    -- If the user provided new headers and omitted the content type
    -- add it back in automatically
    if content_type is null then
        select headers || '{"Content-Type": "application/json"}'::jsonb into headers;
    end if;

    -- Confirm that the content-type is set as "application/json"
    if content_type <> 'application/json' then
        raise exception 'Content-Type header must be "application/json"';
    end if;

    select
        coalesce(array_agg(net._urlencode_string(key) || '=' || net._urlencode_string(value)), '{}')
    into
        params_array
    from
        jsonb_each_text(params);

    -- Add to the request queue
    insert into net.http_request_queue(method, url, headers, body, timeout_milliseconds)
    values (
        'POST',
        net._encode_url_with_params_array(url, params_array),
        headers,
        convert_to(body::text, 'UTF8'),
        timeout_milliseconds
    )
    returning id
    into request_id;

    perform net.wake();

    return request_id;
end
$function$;

-- [net] wait_until_running()
CREATE OR REPLACE FUNCTION net.wait_until_running()
 RETURNS void
 LANGUAGE c
AS 'pg_net', $function$wait_until_running$function$;

-- [net] wake()
CREATE OR REPLACE FUNCTION net.wake()
 RETURNS void
 LANGUAGE c
AS 'pg_net', $function$wake$function$;

-- [net] worker_restart()
CREATE OR REPLACE FUNCTION net.worker_restart()
 RETURNS boolean
 LANGUAGE c
AS 'pg_net', $function$worker_restart$function$;

-- [pg_catalog] RI_FKey_cascade_del()
CREATE OR REPLACE FUNCTION pg_catalog."RI_FKey_cascade_del"()
 RETURNS trigger
 LANGUAGE internal
 PARALLEL SAFE STRICT
AS $function$RI_FKey_cascade_del$function$;

-- [pg_catalog] RI_FKey_cascade_upd()
CREATE OR REPLACE FUNCTION pg_catalog."RI_FKey_cascade_upd"()
 RETURNS trigger
 LANGUAGE internal
 PARALLEL SAFE STRICT
AS $function$RI_FKey_cascade_upd$function$;

-- [pg_catalog] RI_FKey_check_ins()
CREATE OR REPLACE FUNCTION pg_catalog."RI_FKey_check_ins"()
 RETURNS trigger
 LANGUAGE internal
 PARALLEL SAFE STRICT
AS $function$RI_FKey_check_ins$function$;

-- [pg_catalog] RI_FKey_check_upd()
CREATE OR REPLACE FUNCTION pg_catalog."RI_FKey_check_upd"()
 RETURNS trigger
 LANGUAGE internal
 PARALLEL SAFE STRICT
AS $function$RI_FKey_check_upd$function$;

-- [pg_catalog] RI_FKey_noaction_del()
CREATE OR REPLACE FUNCTION pg_catalog."RI_FKey_noaction_del"()
 RETURNS trigger
 LANGUAGE internal
 PARALLEL SAFE STRICT
AS $function$RI_FKey_noaction_del$function$;

-- [pg_catalog] RI_FKey_noaction_upd()
CREATE OR REPLACE FUNCTION pg_catalog."RI_FKey_noaction_upd"()
 RETURNS trigger
 LANGUAGE internal
 PARALLEL SAFE STRICT
AS $function$RI_FKey_noaction_upd$function$;

-- [pg_catalog] RI_FKey_restrict_del()
CREATE OR REPLACE FUNCTION pg_catalog."RI_FKey_restrict_del"()
 RETURNS trigger
 LANGUAGE internal
 PARALLEL SAFE STRICT
AS $function$RI_FKey_restrict_del$function$;

-- [pg_catalog] RI_FKey_restrict_upd()
CREATE OR REPLACE FUNCTION pg_catalog."RI_FKey_restrict_upd"()
 RETURNS trigger
 LANGUAGE internal
 PARALLEL SAFE STRICT
AS $function$RI_FKey_restrict_upd$function$;

-- [pg_catalog] RI_FKey_setdefault_del()
CREATE OR REPLACE FUNCTION pg_catalog."RI_FKey_setdefault_del"()
 RETURNS trigger
 LANGUAGE internal
 PARALLEL SAFE STRICT
AS $function$RI_FKey_setdefault_del$function$;

-- [pg_catalog] RI_FKey_setdefault_upd()
CREATE OR REPLACE FUNCTION pg_catalog."RI_FKey_setdefault_upd"()
 RETURNS trigger
 LANGUAGE internal
 PARALLEL SAFE STRICT
AS $function$RI_FKey_setdefault_upd$function$;

-- [pg_catalog] RI_FKey_setnull_del()
CREATE OR REPLACE FUNCTION pg_catalog."RI_FKey_setnull_del"()
 RETURNS trigger
 LANGUAGE internal
 PARALLEL SAFE STRICT
AS $function$RI_FKey_setnull_del$function$;

-- [pg_catalog] RI_FKey_setnull_upd()
CREATE OR REPLACE FUNCTION pg_catalog."RI_FKey_setnull_upd"()
 RETURNS trigger
 LANGUAGE internal
 PARALLEL SAFE STRICT
AS $function$RI_FKey_setnull_upd$function$;

-- [pg_catalog] abbrev(cidr)
CREATE OR REPLACE FUNCTION pg_catalog.abbrev(cidr)
 RETURNS text
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$cidr_abbrev$function$;

-- [pg_catalog] abbrev(inet)
CREATE OR REPLACE FUNCTION pg_catalog.abbrev(inet)
 RETURNS text
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$inet_abbrev$function$;

-- [pg_catalog] abs(bigint)
CREATE OR REPLACE FUNCTION pg_catalog.abs(bigint)
 RETURNS bigint
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$int8abs$function$;

-- [pg_catalog] abs(double precision)
CREATE OR REPLACE FUNCTION pg_catalog.abs(double precision)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$float8abs$function$;

-- [pg_catalog] abs(integer)
CREATE OR REPLACE FUNCTION pg_catalog.abs(integer)
 RETURNS integer
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$int4abs$function$;

-- [pg_catalog] abs(numeric)
CREATE OR REPLACE FUNCTION pg_catalog.abs(numeric)
 RETURNS numeric
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$numeric_abs$function$;

-- [pg_catalog] abs(real)
CREATE OR REPLACE FUNCTION pg_catalog.abs(real)
 RETURNS real
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$float4abs$function$;

-- [pg_catalog] abs(smallint)
CREATE OR REPLACE FUNCTION pg_catalog.abs(smallint)
 RETURNS smallint
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$int2abs$function$;

-- [pg_catalog] aclcontains(aclitem[], aclitem)
CREATE OR REPLACE FUNCTION pg_catalog.aclcontains(aclitem[], aclitem)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$aclcontains$function$;

-- [pg_catalog] acldefault("char", oid)
CREATE OR REPLACE FUNCTION pg_catalog.acldefault("char", oid)
 RETURNS aclitem[]
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$acldefault_sql$function$;

-- [pg_catalog] aclexplode(acl aclitem[], OUT grantor oid, OUT grantee oid, OUT privilege_type text, OUT is_grantable boolean)
CREATE OR REPLACE FUNCTION pg_catalog.aclexplode(acl aclitem[], OUT grantor oid, OUT grantee oid, OUT privilege_type text, OUT is_grantable boolean)
 RETURNS SETOF record
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT ROWS 10
AS $function$aclexplode$function$;

-- [pg_catalog] aclinsert(aclitem[], aclitem)
CREATE OR REPLACE FUNCTION pg_catalog.aclinsert(aclitem[], aclitem)
 RETURNS aclitem[]
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$aclinsert$function$;

-- [pg_catalog] aclitemeq(aclitem, aclitem)
CREATE OR REPLACE FUNCTION pg_catalog.aclitemeq(aclitem, aclitem)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$aclitem_eq$function$;

-- [pg_catalog] aclitemin(cstring)
CREATE OR REPLACE FUNCTION pg_catalog.aclitemin(cstring)
 RETURNS aclitem
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$aclitemin$function$;

-- [pg_catalog] aclitemout(aclitem)
CREATE OR REPLACE FUNCTION pg_catalog.aclitemout(aclitem)
 RETURNS cstring
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$aclitemout$function$;

-- [pg_catalog] aclremove(aclitem[], aclitem)
CREATE OR REPLACE FUNCTION pg_catalog.aclremove(aclitem[], aclitem)
 RETURNS aclitem[]
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$aclremove$function$;

-- [pg_catalog] acos(double precision)
CREATE OR REPLACE FUNCTION pg_catalog.acos(double precision)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$dacos$function$;

-- [pg_catalog] acosd(double precision)
CREATE OR REPLACE FUNCTION pg_catalog.acosd(double precision)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$dacosd$function$;

-- [pg_catalog] acosh(double precision)
CREATE OR REPLACE FUNCTION pg_catalog.acosh(double precision)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$dacosh$function$;

-- [pg_catalog] age(timestamp with time zone)
CREATE OR REPLACE FUNCTION pg_catalog.age(timestamp with time zone)
 RETURNS interval
 LANGUAGE sql
 STABLE PARALLEL SAFE STRICT COST 1
RETURN age((CURRENT_DATE)::timestamp with time zone, $1);

-- [pg_catalog] age(timestamp with time zone, timestamp with time zone)
CREATE OR REPLACE FUNCTION pg_catalog.age(timestamp with time zone, timestamp with time zone)
 RETURNS interval
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$timestamptz_age$function$;

-- [pg_catalog] age(timestamp without time zone)
CREATE OR REPLACE FUNCTION pg_catalog.age(timestamp without time zone)
 RETURNS interval
 LANGUAGE sql
 STABLE PARALLEL SAFE STRICT COST 1
RETURN age((CURRENT_DATE)::timestamp without time zone, $1);

-- [pg_catalog] age(timestamp without time zone, timestamp without time zone)
CREATE OR REPLACE FUNCTION pg_catalog.age(timestamp without time zone, timestamp without time zone)
 RETURNS interval
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$timestamp_age$function$;

-- [pg_catalog] age(xid)
CREATE OR REPLACE FUNCTION pg_catalog.age(xid)
 RETURNS integer
 LANGUAGE internal
 STABLE PARALLEL RESTRICTED STRICT
AS $function$xid_age$function$;

-- [pg_catalog] amvalidate(oid)
CREATE OR REPLACE FUNCTION pg_catalog.amvalidate(oid)
 RETURNS boolean
 LANGUAGE internal
 PARALLEL SAFE STRICT
AS $function$amvalidate$function$;

-- [pg_catalog] any_in(cstring)
CREATE OR REPLACE FUNCTION pg_catalog.any_in(cstring)
 RETURNS "any"
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$any_in$function$;

-- [pg_catalog] any_out("any")
CREATE OR REPLACE FUNCTION pg_catalog.any_out("any")
 RETURNS cstring
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$any_out$function$;

-- [pg_catalog] any_value_transfn(anyelement, anyelement)
CREATE OR REPLACE FUNCTION pg_catalog.any_value_transfn(anyelement, anyelement)
 RETURNS anyelement
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$any_value_transfn$function$;

-- [pg_catalog] anyarray_in(cstring)
CREATE OR REPLACE FUNCTION pg_catalog.anyarray_in(cstring)
 RETURNS anyarray
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$anyarray_in$function$;

-- [pg_catalog] anyarray_out(anyarray)
CREATE OR REPLACE FUNCTION pg_catalog.anyarray_out(anyarray)
 RETURNS cstring
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$anyarray_out$function$;

-- [pg_catalog] anyarray_recv(internal)
CREATE OR REPLACE FUNCTION pg_catalog.anyarray_recv(internal)
 RETURNS anyarray
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$anyarray_recv$function$;

-- [pg_catalog] anyarray_send(anyarray)
CREATE OR REPLACE FUNCTION pg_catalog.anyarray_send(anyarray)
 RETURNS bytea
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$anyarray_send$function$;

-- [pg_catalog] anycompatible_in(cstring)
CREATE OR REPLACE FUNCTION pg_catalog.anycompatible_in(cstring)
 RETURNS anycompatible
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$anycompatible_in$function$;

-- [pg_catalog] anycompatible_out(anycompatible)
CREATE OR REPLACE FUNCTION pg_catalog.anycompatible_out(anycompatible)
 RETURNS cstring
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$anycompatible_out$function$;

-- [pg_catalog] anycompatiblearray_in(cstring)
CREATE OR REPLACE FUNCTION pg_catalog.anycompatiblearray_in(cstring)
 RETURNS anycompatiblearray
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$anycompatiblearray_in$function$;

-- [pg_catalog] anycompatiblearray_out(anycompatiblearray)
CREATE OR REPLACE FUNCTION pg_catalog.anycompatiblearray_out(anycompatiblearray)
 RETURNS cstring
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$anycompatiblearray_out$function$;

-- [pg_catalog] anycompatiblearray_recv(internal)
CREATE OR REPLACE FUNCTION pg_catalog.anycompatiblearray_recv(internal)
 RETURNS anycompatiblearray
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$anycompatiblearray_recv$function$;

-- [pg_catalog] anycompatiblearray_send(anycompatiblearray)
CREATE OR REPLACE FUNCTION pg_catalog.anycompatiblearray_send(anycompatiblearray)
 RETURNS bytea
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$anycompatiblearray_send$function$;

-- [pg_catalog] anycompatiblemultirange_in(cstring, oid, integer)
CREATE OR REPLACE FUNCTION pg_catalog.anycompatiblemultirange_in(cstring, oid, integer)
 RETURNS anycompatiblemultirange
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$anycompatiblemultirange_in$function$;

-- [pg_catalog] anycompatiblemultirange_out(anycompatiblemultirange)
CREATE OR REPLACE FUNCTION pg_catalog.anycompatiblemultirange_out(anycompatiblemultirange)
 RETURNS cstring
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$anycompatiblemultirange_out$function$;

-- [pg_catalog] anycompatiblenonarray_in(cstring)
CREATE OR REPLACE FUNCTION pg_catalog.anycompatiblenonarray_in(cstring)
 RETURNS anycompatiblenonarray
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$anycompatiblenonarray_in$function$;

-- [pg_catalog] anycompatiblenonarray_out(anycompatiblenonarray)
CREATE OR REPLACE FUNCTION pg_catalog.anycompatiblenonarray_out(anycompatiblenonarray)
 RETURNS cstring
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$anycompatiblenonarray_out$function$;

-- [pg_catalog] anycompatiblerange_in(cstring, oid, integer)
CREATE OR REPLACE FUNCTION pg_catalog.anycompatiblerange_in(cstring, oid, integer)
 RETURNS anycompatiblerange
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$anycompatiblerange_in$function$;

-- [pg_catalog] anycompatiblerange_out(anycompatiblerange)
CREATE OR REPLACE FUNCTION pg_catalog.anycompatiblerange_out(anycompatiblerange)
 RETURNS cstring
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$anycompatiblerange_out$function$;

-- [pg_catalog] anyelement_in(cstring)
CREATE OR REPLACE FUNCTION pg_catalog.anyelement_in(cstring)
 RETURNS anyelement
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$anyelement_in$function$;

-- [pg_catalog] anyelement_out(anyelement)
CREATE OR REPLACE FUNCTION pg_catalog.anyelement_out(anyelement)
 RETURNS cstring
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$anyelement_out$function$;

-- [pg_catalog] anyenum_in(cstring)
CREATE OR REPLACE FUNCTION pg_catalog.anyenum_in(cstring)
 RETURNS anyenum
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$anyenum_in$function$;

-- [pg_catalog] anyenum_out(anyenum)
CREATE OR REPLACE FUNCTION pg_catalog.anyenum_out(anyenum)
 RETURNS cstring
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$anyenum_out$function$;

-- [pg_catalog] anymultirange_in(cstring, oid, integer)
CREATE OR REPLACE FUNCTION pg_catalog.anymultirange_in(cstring, oid, integer)
 RETURNS anymultirange
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$anymultirange_in$function$;

-- [pg_catalog] anymultirange_out(anymultirange)
CREATE OR REPLACE FUNCTION pg_catalog.anymultirange_out(anymultirange)
 RETURNS cstring
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$anymultirange_out$function$;

-- [pg_catalog] anynonarray_in(cstring)
CREATE OR REPLACE FUNCTION pg_catalog.anynonarray_in(cstring)
 RETURNS anynonarray
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$anynonarray_in$function$;

-- [pg_catalog] anynonarray_out(anynonarray)
CREATE OR REPLACE FUNCTION pg_catalog.anynonarray_out(anynonarray)
 RETURNS cstring
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$anynonarray_out$function$;

-- [pg_catalog] anyrange_in(cstring, oid, integer)
CREATE OR REPLACE FUNCTION pg_catalog.anyrange_in(cstring, oid, integer)
 RETURNS anyrange
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$anyrange_in$function$;

-- [pg_catalog] anyrange_out(anyrange)
CREATE OR REPLACE FUNCTION pg_catalog.anyrange_out(anyrange)
 RETURNS cstring
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$anyrange_out$function$;

-- [pg_catalog] anytextcat(anynonarray, text)
CREATE OR REPLACE FUNCTION pg_catalog.anytextcat(anynonarray, text)
 RETURNS text
 LANGUAGE sql
 STABLE PARALLEL SAFE STRICT COST 1
AS $function$select $1::pg_catalog.text operator(pg_catalog.||) $2$function$;

-- [pg_catalog] area(box)
CREATE OR REPLACE FUNCTION pg_catalog.area(box)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$box_area$function$;

-- [pg_catalog] area(circle)
CREATE OR REPLACE FUNCTION pg_catalog.area(circle)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$circle_area$function$;

-- [pg_catalog] area(path)
CREATE OR REPLACE FUNCTION pg_catalog.area(path)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$path_area$function$;

-- [pg_catalog] areajoinsel(internal, oid, internal, smallint, internal)
CREATE OR REPLACE FUNCTION pg_catalog.areajoinsel(internal, oid, internal, smallint, internal)
 RETURNS double precision
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$areajoinsel$function$;

-- [pg_catalog] areasel(internal, oid, internal, integer)
CREATE OR REPLACE FUNCTION pg_catalog.areasel(internal, oid, internal, integer)
 RETURNS double precision
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$areasel$function$;

-- [pg_catalog] array_agg_array_combine(internal, internal)
CREATE OR REPLACE FUNCTION pg_catalog.array_agg_array_combine(internal, internal)
 RETURNS internal
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE
AS $function$array_agg_array_combine$function$;

-- [pg_catalog] array_agg_array_deserialize(bytea, internal)
CREATE OR REPLACE FUNCTION pg_catalog.array_agg_array_deserialize(bytea, internal)
 RETURNS internal
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$array_agg_array_deserialize$function$;

-- [pg_catalog] array_agg_array_finalfn(internal, anyarray)
CREATE OR REPLACE FUNCTION pg_catalog.array_agg_array_finalfn(internal, anyarray)
 RETURNS anyarray
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE
AS $function$array_agg_array_finalfn$function$;

-- [pg_catalog] array_agg_array_serialize(internal)
CREATE OR REPLACE FUNCTION pg_catalog.array_agg_array_serialize(internal)
 RETURNS bytea
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$array_agg_array_serialize$function$;

-- [pg_catalog] array_agg_array_transfn(internal, anyarray)
CREATE OR REPLACE FUNCTION pg_catalog.array_agg_array_transfn(internal, anyarray)
 RETURNS internal
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE
AS $function$array_agg_array_transfn$function$;

-- [pg_catalog] array_agg_combine(internal, internal)
CREATE OR REPLACE FUNCTION pg_catalog.array_agg_combine(internal, internal)
 RETURNS internal
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE
AS $function$array_agg_combine$function$;

-- [pg_catalog] array_agg_deserialize(bytea, internal)
CREATE OR REPLACE FUNCTION pg_catalog.array_agg_deserialize(bytea, internal)
 RETURNS internal
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$array_agg_deserialize$function$;

-- [pg_catalog] array_agg_finalfn(internal, anynonarray)
CREATE OR REPLACE FUNCTION pg_catalog.array_agg_finalfn(internal, anynonarray)
 RETURNS anyarray
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE
AS $function$array_agg_finalfn$function$;

-- [pg_catalog] array_agg_serialize(internal)
CREATE OR REPLACE FUNCTION pg_catalog.array_agg_serialize(internal)
 RETURNS bytea
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$array_agg_serialize$function$;

-- [pg_catalog] array_agg_transfn(internal, anynonarray)
CREATE OR REPLACE FUNCTION pg_catalog.array_agg_transfn(internal, anynonarray)
 RETURNS internal
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE
AS $function$array_agg_transfn$function$;

-- [pg_catalog] array_append(anycompatiblearray, anycompatible)
CREATE OR REPLACE FUNCTION pg_catalog.array_append(anycompatiblearray, anycompatible)
 RETURNS anycompatiblearray
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE
AS $function$array_append$function$;

-- [pg_catalog] array_cat(anycompatiblearray, anycompatiblearray)
CREATE OR REPLACE FUNCTION pg_catalog.array_cat(anycompatiblearray, anycompatiblearray)
 RETURNS anycompatiblearray
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE
AS $function$array_cat$function$;

-- [pg_catalog] array_dims(anyarray)
CREATE OR REPLACE FUNCTION pg_catalog.array_dims(anyarray)
 RETURNS text
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$array_dims$function$;

-- [pg_catalog] array_eq(anyarray, anyarray)
CREATE OR REPLACE FUNCTION pg_catalog.array_eq(anyarray, anyarray)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$array_eq$function$;

-- [pg_catalog] array_fill(anyelement, integer[])
CREATE OR REPLACE FUNCTION pg_catalog.array_fill(anyelement, integer[])
 RETURNS anyarray
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE
AS $function$array_fill$function$;

-- [pg_catalog] array_fill(anyelement, integer[], integer[])
CREATE OR REPLACE FUNCTION pg_catalog.array_fill(anyelement, integer[], integer[])
 RETURNS anyarray
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE
AS $function$array_fill_with_lower_bounds$function$;

-- [pg_catalog] array_ge(anyarray, anyarray)
CREATE OR REPLACE FUNCTION pg_catalog.array_ge(anyarray, anyarray)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$array_ge$function$;

-- [pg_catalog] array_gt(anyarray, anyarray)
CREATE OR REPLACE FUNCTION pg_catalog.array_gt(anyarray, anyarray)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$array_gt$function$;

-- [pg_catalog] array_in(cstring, oid, integer)
CREATE OR REPLACE FUNCTION pg_catalog.array_in(cstring, oid, integer)
 RETURNS anyarray
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$array_in$function$;

-- [pg_catalog] array_larger(anyarray, anyarray)
CREATE OR REPLACE FUNCTION pg_catalog.array_larger(anyarray, anyarray)
 RETURNS anyarray
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$array_larger$function$;

-- [pg_catalog] array_le(anyarray, anyarray)
CREATE OR REPLACE FUNCTION pg_catalog.array_le(anyarray, anyarray)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$array_le$function$;

-- [pg_catalog] array_length(anyarray, integer)
CREATE OR REPLACE FUNCTION pg_catalog.array_length(anyarray, integer)
 RETURNS integer
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$array_length$function$;

-- [pg_catalog] array_lower(anyarray, integer)
CREATE OR REPLACE FUNCTION pg_catalog.array_lower(anyarray, integer)
 RETURNS integer
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$array_lower$function$;

-- [pg_catalog] array_lt(anyarray, anyarray)
CREATE OR REPLACE FUNCTION pg_catalog.array_lt(anyarray, anyarray)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$array_lt$function$;

-- [pg_catalog] array_ndims(anyarray)
CREATE OR REPLACE FUNCTION pg_catalog.array_ndims(anyarray)
 RETURNS integer
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$array_ndims$function$;

-- [pg_catalog] array_ne(anyarray, anyarray)
CREATE OR REPLACE FUNCTION pg_catalog.array_ne(anyarray, anyarray)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$array_ne$function$;

-- [pg_catalog] array_out(anyarray)
CREATE OR REPLACE FUNCTION pg_catalog.array_out(anyarray)
 RETURNS cstring
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$array_out$function$;

-- [pg_catalog] array_position(anycompatiblearray, anycompatible)
CREATE OR REPLACE FUNCTION pg_catalog.array_position(anycompatiblearray, anycompatible)
 RETURNS integer
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE
AS $function$array_position$function$;

-- [pg_catalog] array_position(anycompatiblearray, anycompatible, integer)
CREATE OR REPLACE FUNCTION pg_catalog.array_position(anycompatiblearray, anycompatible, integer)
 RETURNS integer
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE
AS $function$array_position_start$function$;

-- [pg_catalog] array_positions(anycompatiblearray, anycompatible)
CREATE OR REPLACE FUNCTION pg_catalog.array_positions(anycompatiblearray, anycompatible)
 RETURNS integer[]
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE
AS $function$array_positions$function$;

-- [pg_catalog] array_prepend(anycompatible, anycompatiblearray)
CREATE OR REPLACE FUNCTION pg_catalog.array_prepend(anycompatible, anycompatiblearray)
 RETURNS anycompatiblearray
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE
AS $function$array_prepend$function$;

-- [pg_catalog] array_recv(internal, oid, integer)
CREATE OR REPLACE FUNCTION pg_catalog.array_recv(internal, oid, integer)
 RETURNS anyarray
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$array_recv$function$;

-- [pg_catalog] array_remove(anycompatiblearray, anycompatible)
CREATE OR REPLACE FUNCTION pg_catalog.array_remove(anycompatiblearray, anycompatible)
 RETURNS anycompatiblearray
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE
AS $function$array_remove$function$;

-- [pg_catalog] array_replace(anycompatiblearray, anycompatible, anycompatible)
CREATE OR REPLACE FUNCTION pg_catalog.array_replace(anycompatiblearray, anycompatible, anycompatible)
 RETURNS anycompatiblearray
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE
AS $function$array_replace$function$;

-- [pg_catalog] array_sample(anyarray, integer)
CREATE OR REPLACE FUNCTION pg_catalog.array_sample(anyarray, integer)
 RETURNS anyarray
 LANGUAGE internal
 PARALLEL SAFE STRICT
AS $function$array_sample$function$;

-- [pg_catalog] array_send(anyarray)
CREATE OR REPLACE FUNCTION pg_catalog.array_send(anyarray)
 RETURNS bytea
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$array_send$function$;

-- [pg_catalog] array_shuffle(anyarray)
CREATE OR REPLACE FUNCTION pg_catalog.array_shuffle(anyarray)
 RETURNS anyarray
 LANGUAGE internal
 PARALLEL SAFE STRICT
AS $function$array_shuffle$function$;

-- [pg_catalog] array_smaller(anyarray, anyarray)
CREATE OR REPLACE FUNCTION pg_catalog.array_smaller(anyarray, anyarray)
 RETURNS anyarray
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$array_smaller$function$;

-- [pg_catalog] array_subscript_handler(internal)
CREATE OR REPLACE FUNCTION pg_catalog.array_subscript_handler(internal)
 RETURNS internal
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$array_subscript_handler$function$;

-- [pg_catalog] array_to_json(anyarray)
CREATE OR REPLACE FUNCTION pg_catalog.array_to_json(anyarray)
 RETURNS json
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$array_to_json$function$;

-- [pg_catalog] array_to_json(anyarray, boolean)
CREATE OR REPLACE FUNCTION pg_catalog.array_to_json(anyarray, boolean)
 RETURNS json
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$array_to_json_pretty$function$;

-- [pg_catalog] array_to_string(anyarray, text)
CREATE OR REPLACE FUNCTION pg_catalog.array_to_string(anyarray, text)
 RETURNS text
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$array_to_text$function$;

-- [pg_catalog] array_to_string(anyarray, text, text)
CREATE OR REPLACE FUNCTION pg_catalog.array_to_string(anyarray, text, text)
 RETURNS text
 LANGUAGE internal
 STABLE PARALLEL SAFE
AS $function$array_to_text_null$function$;

-- [pg_catalog] array_to_tsvector(text[])
CREATE OR REPLACE FUNCTION pg_catalog.array_to_tsvector(text[])
 RETURNS tsvector
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$array_to_tsvector$function$;

-- [pg_catalog] array_typanalyze(internal)
CREATE OR REPLACE FUNCTION pg_catalog.array_typanalyze(internal)
 RETURNS boolean
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$array_typanalyze$function$;

-- [pg_catalog] array_unnest_support(internal)
CREATE OR REPLACE FUNCTION pg_catalog.array_unnest_support(internal)
 RETURNS internal
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$array_unnest_support$function$;

-- [pg_catalog] array_upper(anyarray, integer)
CREATE OR REPLACE FUNCTION pg_catalog.array_upper(anyarray, integer)
 RETURNS integer
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$array_upper$function$;

-- [pg_catalog] arraycontained(anyarray, anyarray)
CREATE OR REPLACE FUNCTION pg_catalog.arraycontained(anyarray, anyarray)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$arraycontained$function$;

-- [pg_catalog] arraycontains(anyarray, anyarray)
CREATE OR REPLACE FUNCTION pg_catalog.arraycontains(anyarray, anyarray)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$arraycontains$function$;

-- [pg_catalog] arraycontjoinsel(internal, oid, internal, smallint, internal)
CREATE OR REPLACE FUNCTION pg_catalog.arraycontjoinsel(internal, oid, internal, smallint, internal)
 RETURNS double precision
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$arraycontjoinsel$function$;

-- [pg_catalog] arraycontsel(internal, oid, internal, integer)
CREATE OR REPLACE FUNCTION pg_catalog.arraycontsel(internal, oid, internal, integer)
 RETURNS double precision
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$arraycontsel$function$;

-- [pg_catalog] arrayoverlap(anyarray, anyarray)
CREATE OR REPLACE FUNCTION pg_catalog.arrayoverlap(anyarray, anyarray)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$arrayoverlap$function$;

-- [pg_catalog] ascii(text)
CREATE OR REPLACE FUNCTION pg_catalog.ascii(text)
 RETURNS integer
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$ascii$function$;

-- [pg_catalog] asin(double precision)
CREATE OR REPLACE FUNCTION pg_catalog.asin(double precision)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$dasin$function$;

-- [pg_catalog] asind(double precision)
CREATE OR REPLACE FUNCTION pg_catalog.asind(double precision)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$dasind$function$;

-- [pg_catalog] asinh(double precision)
CREATE OR REPLACE FUNCTION pg_catalog.asinh(double precision)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$dasinh$function$;

-- [pg_catalog] atan(double precision)
CREATE OR REPLACE FUNCTION pg_catalog.atan(double precision)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$datan$function$;

-- [pg_catalog] atan2(double precision, double precision)
CREATE OR REPLACE FUNCTION pg_catalog.atan2(double precision, double precision)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$datan2$function$;

-- [pg_catalog] atan2d(double precision, double precision)
CREATE OR REPLACE FUNCTION pg_catalog.atan2d(double precision, double precision)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$datan2d$function$;

-- [pg_catalog] atand(double precision)
CREATE OR REPLACE FUNCTION pg_catalog.atand(double precision)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$datand$function$;

-- [pg_catalog] atanh(double precision)
CREATE OR REPLACE FUNCTION pg_catalog.atanh(double precision)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$datanh$function$;

-- [pg_catalog] bernoulli(internal)
CREATE OR REPLACE FUNCTION pg_catalog.bernoulli(internal)
 RETURNS tsm_handler
 LANGUAGE internal
 PARALLEL SAFE STRICT
AS $function$tsm_bernoulli_handler$function$;

-- [pg_catalog] big5_to_euc_tw(integer, integer, cstring, internal, integer, boolean)
CREATE OR REPLACE FUNCTION pg_catalog.big5_to_euc_tw(integer, integer, cstring, internal, integer, boolean)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/euc_tw_and_big5', $function$big5_to_euc_tw$function$;

-- [pg_catalog] big5_to_mic(integer, integer, cstring, internal, integer, boolean)
CREATE OR REPLACE FUNCTION pg_catalog.big5_to_mic(integer, integer, cstring, internal, integer, boolean)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/euc_tw_and_big5', $function$big5_to_mic$function$;

-- [pg_catalog] big5_to_utf8(integer, integer, cstring, internal, integer, boolean)
CREATE OR REPLACE FUNCTION pg_catalog.big5_to_utf8(integer, integer, cstring, internal, integer, boolean)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/utf8_and_big5', $function$big5_to_utf8$function$;

-- [pg_catalog] binary_upgrade_add_sub_rel_state(text, oid, "char", pg_lsn)
CREATE OR REPLACE FUNCTION pg_catalog.binary_upgrade_add_sub_rel_state(text, oid, "char", pg_lsn)
 RETURNS void
 LANGUAGE internal
AS $function$binary_upgrade_add_sub_rel_state$function$;

-- [pg_catalog] binary_upgrade_create_empty_extension(text, text, boolean, text, oid[], text[], text[])
CREATE OR REPLACE FUNCTION pg_catalog.binary_upgrade_create_empty_extension(text, text, boolean, text, oid[], text[], text[])
 RETURNS void
 LANGUAGE internal
AS $function$binary_upgrade_create_empty_extension$function$;

-- [pg_catalog] binary_upgrade_logical_slot_has_caught_up(name)
CREATE OR REPLACE FUNCTION pg_catalog.binary_upgrade_logical_slot_has_caught_up(name)
 RETURNS boolean
 LANGUAGE internal
 STRICT
AS $function$binary_upgrade_logical_slot_has_caught_up$function$;

-- [pg_catalog] binary_upgrade_replorigin_advance(text, pg_lsn)
CREATE OR REPLACE FUNCTION pg_catalog.binary_upgrade_replorigin_advance(text, pg_lsn)
 RETURNS void
 LANGUAGE internal
AS $function$binary_upgrade_replorigin_advance$function$;

-- [pg_catalog] binary_upgrade_set_missing_value(oid, text, text)
CREATE OR REPLACE FUNCTION pg_catalog.binary_upgrade_set_missing_value(oid, text, text)
 RETURNS void
 LANGUAGE internal
 STRICT
AS $function$binary_upgrade_set_missing_value$function$;

-- [pg_catalog] binary_upgrade_set_next_array_pg_type_oid(oid)
CREATE OR REPLACE FUNCTION pg_catalog.binary_upgrade_set_next_array_pg_type_oid(oid)
 RETURNS void
 LANGUAGE internal
 PARALLEL RESTRICTED STRICT
AS $function$binary_upgrade_set_next_array_pg_type_oid$function$;

-- [pg_catalog] binary_upgrade_set_next_heap_pg_class_oid(oid)
CREATE OR REPLACE FUNCTION pg_catalog.binary_upgrade_set_next_heap_pg_class_oid(oid)
 RETURNS void
 LANGUAGE internal
 PARALLEL RESTRICTED STRICT
AS $function$binary_upgrade_set_next_heap_pg_class_oid$function$;

-- [pg_catalog] binary_upgrade_set_next_heap_relfilenode(oid)
CREATE OR REPLACE FUNCTION pg_catalog.binary_upgrade_set_next_heap_relfilenode(oid)
 RETURNS void
 LANGUAGE internal
 STRICT
AS $function$binary_upgrade_set_next_heap_relfilenode$function$;

-- [pg_catalog] binary_upgrade_set_next_index_pg_class_oid(oid)
CREATE OR REPLACE FUNCTION pg_catalog.binary_upgrade_set_next_index_pg_class_oid(oid)
 RETURNS void
 LANGUAGE internal
 PARALLEL RESTRICTED STRICT
AS $function$binary_upgrade_set_next_index_pg_class_oid$function$;

-- [pg_catalog] binary_upgrade_set_next_index_relfilenode(oid)
CREATE OR REPLACE FUNCTION pg_catalog.binary_upgrade_set_next_index_relfilenode(oid)
 RETURNS void
 LANGUAGE internal
 STRICT
AS $function$binary_upgrade_set_next_index_relfilenode$function$;

-- [pg_catalog] binary_upgrade_set_next_multirange_array_pg_type_oid(oid)
CREATE OR REPLACE FUNCTION pg_catalog.binary_upgrade_set_next_multirange_array_pg_type_oid(oid)
 RETURNS void
 LANGUAGE internal
 PARALLEL RESTRICTED STRICT
AS $function$binary_upgrade_set_next_multirange_array_pg_type_oid$function$;

-- [pg_catalog] binary_upgrade_set_next_multirange_pg_type_oid(oid)
CREATE OR REPLACE FUNCTION pg_catalog.binary_upgrade_set_next_multirange_pg_type_oid(oid)
 RETURNS void
 LANGUAGE internal
 PARALLEL RESTRICTED STRICT
AS $function$binary_upgrade_set_next_multirange_pg_type_oid$function$;

-- [pg_catalog] binary_upgrade_set_next_pg_authid_oid(oid)
CREATE OR REPLACE FUNCTION pg_catalog.binary_upgrade_set_next_pg_authid_oid(oid)
 RETURNS void
 LANGUAGE internal
 PARALLEL RESTRICTED STRICT
AS $function$binary_upgrade_set_next_pg_authid_oid$function$;

-- [pg_catalog] binary_upgrade_set_next_pg_enum_oid(oid)
CREATE OR REPLACE FUNCTION pg_catalog.binary_upgrade_set_next_pg_enum_oid(oid)
 RETURNS void
 LANGUAGE internal
 PARALLEL RESTRICTED STRICT
AS $function$binary_upgrade_set_next_pg_enum_oid$function$;

-- [pg_catalog] binary_upgrade_set_next_pg_tablespace_oid(oid)
CREATE OR REPLACE FUNCTION pg_catalog.binary_upgrade_set_next_pg_tablespace_oid(oid)
 RETURNS void
 LANGUAGE internal
 STRICT
AS $function$binary_upgrade_set_next_pg_tablespace_oid$function$;

-- [pg_catalog] binary_upgrade_set_next_pg_type_oid(oid)
CREATE OR REPLACE FUNCTION pg_catalog.binary_upgrade_set_next_pg_type_oid(oid)
 RETURNS void
 LANGUAGE internal
 PARALLEL RESTRICTED STRICT
AS $function$binary_upgrade_set_next_pg_type_oid$function$;

-- [pg_catalog] binary_upgrade_set_next_toast_pg_class_oid(oid)
CREATE OR REPLACE FUNCTION pg_catalog.binary_upgrade_set_next_toast_pg_class_oid(oid)
 RETURNS void
 LANGUAGE internal
 PARALLEL RESTRICTED STRICT
AS $function$binary_upgrade_set_next_toast_pg_class_oid$function$;

-- [pg_catalog] binary_upgrade_set_next_toast_relfilenode(oid)
CREATE OR REPLACE FUNCTION pg_catalog.binary_upgrade_set_next_toast_relfilenode(oid)
 RETURNS void
 LANGUAGE internal
 STRICT
AS $function$binary_upgrade_set_next_toast_relfilenode$function$;

-- [pg_catalog] binary_upgrade_set_record_init_privs(boolean)
CREATE OR REPLACE FUNCTION pg_catalog.binary_upgrade_set_record_init_privs(boolean)
 RETURNS void
 LANGUAGE internal
 PARALLEL RESTRICTED STRICT
AS $function$binary_upgrade_set_record_init_privs$function$;

-- [pg_catalog] bit(bigint, integer)
CREATE OR REPLACE FUNCTION pg_catalog."bit"(bigint, integer)
 RETURNS bit
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$bitfromint8$function$;

-- [pg_catalog] bit(bit, integer, boolean)
CREATE OR REPLACE FUNCTION pg_catalog."bit"(bit, integer, boolean)
 RETURNS bit
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$bit$function$;

-- [pg_catalog] bit(integer, integer)
CREATE OR REPLACE FUNCTION pg_catalog."bit"(integer, integer)
 RETURNS bit
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$bitfromint4$function$;

-- [pg_catalog] bit_count(bit)
CREATE OR REPLACE FUNCTION pg_catalog.bit_count(bit)
 RETURNS bigint
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$bit_bit_count$function$;

-- [pg_catalog] bit_count(bytea)
CREATE OR REPLACE FUNCTION pg_catalog.bit_count(bytea)
 RETURNS bigint
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$bytea_bit_count$function$;

-- [pg_catalog] bit_in(cstring, oid, integer)
CREATE OR REPLACE FUNCTION pg_catalog.bit_in(cstring, oid, integer)
 RETURNS bit
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$bit_in$function$;

-- [pg_catalog] bit_length(bit)
CREATE OR REPLACE FUNCTION pg_catalog.bit_length(bit)
 RETURNS integer
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 1
RETURN length($1);

-- [pg_catalog] bit_length(bytea)
CREATE OR REPLACE FUNCTION pg_catalog.bit_length(bytea)
 RETURNS integer
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 1
RETURN (octet_length($1) * 8);

-- [pg_catalog] bit_length(text)
CREATE OR REPLACE FUNCTION pg_catalog.bit_length(text)
 RETURNS integer
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 1
RETURN (octet_length($1) * 8);

-- [pg_catalog] bit_out(bit)
CREATE OR REPLACE FUNCTION pg_catalog.bit_out(bit)
 RETURNS cstring
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$bit_out$function$;

-- [pg_catalog] bit_recv(internal, oid, integer)
CREATE OR REPLACE FUNCTION pg_catalog.bit_recv(internal, oid, integer)
 RETURNS bit
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$bit_recv$function$;

-- [pg_catalog] bit_send(bit)
CREATE OR REPLACE FUNCTION pg_catalog.bit_send(bit)
 RETURNS bytea
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$bit_send$function$;

-- [pg_catalog] bitand(bit, bit)
CREATE OR REPLACE FUNCTION pg_catalog.bitand(bit, bit)
 RETURNS bit
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$bit_and$function$;

-- [pg_catalog] bitcat(bit varying, bit varying)
CREATE OR REPLACE FUNCTION pg_catalog.bitcat(bit varying, bit varying)
 RETURNS bit varying
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$bitcat$function$;

-- [pg_catalog] bitcmp(bit, bit)
CREATE OR REPLACE FUNCTION pg_catalog.bitcmp(bit, bit)
 RETURNS integer
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$bitcmp$function$;

-- [pg_catalog] biteq(bit, bit)
CREATE OR REPLACE FUNCTION pg_catalog.biteq(bit, bit)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$biteq$function$;

-- [pg_catalog] bitge(bit, bit)
CREATE OR REPLACE FUNCTION pg_catalog.bitge(bit, bit)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$bitge$function$;

-- [pg_catalog] bitgt(bit, bit)
CREATE OR REPLACE FUNCTION pg_catalog.bitgt(bit, bit)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$bitgt$function$;

-- [pg_catalog] bitle(bit, bit)
CREATE OR REPLACE FUNCTION pg_catalog.bitle(bit, bit)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$bitle$function$;

-- [pg_catalog] bitlt(bit, bit)
CREATE OR REPLACE FUNCTION pg_catalog.bitlt(bit, bit)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$bitlt$function$;

-- [pg_catalog] bitne(bit, bit)
CREATE OR REPLACE FUNCTION pg_catalog.bitne(bit, bit)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$bitne$function$;

-- [pg_catalog] bitnot(bit)
CREATE OR REPLACE FUNCTION pg_catalog.bitnot(bit)
 RETURNS bit
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$bitnot$function$;

-- [pg_catalog] bitor(bit, bit)
CREATE OR REPLACE FUNCTION pg_catalog.bitor(bit, bit)
 RETURNS bit
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$bit_or$function$;

-- [pg_catalog] bitshiftleft(bit, integer)
CREATE OR REPLACE FUNCTION pg_catalog.bitshiftleft(bit, integer)
 RETURNS bit
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$bitshiftleft$function$;

-- [pg_catalog] bitshiftright(bit, integer)
CREATE OR REPLACE FUNCTION pg_catalog.bitshiftright(bit, integer)
 RETURNS bit
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$bitshiftright$function$;

-- [pg_catalog] bittypmodin(cstring[])
CREATE OR REPLACE FUNCTION pg_catalog.bittypmodin(cstring[])
 RETURNS integer
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$bittypmodin$function$;

-- [pg_catalog] bittypmodout(integer)
CREATE OR REPLACE FUNCTION pg_catalog.bittypmodout(integer)
 RETURNS cstring
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$bittypmodout$function$;

-- [pg_catalog] bitxor(bit, bit)
CREATE OR REPLACE FUNCTION pg_catalog.bitxor(bit, bit)
 RETURNS bit
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$bitxor$function$;

-- [pg_catalog] bool(integer)
CREATE OR REPLACE FUNCTION pg_catalog.bool(integer)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$int4_bool$function$;

-- [pg_catalog] bool(jsonb)
CREATE OR REPLACE FUNCTION pg_catalog.bool(jsonb)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$jsonb_bool$function$;

-- [pg_catalog] bool_accum(internal, boolean)
CREATE OR REPLACE FUNCTION pg_catalog.bool_accum(internal, boolean)
 RETURNS internal
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE
AS $function$bool_accum$function$;

-- [pg_catalog] bool_accum_inv(internal, boolean)
CREATE OR REPLACE FUNCTION pg_catalog.bool_accum_inv(internal, boolean)
 RETURNS internal
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE
AS $function$bool_accum_inv$function$;

-- [pg_catalog] bool_alltrue(internal)
CREATE OR REPLACE FUNCTION pg_catalog.bool_alltrue(internal)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$bool_alltrue$function$;

-- [pg_catalog] bool_anytrue(internal)
CREATE OR REPLACE FUNCTION pg_catalog.bool_anytrue(internal)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$bool_anytrue$function$;

-- [pg_catalog] booland_statefunc(boolean, boolean)
CREATE OR REPLACE FUNCTION pg_catalog.booland_statefunc(boolean, boolean)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$booland_statefunc$function$;

-- [pg_catalog] booleq(boolean, boolean)
CREATE OR REPLACE FUNCTION pg_catalog.booleq(boolean, boolean)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$booleq$function$;

-- [pg_catalog] boolge(boolean, boolean)
CREATE OR REPLACE FUNCTION pg_catalog.boolge(boolean, boolean)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$boolge$function$;

-- [pg_catalog] boolgt(boolean, boolean)
CREATE OR REPLACE FUNCTION pg_catalog.boolgt(boolean, boolean)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$boolgt$function$;

-- [pg_catalog] boolin(cstring)
CREATE OR REPLACE FUNCTION pg_catalog.boolin(cstring)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$boolin$function$;

-- [pg_catalog] boolle(boolean, boolean)
CREATE OR REPLACE FUNCTION pg_catalog.boolle(boolean, boolean)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$boolle$function$;

-- [pg_catalog] boollt(boolean, boolean)
CREATE OR REPLACE FUNCTION pg_catalog.boollt(boolean, boolean)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$boollt$function$;

-- [pg_catalog] boolne(boolean, boolean)
CREATE OR REPLACE FUNCTION pg_catalog.boolne(boolean, boolean)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$boolne$function$;

-- [pg_catalog] boolor_statefunc(boolean, boolean)
CREATE OR REPLACE FUNCTION pg_catalog.boolor_statefunc(boolean, boolean)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$boolor_statefunc$function$;

-- [pg_catalog] boolout(boolean)
CREATE OR REPLACE FUNCTION pg_catalog.boolout(boolean)
 RETURNS cstring
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$boolout$function$;

-- [pg_catalog] boolrecv(internal)
CREATE OR REPLACE FUNCTION pg_catalog.boolrecv(internal)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$boolrecv$function$;

-- [pg_catalog] boolsend(boolean)
CREATE OR REPLACE FUNCTION pg_catalog.boolsend(boolean)
 RETURNS bytea
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$boolsend$function$;

-- [pg_catalog] bound_box(box, box)
CREATE OR REPLACE FUNCTION pg_catalog.bound_box(box, box)
 RETURNS box
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$boxes_bound_box$function$;

-- [pg_catalog] box(circle)
CREATE OR REPLACE FUNCTION pg_catalog.box(circle)
 RETURNS box
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$circle_box$function$;

-- [pg_catalog] box(point)
CREATE OR REPLACE FUNCTION pg_catalog.box(point)
 RETURNS box
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$point_box$function$;

-- [pg_catalog] box(point, point)
CREATE OR REPLACE FUNCTION pg_catalog.box(point, point)
 RETURNS box
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$points_box$function$;

-- [pg_catalog] box(polygon)
CREATE OR REPLACE FUNCTION pg_catalog.box(polygon)
 RETURNS box
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$poly_box$function$;

-- [pg_catalog] box_above(box, box)
CREATE OR REPLACE FUNCTION pg_catalog.box_above(box, box)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$box_above$function$;

-- [pg_catalog] box_above_eq(box, box)
CREATE OR REPLACE FUNCTION pg_catalog.box_above_eq(box, box)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$box_above_eq$function$;

-- [pg_catalog] box_add(box, point)
CREATE OR REPLACE FUNCTION pg_catalog.box_add(box, point)
 RETURNS box
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$box_add$function$;

-- [pg_catalog] box_below(box, box)
CREATE OR REPLACE FUNCTION pg_catalog.box_below(box, box)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$box_below$function$;

-- [pg_catalog] box_below_eq(box, box)
CREATE OR REPLACE FUNCTION pg_catalog.box_below_eq(box, box)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$box_below_eq$function$;

-- [pg_catalog] box_center(box)
CREATE OR REPLACE FUNCTION pg_catalog.box_center(box)
 RETURNS point
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$box_center$function$;

-- [pg_catalog] box_contain(box, box)
CREATE OR REPLACE FUNCTION pg_catalog.box_contain(box, box)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$box_contain$function$;

-- [pg_catalog] box_contain_pt(box, point)
CREATE OR REPLACE FUNCTION pg_catalog.box_contain_pt(box, point)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$box_contain_pt$function$;

-- [pg_catalog] box_contained(box, box)
CREATE OR REPLACE FUNCTION pg_catalog.box_contained(box, box)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$box_contained$function$;

-- [pg_catalog] box_distance(box, box)
CREATE OR REPLACE FUNCTION pg_catalog.box_distance(box, box)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$box_distance$function$;

-- [pg_catalog] box_div(box, point)
CREATE OR REPLACE FUNCTION pg_catalog.box_div(box, point)
 RETURNS box
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$box_div$function$;

-- [pg_catalog] box_eq(box, box)
CREATE OR REPLACE FUNCTION pg_catalog.box_eq(box, box)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$box_eq$function$;

-- [pg_catalog] box_ge(box, box)
CREATE OR REPLACE FUNCTION pg_catalog.box_ge(box, box)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$box_ge$function$;

-- [pg_catalog] box_gt(box, box)
CREATE OR REPLACE FUNCTION pg_catalog.box_gt(box, box)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$box_gt$function$;

-- [pg_catalog] box_in(cstring)
CREATE OR REPLACE FUNCTION pg_catalog.box_in(cstring)
 RETURNS box
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$box_in$function$;

-- [pg_catalog] box_intersect(box, box)
CREATE OR REPLACE FUNCTION pg_catalog.box_intersect(box, box)
 RETURNS box
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$box_intersect$function$;

-- [pg_catalog] box_le(box, box)
CREATE OR REPLACE FUNCTION pg_catalog.box_le(box, box)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$box_le$function$;

-- [pg_catalog] box_left(box, box)
CREATE OR REPLACE FUNCTION pg_catalog.box_left(box, box)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$box_left$function$;

-- [pg_catalog] box_lt(box, box)
CREATE OR REPLACE FUNCTION pg_catalog.box_lt(box, box)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$box_lt$function$;

-- [pg_catalog] box_mul(box, point)
CREATE OR REPLACE FUNCTION pg_catalog.box_mul(box, point)
 RETURNS box
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$box_mul$function$;

-- [pg_catalog] box_out(box)
CREATE OR REPLACE FUNCTION pg_catalog.box_out(box)
 RETURNS cstring
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$box_out$function$;

-- [pg_catalog] box_overabove(box, box)
CREATE OR REPLACE FUNCTION pg_catalog.box_overabove(box, box)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$box_overabove$function$;

-- [pg_catalog] box_overbelow(box, box)
CREATE OR REPLACE FUNCTION pg_catalog.box_overbelow(box, box)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$box_overbelow$function$;

-- [pg_catalog] box_overlap(box, box)
CREATE OR REPLACE FUNCTION pg_catalog.box_overlap(box, box)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$box_overlap$function$;

-- [pg_catalog] box_overleft(box, box)
CREATE OR REPLACE FUNCTION pg_catalog.box_overleft(box, box)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$box_overleft$function$;

-- [pg_catalog] box_overright(box, box)
CREATE OR REPLACE FUNCTION pg_catalog.box_overright(box, box)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$box_overright$function$;

-- [pg_catalog] box_recv(internal)
CREATE OR REPLACE FUNCTION pg_catalog.box_recv(internal)
 RETURNS box
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$box_recv$function$;

-- [pg_catalog] box_right(box, box)
CREATE OR REPLACE FUNCTION pg_catalog.box_right(box, box)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$box_right$function$;

-- [pg_catalog] box_same(box, box)
CREATE OR REPLACE FUNCTION pg_catalog.box_same(box, box)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$box_same$function$;

-- [pg_catalog] box_send(box)
CREATE OR REPLACE FUNCTION pg_catalog.box_send(box)
 RETURNS bytea
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$box_send$function$;

-- [pg_catalog] box_sub(box, point)
CREATE OR REPLACE FUNCTION pg_catalog.box_sub(box, point)
 RETURNS box
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$box_sub$function$;

-- [pg_catalog] bpchar("char")
CREATE OR REPLACE FUNCTION pg_catalog.bpchar("char")
 RETURNS character
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$char_bpchar$function$;

-- [pg_catalog] bpchar(character, integer, boolean)
CREATE OR REPLACE FUNCTION pg_catalog.bpchar(character, integer, boolean)
 RETURNS character
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$bpchar$function$;

-- [pg_catalog] bpchar(name)
CREATE OR REPLACE FUNCTION pg_catalog.bpchar(name)
 RETURNS character
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$name_bpchar$function$;

-- [pg_catalog] bpchar_larger(character, character)
CREATE OR REPLACE FUNCTION pg_catalog.bpchar_larger(character, character)
 RETURNS character
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$bpchar_larger$function$;

-- [pg_catalog] bpchar_pattern_ge(character, character)
CREATE OR REPLACE FUNCTION pg_catalog.bpchar_pattern_ge(character, character)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$bpchar_pattern_ge$function$;

-- [pg_catalog] bpchar_pattern_gt(character, character)
CREATE OR REPLACE FUNCTION pg_catalog.bpchar_pattern_gt(character, character)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$bpchar_pattern_gt$function$;

-- [pg_catalog] bpchar_pattern_le(character, character)
CREATE OR REPLACE FUNCTION pg_catalog.bpchar_pattern_le(character, character)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$bpchar_pattern_le$function$;

-- [pg_catalog] bpchar_pattern_lt(character, character)
CREATE OR REPLACE FUNCTION pg_catalog.bpchar_pattern_lt(character, character)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$bpchar_pattern_lt$function$;

-- [pg_catalog] bpchar_smaller(character, character)
CREATE OR REPLACE FUNCTION pg_catalog.bpchar_smaller(character, character)
 RETURNS character
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$bpchar_smaller$function$;

-- [pg_catalog] bpchar_sortsupport(internal)
CREATE OR REPLACE FUNCTION pg_catalog.bpchar_sortsupport(internal)
 RETURNS void
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$bpchar_sortsupport$function$;

-- [pg_catalog] bpcharcmp(character, character)
CREATE OR REPLACE FUNCTION pg_catalog.bpcharcmp(character, character)
 RETURNS integer
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$bpcharcmp$function$;

-- [pg_catalog] bpchareq(character, character)
CREATE OR REPLACE FUNCTION pg_catalog.bpchareq(character, character)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$bpchareq$function$;

-- [pg_catalog] bpcharge(character, character)
CREATE OR REPLACE FUNCTION pg_catalog.bpcharge(character, character)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$bpcharge$function$;

-- [pg_catalog] bpchargt(character, character)
CREATE OR REPLACE FUNCTION pg_catalog.bpchargt(character, character)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$bpchargt$function$;

-- [pg_catalog] bpchariclike(character, text)
CREATE OR REPLACE FUNCTION pg_catalog.bpchariclike(character, text)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT SUPPORT texticlike_support
AS $function$texticlike$function$;

-- [pg_catalog] bpcharicnlike(character, text)
CREATE OR REPLACE FUNCTION pg_catalog.bpcharicnlike(character, text)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$texticnlike$function$;

-- [pg_catalog] bpcharicregexeq(character, text)
CREATE OR REPLACE FUNCTION pg_catalog.bpcharicregexeq(character, text)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT SUPPORT texticregexeq_support
AS $function$texticregexeq$function$;

-- [pg_catalog] bpcharicregexne(character, text)
CREATE OR REPLACE FUNCTION pg_catalog.bpcharicregexne(character, text)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$texticregexne$function$;

-- [pg_catalog] bpcharin(cstring, oid, integer)
CREATE OR REPLACE FUNCTION pg_catalog.bpcharin(cstring, oid, integer)
 RETURNS character
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$bpcharin$function$;

-- [pg_catalog] bpcharle(character, character)
CREATE OR REPLACE FUNCTION pg_catalog.bpcharle(character, character)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$bpcharle$function$;

-- [pg_catalog] bpcharlike(character, text)
CREATE OR REPLACE FUNCTION pg_catalog.bpcharlike(character, text)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT SUPPORT textlike_support
AS $function$textlike$function$;

-- [pg_catalog] bpcharlt(character, character)
CREATE OR REPLACE FUNCTION pg_catalog.bpcharlt(character, character)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$bpcharlt$function$;

-- [pg_catalog] bpcharne(character, character)
CREATE OR REPLACE FUNCTION pg_catalog.bpcharne(character, character)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$bpcharne$function$;

-- [pg_catalog] bpcharnlike(character, text)
CREATE OR REPLACE FUNCTION pg_catalog.bpcharnlike(character, text)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$textnlike$function$;

-- [pg_catalog] bpcharout(character)
CREATE OR REPLACE FUNCTION pg_catalog.bpcharout(character)
 RETURNS cstring
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$bpcharout$function$;

-- [pg_catalog] bpcharrecv(internal, oid, integer)
CREATE OR REPLACE FUNCTION pg_catalog.bpcharrecv(internal, oid, integer)
 RETURNS character
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$bpcharrecv$function$;

-- [pg_catalog] bpcharregexeq(character, text)
CREATE OR REPLACE FUNCTION pg_catalog.bpcharregexeq(character, text)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT SUPPORT textregexeq_support
AS $function$textregexeq$function$;

-- [pg_catalog] bpcharregexne(character, text)
CREATE OR REPLACE FUNCTION pg_catalog.bpcharregexne(character, text)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$textregexne$function$;

-- [pg_catalog] bpcharsend(character)
CREATE OR REPLACE FUNCTION pg_catalog.bpcharsend(character)
 RETURNS bytea
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$bpcharsend$function$;

-- [pg_catalog] bpchartypmodin(cstring[])
CREATE OR REPLACE FUNCTION pg_catalog.bpchartypmodin(cstring[])
 RETURNS integer
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$bpchartypmodin$function$;

-- [pg_catalog] bpchartypmodout(integer)
CREATE OR REPLACE FUNCTION pg_catalog.bpchartypmodout(integer)
 RETURNS cstring
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$bpchartypmodout$function$;

-- [pg_catalog] brin_bloom_add_value(internal, internal, internal, internal)
CREATE OR REPLACE FUNCTION pg_catalog.brin_bloom_add_value(internal, internal, internal, internal)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$brin_bloom_add_value$function$;

-- [pg_catalog] brin_bloom_consistent(internal, internal, internal, integer)
CREATE OR REPLACE FUNCTION pg_catalog.brin_bloom_consistent(internal, internal, internal, integer)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$brin_bloom_consistent$function$;

-- [pg_catalog] brin_bloom_opcinfo(internal)
CREATE OR REPLACE FUNCTION pg_catalog.brin_bloom_opcinfo(internal)
 RETURNS internal
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$brin_bloom_opcinfo$function$;

-- [pg_catalog] brin_bloom_options(internal)
CREATE OR REPLACE FUNCTION pg_catalog.brin_bloom_options(internal)
 RETURNS void
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE
AS $function$brin_bloom_options$function$;

-- [pg_catalog] brin_bloom_summary_in(cstring)
CREATE OR REPLACE FUNCTION pg_catalog.brin_bloom_summary_in(cstring)
 RETURNS pg_brin_bloom_summary
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$brin_bloom_summary_in$function$;

-- [pg_catalog] brin_bloom_summary_out(pg_brin_bloom_summary)
CREATE OR REPLACE FUNCTION pg_catalog.brin_bloom_summary_out(pg_brin_bloom_summary)
 RETURNS cstring
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$brin_bloom_summary_out$function$;

-- [pg_catalog] brin_bloom_summary_recv(internal)
CREATE OR REPLACE FUNCTION pg_catalog.brin_bloom_summary_recv(internal)
 RETURNS pg_brin_bloom_summary
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$brin_bloom_summary_recv$function$;

-- [pg_catalog] brin_bloom_summary_send(pg_brin_bloom_summary)
CREATE OR REPLACE FUNCTION pg_catalog.brin_bloom_summary_send(pg_brin_bloom_summary)
 RETURNS bytea
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$brin_bloom_summary_send$function$;

-- [pg_catalog] brin_bloom_union(internal, internal, internal)
CREATE OR REPLACE FUNCTION pg_catalog.brin_bloom_union(internal, internal, internal)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$brin_bloom_union$function$;

-- [pg_catalog] brin_desummarize_range(regclass, bigint)
CREATE OR REPLACE FUNCTION pg_catalog.brin_desummarize_range(regclass, bigint)
 RETURNS void
 LANGUAGE internal
 STRICT
AS $function$brin_desummarize_range$function$;

-- [pg_catalog] brin_inclusion_add_value(internal, internal, internal, internal)
CREATE OR REPLACE FUNCTION pg_catalog.brin_inclusion_add_value(internal, internal, internal, internal)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$brin_inclusion_add_value$function$;

-- [pg_catalog] brin_inclusion_consistent(internal, internal, internal)
CREATE OR REPLACE FUNCTION pg_catalog.brin_inclusion_consistent(internal, internal, internal)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$brin_inclusion_consistent$function$;

-- [pg_catalog] brin_inclusion_opcinfo(internal)
CREATE OR REPLACE FUNCTION pg_catalog.brin_inclusion_opcinfo(internal)
 RETURNS internal
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$brin_inclusion_opcinfo$function$;

-- [pg_catalog] brin_inclusion_union(internal, internal, internal)
CREATE OR REPLACE FUNCTION pg_catalog.brin_inclusion_union(internal, internal, internal)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$brin_inclusion_union$function$;

-- [pg_catalog] brin_minmax_add_value(internal, internal, internal, internal)
CREATE OR REPLACE FUNCTION pg_catalog.brin_minmax_add_value(internal, internal, internal, internal)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$brin_minmax_add_value$function$;

-- [pg_catalog] brin_minmax_consistent(internal, internal, internal)
CREATE OR REPLACE FUNCTION pg_catalog.brin_minmax_consistent(internal, internal, internal)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$brin_minmax_consistent$function$;

-- [pg_catalog] brin_minmax_multi_add_value(internal, internal, internal, internal)
CREATE OR REPLACE FUNCTION pg_catalog.brin_minmax_multi_add_value(internal, internal, internal, internal)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$brin_minmax_multi_add_value$function$;

-- [pg_catalog] brin_minmax_multi_consistent(internal, internal, internal, integer)
CREATE OR REPLACE FUNCTION pg_catalog.brin_minmax_multi_consistent(internal, internal, internal, integer)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$brin_minmax_multi_consistent$function$;

-- [pg_catalog] brin_minmax_multi_distance_date(internal, internal)
CREATE OR REPLACE FUNCTION pg_catalog.brin_minmax_multi_distance_date(internal, internal)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$brin_minmax_multi_distance_date$function$;

-- [pg_catalog] brin_minmax_multi_distance_float4(internal, internal)
CREATE OR REPLACE FUNCTION pg_catalog.brin_minmax_multi_distance_float4(internal, internal)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$brin_minmax_multi_distance_float4$function$;

-- [pg_catalog] brin_minmax_multi_distance_float8(internal, internal)
CREATE OR REPLACE FUNCTION pg_catalog.brin_minmax_multi_distance_float8(internal, internal)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$brin_minmax_multi_distance_float8$function$;

-- [pg_catalog] brin_minmax_multi_distance_inet(internal, internal)
CREATE OR REPLACE FUNCTION pg_catalog.brin_minmax_multi_distance_inet(internal, internal)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$brin_minmax_multi_distance_inet$function$;

-- [pg_catalog] brin_minmax_multi_distance_int2(internal, internal)
CREATE OR REPLACE FUNCTION pg_catalog.brin_minmax_multi_distance_int2(internal, internal)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$brin_minmax_multi_distance_int2$function$;

-- [pg_catalog] brin_minmax_multi_distance_int4(internal, internal)
CREATE OR REPLACE FUNCTION pg_catalog.brin_minmax_multi_distance_int4(internal, internal)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$brin_minmax_multi_distance_int4$function$;

-- [pg_catalog] brin_minmax_multi_distance_int8(internal, internal)
CREATE OR REPLACE FUNCTION pg_catalog.brin_minmax_multi_distance_int8(internal, internal)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$brin_minmax_multi_distance_int8$function$;

-- [pg_catalog] brin_minmax_multi_distance_interval(internal, internal)
CREATE OR REPLACE FUNCTION pg_catalog.brin_minmax_multi_distance_interval(internal, internal)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$brin_minmax_multi_distance_interval$function$;

-- [pg_catalog] brin_minmax_multi_distance_macaddr(internal, internal)
CREATE OR REPLACE FUNCTION pg_catalog.brin_minmax_multi_distance_macaddr(internal, internal)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$brin_minmax_multi_distance_macaddr$function$;

-- [pg_catalog] brin_minmax_multi_distance_macaddr8(internal, internal)
CREATE OR REPLACE FUNCTION pg_catalog.brin_minmax_multi_distance_macaddr8(internal, internal)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$brin_minmax_multi_distance_macaddr8$function$;

-- [pg_catalog] brin_minmax_multi_distance_numeric(internal, internal)
CREATE OR REPLACE FUNCTION pg_catalog.brin_minmax_multi_distance_numeric(internal, internal)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$brin_minmax_multi_distance_numeric$function$;

-- [pg_catalog] brin_minmax_multi_distance_pg_lsn(internal, internal)
CREATE OR REPLACE FUNCTION pg_catalog.brin_minmax_multi_distance_pg_lsn(internal, internal)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$brin_minmax_multi_distance_pg_lsn$function$;

-- [pg_catalog] brin_minmax_multi_distance_tid(internal, internal)
CREATE OR REPLACE FUNCTION pg_catalog.brin_minmax_multi_distance_tid(internal, internal)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$brin_minmax_multi_distance_tid$function$;

-- [pg_catalog] brin_minmax_multi_distance_time(internal, internal)
CREATE OR REPLACE FUNCTION pg_catalog.brin_minmax_multi_distance_time(internal, internal)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$brin_minmax_multi_distance_time$function$;

-- [pg_catalog] brin_minmax_multi_distance_timestamp(internal, internal)
CREATE OR REPLACE FUNCTION pg_catalog.brin_minmax_multi_distance_timestamp(internal, internal)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$brin_minmax_multi_distance_timestamp$function$;

-- [pg_catalog] brin_minmax_multi_distance_timetz(internal, internal)
CREATE OR REPLACE FUNCTION pg_catalog.brin_minmax_multi_distance_timetz(internal, internal)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$brin_minmax_multi_distance_timetz$function$;

-- [pg_catalog] brin_minmax_multi_distance_uuid(internal, internal)
CREATE OR REPLACE FUNCTION pg_catalog.brin_minmax_multi_distance_uuid(internal, internal)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$brin_minmax_multi_distance_uuid$function$;

-- [pg_catalog] brin_minmax_multi_opcinfo(internal)
CREATE OR REPLACE FUNCTION pg_catalog.brin_minmax_multi_opcinfo(internal)
 RETURNS internal
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$brin_minmax_multi_opcinfo$function$;

-- [pg_catalog] brin_minmax_multi_options(internal)
CREATE OR REPLACE FUNCTION pg_catalog.brin_minmax_multi_options(internal)
 RETURNS void
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE
AS $function$brin_minmax_multi_options$function$;

-- [pg_catalog] brin_minmax_multi_summary_in(cstring)
CREATE OR REPLACE FUNCTION pg_catalog.brin_minmax_multi_summary_in(cstring)
 RETURNS pg_brin_minmax_multi_summary
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$brin_minmax_multi_summary_in$function$;

-- [pg_catalog] brin_minmax_multi_summary_out(pg_brin_minmax_multi_summary)
CREATE OR REPLACE FUNCTION pg_catalog.brin_minmax_multi_summary_out(pg_brin_minmax_multi_summary)
 RETURNS cstring
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$brin_minmax_multi_summary_out$function$;

-- [pg_catalog] brin_minmax_multi_summary_recv(internal)
CREATE OR REPLACE FUNCTION pg_catalog.brin_minmax_multi_summary_recv(internal)
 RETURNS pg_brin_minmax_multi_summary
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$brin_minmax_multi_summary_recv$function$;

-- [pg_catalog] brin_minmax_multi_summary_send(pg_brin_minmax_multi_summary)
CREATE OR REPLACE FUNCTION pg_catalog.brin_minmax_multi_summary_send(pg_brin_minmax_multi_summary)
 RETURNS bytea
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$brin_minmax_multi_summary_send$function$;

-- [pg_catalog] brin_minmax_multi_union(internal, internal, internal)
CREATE OR REPLACE FUNCTION pg_catalog.brin_minmax_multi_union(internal, internal, internal)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$brin_minmax_multi_union$function$;

-- [pg_catalog] brin_minmax_opcinfo(internal)
CREATE OR REPLACE FUNCTION pg_catalog.brin_minmax_opcinfo(internal)
 RETURNS internal
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$brin_minmax_opcinfo$function$;

-- [pg_catalog] brin_minmax_union(internal, internal, internal)
CREATE OR REPLACE FUNCTION pg_catalog.brin_minmax_union(internal, internal, internal)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$brin_minmax_union$function$;

-- [pg_catalog] brin_summarize_new_values(regclass)
CREATE OR REPLACE FUNCTION pg_catalog.brin_summarize_new_values(regclass)
 RETURNS integer
 LANGUAGE internal
 STRICT
AS $function$brin_summarize_new_values$function$;

-- [pg_catalog] brin_summarize_range(regclass, bigint)
CREATE OR REPLACE FUNCTION pg_catalog.brin_summarize_range(regclass, bigint)
 RETURNS integer
 LANGUAGE internal
 STRICT
AS $function$brin_summarize_range$function$;

-- [pg_catalog] brinhandler(internal)
CREATE OR REPLACE FUNCTION pg_catalog.brinhandler(internal)
 RETURNS index_am_handler
 LANGUAGE internal
 PARALLEL SAFE STRICT
AS $function$brinhandler$function$;

-- [pg_catalog] broadcast(inet)
CREATE OR REPLACE FUNCTION pg_catalog.broadcast(inet)
 RETURNS inet
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$network_broadcast$function$;

-- [pg_catalog] btarraycmp(anyarray, anyarray)
CREATE OR REPLACE FUNCTION pg_catalog.btarraycmp(anyarray, anyarray)
 RETURNS integer
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$btarraycmp$function$;

-- [pg_catalog] btboolcmp(boolean, boolean)
CREATE OR REPLACE FUNCTION pg_catalog.btboolcmp(boolean, boolean)
 RETURNS integer
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$btboolcmp$function$;

-- [pg_catalog] btbpchar_pattern_cmp(character, character)
CREATE OR REPLACE FUNCTION pg_catalog.btbpchar_pattern_cmp(character, character)
 RETURNS integer
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$btbpchar_pattern_cmp$function$;

-- [pg_catalog] btbpchar_pattern_sortsupport(internal)
CREATE OR REPLACE FUNCTION pg_catalog.btbpchar_pattern_sortsupport(internal)
 RETURNS void
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$btbpchar_pattern_sortsupport$function$;

-- [pg_catalog] btcharcmp("char", "char")
CREATE OR REPLACE FUNCTION pg_catalog.btcharcmp("char", "char")
 RETURNS integer
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$btcharcmp$function$;

-- [pg_catalog] btequalimage(oid)
CREATE OR REPLACE FUNCTION pg_catalog.btequalimage(oid)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$btequalimage$function$;

-- [pg_catalog] btfloat48cmp(real, double precision)
CREATE OR REPLACE FUNCTION pg_catalog.btfloat48cmp(real, double precision)
 RETURNS integer
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$btfloat48cmp$function$;

-- [pg_catalog] btfloat4cmp(real, real)
CREATE OR REPLACE FUNCTION pg_catalog.btfloat4cmp(real, real)
 RETURNS integer
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$btfloat4cmp$function$;

-- [pg_catalog] btfloat4sortsupport(internal)
CREATE OR REPLACE FUNCTION pg_catalog.btfloat4sortsupport(internal)
 RETURNS void
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$btfloat4sortsupport$function$;

-- [pg_catalog] btfloat84cmp(double precision, real)
CREATE OR REPLACE FUNCTION pg_catalog.btfloat84cmp(double precision, real)
 RETURNS integer
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$btfloat84cmp$function$;

-- [pg_catalog] btfloat8cmp(double precision, double precision)
CREATE OR REPLACE FUNCTION pg_catalog.btfloat8cmp(double precision, double precision)
 RETURNS integer
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$btfloat8cmp$function$;

-- [pg_catalog] btfloat8sortsupport(internal)
CREATE OR REPLACE FUNCTION pg_catalog.btfloat8sortsupport(internal)
 RETURNS void
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$btfloat8sortsupport$function$;

-- [pg_catalog] bthandler(internal)
CREATE OR REPLACE FUNCTION pg_catalog.bthandler(internal)
 RETURNS index_am_handler
 LANGUAGE internal
 PARALLEL SAFE STRICT
AS $function$bthandler$function$;

-- [pg_catalog] btint24cmp(smallint, integer)
CREATE OR REPLACE FUNCTION pg_catalog.btint24cmp(smallint, integer)
 RETURNS integer
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$btint24cmp$function$;

-- [pg_catalog] btint28cmp(smallint, bigint)
CREATE OR REPLACE FUNCTION pg_catalog.btint28cmp(smallint, bigint)
 RETURNS integer
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$btint28cmp$function$;

-- [pg_catalog] btint2cmp(smallint, smallint)
CREATE OR REPLACE FUNCTION pg_catalog.btint2cmp(smallint, smallint)
 RETURNS integer
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$btint2cmp$function$;

-- [pg_catalog] btint2sortsupport(internal)
CREATE OR REPLACE FUNCTION pg_catalog.btint2sortsupport(internal)
 RETURNS void
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$btint2sortsupport$function$;

-- [pg_catalog] btint42cmp(integer, smallint)
CREATE OR REPLACE FUNCTION pg_catalog.btint42cmp(integer, smallint)
 RETURNS integer
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$btint42cmp$function$;

-- [pg_catalog] btint48cmp(integer, bigint)
CREATE OR REPLACE FUNCTION pg_catalog.btint48cmp(integer, bigint)
 RETURNS integer
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$btint48cmp$function$;

-- [pg_catalog] btint4cmp(integer, integer)
CREATE OR REPLACE FUNCTION pg_catalog.btint4cmp(integer, integer)
 RETURNS integer
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$btint4cmp$function$;

-- [pg_catalog] btint4sortsupport(internal)
CREATE OR REPLACE FUNCTION pg_catalog.btint4sortsupport(internal)
 RETURNS void
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$btint4sortsupport$function$;

-- [pg_catalog] btint82cmp(bigint, smallint)
CREATE OR REPLACE FUNCTION pg_catalog.btint82cmp(bigint, smallint)
 RETURNS integer
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$btint82cmp$function$;

-- [pg_catalog] btint84cmp(bigint, integer)
CREATE OR REPLACE FUNCTION pg_catalog.btint84cmp(bigint, integer)
 RETURNS integer
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$btint84cmp$function$;

-- [pg_catalog] btint8cmp(bigint, bigint)
CREATE OR REPLACE FUNCTION pg_catalog.btint8cmp(bigint, bigint)
 RETURNS integer
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$btint8cmp$function$;

-- [pg_catalog] btint8sortsupport(internal)
CREATE OR REPLACE FUNCTION pg_catalog.btint8sortsupport(internal)
 RETURNS void
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$btint8sortsupport$function$;

-- [pg_catalog] btnamecmp(name, name)
CREATE OR REPLACE FUNCTION pg_catalog.btnamecmp(name, name)
 RETURNS integer
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$btnamecmp$function$;

-- [pg_catalog] btnamesortsupport(internal)
CREATE OR REPLACE FUNCTION pg_catalog.btnamesortsupport(internal)
 RETURNS void
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$btnamesortsupport$function$;

-- [pg_catalog] btnametextcmp(name, text)
CREATE OR REPLACE FUNCTION pg_catalog.btnametextcmp(name, text)
 RETURNS integer
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$btnametextcmp$function$;

-- [pg_catalog] btoidcmp(oid, oid)
CREATE OR REPLACE FUNCTION pg_catalog.btoidcmp(oid, oid)
 RETURNS integer
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$btoidcmp$function$;

-- [pg_catalog] btoidsortsupport(internal)
CREATE OR REPLACE FUNCTION pg_catalog.btoidsortsupport(internal)
 RETURNS void
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$btoidsortsupport$function$;

-- [pg_catalog] btoidvectorcmp(oidvector, oidvector)
CREATE OR REPLACE FUNCTION pg_catalog.btoidvectorcmp(oidvector, oidvector)
 RETURNS integer
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$btoidvectorcmp$function$;

-- [pg_catalog] btrecordcmp(record, record)
CREATE OR REPLACE FUNCTION pg_catalog.btrecordcmp(record, record)
 RETURNS integer
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$btrecordcmp$function$;

-- [pg_catalog] btrecordimagecmp(record, record)
CREATE OR REPLACE FUNCTION pg_catalog.btrecordimagecmp(record, record)
 RETURNS integer
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$btrecordimagecmp$function$;

-- [pg_catalog] btrim(bytea, bytea)
CREATE OR REPLACE FUNCTION pg_catalog.btrim(bytea, bytea)
 RETURNS bytea
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$byteatrim$function$;

-- [pg_catalog] btrim(text)
CREATE OR REPLACE FUNCTION pg_catalog.btrim(text)
 RETURNS text
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$btrim1$function$;

-- [pg_catalog] btrim(text, text)
CREATE OR REPLACE FUNCTION pg_catalog.btrim(text, text)
 RETURNS text
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$btrim$function$;

-- [pg_catalog] bttext_pattern_cmp(text, text)
CREATE OR REPLACE FUNCTION pg_catalog.bttext_pattern_cmp(text, text)
 RETURNS integer
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$bttext_pattern_cmp$function$;

-- [pg_catalog] bttext_pattern_sortsupport(internal)
CREATE OR REPLACE FUNCTION pg_catalog.bttext_pattern_sortsupport(internal)
 RETURNS void
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$bttext_pattern_sortsupport$function$;

-- [pg_catalog] bttextcmp(text, text)
CREATE OR REPLACE FUNCTION pg_catalog.bttextcmp(text, text)
 RETURNS integer
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$bttextcmp$function$;

-- [pg_catalog] bttextnamecmp(text, name)
CREATE OR REPLACE FUNCTION pg_catalog.bttextnamecmp(text, name)
 RETURNS integer
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$bttextnamecmp$function$;

-- [pg_catalog] bttextsortsupport(internal)
CREATE OR REPLACE FUNCTION pg_catalog.bttextsortsupport(internal)
 RETURNS void
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$bttextsortsupport$function$;

-- [pg_catalog] bttidcmp(tid, tid)
CREATE OR REPLACE FUNCTION pg_catalog.bttidcmp(tid, tid)
 RETURNS integer
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$bttidcmp$function$;

-- [pg_catalog] btvarstrequalimage(oid)
CREATE OR REPLACE FUNCTION pg_catalog.btvarstrequalimage(oid)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$btvarstrequalimage$function$;

-- [pg_catalog] bytea_sortsupport(internal)
CREATE OR REPLACE FUNCTION pg_catalog.bytea_sortsupport(internal)
 RETURNS void
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$bytea_sortsupport$function$;

-- [pg_catalog] bytea_string_agg_finalfn(internal)
CREATE OR REPLACE FUNCTION pg_catalog.bytea_string_agg_finalfn(internal)
 RETURNS bytea
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE
AS $function$bytea_string_agg_finalfn$function$;

-- [pg_catalog] bytea_string_agg_transfn(internal, bytea, bytea)
CREATE OR REPLACE FUNCTION pg_catalog.bytea_string_agg_transfn(internal, bytea, bytea)
 RETURNS internal
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE
AS $function$bytea_string_agg_transfn$function$;

-- [pg_catalog] byteacat(bytea, bytea)
CREATE OR REPLACE FUNCTION pg_catalog.byteacat(bytea, bytea)
 RETURNS bytea
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$byteacat$function$;

-- [pg_catalog] byteacmp(bytea, bytea)
CREATE OR REPLACE FUNCTION pg_catalog.byteacmp(bytea, bytea)
 RETURNS integer
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$byteacmp$function$;

-- [pg_catalog] byteaeq(bytea, bytea)
CREATE OR REPLACE FUNCTION pg_catalog.byteaeq(bytea, bytea)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$byteaeq$function$;

-- [pg_catalog] byteage(bytea, bytea)
CREATE OR REPLACE FUNCTION pg_catalog.byteage(bytea, bytea)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$byteage$function$;

-- [pg_catalog] byteagt(bytea, bytea)
CREATE OR REPLACE FUNCTION pg_catalog.byteagt(bytea, bytea)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$byteagt$function$;

-- [pg_catalog] byteain(cstring)
CREATE OR REPLACE FUNCTION pg_catalog.byteain(cstring)
 RETURNS bytea
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$byteain$function$;

-- [pg_catalog] byteale(bytea, bytea)
CREATE OR REPLACE FUNCTION pg_catalog.byteale(bytea, bytea)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$byteale$function$;

-- [pg_catalog] bytealike(bytea, bytea)
CREATE OR REPLACE FUNCTION pg_catalog.bytealike(bytea, bytea)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT SUPPORT textlike_support
AS $function$bytealike$function$;

-- [pg_catalog] bytealt(bytea, bytea)
CREATE OR REPLACE FUNCTION pg_catalog.bytealt(bytea, bytea)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$bytealt$function$;

-- [pg_catalog] byteane(bytea, bytea)
CREATE OR REPLACE FUNCTION pg_catalog.byteane(bytea, bytea)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$byteane$function$;

-- [pg_catalog] byteanlike(bytea, bytea)
CREATE OR REPLACE FUNCTION pg_catalog.byteanlike(bytea, bytea)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$byteanlike$function$;

-- [pg_catalog] byteaout(bytea)
CREATE OR REPLACE FUNCTION pg_catalog.byteaout(bytea)
 RETURNS cstring
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$byteaout$function$;

-- [pg_catalog] bytearecv(internal)
CREATE OR REPLACE FUNCTION pg_catalog.bytearecv(internal)
 RETURNS bytea
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$bytearecv$function$;

-- [pg_catalog] byteasend(bytea)
CREATE OR REPLACE FUNCTION pg_catalog.byteasend(bytea)
 RETURNS bytea
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$byteasend$function$;

-- [pg_catalog] cardinality(anyarray)
CREATE OR REPLACE FUNCTION pg_catalog.cardinality(anyarray)
 RETURNS integer
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$array_cardinality$function$;

-- [pg_catalog] cash_cmp(money, money)
CREATE OR REPLACE FUNCTION pg_catalog.cash_cmp(money, money)
 RETURNS integer
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$cash_cmp$function$;

-- [pg_catalog] cash_div_cash(money, money)
CREATE OR REPLACE FUNCTION pg_catalog.cash_div_cash(money, money)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$cash_div_cash$function$;

-- [pg_catalog] cash_div_flt4(money, real)
CREATE OR REPLACE FUNCTION pg_catalog.cash_div_flt4(money, real)
 RETURNS money
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$cash_div_flt4$function$;

-- [pg_catalog] cash_div_flt8(money, double precision)
CREATE OR REPLACE FUNCTION pg_catalog.cash_div_flt8(money, double precision)
 RETURNS money
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$cash_div_flt8$function$;

-- [pg_catalog] cash_div_int2(money, smallint)
CREATE OR REPLACE FUNCTION pg_catalog.cash_div_int2(money, smallint)
 RETURNS money
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$cash_div_int2$function$;

-- [pg_catalog] cash_div_int4(money, integer)
CREATE OR REPLACE FUNCTION pg_catalog.cash_div_int4(money, integer)
 RETURNS money
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$cash_div_int4$function$;

-- [pg_catalog] cash_div_int8(money, bigint)
CREATE OR REPLACE FUNCTION pg_catalog.cash_div_int8(money, bigint)
 RETURNS money
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$cash_div_int8$function$;

-- [pg_catalog] cash_eq(money, money)
CREATE OR REPLACE FUNCTION pg_catalog.cash_eq(money, money)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$cash_eq$function$;

-- [pg_catalog] cash_ge(money, money)
CREATE OR REPLACE FUNCTION pg_catalog.cash_ge(money, money)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$cash_ge$function$;

-- [pg_catalog] cash_gt(money, money)
CREATE OR REPLACE FUNCTION pg_catalog.cash_gt(money, money)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$cash_gt$function$;

-- [pg_catalog] cash_in(cstring)
CREATE OR REPLACE FUNCTION pg_catalog.cash_in(cstring)
 RETURNS money
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$cash_in$function$;

-- [pg_catalog] cash_le(money, money)
CREATE OR REPLACE FUNCTION pg_catalog.cash_le(money, money)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$cash_le$function$;

-- [pg_catalog] cash_lt(money, money)
CREATE OR REPLACE FUNCTION pg_catalog.cash_lt(money, money)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$cash_lt$function$;

-- [pg_catalog] cash_mi(money, money)
CREATE OR REPLACE FUNCTION pg_catalog.cash_mi(money, money)
 RETURNS money
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$cash_mi$function$;

-- [pg_catalog] cash_mul_flt4(money, real)
CREATE OR REPLACE FUNCTION pg_catalog.cash_mul_flt4(money, real)
 RETURNS money
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$cash_mul_flt4$function$;

-- [pg_catalog] cash_mul_flt8(money, double precision)
CREATE OR REPLACE FUNCTION pg_catalog.cash_mul_flt8(money, double precision)
 RETURNS money
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$cash_mul_flt8$function$;

-- [pg_catalog] cash_mul_int2(money, smallint)
CREATE OR REPLACE FUNCTION pg_catalog.cash_mul_int2(money, smallint)
 RETURNS money
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$cash_mul_int2$function$;

-- [pg_catalog] cash_mul_int4(money, integer)
CREATE OR REPLACE FUNCTION pg_catalog.cash_mul_int4(money, integer)
 RETURNS money
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$cash_mul_int4$function$;

-- [pg_catalog] cash_mul_int8(money, bigint)
CREATE OR REPLACE FUNCTION pg_catalog.cash_mul_int8(money, bigint)
 RETURNS money
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$cash_mul_int8$function$;

-- [pg_catalog] cash_ne(money, money)
CREATE OR REPLACE FUNCTION pg_catalog.cash_ne(money, money)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$cash_ne$function$;

-- [pg_catalog] cash_out(money)
CREATE OR REPLACE FUNCTION pg_catalog.cash_out(money)
 RETURNS cstring
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$cash_out$function$;

-- [pg_catalog] cash_pl(money, money)
CREATE OR REPLACE FUNCTION pg_catalog.cash_pl(money, money)
 RETURNS money
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$cash_pl$function$;

-- [pg_catalog] cash_recv(internal)
CREATE OR REPLACE FUNCTION pg_catalog.cash_recv(internal)
 RETURNS money
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$cash_recv$function$;

-- [pg_catalog] cash_send(money)
CREATE OR REPLACE FUNCTION pg_catalog.cash_send(money)
 RETURNS bytea
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$cash_send$function$;

-- [pg_catalog] cash_words(money)
CREATE OR REPLACE FUNCTION pg_catalog.cash_words(money)
 RETURNS text
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$cash_words$function$;

-- [pg_catalog] cashlarger(money, money)
CREATE OR REPLACE FUNCTION pg_catalog.cashlarger(money, money)
 RETURNS money
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$cashlarger$function$;

-- [pg_catalog] cashsmaller(money, money)
CREATE OR REPLACE FUNCTION pg_catalog.cashsmaller(money, money)
 RETURNS money
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$cashsmaller$function$;

-- [pg_catalog] cbrt(double precision)
CREATE OR REPLACE FUNCTION pg_catalog.cbrt(double precision)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$dcbrt$function$;

-- [pg_catalog] ceil(double precision)
CREATE OR REPLACE FUNCTION pg_catalog.ceil(double precision)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$dceil$function$;

-- [pg_catalog] ceil(numeric)
CREATE OR REPLACE FUNCTION pg_catalog.ceil(numeric)
 RETURNS numeric
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$numeric_ceil$function$;

-- [pg_catalog] ceiling(double precision)
CREATE OR REPLACE FUNCTION pg_catalog.ceiling(double precision)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$dceil$function$;

-- [pg_catalog] ceiling(numeric)
CREATE OR REPLACE FUNCTION pg_catalog.ceiling(numeric)
 RETURNS numeric
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$numeric_ceil$function$;

-- [pg_catalog] center(box)
CREATE OR REPLACE FUNCTION pg_catalog.center(box)
 RETURNS point
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$box_center$function$;

-- [pg_catalog] center(circle)
CREATE OR REPLACE FUNCTION pg_catalog.center(circle)
 RETURNS point
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$circle_center$function$;

-- [pg_catalog] char(integer)
CREATE OR REPLACE FUNCTION pg_catalog."char"(integer)
 RETURNS "char"
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$i4tochar$function$;

-- [pg_catalog] char(text)
CREATE OR REPLACE FUNCTION pg_catalog."char"(text)
 RETURNS "char"
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$text_char$function$;

-- [pg_catalog] char_length(character)
CREATE OR REPLACE FUNCTION pg_catalog.char_length(character)
 RETURNS integer
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$bpcharlen$function$;

-- [pg_catalog] char_length(text)
CREATE OR REPLACE FUNCTION pg_catalog.char_length(text)
 RETURNS integer
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$textlen$function$;

-- [pg_catalog] character_length(character)
CREATE OR REPLACE FUNCTION pg_catalog.character_length(character)
 RETURNS integer
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$bpcharlen$function$;

-- [pg_catalog] character_length(text)
CREATE OR REPLACE FUNCTION pg_catalog.character_length(text)
 RETURNS integer
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$textlen$function$;

-- [pg_catalog] chareq("char", "char")
CREATE OR REPLACE FUNCTION pg_catalog.chareq("char", "char")
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$chareq$function$;

-- [pg_catalog] charge("char", "char")
CREATE OR REPLACE FUNCTION pg_catalog.charge("char", "char")
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$charge$function$;

-- [pg_catalog] chargt("char", "char")
CREATE OR REPLACE FUNCTION pg_catalog.chargt("char", "char")
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$chargt$function$;

-- [pg_catalog] charin(cstring)
CREATE OR REPLACE FUNCTION pg_catalog.charin(cstring)
 RETURNS "char"
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$charin$function$;

-- [pg_catalog] charle("char", "char")
CREATE OR REPLACE FUNCTION pg_catalog.charle("char", "char")
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$charle$function$;

-- [pg_catalog] charlt("char", "char")
CREATE OR REPLACE FUNCTION pg_catalog.charlt("char", "char")
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$charlt$function$;

-- [pg_catalog] charne("char", "char")
CREATE OR REPLACE FUNCTION pg_catalog.charne("char", "char")
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$charne$function$;

-- [pg_catalog] charout("char")
CREATE OR REPLACE FUNCTION pg_catalog.charout("char")
 RETURNS cstring
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$charout$function$;

-- [pg_catalog] charrecv(internal)
CREATE OR REPLACE FUNCTION pg_catalog.charrecv(internal)
 RETURNS "char"
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$charrecv$function$;

-- [pg_catalog] charsend("char")
CREATE OR REPLACE FUNCTION pg_catalog.charsend("char")
 RETURNS bytea
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$charsend$function$;

-- [pg_catalog] chr(integer)
CREATE OR REPLACE FUNCTION pg_catalog.chr(integer)
 RETURNS text
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$chr$function$;

-- [pg_catalog] cideq(cid, cid)
CREATE OR REPLACE FUNCTION pg_catalog.cideq(cid, cid)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$cideq$function$;

-- [pg_catalog] cidin(cstring)
CREATE OR REPLACE FUNCTION pg_catalog.cidin(cstring)
 RETURNS cid
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$cidin$function$;

-- [pg_catalog] cidout(cid)
CREATE OR REPLACE FUNCTION pg_catalog.cidout(cid)
 RETURNS cstring
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$cidout$function$;

-- [pg_catalog] cidr(inet)
CREATE OR REPLACE FUNCTION pg_catalog.cidr(inet)
 RETURNS cidr
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$inet_to_cidr$function$;

-- [pg_catalog] cidr_in(cstring)
CREATE OR REPLACE FUNCTION pg_catalog.cidr_in(cstring)
 RETURNS cidr
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$cidr_in$function$;

-- [pg_catalog] cidr_out(cidr)
CREATE OR REPLACE FUNCTION pg_catalog.cidr_out(cidr)
 RETURNS cstring
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$cidr_out$function$;

-- [pg_catalog] cidr_recv(internal)
CREATE OR REPLACE FUNCTION pg_catalog.cidr_recv(internal)
 RETURNS cidr
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$cidr_recv$function$;

-- [pg_catalog] cidr_send(cidr)
CREATE OR REPLACE FUNCTION pg_catalog.cidr_send(cidr)
 RETURNS bytea
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$cidr_send$function$;

-- [pg_catalog] cidrecv(internal)
CREATE OR REPLACE FUNCTION pg_catalog.cidrecv(internal)
 RETURNS cid
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$cidrecv$function$;

-- [pg_catalog] cidsend(cid)
CREATE OR REPLACE FUNCTION pg_catalog.cidsend(cid)
 RETURNS bytea
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$cidsend$function$;

-- [pg_catalog] circle(box)
CREATE OR REPLACE FUNCTION pg_catalog.circle(box)
 RETURNS circle
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$box_circle$function$;

-- [pg_catalog] circle(point, double precision)
CREATE OR REPLACE FUNCTION pg_catalog.circle(point, double precision)
 RETURNS circle
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$cr_circle$function$;

-- [pg_catalog] circle(polygon)
CREATE OR REPLACE FUNCTION pg_catalog.circle(polygon)
 RETURNS circle
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$poly_circle$function$;

-- [pg_catalog] circle_above(circle, circle)
CREATE OR REPLACE FUNCTION pg_catalog.circle_above(circle, circle)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$circle_above$function$;

-- [pg_catalog] circle_add_pt(circle, point)
CREATE OR REPLACE FUNCTION pg_catalog.circle_add_pt(circle, point)
 RETURNS circle
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$circle_add_pt$function$;

-- [pg_catalog] circle_below(circle, circle)
CREATE OR REPLACE FUNCTION pg_catalog.circle_below(circle, circle)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$circle_below$function$;

-- [pg_catalog] circle_center(circle)
CREATE OR REPLACE FUNCTION pg_catalog.circle_center(circle)
 RETURNS point
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$circle_center$function$;

-- [pg_catalog] circle_contain(circle, circle)
CREATE OR REPLACE FUNCTION pg_catalog.circle_contain(circle, circle)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$circle_contain$function$;

-- [pg_catalog] circle_contain_pt(circle, point)
CREATE OR REPLACE FUNCTION pg_catalog.circle_contain_pt(circle, point)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$circle_contain_pt$function$;

-- [pg_catalog] circle_contained(circle, circle)
CREATE OR REPLACE FUNCTION pg_catalog.circle_contained(circle, circle)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$circle_contained$function$;

-- [pg_catalog] circle_distance(circle, circle)
CREATE OR REPLACE FUNCTION pg_catalog.circle_distance(circle, circle)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$circle_distance$function$;

-- [pg_catalog] circle_div_pt(circle, point)
CREATE OR REPLACE FUNCTION pg_catalog.circle_div_pt(circle, point)
 RETURNS circle
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$circle_div_pt$function$;

-- [pg_catalog] circle_eq(circle, circle)
CREATE OR REPLACE FUNCTION pg_catalog.circle_eq(circle, circle)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$circle_eq$function$;

-- [pg_catalog] circle_ge(circle, circle)
CREATE OR REPLACE FUNCTION pg_catalog.circle_ge(circle, circle)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$circle_ge$function$;

-- [pg_catalog] circle_gt(circle, circle)
CREATE OR REPLACE FUNCTION pg_catalog.circle_gt(circle, circle)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$circle_gt$function$;

-- [pg_catalog] circle_in(cstring)
CREATE OR REPLACE FUNCTION pg_catalog.circle_in(cstring)
 RETURNS circle
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$circle_in$function$;

-- [pg_catalog] circle_le(circle, circle)
CREATE OR REPLACE FUNCTION pg_catalog.circle_le(circle, circle)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$circle_le$function$;

-- [pg_catalog] circle_left(circle, circle)
CREATE OR REPLACE FUNCTION pg_catalog.circle_left(circle, circle)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$circle_left$function$;

-- [pg_catalog] circle_lt(circle, circle)
CREATE OR REPLACE FUNCTION pg_catalog.circle_lt(circle, circle)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$circle_lt$function$;

-- [pg_catalog] circle_mul_pt(circle, point)
CREATE OR REPLACE FUNCTION pg_catalog.circle_mul_pt(circle, point)
 RETURNS circle
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$circle_mul_pt$function$;

-- [pg_catalog] circle_ne(circle, circle)
CREATE OR REPLACE FUNCTION pg_catalog.circle_ne(circle, circle)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$circle_ne$function$;

-- [pg_catalog] circle_out(circle)
CREATE OR REPLACE FUNCTION pg_catalog.circle_out(circle)
 RETURNS cstring
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$circle_out$function$;

-- [pg_catalog] circle_overabove(circle, circle)
CREATE OR REPLACE FUNCTION pg_catalog.circle_overabove(circle, circle)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$circle_overabove$function$;

-- [pg_catalog] circle_overbelow(circle, circle)
CREATE OR REPLACE FUNCTION pg_catalog.circle_overbelow(circle, circle)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$circle_overbelow$function$;

-- [pg_catalog] circle_overlap(circle, circle)
CREATE OR REPLACE FUNCTION pg_catalog.circle_overlap(circle, circle)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$circle_overlap$function$;

-- [pg_catalog] circle_overleft(circle, circle)
CREATE OR REPLACE FUNCTION pg_catalog.circle_overleft(circle, circle)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$circle_overleft$function$;

-- [pg_catalog] circle_overright(circle, circle)
CREATE OR REPLACE FUNCTION pg_catalog.circle_overright(circle, circle)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$circle_overright$function$;

-- [pg_catalog] circle_recv(internal)
CREATE OR REPLACE FUNCTION pg_catalog.circle_recv(internal)
 RETURNS circle
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$circle_recv$function$;

-- [pg_catalog] circle_right(circle, circle)
CREATE OR REPLACE FUNCTION pg_catalog.circle_right(circle, circle)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$circle_right$function$;

-- [pg_catalog] circle_same(circle, circle)
CREATE OR REPLACE FUNCTION pg_catalog.circle_same(circle, circle)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$circle_same$function$;

-- [pg_catalog] circle_send(circle)
CREATE OR REPLACE FUNCTION pg_catalog.circle_send(circle)
 RETURNS bytea
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$circle_send$function$;

-- [pg_catalog] circle_sub_pt(circle, point)
CREATE OR REPLACE FUNCTION pg_catalog.circle_sub_pt(circle, point)
 RETURNS circle
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$circle_sub_pt$function$;

-- [pg_catalog] clock_timestamp()
CREATE OR REPLACE FUNCTION pg_catalog.clock_timestamp()
 RETURNS timestamp with time zone
 LANGUAGE internal
 PARALLEL SAFE STRICT
AS $function$clock_timestamp$function$;

-- [pg_catalog] close_ls(line, lseg)
CREATE OR REPLACE FUNCTION pg_catalog.close_ls(line, lseg)
 RETURNS point
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$close_ls$function$;

-- [pg_catalog] close_lseg(lseg, lseg)
CREATE OR REPLACE FUNCTION pg_catalog.close_lseg(lseg, lseg)
 RETURNS point
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$close_lseg$function$;

-- [pg_catalog] close_pb(point, box)
CREATE OR REPLACE FUNCTION pg_catalog.close_pb(point, box)
 RETURNS point
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$close_pb$function$;

-- [pg_catalog] close_pl(point, line)
CREATE OR REPLACE FUNCTION pg_catalog.close_pl(point, line)
 RETURNS point
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$close_pl$function$;

-- [pg_catalog] close_ps(point, lseg)
CREATE OR REPLACE FUNCTION pg_catalog.close_ps(point, lseg)
 RETURNS point
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$close_ps$function$;

-- [pg_catalog] close_sb(lseg, box)
CREATE OR REPLACE FUNCTION pg_catalog.close_sb(lseg, box)
 RETURNS point
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$close_sb$function$;

-- [pg_catalog] col_description(oid, integer)
CREATE OR REPLACE FUNCTION pg_catalog.col_description(oid, integer)
 RETURNS text
 LANGUAGE sql
 STABLE PARALLEL SAFE STRICT
BEGIN ATOMIC
 SELECT pg_description.description
    FROM pg_description
   WHERE ((pg_description.objoid = $1) AND (pg_description.classoid = ('pg_class'::regclass)::oid) AND (pg_description.objsubid = $2));
END;

-- [pg_catalog] concat(VARIADIC "any")
CREATE OR REPLACE FUNCTION pg_catalog.concat(VARIADIC "any")
 RETURNS text
 LANGUAGE internal
 STABLE PARALLEL SAFE
AS $function$text_concat$function$;

-- [pg_catalog] concat_ws(text, VARIADIC "any")
CREATE OR REPLACE FUNCTION pg_catalog.concat_ws(text, VARIADIC "any")
 RETURNS text
 LANGUAGE internal
 STABLE PARALLEL SAFE
AS $function$text_concat_ws$function$;

-- [pg_catalog] contjoinsel(internal, oid, internal, smallint, internal)
CREATE OR REPLACE FUNCTION pg_catalog.contjoinsel(internal, oid, internal, smallint, internal)
 RETURNS double precision
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$contjoinsel$function$;

-- [pg_catalog] contsel(internal, oid, internal, integer)
CREATE OR REPLACE FUNCTION pg_catalog.contsel(internal, oid, internal, integer)
 RETURNS double precision
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$contsel$function$;

-- [pg_catalog] convert(bytea, name, name)
CREATE OR REPLACE FUNCTION pg_catalog.convert(bytea, name, name)
 RETURNS bytea
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$pg_convert$function$;

-- [pg_catalog] convert_from(bytea, name)
CREATE OR REPLACE FUNCTION pg_catalog.convert_from(bytea, name)
 RETURNS text
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$pg_convert_from$function$;

-- [pg_catalog] convert_to(text, name)
CREATE OR REPLACE FUNCTION pg_catalog.convert_to(text, name)
 RETURNS bytea
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$pg_convert_to$function$;

-- [pg_catalog] cos(double precision)
CREATE OR REPLACE FUNCTION pg_catalog.cos(double precision)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$dcos$function$;

-- [pg_catalog] cosd(double precision)
CREATE OR REPLACE FUNCTION pg_catalog.cosd(double precision)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$dcosd$function$;

-- [pg_catalog] cosh(double precision)
CREATE OR REPLACE FUNCTION pg_catalog.cosh(double precision)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$dcosh$function$;

-- [pg_catalog] cot(double precision)
CREATE OR REPLACE FUNCTION pg_catalog.cot(double precision)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$dcot$function$;

-- [pg_catalog] cotd(double precision)
CREATE OR REPLACE FUNCTION pg_catalog.cotd(double precision)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$dcotd$function$;

-- [pg_catalog] cstring_in(cstring)
CREATE OR REPLACE FUNCTION pg_catalog.cstring_in(cstring)
 RETURNS cstring
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$cstring_in$function$;

-- [pg_catalog] cstring_out(cstring)
CREATE OR REPLACE FUNCTION pg_catalog.cstring_out(cstring)
 RETURNS cstring
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$cstring_out$function$;

-- [pg_catalog] cstring_recv(internal)
CREATE OR REPLACE FUNCTION pg_catalog.cstring_recv(internal)
 RETURNS cstring
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$cstring_recv$function$;

-- [pg_catalog] cstring_send(cstring)
CREATE OR REPLACE FUNCTION pg_catalog.cstring_send(cstring)
 RETURNS bytea
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$cstring_send$function$;

-- [pg_catalog] cume_dist_final(internal, VARIADIC "any")
CREATE OR REPLACE FUNCTION pg_catalog.cume_dist_final(internal, VARIADIC "any")
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE
AS $function$hypothetical_cume_dist_final$function$;

-- [pg_catalog] current_database()
CREATE OR REPLACE FUNCTION pg_catalog.current_database()
 RETURNS name
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$current_database$function$;

-- [pg_catalog] current_query()
CREATE OR REPLACE FUNCTION pg_catalog.current_query()
 RETURNS text
 LANGUAGE internal
 PARALLEL RESTRICTED
AS $function$current_query$function$;

-- [pg_catalog] current_schema()
CREATE OR REPLACE FUNCTION pg_catalog."current_schema"()
 RETURNS name
 LANGUAGE internal
 STABLE STRICT
AS $function$current_schema$function$;

-- [pg_catalog] current_schemas(boolean)
CREATE OR REPLACE FUNCTION pg_catalog.current_schemas(boolean)
 RETURNS name[]
 LANGUAGE internal
 STABLE STRICT
AS $function$current_schemas$function$;

-- [pg_catalog] current_setting(text)
CREATE OR REPLACE FUNCTION pg_catalog.current_setting(text)
 RETURNS text
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$show_config_by_name$function$;

-- [pg_catalog] current_setting(text, boolean)
CREATE OR REPLACE FUNCTION pg_catalog.current_setting(text, boolean)
 RETURNS text
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$show_config_by_name_missing_ok$function$;

-- [pg_catalog] current_user()
CREATE OR REPLACE FUNCTION pg_catalog."current_user"()
 RETURNS name
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$current_user$function$;

-- [pg_catalog] currtid2(text, tid)
CREATE OR REPLACE FUNCTION pg_catalog.currtid2(text, tid)
 RETURNS tid
 LANGUAGE internal
 STRICT
AS $function$currtid_byrelname$function$;

-- [pg_catalog] currval(regclass)
CREATE OR REPLACE FUNCTION pg_catalog.currval(regclass)
 RETURNS bigint
 LANGUAGE internal
 STRICT
AS $function$currval_oid$function$;

-- [pg_catalog] cursor_to_xml(cursor refcursor, count integer, nulls boolean, tableforest boolean, targetns text)
CREATE OR REPLACE FUNCTION pg_catalog.cursor_to_xml(cursor refcursor, count integer, nulls boolean, tableforest boolean, targetns text)
 RETURNS xml
 LANGUAGE internal
 STRICT COST 100
AS $function$cursor_to_xml$function$;

-- [pg_catalog] cursor_to_xmlschema(cursor refcursor, nulls boolean, tableforest boolean, targetns text)
CREATE OR REPLACE FUNCTION pg_catalog.cursor_to_xmlschema(cursor refcursor, nulls boolean, tableforest boolean, targetns text)
 RETURNS xml
 LANGUAGE internal
 STRICT COST 100
AS $function$cursor_to_xmlschema$function$;

-- [pg_catalog] database_to_xml(nulls boolean, tableforest boolean, targetns text)
CREATE OR REPLACE FUNCTION pg_catalog.database_to_xml(nulls boolean, tableforest boolean, targetns text)
 RETURNS xml
 LANGUAGE internal
 STABLE PARALLEL RESTRICTED STRICT COST 100
AS $function$database_to_xml$function$;

-- [pg_catalog] database_to_xml_and_xmlschema(nulls boolean, tableforest boolean, targetns text)
CREATE OR REPLACE FUNCTION pg_catalog.database_to_xml_and_xmlschema(nulls boolean, tableforest boolean, targetns text)
 RETURNS xml
 LANGUAGE internal
 STABLE PARALLEL RESTRICTED STRICT COST 100
AS $function$database_to_xml_and_xmlschema$function$;

-- [pg_catalog] database_to_xmlschema(nulls boolean, tableforest boolean, targetns text)
CREATE OR REPLACE FUNCTION pg_catalog.database_to_xmlschema(nulls boolean, tableforest boolean, targetns text)
 RETURNS xml
 LANGUAGE internal
 STABLE PARALLEL RESTRICTED STRICT COST 100
AS $function$database_to_xmlschema$function$;

-- [pg_catalog] date(timestamp with time zone)
CREATE OR REPLACE FUNCTION pg_catalog.date(timestamp with time zone)
 RETURNS date
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$timestamptz_date$function$;

-- [pg_catalog] date(timestamp without time zone)
CREATE OR REPLACE FUNCTION pg_catalog.date(timestamp without time zone)
 RETURNS date
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$timestamp_date$function$;

-- [pg_catalog] date_add(timestamp with time zone, interval)
CREATE OR REPLACE FUNCTION pg_catalog.date_add(timestamp with time zone, interval)
 RETURNS timestamp with time zone
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$timestamptz_pl_interval$function$;

-- [pg_catalog] date_add(timestamp with time zone, interval, text)
CREATE OR REPLACE FUNCTION pg_catalog.date_add(timestamp with time zone, interval, text)
 RETURNS timestamp with time zone
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$timestamptz_pl_interval_at_zone$function$;

-- [pg_catalog] date_bin(interval, timestamp with time zone, timestamp with time zone)
CREATE OR REPLACE FUNCTION pg_catalog.date_bin(interval, timestamp with time zone, timestamp with time zone)
 RETURNS timestamp with time zone
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$timestamptz_bin$function$;

-- [pg_catalog] date_bin(interval, timestamp without time zone, timestamp without time zone)
CREATE OR REPLACE FUNCTION pg_catalog.date_bin(interval, timestamp without time zone, timestamp without time zone)
 RETURNS timestamp without time zone
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$timestamp_bin$function$;

-- [pg_catalog] date_cmp(date, date)
CREATE OR REPLACE FUNCTION pg_catalog.date_cmp(date, date)
 RETURNS integer
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$date_cmp$function$;

-- [pg_catalog] date_cmp_timestamp(date, timestamp without time zone)
CREATE OR REPLACE FUNCTION pg_catalog.date_cmp_timestamp(date, timestamp without time zone)
 RETURNS integer
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$date_cmp_timestamp$function$;

-- [pg_catalog] date_cmp_timestamptz(date, timestamp with time zone)
CREATE OR REPLACE FUNCTION pg_catalog.date_cmp_timestamptz(date, timestamp with time zone)
 RETURNS integer
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$date_cmp_timestamptz$function$;

-- [pg_catalog] date_eq(date, date)
CREATE OR REPLACE FUNCTION pg_catalog.date_eq(date, date)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$date_eq$function$;

-- [pg_catalog] date_eq_timestamp(date, timestamp without time zone)
CREATE OR REPLACE FUNCTION pg_catalog.date_eq_timestamp(date, timestamp without time zone)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$date_eq_timestamp$function$;

-- [pg_catalog] date_eq_timestamptz(date, timestamp with time zone)
CREATE OR REPLACE FUNCTION pg_catalog.date_eq_timestamptz(date, timestamp with time zone)
 RETURNS boolean
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$date_eq_timestamptz$function$;

-- [pg_catalog] date_ge(date, date)
CREATE OR REPLACE FUNCTION pg_catalog.date_ge(date, date)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$date_ge$function$;

-- [pg_catalog] date_ge_timestamp(date, timestamp without time zone)
CREATE OR REPLACE FUNCTION pg_catalog.date_ge_timestamp(date, timestamp without time zone)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$date_ge_timestamp$function$;

-- [pg_catalog] date_ge_timestamptz(date, timestamp with time zone)
CREATE OR REPLACE FUNCTION pg_catalog.date_ge_timestamptz(date, timestamp with time zone)
 RETURNS boolean
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$date_ge_timestamptz$function$;

-- [pg_catalog] date_gt(date, date)
CREATE OR REPLACE FUNCTION pg_catalog.date_gt(date, date)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$date_gt$function$;

-- [pg_catalog] date_gt_timestamp(date, timestamp without time zone)
CREATE OR REPLACE FUNCTION pg_catalog.date_gt_timestamp(date, timestamp without time zone)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$date_gt_timestamp$function$;

-- [pg_catalog] date_gt_timestamptz(date, timestamp with time zone)
CREATE OR REPLACE FUNCTION pg_catalog.date_gt_timestamptz(date, timestamp with time zone)
 RETURNS boolean
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$date_gt_timestamptz$function$;

-- [pg_catalog] date_in(cstring)
CREATE OR REPLACE FUNCTION pg_catalog.date_in(cstring)
 RETURNS date
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$date_in$function$;

-- [pg_catalog] date_larger(date, date)
CREATE OR REPLACE FUNCTION pg_catalog.date_larger(date, date)
 RETURNS date
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$date_larger$function$;

-- [pg_catalog] date_le(date, date)
CREATE OR REPLACE FUNCTION pg_catalog.date_le(date, date)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$date_le$function$;

-- [pg_catalog] date_le_timestamp(date, timestamp without time zone)
CREATE OR REPLACE FUNCTION pg_catalog.date_le_timestamp(date, timestamp without time zone)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$date_le_timestamp$function$;

-- [pg_catalog] date_le_timestamptz(date, timestamp with time zone)
CREATE OR REPLACE FUNCTION pg_catalog.date_le_timestamptz(date, timestamp with time zone)
 RETURNS boolean
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$date_le_timestamptz$function$;

-- [pg_catalog] date_lt(date, date)
CREATE OR REPLACE FUNCTION pg_catalog.date_lt(date, date)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$date_lt$function$;

-- [pg_catalog] date_lt_timestamp(date, timestamp without time zone)
CREATE OR REPLACE FUNCTION pg_catalog.date_lt_timestamp(date, timestamp without time zone)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$date_lt_timestamp$function$;

-- [pg_catalog] date_lt_timestamptz(date, timestamp with time zone)
CREATE OR REPLACE FUNCTION pg_catalog.date_lt_timestamptz(date, timestamp with time zone)
 RETURNS boolean
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$date_lt_timestamptz$function$;

-- [pg_catalog] date_mi(date, date)
CREATE OR REPLACE FUNCTION pg_catalog.date_mi(date, date)
 RETURNS integer
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$date_mi$function$;

-- [pg_catalog] date_mi_interval(date, interval)
CREATE OR REPLACE FUNCTION pg_catalog.date_mi_interval(date, interval)
 RETURNS timestamp without time zone
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$date_mi_interval$function$;

-- [pg_catalog] date_mii(date, integer)
CREATE OR REPLACE FUNCTION pg_catalog.date_mii(date, integer)
 RETURNS date
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$date_mii$function$;

-- [pg_catalog] date_ne(date, date)
CREATE OR REPLACE FUNCTION pg_catalog.date_ne(date, date)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$date_ne$function$;

-- [pg_catalog] date_ne_timestamp(date, timestamp without time zone)
CREATE OR REPLACE FUNCTION pg_catalog.date_ne_timestamp(date, timestamp without time zone)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$date_ne_timestamp$function$;

-- [pg_catalog] date_ne_timestamptz(date, timestamp with time zone)
CREATE OR REPLACE FUNCTION pg_catalog.date_ne_timestamptz(date, timestamp with time zone)
 RETURNS boolean
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$date_ne_timestamptz$function$;

-- [pg_catalog] date_out(date)
CREATE OR REPLACE FUNCTION pg_catalog.date_out(date)
 RETURNS cstring
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$date_out$function$;

-- [pg_catalog] date_part(text, date)
CREATE OR REPLACE FUNCTION pg_catalog.date_part(text, date)
 RETURNS double precision
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 1
RETURN date_part($1, ($2)::timestamp without time zone);

-- [pg_catalog] date_part(text, interval)
CREATE OR REPLACE FUNCTION pg_catalog.date_part(text, interval)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$interval_part$function$;

-- [pg_catalog] date_part(text, time with time zone)
CREATE OR REPLACE FUNCTION pg_catalog.date_part(text, time with time zone)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$timetz_part$function$;

-- [pg_catalog] date_part(text, time without time zone)
CREATE OR REPLACE FUNCTION pg_catalog.date_part(text, time without time zone)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$time_part$function$;

-- [pg_catalog] date_part(text, timestamp with time zone)
CREATE OR REPLACE FUNCTION pg_catalog.date_part(text, timestamp with time zone)
 RETURNS double precision
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$timestamptz_part$function$;

-- [pg_catalog] date_part(text, timestamp without time zone)
CREATE OR REPLACE FUNCTION pg_catalog.date_part(text, timestamp without time zone)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$timestamp_part$function$;

-- [pg_catalog] date_pl_interval(date, interval)
CREATE OR REPLACE FUNCTION pg_catalog.date_pl_interval(date, interval)
 RETURNS timestamp without time zone
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$date_pl_interval$function$;

-- [pg_catalog] date_pli(date, integer)
CREATE OR REPLACE FUNCTION pg_catalog.date_pli(date, integer)
 RETURNS date
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$date_pli$function$;

-- [pg_catalog] date_recv(internal)
CREATE OR REPLACE FUNCTION pg_catalog.date_recv(internal)
 RETURNS date
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$date_recv$function$;

-- [pg_catalog] date_send(date)
CREATE OR REPLACE FUNCTION pg_catalog.date_send(date)
 RETURNS bytea
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$date_send$function$;

-- [pg_catalog] date_smaller(date, date)
CREATE OR REPLACE FUNCTION pg_catalog.date_smaller(date, date)
 RETURNS date
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$date_smaller$function$;

-- [pg_catalog] date_sortsupport(internal)
CREATE OR REPLACE FUNCTION pg_catalog.date_sortsupport(internal)
 RETURNS void
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$date_sortsupport$function$;

-- [pg_catalog] date_subtract(timestamp with time zone, interval)
CREATE OR REPLACE FUNCTION pg_catalog.date_subtract(timestamp with time zone, interval)
 RETURNS timestamp with time zone
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$timestamptz_mi_interval$function$;

-- [pg_catalog] date_subtract(timestamp with time zone, interval, text)
CREATE OR REPLACE FUNCTION pg_catalog.date_subtract(timestamp with time zone, interval, text)
 RETURNS timestamp with time zone
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$timestamptz_mi_interval_at_zone$function$;

-- [pg_catalog] date_trunc(text, interval)
CREATE OR REPLACE FUNCTION pg_catalog.date_trunc(text, interval)
 RETURNS interval
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$interval_trunc$function$;

-- [pg_catalog] date_trunc(text, timestamp with time zone)
CREATE OR REPLACE FUNCTION pg_catalog.date_trunc(text, timestamp with time zone)
 RETURNS timestamp with time zone
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$timestamptz_trunc$function$;

-- [pg_catalog] date_trunc(text, timestamp with time zone, text)
CREATE OR REPLACE FUNCTION pg_catalog.date_trunc(text, timestamp with time zone, text)
 RETURNS timestamp with time zone
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$timestamptz_trunc_zone$function$;

-- [pg_catalog] date_trunc(text, timestamp without time zone)
CREATE OR REPLACE FUNCTION pg_catalog.date_trunc(text, timestamp without time zone)
 RETURNS timestamp without time zone
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$timestamp_trunc$function$;

-- [pg_catalog] datemultirange()
CREATE OR REPLACE FUNCTION pg_catalog.datemultirange()
 RETURNS datemultirange
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$multirange_constructor0$function$;

-- [pg_catalog] datemultirange(daterange)
CREATE OR REPLACE FUNCTION pg_catalog.datemultirange(daterange)
 RETURNS datemultirange
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$multirange_constructor1$function$;

-- [pg_catalog] datemultirange(VARIADIC daterange[])
CREATE OR REPLACE FUNCTION pg_catalog.datemultirange(VARIADIC daterange[])
 RETURNS datemultirange
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$multirange_constructor2$function$;

-- [pg_catalog] daterange(date, date)
CREATE OR REPLACE FUNCTION pg_catalog.daterange(date, date)
 RETURNS daterange
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE
AS $function$range_constructor2$function$;

-- [pg_catalog] daterange(date, date, text)
CREATE OR REPLACE FUNCTION pg_catalog.daterange(date, date, text)
 RETURNS daterange
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE
AS $function$range_constructor3$function$;

-- [pg_catalog] daterange_canonical(daterange)
CREATE OR REPLACE FUNCTION pg_catalog.daterange_canonical(daterange)
 RETURNS daterange
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$daterange_canonical$function$;

-- [pg_catalog] daterange_subdiff(date, date)
CREATE OR REPLACE FUNCTION pg_catalog.daterange_subdiff(date, date)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$daterange_subdiff$function$;

-- [pg_catalog] datetime_pl(date, time without time zone)
CREATE OR REPLACE FUNCTION pg_catalog.datetime_pl(date, time without time zone)
 RETURNS timestamp without time zone
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$datetime_timestamp$function$;

-- [pg_catalog] datetimetz_pl(date, time with time zone)
CREATE OR REPLACE FUNCTION pg_catalog.datetimetz_pl(date, time with time zone)
 RETURNS timestamp with time zone
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$datetimetz_timestamptz$function$;

-- [pg_catalog] dcbrt(double precision)
CREATE OR REPLACE FUNCTION pg_catalog.dcbrt(double precision)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$dcbrt$function$;

-- [pg_catalog] decode(text, text)
CREATE OR REPLACE FUNCTION pg_catalog.decode(text, text)
 RETURNS bytea
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$binary_decode$function$;

-- [pg_catalog] degrees(double precision)
CREATE OR REPLACE FUNCTION pg_catalog.degrees(double precision)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$degrees$function$;

-- [pg_catalog] dense_rank_final(internal, VARIADIC "any")
CREATE OR REPLACE FUNCTION pg_catalog.dense_rank_final(internal, VARIADIC "any")
 RETURNS bigint
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE
AS $function$hypothetical_dense_rank_final$function$;

-- [pg_catalog] dexp(double precision)
CREATE OR REPLACE FUNCTION pg_catalog.dexp(double precision)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$dexp$function$;

-- [pg_catalog] diagonal(box)
CREATE OR REPLACE FUNCTION pg_catalog.diagonal(box)
 RETURNS lseg
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$box_diagonal$function$;

-- [pg_catalog] diameter(circle)
CREATE OR REPLACE FUNCTION pg_catalog.diameter(circle)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$circle_diameter$function$;

-- [pg_catalog] dispell_init(internal)
CREATE OR REPLACE FUNCTION pg_catalog.dispell_init(internal)
 RETURNS internal
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$dispell_init$function$;

-- [pg_catalog] dispell_lexize(internal, internal, internal, internal)
CREATE OR REPLACE FUNCTION pg_catalog.dispell_lexize(internal, internal, internal, internal)
 RETURNS internal
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$dispell_lexize$function$;

-- [pg_catalog] dist_bp(box, point)
CREATE OR REPLACE FUNCTION pg_catalog.dist_bp(box, point)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$dist_bp$function$;

-- [pg_catalog] dist_bs(box, lseg)
CREATE OR REPLACE FUNCTION pg_catalog.dist_bs(box, lseg)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$dist_bs$function$;

-- [pg_catalog] dist_cpoint(circle, point)
CREATE OR REPLACE FUNCTION pg_catalog.dist_cpoint(circle, point)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$dist_cpoint$function$;

-- [pg_catalog] dist_cpoly(circle, polygon)
CREATE OR REPLACE FUNCTION pg_catalog.dist_cpoly(circle, polygon)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$dist_cpoly$function$;

-- [pg_catalog] dist_lp(line, point)
CREATE OR REPLACE FUNCTION pg_catalog.dist_lp(line, point)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$dist_lp$function$;

-- [pg_catalog] dist_ls(line, lseg)
CREATE OR REPLACE FUNCTION pg_catalog.dist_ls(line, lseg)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$dist_ls$function$;

-- [pg_catalog] dist_pathp(path, point)
CREATE OR REPLACE FUNCTION pg_catalog.dist_pathp(path, point)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$dist_pathp$function$;

-- [pg_catalog] dist_pb(point, box)
CREATE OR REPLACE FUNCTION pg_catalog.dist_pb(point, box)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$dist_pb$function$;

-- [pg_catalog] dist_pc(point, circle)
CREATE OR REPLACE FUNCTION pg_catalog.dist_pc(point, circle)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$dist_pc$function$;

-- [pg_catalog] dist_pl(point, line)
CREATE OR REPLACE FUNCTION pg_catalog.dist_pl(point, line)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$dist_pl$function$;

-- [pg_catalog] dist_polyc(polygon, circle)
CREATE OR REPLACE FUNCTION pg_catalog.dist_polyc(polygon, circle)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$dist_polyc$function$;

-- [pg_catalog] dist_polyp(polygon, point)
CREATE OR REPLACE FUNCTION pg_catalog.dist_polyp(polygon, point)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$dist_polyp$function$;

-- [pg_catalog] dist_ppath(point, path)
CREATE OR REPLACE FUNCTION pg_catalog.dist_ppath(point, path)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$dist_ppath$function$;

-- [pg_catalog] dist_ppoly(point, polygon)
CREATE OR REPLACE FUNCTION pg_catalog.dist_ppoly(point, polygon)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$dist_ppoly$function$;

-- [pg_catalog] dist_ps(point, lseg)
CREATE OR REPLACE FUNCTION pg_catalog.dist_ps(point, lseg)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$dist_ps$function$;

-- [pg_catalog] dist_sb(lseg, box)
CREATE OR REPLACE FUNCTION pg_catalog.dist_sb(lseg, box)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$dist_sb$function$;

-- [pg_catalog] dist_sl(lseg, line)
CREATE OR REPLACE FUNCTION pg_catalog.dist_sl(lseg, line)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$dist_sl$function$;

-- [pg_catalog] dist_sp(lseg, point)
CREATE OR REPLACE FUNCTION pg_catalog.dist_sp(lseg, point)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$dist_sp$function$;

-- [pg_catalog] div(numeric, numeric)
CREATE OR REPLACE FUNCTION pg_catalog.div(numeric, numeric)
 RETURNS numeric
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$numeric_div_trunc$function$;

-- [pg_catalog] dlog1(double precision)
CREATE OR REPLACE FUNCTION pg_catalog.dlog1(double precision)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$dlog1$function$;

-- [pg_catalog] dlog10(double precision)
CREATE OR REPLACE FUNCTION pg_catalog.dlog10(double precision)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$dlog10$function$;

-- [pg_catalog] domain_in(cstring, oid, integer)
CREATE OR REPLACE FUNCTION pg_catalog.domain_in(cstring, oid, integer)
 RETURNS "any"
 LANGUAGE internal
 STABLE PARALLEL SAFE
AS $function$domain_in$function$;

-- [pg_catalog] domain_recv(internal, oid, integer)
CREATE OR REPLACE FUNCTION pg_catalog.domain_recv(internal, oid, integer)
 RETURNS "any"
 LANGUAGE internal
 STABLE PARALLEL SAFE
AS $function$domain_recv$function$;

-- [pg_catalog] dpow(double precision, double precision)
CREATE OR REPLACE FUNCTION pg_catalog.dpow(double precision, double precision)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$dpow$function$;

-- [pg_catalog] dround(double precision)
CREATE OR REPLACE FUNCTION pg_catalog.dround(double precision)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$dround$function$;

-- [pg_catalog] dsimple_init(internal)
CREATE OR REPLACE FUNCTION pg_catalog.dsimple_init(internal)
 RETURNS internal
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$dsimple_init$function$;

-- [pg_catalog] dsimple_lexize(internal, internal, internal, internal)
CREATE OR REPLACE FUNCTION pg_catalog.dsimple_lexize(internal, internal, internal, internal)
 RETURNS internal
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$dsimple_lexize$function$;

-- [pg_catalog] dsnowball_init(internal)
CREATE OR REPLACE FUNCTION pg_catalog.dsnowball_init(internal)
 RETURNS internal
 LANGUAGE c
 STRICT
AS '$libdir/dict_snowball', $function$dsnowball_init$function$;

-- [pg_catalog] dsnowball_lexize(internal, internal, internal, internal)
CREATE OR REPLACE FUNCTION pg_catalog.dsnowball_lexize(internal, internal, internal, internal)
 RETURNS internal
 LANGUAGE c
 STRICT
AS '$libdir/dict_snowball', $function$dsnowball_lexize$function$;

-- [pg_catalog] dsqrt(double precision)
CREATE OR REPLACE FUNCTION pg_catalog.dsqrt(double precision)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$dsqrt$function$;

-- [pg_catalog] dsynonym_init(internal)
CREATE OR REPLACE FUNCTION pg_catalog.dsynonym_init(internal)
 RETURNS internal
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$dsynonym_init$function$;

-- [pg_catalog] dsynonym_lexize(internal, internal, internal, internal)
CREATE OR REPLACE FUNCTION pg_catalog.dsynonym_lexize(internal, internal, internal, internal)
 RETURNS internal
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$dsynonym_lexize$function$;

-- [pg_catalog] dtrunc(double precision)
CREATE OR REPLACE FUNCTION pg_catalog.dtrunc(double precision)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$dtrunc$function$;

-- [pg_catalog] elem_contained_by_multirange(anyelement, anymultirange)
CREATE OR REPLACE FUNCTION pg_catalog.elem_contained_by_multirange(anyelement, anymultirange)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$elem_contained_by_multirange$function$;

-- [pg_catalog] elem_contained_by_range(anyelement, anyrange)
CREATE OR REPLACE FUNCTION pg_catalog.elem_contained_by_range(anyelement, anyrange)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT SUPPORT elem_contained_by_range_support
AS $function$elem_contained_by_range$function$;

-- [pg_catalog] elem_contained_by_range_support(internal)
CREATE OR REPLACE FUNCTION pg_catalog.elem_contained_by_range_support(internal)
 RETURNS internal
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$elem_contained_by_range_support$function$;

-- [pg_catalog] encode(bytea, text)
CREATE OR REPLACE FUNCTION pg_catalog.encode(bytea, text)
 RETURNS text
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$binary_encode$function$;

-- [pg_catalog] enum_cmp(anyenum, anyenum)
CREATE OR REPLACE FUNCTION pg_catalog.enum_cmp(anyenum, anyenum)
 RETURNS integer
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$enum_cmp$function$;

-- [pg_catalog] enum_eq(anyenum, anyenum)
CREATE OR REPLACE FUNCTION pg_catalog.enum_eq(anyenum, anyenum)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$enum_eq$function$;

-- [pg_catalog] enum_first(anyenum)
CREATE OR REPLACE FUNCTION pg_catalog.enum_first(anyenum)
 RETURNS anyenum
 LANGUAGE internal
 STABLE PARALLEL SAFE
AS $function$enum_first$function$;

-- [pg_catalog] enum_ge(anyenum, anyenum)
CREATE OR REPLACE FUNCTION pg_catalog.enum_ge(anyenum, anyenum)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$enum_ge$function$;

-- [pg_catalog] enum_gt(anyenum, anyenum)
CREATE OR REPLACE FUNCTION pg_catalog.enum_gt(anyenum, anyenum)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$enum_gt$function$;

-- [pg_catalog] enum_in(cstring, oid)
CREATE OR REPLACE FUNCTION pg_catalog.enum_in(cstring, oid)
 RETURNS anyenum
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$enum_in$function$;

-- [pg_catalog] enum_larger(anyenum, anyenum)
CREATE OR REPLACE FUNCTION pg_catalog.enum_larger(anyenum, anyenum)
 RETURNS anyenum
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$enum_larger$function$;

-- [pg_catalog] enum_last(anyenum)
CREATE OR REPLACE FUNCTION pg_catalog.enum_last(anyenum)
 RETURNS anyenum
 LANGUAGE internal
 STABLE PARALLEL SAFE
AS $function$enum_last$function$;

-- [pg_catalog] enum_le(anyenum, anyenum)
CREATE OR REPLACE FUNCTION pg_catalog.enum_le(anyenum, anyenum)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$enum_le$function$;

-- [pg_catalog] enum_lt(anyenum, anyenum)
CREATE OR REPLACE FUNCTION pg_catalog.enum_lt(anyenum, anyenum)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$enum_lt$function$;

-- [pg_catalog] enum_ne(anyenum, anyenum)
CREATE OR REPLACE FUNCTION pg_catalog.enum_ne(anyenum, anyenum)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$enum_ne$function$;

-- [pg_catalog] enum_out(anyenum)
CREATE OR REPLACE FUNCTION pg_catalog.enum_out(anyenum)
 RETURNS cstring
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$enum_out$function$;

-- [pg_catalog] enum_range(anyenum)
CREATE OR REPLACE FUNCTION pg_catalog.enum_range(anyenum)
 RETURNS anyarray
 LANGUAGE internal
 STABLE PARALLEL SAFE
AS $function$enum_range_all$function$;

-- [pg_catalog] enum_range(anyenum, anyenum)
CREATE OR REPLACE FUNCTION pg_catalog.enum_range(anyenum, anyenum)
 RETURNS anyarray
 LANGUAGE internal
 STABLE PARALLEL SAFE
AS $function$enum_range_bounds$function$;

-- [pg_catalog] enum_recv(internal, oid)
CREATE OR REPLACE FUNCTION pg_catalog.enum_recv(internal, oid)
 RETURNS anyenum
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$enum_recv$function$;

-- [pg_catalog] enum_send(anyenum)
CREATE OR REPLACE FUNCTION pg_catalog.enum_send(anyenum)
 RETURNS bytea
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$enum_send$function$;

-- [pg_catalog] enum_smaller(anyenum, anyenum)
CREATE OR REPLACE FUNCTION pg_catalog.enum_smaller(anyenum, anyenum)
 RETURNS anyenum
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$enum_smaller$function$;

-- [pg_catalog] eqjoinsel(internal, oid, internal, smallint, internal)
CREATE OR REPLACE FUNCTION pg_catalog.eqjoinsel(internal, oid, internal, smallint, internal)
 RETURNS double precision
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$eqjoinsel$function$;

-- [pg_catalog] eqsel(internal, oid, internal, integer)
CREATE OR REPLACE FUNCTION pg_catalog.eqsel(internal, oid, internal, integer)
 RETURNS double precision
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$eqsel$function$;

-- [pg_catalog] erf(double precision)
CREATE OR REPLACE FUNCTION pg_catalog.erf(double precision)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$derf$function$;

-- [pg_catalog] erfc(double precision)
CREATE OR REPLACE FUNCTION pg_catalog.erfc(double precision)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$derfc$function$;

-- [pg_catalog] euc_cn_to_mic(integer, integer, cstring, internal, integer, boolean)
CREATE OR REPLACE FUNCTION pg_catalog.euc_cn_to_mic(integer, integer, cstring, internal, integer, boolean)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/euc_cn_and_mic', $function$euc_cn_to_mic$function$;

-- [pg_catalog] euc_cn_to_utf8(integer, integer, cstring, internal, integer, boolean)
CREATE OR REPLACE FUNCTION pg_catalog.euc_cn_to_utf8(integer, integer, cstring, internal, integer, boolean)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/utf8_and_euc_cn', $function$euc_cn_to_utf8$function$;

-- [pg_catalog] euc_jis_2004_to_shift_jis_2004(integer, integer, cstring, internal, integer, boolean)
CREATE OR REPLACE FUNCTION pg_catalog.euc_jis_2004_to_shift_jis_2004(integer, integer, cstring, internal, integer, boolean)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/euc2004_sjis2004', $function$euc_jis_2004_to_shift_jis_2004$function$;

-- [pg_catalog] euc_jis_2004_to_utf8(integer, integer, cstring, internal, integer, boolean)
CREATE OR REPLACE FUNCTION pg_catalog.euc_jis_2004_to_utf8(integer, integer, cstring, internal, integer, boolean)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/utf8_and_euc2004', $function$euc_jis_2004_to_utf8$function$;

-- [pg_catalog] euc_jp_to_mic(integer, integer, cstring, internal, integer, boolean)
CREATE OR REPLACE FUNCTION pg_catalog.euc_jp_to_mic(integer, integer, cstring, internal, integer, boolean)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/euc_jp_and_sjis', $function$euc_jp_to_mic$function$;

-- [pg_catalog] euc_jp_to_sjis(integer, integer, cstring, internal, integer, boolean)
CREATE OR REPLACE FUNCTION pg_catalog.euc_jp_to_sjis(integer, integer, cstring, internal, integer, boolean)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/euc_jp_and_sjis', $function$euc_jp_to_sjis$function$;

-- [pg_catalog] euc_jp_to_utf8(integer, integer, cstring, internal, integer, boolean)
CREATE OR REPLACE FUNCTION pg_catalog.euc_jp_to_utf8(integer, integer, cstring, internal, integer, boolean)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/utf8_and_euc_jp', $function$euc_jp_to_utf8$function$;

-- [pg_catalog] euc_kr_to_mic(integer, integer, cstring, internal, integer, boolean)
CREATE OR REPLACE FUNCTION pg_catalog.euc_kr_to_mic(integer, integer, cstring, internal, integer, boolean)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/euc_kr_and_mic', $function$euc_kr_to_mic$function$;

-- [pg_catalog] euc_kr_to_utf8(integer, integer, cstring, internal, integer, boolean)
CREATE OR REPLACE FUNCTION pg_catalog.euc_kr_to_utf8(integer, integer, cstring, internal, integer, boolean)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/utf8_and_euc_kr', $function$euc_kr_to_utf8$function$;

-- [pg_catalog] euc_tw_to_big5(integer, integer, cstring, internal, integer, boolean)
CREATE OR REPLACE FUNCTION pg_catalog.euc_tw_to_big5(integer, integer, cstring, internal, integer, boolean)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/euc_tw_and_big5', $function$euc_tw_to_big5$function$;

-- [pg_catalog] euc_tw_to_mic(integer, integer, cstring, internal, integer, boolean)
CREATE OR REPLACE FUNCTION pg_catalog.euc_tw_to_mic(integer, integer, cstring, internal, integer, boolean)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/euc_tw_and_big5', $function$euc_tw_to_mic$function$;

-- [pg_catalog] euc_tw_to_utf8(integer, integer, cstring, internal, integer, boolean)
CREATE OR REPLACE FUNCTION pg_catalog.euc_tw_to_utf8(integer, integer, cstring, internal, integer, boolean)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/utf8_and_euc_tw', $function$euc_tw_to_utf8$function$;

-- [pg_catalog] event_trigger_in(cstring)
CREATE OR REPLACE FUNCTION pg_catalog.event_trigger_in(cstring)
 RETURNS event_trigger
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE
AS $function$event_trigger_in$function$;

-- [pg_catalog] event_trigger_out(event_trigger)
CREATE OR REPLACE FUNCTION pg_catalog.event_trigger_out(event_trigger)
 RETURNS cstring
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$event_trigger_out$function$;

-- [pg_catalog] exp(double precision)
CREATE OR REPLACE FUNCTION pg_catalog.exp(double precision)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$dexp$function$;

-- [pg_catalog] exp(numeric)
CREATE OR REPLACE FUNCTION pg_catalog.exp(numeric)
 RETURNS numeric
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$numeric_exp$function$;

-- [pg_catalog] extract(text, date)
CREATE OR REPLACE FUNCTION pg_catalog."extract"(text, date)
 RETURNS numeric
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$extract_date$function$;

-- [pg_catalog] extract(text, interval)
CREATE OR REPLACE FUNCTION pg_catalog."extract"(text, interval)
 RETURNS numeric
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$extract_interval$function$;

-- [pg_catalog] extract(text, time with time zone)
CREATE OR REPLACE FUNCTION pg_catalog."extract"(text, time with time zone)
 RETURNS numeric
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$extract_timetz$function$;

-- [pg_catalog] extract(text, time without time zone)
CREATE OR REPLACE FUNCTION pg_catalog."extract"(text, time without time zone)
 RETURNS numeric
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$extract_time$function$;

-- [pg_catalog] extract(text, timestamp with time zone)
CREATE OR REPLACE FUNCTION pg_catalog."extract"(text, timestamp with time zone)
 RETURNS numeric
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$extract_timestamptz$function$;

-- [pg_catalog] extract(text, timestamp without time zone)
CREATE OR REPLACE FUNCTION pg_catalog."extract"(text, timestamp without time zone)
 RETURNS numeric
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$extract_timestamp$function$;

-- [pg_catalog] factorial(bigint)
CREATE OR REPLACE FUNCTION pg_catalog.factorial(bigint)
 RETURNS numeric
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$numeric_fac$function$;

-- [pg_catalog] family(inet)
CREATE OR REPLACE FUNCTION pg_catalog.family(inet)
 RETURNS integer
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$network_family$function$;

-- [pg_catalog] fdw_handler_in(cstring)
CREATE OR REPLACE FUNCTION pg_catalog.fdw_handler_in(cstring)
 RETURNS fdw_handler
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE
AS $function$fdw_handler_in$function$;

-- [pg_catalog] fdw_handler_out(fdw_handler)
CREATE OR REPLACE FUNCTION pg_catalog.fdw_handler_out(fdw_handler)
 RETURNS cstring
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$fdw_handler_out$function$;

-- [pg_catalog] float4(bigint)
CREATE OR REPLACE FUNCTION pg_catalog.float4(bigint)
 RETURNS real
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$i8tof$function$;

-- [pg_catalog] float4(double precision)
CREATE OR REPLACE FUNCTION pg_catalog.float4(double precision)
 RETURNS real
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$dtof$function$;

-- [pg_catalog] float4(integer)
CREATE OR REPLACE FUNCTION pg_catalog.float4(integer)
 RETURNS real
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$i4tof$function$;

-- [pg_catalog] float4(jsonb)
CREATE OR REPLACE FUNCTION pg_catalog.float4(jsonb)
 RETURNS real
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$jsonb_float4$function$;

-- [pg_catalog] float4(numeric)
CREATE OR REPLACE FUNCTION pg_catalog.float4(numeric)
 RETURNS real
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$numeric_float4$function$;

-- [pg_catalog] float4(smallint)
CREATE OR REPLACE FUNCTION pg_catalog.float4(smallint)
 RETURNS real
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$i2tof$function$;

-- [pg_catalog] float48div(real, double precision)
CREATE OR REPLACE FUNCTION pg_catalog.float48div(real, double precision)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$float48div$function$;

-- [pg_catalog] float48eq(real, double precision)
CREATE OR REPLACE FUNCTION pg_catalog.float48eq(real, double precision)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$float48eq$function$;

-- [pg_catalog] float48ge(real, double precision)
CREATE OR REPLACE FUNCTION pg_catalog.float48ge(real, double precision)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$float48ge$function$;

-- [pg_catalog] float48gt(real, double precision)
CREATE OR REPLACE FUNCTION pg_catalog.float48gt(real, double precision)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$float48gt$function$;

-- [pg_catalog] float48le(real, double precision)
CREATE OR REPLACE FUNCTION pg_catalog.float48le(real, double precision)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$float48le$function$;

-- [pg_catalog] float48lt(real, double precision)
CREATE OR REPLACE FUNCTION pg_catalog.float48lt(real, double precision)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$float48lt$function$;

-- [pg_catalog] float48mi(real, double precision)
CREATE OR REPLACE FUNCTION pg_catalog.float48mi(real, double precision)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$float48mi$function$;

-- [pg_catalog] float48mul(real, double precision)
CREATE OR REPLACE FUNCTION pg_catalog.float48mul(real, double precision)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$float48mul$function$;

-- [pg_catalog] float48ne(real, double precision)
CREATE OR REPLACE FUNCTION pg_catalog.float48ne(real, double precision)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$float48ne$function$;

-- [pg_catalog] float48pl(real, double precision)
CREATE OR REPLACE FUNCTION pg_catalog.float48pl(real, double precision)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$float48pl$function$;

-- [pg_catalog] float4_accum(double precision[], real)
CREATE OR REPLACE FUNCTION pg_catalog.float4_accum(double precision[], real)
 RETURNS double precision[]
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$float4_accum$function$;

-- [pg_catalog] float4abs(real)
CREATE OR REPLACE FUNCTION pg_catalog.float4abs(real)
 RETURNS real
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$float4abs$function$;

-- [pg_catalog] float4div(real, real)
CREATE OR REPLACE FUNCTION pg_catalog.float4div(real, real)
 RETURNS real
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$float4div$function$;

-- [pg_catalog] float4eq(real, real)
CREATE OR REPLACE FUNCTION pg_catalog.float4eq(real, real)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$float4eq$function$;

-- [pg_catalog] float4ge(real, real)
CREATE OR REPLACE FUNCTION pg_catalog.float4ge(real, real)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$float4ge$function$;

-- [pg_catalog] float4gt(real, real)
CREATE OR REPLACE FUNCTION pg_catalog.float4gt(real, real)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$float4gt$function$;

-- [pg_catalog] float4in(cstring)
CREATE OR REPLACE FUNCTION pg_catalog.float4in(cstring)
 RETURNS real
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$float4in$function$;

-- [pg_catalog] float4larger(real, real)
CREATE OR REPLACE FUNCTION pg_catalog.float4larger(real, real)
 RETURNS real
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$float4larger$function$;

-- [pg_catalog] float4le(real, real)
CREATE OR REPLACE FUNCTION pg_catalog.float4le(real, real)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$float4le$function$;

-- [pg_catalog] float4lt(real, real)
CREATE OR REPLACE FUNCTION pg_catalog.float4lt(real, real)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$float4lt$function$;

-- [pg_catalog] float4mi(real, real)
CREATE OR REPLACE FUNCTION pg_catalog.float4mi(real, real)
 RETURNS real
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$float4mi$function$;

-- [pg_catalog] float4mul(real, real)
CREATE OR REPLACE FUNCTION pg_catalog.float4mul(real, real)
 RETURNS real
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$float4mul$function$;

-- [pg_catalog] float4ne(real, real)
CREATE OR REPLACE FUNCTION pg_catalog.float4ne(real, real)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$float4ne$function$;

-- [pg_catalog] float4out(real)
CREATE OR REPLACE FUNCTION pg_catalog.float4out(real)
 RETURNS cstring
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$float4out$function$;

-- [pg_catalog] float4pl(real, real)
CREATE OR REPLACE FUNCTION pg_catalog.float4pl(real, real)
 RETURNS real
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$float4pl$function$;

-- [pg_catalog] float4recv(internal)
CREATE OR REPLACE FUNCTION pg_catalog.float4recv(internal)
 RETURNS real
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$float4recv$function$;

-- [pg_catalog] float4send(real)
CREATE OR REPLACE FUNCTION pg_catalog.float4send(real)
 RETURNS bytea
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$float4send$function$;

-- [pg_catalog] float4smaller(real, real)
CREATE OR REPLACE FUNCTION pg_catalog.float4smaller(real, real)
 RETURNS real
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$float4smaller$function$;

-- [pg_catalog] float4um(real)
CREATE OR REPLACE FUNCTION pg_catalog.float4um(real)
 RETURNS real
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$float4um$function$;

-- [pg_catalog] float4up(real)
CREATE OR REPLACE FUNCTION pg_catalog.float4up(real)
 RETURNS real
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$float4up$function$;

-- [pg_catalog] float8(bigint)
CREATE OR REPLACE FUNCTION pg_catalog.float8(bigint)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$i8tod$function$;

-- [pg_catalog] float8(integer)
CREATE OR REPLACE FUNCTION pg_catalog.float8(integer)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$i4tod$function$;

-- [pg_catalog] float8(jsonb)
CREATE OR REPLACE FUNCTION pg_catalog.float8(jsonb)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$jsonb_float8$function$;

-- [pg_catalog] float8(numeric)
CREATE OR REPLACE FUNCTION pg_catalog.float8(numeric)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$numeric_float8$function$;

-- [pg_catalog] float8(real)
CREATE OR REPLACE FUNCTION pg_catalog.float8(real)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$ftod$function$;

-- [pg_catalog] float8(smallint)
CREATE OR REPLACE FUNCTION pg_catalog.float8(smallint)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$i2tod$function$;

-- [pg_catalog] float84div(double precision, real)
CREATE OR REPLACE FUNCTION pg_catalog.float84div(double precision, real)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$float84div$function$;

-- [pg_catalog] float84eq(double precision, real)
CREATE OR REPLACE FUNCTION pg_catalog.float84eq(double precision, real)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$float84eq$function$;

-- [pg_catalog] float84ge(double precision, real)
CREATE OR REPLACE FUNCTION pg_catalog.float84ge(double precision, real)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$float84ge$function$;

-- [pg_catalog] float84gt(double precision, real)
CREATE OR REPLACE FUNCTION pg_catalog.float84gt(double precision, real)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$float84gt$function$;

-- [pg_catalog] float84le(double precision, real)
CREATE OR REPLACE FUNCTION pg_catalog.float84le(double precision, real)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$float84le$function$;

-- [pg_catalog] float84lt(double precision, real)
CREATE OR REPLACE FUNCTION pg_catalog.float84lt(double precision, real)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$float84lt$function$;

-- [pg_catalog] float84mi(double precision, real)
CREATE OR REPLACE FUNCTION pg_catalog.float84mi(double precision, real)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$float84mi$function$;

-- [pg_catalog] float84mul(double precision, real)
CREATE OR REPLACE FUNCTION pg_catalog.float84mul(double precision, real)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$float84mul$function$;

-- [pg_catalog] float84ne(double precision, real)
CREATE OR REPLACE FUNCTION pg_catalog.float84ne(double precision, real)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$float84ne$function$;

-- [pg_catalog] float84pl(double precision, real)
CREATE OR REPLACE FUNCTION pg_catalog.float84pl(double precision, real)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$float84pl$function$;

-- [pg_catalog] float8_accum(double precision[], double precision)
CREATE OR REPLACE FUNCTION pg_catalog.float8_accum(double precision[], double precision)
 RETURNS double precision[]
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$float8_accum$function$;

-- [pg_catalog] float8_avg(double precision[])
CREATE OR REPLACE FUNCTION pg_catalog.float8_avg(double precision[])
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$float8_avg$function$;

-- [pg_catalog] float8_combine(double precision[], double precision[])
CREATE OR REPLACE FUNCTION pg_catalog.float8_combine(double precision[], double precision[])
 RETURNS double precision[]
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$float8_combine$function$;

-- [pg_catalog] float8_corr(double precision[])
CREATE OR REPLACE FUNCTION pg_catalog.float8_corr(double precision[])
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$float8_corr$function$;

-- [pg_catalog] float8_covar_pop(double precision[])
CREATE OR REPLACE FUNCTION pg_catalog.float8_covar_pop(double precision[])
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$float8_covar_pop$function$;

-- [pg_catalog] float8_covar_samp(double precision[])
CREATE OR REPLACE FUNCTION pg_catalog.float8_covar_samp(double precision[])
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$float8_covar_samp$function$;

-- [pg_catalog] float8_regr_accum(double precision[], double precision, double precision)
CREATE OR REPLACE FUNCTION pg_catalog.float8_regr_accum(double precision[], double precision, double precision)
 RETURNS double precision[]
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$float8_regr_accum$function$;

-- [pg_catalog] float8_regr_avgx(double precision[])
CREATE OR REPLACE FUNCTION pg_catalog.float8_regr_avgx(double precision[])
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$float8_regr_avgx$function$;

-- [pg_catalog] float8_regr_avgy(double precision[])
CREATE OR REPLACE FUNCTION pg_catalog.float8_regr_avgy(double precision[])
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$float8_regr_avgy$function$;

-- [pg_catalog] float8_regr_combine(double precision[], double precision[])
CREATE OR REPLACE FUNCTION pg_catalog.float8_regr_combine(double precision[], double precision[])
 RETURNS double precision[]
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$float8_regr_combine$function$;

-- [pg_catalog] float8_regr_intercept(double precision[])
CREATE OR REPLACE FUNCTION pg_catalog.float8_regr_intercept(double precision[])
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$float8_regr_intercept$function$;

-- [pg_catalog] float8_regr_r2(double precision[])
CREATE OR REPLACE FUNCTION pg_catalog.float8_regr_r2(double precision[])
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$float8_regr_r2$function$;

-- [pg_catalog] float8_regr_slope(double precision[])
CREATE OR REPLACE FUNCTION pg_catalog.float8_regr_slope(double precision[])
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$float8_regr_slope$function$;

-- [pg_catalog] float8_regr_sxx(double precision[])
CREATE OR REPLACE FUNCTION pg_catalog.float8_regr_sxx(double precision[])
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$float8_regr_sxx$function$;

-- [pg_catalog] float8_regr_sxy(double precision[])
CREATE OR REPLACE FUNCTION pg_catalog.float8_regr_sxy(double precision[])
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$float8_regr_sxy$function$;

-- [pg_catalog] float8_regr_syy(double precision[])
CREATE OR REPLACE FUNCTION pg_catalog.float8_regr_syy(double precision[])
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$float8_regr_syy$function$;

-- [pg_catalog] float8_stddev_pop(double precision[])
CREATE OR REPLACE FUNCTION pg_catalog.float8_stddev_pop(double precision[])
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$float8_stddev_pop$function$;

-- [pg_catalog] float8_stddev_samp(double precision[])
CREATE OR REPLACE FUNCTION pg_catalog.float8_stddev_samp(double precision[])
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$float8_stddev_samp$function$;

-- [pg_catalog] float8_var_pop(double precision[])
CREATE OR REPLACE FUNCTION pg_catalog.float8_var_pop(double precision[])
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$float8_var_pop$function$;

-- [pg_catalog] float8_var_samp(double precision[])
CREATE OR REPLACE FUNCTION pg_catalog.float8_var_samp(double precision[])
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$float8_var_samp$function$;

-- [pg_catalog] float8abs(double precision)
CREATE OR REPLACE FUNCTION pg_catalog.float8abs(double precision)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$float8abs$function$;

-- [pg_catalog] float8div(double precision, double precision)
CREATE OR REPLACE FUNCTION pg_catalog.float8div(double precision, double precision)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$float8div$function$;

-- [pg_catalog] float8eq(double precision, double precision)
CREATE OR REPLACE FUNCTION pg_catalog.float8eq(double precision, double precision)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$float8eq$function$;

-- [pg_catalog] float8ge(double precision, double precision)
CREATE OR REPLACE FUNCTION pg_catalog.float8ge(double precision, double precision)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$float8ge$function$;

-- [pg_catalog] float8gt(double precision, double precision)
CREATE OR REPLACE FUNCTION pg_catalog.float8gt(double precision, double precision)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$float8gt$function$;

-- [pg_catalog] float8in(cstring)
CREATE OR REPLACE FUNCTION pg_catalog.float8in(cstring)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$float8in$function$;

-- [pg_catalog] float8larger(double precision, double precision)
CREATE OR REPLACE FUNCTION pg_catalog.float8larger(double precision, double precision)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$float8larger$function$;

-- [pg_catalog] float8le(double precision, double precision)
CREATE OR REPLACE FUNCTION pg_catalog.float8le(double precision, double precision)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$float8le$function$;

-- [pg_catalog] float8lt(double precision, double precision)
CREATE OR REPLACE FUNCTION pg_catalog.float8lt(double precision, double precision)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$float8lt$function$;

-- [pg_catalog] float8mi(double precision, double precision)
CREATE OR REPLACE FUNCTION pg_catalog.float8mi(double precision, double precision)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$float8mi$function$;

-- [pg_catalog] float8mul(double precision, double precision)
CREATE OR REPLACE FUNCTION pg_catalog.float8mul(double precision, double precision)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$float8mul$function$;

-- [pg_catalog] float8ne(double precision, double precision)
CREATE OR REPLACE FUNCTION pg_catalog.float8ne(double precision, double precision)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$float8ne$function$;

-- [pg_catalog] float8out(double precision)
CREATE OR REPLACE FUNCTION pg_catalog.float8out(double precision)
 RETURNS cstring
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$float8out$function$;

-- [pg_catalog] float8pl(double precision, double precision)
CREATE OR REPLACE FUNCTION pg_catalog.float8pl(double precision, double precision)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$float8pl$function$;

-- [pg_catalog] float8recv(internal)
CREATE OR REPLACE FUNCTION pg_catalog.float8recv(internal)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$float8recv$function$;

-- [pg_catalog] float8send(double precision)
CREATE OR REPLACE FUNCTION pg_catalog.float8send(double precision)
 RETURNS bytea
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$float8send$function$;

-- [pg_catalog] float8smaller(double precision, double precision)
CREATE OR REPLACE FUNCTION pg_catalog.float8smaller(double precision, double precision)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$float8smaller$function$;

-- [pg_catalog] float8um(double precision)
CREATE OR REPLACE FUNCTION pg_catalog.float8um(double precision)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$float8um$function$;

-- [pg_catalog] float8up(double precision)
CREATE OR REPLACE FUNCTION pg_catalog.float8up(double precision)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$float8up$function$;

-- [pg_catalog] floor(double precision)
CREATE OR REPLACE FUNCTION pg_catalog.floor(double precision)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$dfloor$function$;

-- [pg_catalog] floor(numeric)
CREATE OR REPLACE FUNCTION pg_catalog.floor(numeric)
 RETURNS numeric
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$numeric_floor$function$;

-- [pg_catalog] flt4_mul_cash(real, money)
CREATE OR REPLACE FUNCTION pg_catalog.flt4_mul_cash(real, money)
 RETURNS money
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$flt4_mul_cash$function$;

-- [pg_catalog] flt8_mul_cash(double precision, money)
CREATE OR REPLACE FUNCTION pg_catalog.flt8_mul_cash(double precision, money)
 RETURNS money
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$flt8_mul_cash$function$;

-- [pg_catalog] fmgr_c_validator(oid)
CREATE OR REPLACE FUNCTION pg_catalog.fmgr_c_validator(oid)
 RETURNS void
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$fmgr_c_validator$function$;

-- [pg_catalog] fmgr_internal_validator(oid)
CREATE OR REPLACE FUNCTION pg_catalog.fmgr_internal_validator(oid)
 RETURNS void
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$fmgr_internal_validator$function$;

-- [pg_catalog] fmgr_sql_validator(oid)
CREATE OR REPLACE FUNCTION pg_catalog.fmgr_sql_validator(oid)
 RETURNS void
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$fmgr_sql_validator$function$;

-- [pg_catalog] format(text)
CREATE OR REPLACE FUNCTION pg_catalog.format(text)
 RETURNS text
 LANGUAGE internal
 STABLE PARALLEL SAFE
AS $function$text_format_nv$function$;

-- [pg_catalog] format(text, VARIADIC "any")
CREATE OR REPLACE FUNCTION pg_catalog.format(text, VARIADIC "any")
 RETURNS text
 LANGUAGE internal
 STABLE PARALLEL SAFE
AS $function$text_format$function$;

-- [pg_catalog] format_type(oid, integer)
CREATE OR REPLACE FUNCTION pg_catalog.format_type(oid, integer)
 RETURNS text
 LANGUAGE internal
 STABLE PARALLEL SAFE
AS $function$format_type$function$;

-- [pg_catalog] gb18030_to_utf8(integer, integer, cstring, internal, integer, boolean)
CREATE OR REPLACE FUNCTION pg_catalog.gb18030_to_utf8(integer, integer, cstring, internal, integer, boolean)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/utf8_and_gb18030', $function$gb18030_to_utf8$function$;

-- [pg_catalog] gbk_to_utf8(integer, integer, cstring, internal, integer, boolean)
CREATE OR REPLACE FUNCTION pg_catalog.gbk_to_utf8(integer, integer, cstring, internal, integer, boolean)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/utf8_and_gbk', $function$gbk_to_utf8$function$;

-- [pg_catalog] gcd(bigint, bigint)
CREATE OR REPLACE FUNCTION pg_catalog.gcd(bigint, bigint)
 RETURNS bigint
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$int8gcd$function$;

-- [pg_catalog] gcd(integer, integer)
CREATE OR REPLACE FUNCTION pg_catalog.gcd(integer, integer)
 RETURNS integer
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$int4gcd$function$;

-- [pg_catalog] gcd(numeric, numeric)
CREATE OR REPLACE FUNCTION pg_catalog.gcd(numeric, numeric)
 RETURNS numeric
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$numeric_gcd$function$;

-- [pg_catalog] gen_random_uuid()
CREATE OR REPLACE FUNCTION pg_catalog.gen_random_uuid()
 RETURNS uuid
 LANGUAGE internal
 PARALLEL SAFE STRICT LEAKPROOF
AS $function$gen_random_uuid$function$;

-- [pg_catalog] generate_series(bigint, bigint)
CREATE OR REPLACE FUNCTION pg_catalog.generate_series(bigint, bigint)
 RETURNS SETOF bigint
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT SUPPORT generate_series_int8_support
AS $function$generate_series_int8$function$;

-- [pg_catalog] generate_series(bigint, bigint, bigint)
CREATE OR REPLACE FUNCTION pg_catalog.generate_series(bigint, bigint, bigint)
 RETURNS SETOF bigint
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT SUPPORT generate_series_int8_support
AS $function$generate_series_step_int8$function$;

-- [pg_catalog] generate_series(integer, integer)
CREATE OR REPLACE FUNCTION pg_catalog.generate_series(integer, integer)
 RETURNS SETOF integer
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT SUPPORT generate_series_int4_support
AS $function$generate_series_int4$function$;

-- [pg_catalog] generate_series(integer, integer, integer)
CREATE OR REPLACE FUNCTION pg_catalog.generate_series(integer, integer, integer)
 RETURNS SETOF integer
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT SUPPORT generate_series_int4_support
AS $function$generate_series_step_int4$function$;

-- [pg_catalog] generate_series(numeric, numeric)
CREATE OR REPLACE FUNCTION pg_catalog.generate_series(numeric, numeric)
 RETURNS SETOF numeric
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$generate_series_numeric$function$;

-- [pg_catalog] generate_series(numeric, numeric, numeric)
CREATE OR REPLACE FUNCTION pg_catalog.generate_series(numeric, numeric, numeric)
 RETURNS SETOF numeric
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$generate_series_step_numeric$function$;

-- [pg_catalog] generate_series(timestamp with time zone, timestamp with time zone, interval)
CREATE OR REPLACE FUNCTION pg_catalog.generate_series(timestamp with time zone, timestamp with time zone, interval)
 RETURNS SETOF timestamp with time zone
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$generate_series_timestamptz$function$;

-- [pg_catalog] generate_series(timestamp with time zone, timestamp with time zone, interval, text)
CREATE OR REPLACE FUNCTION pg_catalog.generate_series(timestamp with time zone, timestamp with time zone, interval, text)
 RETURNS SETOF timestamp with time zone
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$generate_series_timestamptz_at_zone$function$;

-- [pg_catalog] generate_series(timestamp without time zone, timestamp without time zone, interval)
CREATE OR REPLACE FUNCTION pg_catalog.generate_series(timestamp without time zone, timestamp without time zone, interval)
 RETURNS SETOF timestamp without time zone
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$generate_series_timestamp$function$;

-- [pg_catalog] generate_series_int4_support(internal)
CREATE OR REPLACE FUNCTION pg_catalog.generate_series_int4_support(internal)
 RETURNS internal
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$generate_series_int4_support$function$;

-- [pg_catalog] generate_series_int8_support(internal)
CREATE OR REPLACE FUNCTION pg_catalog.generate_series_int8_support(internal)
 RETURNS internal
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$generate_series_int8_support$function$;

-- [pg_catalog] generate_subscripts(anyarray, integer)
CREATE OR REPLACE FUNCTION pg_catalog.generate_subscripts(anyarray, integer)
 RETURNS SETOF integer
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$generate_subscripts_nodir$function$;

-- [pg_catalog] generate_subscripts(anyarray, integer, boolean)
CREATE OR REPLACE FUNCTION pg_catalog.generate_subscripts(anyarray, integer, boolean)
 RETURNS SETOF integer
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$generate_subscripts$function$;

-- [pg_catalog] get_bit(bit, integer)
CREATE OR REPLACE FUNCTION pg_catalog.get_bit(bit, integer)
 RETURNS integer
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$bitgetbit$function$;

-- [pg_catalog] get_bit(bytea, bigint)
CREATE OR REPLACE FUNCTION pg_catalog.get_bit(bytea, bigint)
 RETURNS integer
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$byteaGetBit$function$;

-- [pg_catalog] get_byte(bytea, integer)
CREATE OR REPLACE FUNCTION pg_catalog.get_byte(bytea, integer)
 RETURNS integer
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$byteaGetByte$function$;

-- [pg_catalog] get_current_ts_config()
CREATE OR REPLACE FUNCTION pg_catalog.get_current_ts_config()
 RETURNS regconfig
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$get_current_ts_config$function$;

-- [pg_catalog] getdatabaseencoding()
CREATE OR REPLACE FUNCTION pg_catalog.getdatabaseencoding()
 RETURNS name
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$getdatabaseencoding$function$;

-- [pg_catalog] getpgusername()
CREATE OR REPLACE FUNCTION pg_catalog.getpgusername()
 RETURNS name
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$current_user$function$;

-- [pg_catalog] gin_clean_pending_list(regclass)
CREATE OR REPLACE FUNCTION pg_catalog.gin_clean_pending_list(regclass)
 RETURNS bigint
 LANGUAGE internal
 STRICT
AS $function$gin_clean_pending_list$function$;

-- [pg_catalog] gin_cmp_prefix(text, text, smallint, internal)
CREATE OR REPLACE FUNCTION pg_catalog.gin_cmp_prefix(text, text, smallint, internal)
 RETURNS integer
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$gin_cmp_prefix$function$;

-- [pg_catalog] gin_cmp_tslexeme(text, text)
CREATE OR REPLACE FUNCTION pg_catalog.gin_cmp_tslexeme(text, text)
 RETURNS integer
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$gin_cmp_tslexeme$function$;

-- [pg_catalog] gin_compare_jsonb(text, text)
CREATE OR REPLACE FUNCTION pg_catalog.gin_compare_jsonb(text, text)
 RETURNS integer
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$gin_compare_jsonb$function$;

-- [pg_catalog] gin_consistent_jsonb(internal, smallint, jsonb, integer, internal, internal, internal, internal)
CREATE OR REPLACE FUNCTION pg_catalog.gin_consistent_jsonb(internal, smallint, jsonb, integer, internal, internal, internal, internal)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$gin_consistent_jsonb$function$;

-- [pg_catalog] gin_consistent_jsonb_path(internal, smallint, jsonb, integer, internal, internal, internal, internal)
CREATE OR REPLACE FUNCTION pg_catalog.gin_consistent_jsonb_path(internal, smallint, jsonb, integer, internal, internal, internal, internal)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$gin_consistent_jsonb_path$function$;

-- [pg_catalog] gin_extract_jsonb(jsonb, internal, internal)
CREATE OR REPLACE FUNCTION pg_catalog.gin_extract_jsonb(jsonb, internal, internal)
 RETURNS internal
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$gin_extract_jsonb$function$;

-- [pg_catalog] gin_extract_jsonb_path(jsonb, internal, internal)
CREATE OR REPLACE FUNCTION pg_catalog.gin_extract_jsonb_path(jsonb, internal, internal)
 RETURNS internal
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$gin_extract_jsonb_path$function$;

-- [pg_catalog] gin_extract_jsonb_query(jsonb, internal, smallint, internal, internal, internal, internal)
CREATE OR REPLACE FUNCTION pg_catalog.gin_extract_jsonb_query(jsonb, internal, smallint, internal, internal, internal, internal)
 RETURNS internal
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$gin_extract_jsonb_query$function$;

-- [pg_catalog] gin_extract_jsonb_query_path(jsonb, internal, smallint, internal, internal, internal, internal)
CREATE OR REPLACE FUNCTION pg_catalog.gin_extract_jsonb_query_path(jsonb, internal, smallint, internal, internal, internal, internal)
 RETURNS internal
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$gin_extract_jsonb_query_path$function$;

-- [pg_catalog] gin_extract_tsquery(tsquery, internal, smallint, internal, internal)
CREATE OR REPLACE FUNCTION pg_catalog.gin_extract_tsquery(tsquery, internal, smallint, internal, internal)
 RETURNS internal
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$gin_extract_tsquery_5args$function$;

-- [pg_catalog] gin_extract_tsquery(tsquery, internal, smallint, internal, internal, internal, internal)
CREATE OR REPLACE FUNCTION pg_catalog.gin_extract_tsquery(tsquery, internal, smallint, internal, internal, internal, internal)
 RETURNS internal
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$gin_extract_tsquery_oldsig$function$;

-- [pg_catalog] gin_extract_tsquery(tsvector, internal, smallint, internal, internal, internal, internal)
CREATE OR REPLACE FUNCTION pg_catalog.gin_extract_tsquery(tsvector, internal, smallint, internal, internal, internal, internal)
 RETURNS internal
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$gin_extract_tsquery$function$;

-- [pg_catalog] gin_extract_tsvector(tsvector, internal)
CREATE OR REPLACE FUNCTION pg_catalog.gin_extract_tsvector(tsvector, internal)
 RETURNS internal
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$gin_extract_tsvector_2args$function$;

-- [pg_catalog] gin_extract_tsvector(tsvector, internal, internal)
CREATE OR REPLACE FUNCTION pg_catalog.gin_extract_tsvector(tsvector, internal, internal)
 RETURNS internal
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$gin_extract_tsvector$function$;

-- [pg_catalog] gin_triconsistent_jsonb(internal, smallint, jsonb, integer, internal, internal, internal)
CREATE OR REPLACE FUNCTION pg_catalog.gin_triconsistent_jsonb(internal, smallint, jsonb, integer, internal, internal, internal)
 RETURNS "char"
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$gin_triconsistent_jsonb$function$;

-- [pg_catalog] gin_triconsistent_jsonb_path(internal, smallint, jsonb, integer, internal, internal, internal)
CREATE OR REPLACE FUNCTION pg_catalog.gin_triconsistent_jsonb_path(internal, smallint, jsonb, integer, internal, internal, internal)
 RETURNS "char"
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$gin_triconsistent_jsonb_path$function$;

-- [pg_catalog] gin_tsquery_consistent(internal, smallint, tsquery, integer, internal, internal)
CREATE OR REPLACE FUNCTION pg_catalog.gin_tsquery_consistent(internal, smallint, tsquery, integer, internal, internal)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$gin_tsquery_consistent_6args$function$;

-- [pg_catalog] gin_tsquery_consistent(internal, smallint, tsquery, integer, internal, internal, internal, internal)
CREATE OR REPLACE FUNCTION pg_catalog.gin_tsquery_consistent(internal, smallint, tsquery, integer, internal, internal, internal, internal)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$gin_tsquery_consistent_oldsig$function$;

-- [pg_catalog] gin_tsquery_consistent(internal, smallint, tsvector, integer, internal, internal, internal, internal)
CREATE OR REPLACE FUNCTION pg_catalog.gin_tsquery_consistent(internal, smallint, tsvector, integer, internal, internal, internal, internal)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$gin_tsquery_consistent$function$;

-- [pg_catalog] gin_tsquery_triconsistent(internal, smallint, tsvector, integer, internal, internal, internal)
CREATE OR REPLACE FUNCTION pg_catalog.gin_tsquery_triconsistent(internal, smallint, tsvector, integer, internal, internal, internal)
 RETURNS "char"
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$gin_tsquery_triconsistent$function$;

-- [pg_catalog] ginarrayconsistent(internal, smallint, anyarray, integer, internal, internal, internal, internal)
CREATE OR REPLACE FUNCTION pg_catalog.ginarrayconsistent(internal, smallint, anyarray, integer, internal, internal, internal, internal)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$ginarrayconsistent$function$;

-- [pg_catalog] ginarrayextract(anyarray, internal)
CREATE OR REPLACE FUNCTION pg_catalog.ginarrayextract(anyarray, internal)
 RETURNS internal
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$ginarrayextract_2args$function$;

-- [pg_catalog] ginarrayextract(anyarray, internal, internal)
CREATE OR REPLACE FUNCTION pg_catalog.ginarrayextract(anyarray, internal, internal)
 RETURNS internal
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$ginarrayextract$function$;

-- [pg_catalog] ginarraytriconsistent(internal, smallint, anyarray, integer, internal, internal, internal)
CREATE OR REPLACE FUNCTION pg_catalog.ginarraytriconsistent(internal, smallint, anyarray, integer, internal, internal, internal)
 RETURNS "char"
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$ginarraytriconsistent$function$;

-- [pg_catalog] ginhandler(internal)
CREATE OR REPLACE FUNCTION pg_catalog.ginhandler(internal)
 RETURNS index_am_handler
 LANGUAGE internal
 PARALLEL SAFE STRICT
AS $function$ginhandler$function$;

-- [pg_catalog] ginqueryarrayextract(anyarray, internal, smallint, internal, internal, internal, internal)
CREATE OR REPLACE FUNCTION pg_catalog.ginqueryarrayextract(anyarray, internal, smallint, internal, internal, internal, internal)
 RETURNS internal
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$ginqueryarrayextract$function$;

-- [pg_catalog] gist_box_consistent(internal, box, smallint, oid, internal)
CREATE OR REPLACE FUNCTION pg_catalog.gist_box_consistent(internal, box, smallint, oid, internal)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$gist_box_consistent$function$;

-- [pg_catalog] gist_box_distance(internal, box, smallint, oid, internal)
CREATE OR REPLACE FUNCTION pg_catalog.gist_box_distance(internal, box, smallint, oid, internal)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$gist_box_distance$function$;

-- [pg_catalog] gist_box_penalty(internal, internal, internal)
CREATE OR REPLACE FUNCTION pg_catalog.gist_box_penalty(internal, internal, internal)
 RETURNS internal
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$gist_box_penalty$function$;

-- [pg_catalog] gist_box_picksplit(internal, internal)
CREATE OR REPLACE FUNCTION pg_catalog.gist_box_picksplit(internal, internal)
 RETURNS internal
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$gist_box_picksplit$function$;

-- [pg_catalog] gist_box_same(box, box, internal)
CREATE OR REPLACE FUNCTION pg_catalog.gist_box_same(box, box, internal)
 RETURNS internal
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$gist_box_same$function$;

-- [pg_catalog] gist_box_union(internal, internal)
CREATE OR REPLACE FUNCTION pg_catalog.gist_box_union(internal, internal)
 RETURNS box
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$gist_box_union$function$;

-- [pg_catalog] gist_circle_compress(internal)
CREATE OR REPLACE FUNCTION pg_catalog.gist_circle_compress(internal)
 RETURNS internal
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$gist_circle_compress$function$;

-- [pg_catalog] gist_circle_consistent(internal, circle, smallint, oid, internal)
CREATE OR REPLACE FUNCTION pg_catalog.gist_circle_consistent(internal, circle, smallint, oid, internal)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$gist_circle_consistent$function$;

-- [pg_catalog] gist_circle_distance(internal, circle, smallint, oid, internal)
CREATE OR REPLACE FUNCTION pg_catalog.gist_circle_distance(internal, circle, smallint, oid, internal)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$gist_circle_distance$function$;

-- [pg_catalog] gist_point_compress(internal)
CREATE OR REPLACE FUNCTION pg_catalog.gist_point_compress(internal)
 RETURNS internal
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$gist_point_compress$function$;

-- [pg_catalog] gist_point_consistent(internal, point, smallint, oid, internal)
CREATE OR REPLACE FUNCTION pg_catalog.gist_point_consistent(internal, point, smallint, oid, internal)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$gist_point_consistent$function$;

-- [pg_catalog] gist_point_distance(internal, point, smallint, oid, internal)
CREATE OR REPLACE FUNCTION pg_catalog.gist_point_distance(internal, point, smallint, oid, internal)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$gist_point_distance$function$;

-- [pg_catalog] gist_point_fetch(internal)
CREATE OR REPLACE FUNCTION pg_catalog.gist_point_fetch(internal)
 RETURNS internal
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$gist_point_fetch$function$;

-- [pg_catalog] gist_point_sortsupport(internal)
CREATE OR REPLACE FUNCTION pg_catalog.gist_point_sortsupport(internal)
 RETURNS void
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$gist_point_sortsupport$function$;

-- [pg_catalog] gist_poly_compress(internal)
CREATE OR REPLACE FUNCTION pg_catalog.gist_poly_compress(internal)
 RETURNS internal
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$gist_poly_compress$function$;

-- [pg_catalog] gist_poly_consistent(internal, polygon, smallint, oid, internal)
CREATE OR REPLACE FUNCTION pg_catalog.gist_poly_consistent(internal, polygon, smallint, oid, internal)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$gist_poly_consistent$function$;

-- [pg_catalog] gist_poly_distance(internal, polygon, smallint, oid, internal)
CREATE OR REPLACE FUNCTION pg_catalog.gist_poly_distance(internal, polygon, smallint, oid, internal)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$gist_poly_distance$function$;

-- [pg_catalog] gisthandler(internal)
CREATE OR REPLACE FUNCTION pg_catalog.gisthandler(internal)
 RETURNS index_am_handler
 LANGUAGE internal
 PARALLEL SAFE STRICT
AS $function$gisthandler$function$;

-- [pg_catalog] gtsquery_compress(internal)
CREATE OR REPLACE FUNCTION pg_catalog.gtsquery_compress(internal)
 RETURNS internal
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$gtsquery_compress$function$;

-- [pg_catalog] gtsquery_consistent(internal, internal, integer, oid, internal)
CREATE OR REPLACE FUNCTION pg_catalog.gtsquery_consistent(internal, internal, integer, oid, internal)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$gtsquery_consistent_oldsig$function$;

-- [pg_catalog] gtsquery_consistent(internal, tsquery, smallint, oid, internal)
CREATE OR REPLACE FUNCTION pg_catalog.gtsquery_consistent(internal, tsquery, smallint, oid, internal)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$gtsquery_consistent$function$;

-- [pg_catalog] gtsquery_penalty(internal, internal, internal)
CREATE OR REPLACE FUNCTION pg_catalog.gtsquery_penalty(internal, internal, internal)
 RETURNS internal
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$gtsquery_penalty$function$;

-- [pg_catalog] gtsquery_picksplit(internal, internal)
CREATE OR REPLACE FUNCTION pg_catalog.gtsquery_picksplit(internal, internal)
 RETURNS internal
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$gtsquery_picksplit$function$;

-- [pg_catalog] gtsquery_same(bigint, bigint, internal)
CREATE OR REPLACE FUNCTION pg_catalog.gtsquery_same(bigint, bigint, internal)
 RETURNS internal
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$gtsquery_same$function$;

-- [pg_catalog] gtsquery_union(internal, internal)
CREATE OR REPLACE FUNCTION pg_catalog.gtsquery_union(internal, internal)
 RETURNS bigint
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$gtsquery_union$function$;

-- [pg_catalog] gtsvector_compress(internal)
CREATE OR REPLACE FUNCTION pg_catalog.gtsvector_compress(internal)
 RETURNS internal
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$gtsvector_compress$function$;

-- [pg_catalog] gtsvector_consistent(internal, gtsvector, integer, oid, internal)
CREATE OR REPLACE FUNCTION pg_catalog.gtsvector_consistent(internal, gtsvector, integer, oid, internal)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$gtsvector_consistent_oldsig$function$;

-- [pg_catalog] gtsvector_consistent(internal, tsvector, smallint, oid, internal)
CREATE OR REPLACE FUNCTION pg_catalog.gtsvector_consistent(internal, tsvector, smallint, oid, internal)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$gtsvector_consistent$function$;

-- [pg_catalog] gtsvector_decompress(internal)
CREATE OR REPLACE FUNCTION pg_catalog.gtsvector_decompress(internal)
 RETURNS internal
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$gtsvector_decompress$function$;

-- [pg_catalog] gtsvector_options(internal)
CREATE OR REPLACE FUNCTION pg_catalog.gtsvector_options(internal)
 RETURNS void
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE
AS $function$gtsvector_options$function$;

-- [pg_catalog] gtsvector_penalty(internal, internal, internal)
CREATE OR REPLACE FUNCTION pg_catalog.gtsvector_penalty(internal, internal, internal)
 RETURNS internal
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$gtsvector_penalty$function$;

-- [pg_catalog] gtsvector_picksplit(internal, internal)
CREATE OR REPLACE FUNCTION pg_catalog.gtsvector_picksplit(internal, internal)
 RETURNS internal
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$gtsvector_picksplit$function$;

-- [pg_catalog] gtsvector_same(gtsvector, gtsvector, internal)
CREATE OR REPLACE FUNCTION pg_catalog.gtsvector_same(gtsvector, gtsvector, internal)
 RETURNS internal
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$gtsvector_same$function$;

-- [pg_catalog] gtsvector_union(internal, internal)
CREATE OR REPLACE FUNCTION pg_catalog.gtsvector_union(internal, internal)
 RETURNS gtsvector
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$gtsvector_union$function$;

-- [pg_catalog] gtsvectorin(cstring)
CREATE OR REPLACE FUNCTION pg_catalog.gtsvectorin(cstring)
 RETURNS gtsvector
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$gtsvectorin$function$;

-- [pg_catalog] gtsvectorout(gtsvector)
CREATE OR REPLACE FUNCTION pg_catalog.gtsvectorout(gtsvector)
 RETURNS cstring
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$gtsvectorout$function$;

-- [pg_catalog] has_any_column_privilege(name, oid, text)
CREATE OR REPLACE FUNCTION pg_catalog.has_any_column_privilege(name, oid, text)
 RETURNS boolean
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT COST 10
AS $function$has_any_column_privilege_name_id$function$;

-- [pg_catalog] has_any_column_privilege(name, text, text)
CREATE OR REPLACE FUNCTION pg_catalog.has_any_column_privilege(name, text, text)
 RETURNS boolean
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT COST 10
AS $function$has_any_column_privilege_name_name$function$;

-- [pg_catalog] has_any_column_privilege(oid, oid, text)
CREATE OR REPLACE FUNCTION pg_catalog.has_any_column_privilege(oid, oid, text)
 RETURNS boolean
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT COST 10
AS $function$has_any_column_privilege_id_id$function$;

-- [pg_catalog] has_any_column_privilege(oid, text)
CREATE OR REPLACE FUNCTION pg_catalog.has_any_column_privilege(oid, text)
 RETURNS boolean
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT COST 10
AS $function$has_any_column_privilege_id$function$;

-- [pg_catalog] has_any_column_privilege(oid, text, text)
CREATE OR REPLACE FUNCTION pg_catalog.has_any_column_privilege(oid, text, text)
 RETURNS boolean
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT COST 10
AS $function$has_any_column_privilege_id_name$function$;

-- [pg_catalog] has_any_column_privilege(text, text)
CREATE OR REPLACE FUNCTION pg_catalog.has_any_column_privilege(text, text)
 RETURNS boolean
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT COST 10
AS $function$has_any_column_privilege_name$function$;

-- [pg_catalog] has_column_privilege(name, oid, smallint, text)
CREATE OR REPLACE FUNCTION pg_catalog.has_column_privilege(name, oid, smallint, text)
 RETURNS boolean
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$has_column_privilege_name_id_attnum$function$;

-- [pg_catalog] has_column_privilege(name, oid, text, text)
CREATE OR REPLACE FUNCTION pg_catalog.has_column_privilege(name, oid, text, text)
 RETURNS boolean
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$has_column_privilege_name_id_name$function$;

-- [pg_catalog] has_column_privilege(name, text, smallint, text)
CREATE OR REPLACE FUNCTION pg_catalog.has_column_privilege(name, text, smallint, text)
 RETURNS boolean
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$has_column_privilege_name_name_attnum$function$;

-- [pg_catalog] has_column_privilege(name, text, text, text)
CREATE OR REPLACE FUNCTION pg_catalog.has_column_privilege(name, text, text, text)
 RETURNS boolean
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$has_column_privilege_name_name_name$function$;

-- [pg_catalog] has_column_privilege(oid, oid, smallint, text)
CREATE OR REPLACE FUNCTION pg_catalog.has_column_privilege(oid, oid, smallint, text)
 RETURNS boolean
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$has_column_privilege_id_id_attnum$function$;

-- [pg_catalog] has_column_privilege(oid, oid, text, text)
CREATE OR REPLACE FUNCTION pg_catalog.has_column_privilege(oid, oid, text, text)
 RETURNS boolean
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$has_column_privilege_id_id_name$function$;

-- [pg_catalog] has_column_privilege(oid, smallint, text)
CREATE OR REPLACE FUNCTION pg_catalog.has_column_privilege(oid, smallint, text)
 RETURNS boolean
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$has_column_privilege_id_attnum$function$;

-- [pg_catalog] has_column_privilege(oid, text, smallint, text)
CREATE OR REPLACE FUNCTION pg_catalog.has_column_privilege(oid, text, smallint, text)
 RETURNS boolean
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$has_column_privilege_id_name_attnum$function$;

-- [pg_catalog] has_column_privilege(oid, text, text)
CREATE OR REPLACE FUNCTION pg_catalog.has_column_privilege(oid, text, text)
 RETURNS boolean
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$has_column_privilege_id_name$function$;

-- [pg_catalog] has_column_privilege(oid, text, text, text)
CREATE OR REPLACE FUNCTION pg_catalog.has_column_privilege(oid, text, text, text)
 RETURNS boolean
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$has_column_privilege_id_name_name$function$;

-- [pg_catalog] has_column_privilege(text, smallint, text)
CREATE OR REPLACE FUNCTION pg_catalog.has_column_privilege(text, smallint, text)
 RETURNS boolean
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$has_column_privilege_name_attnum$function$;

-- [pg_catalog] has_column_privilege(text, text, text)
CREATE OR REPLACE FUNCTION pg_catalog.has_column_privilege(text, text, text)
 RETURNS boolean
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$has_column_privilege_name_name$function$;

-- [pg_catalog] has_database_privilege(name, oid, text)
CREATE OR REPLACE FUNCTION pg_catalog.has_database_privilege(name, oid, text)
 RETURNS boolean
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$has_database_privilege_name_id$function$;

-- [pg_catalog] has_database_privilege(name, text, text)
CREATE OR REPLACE FUNCTION pg_catalog.has_database_privilege(name, text, text)
 RETURNS boolean
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$has_database_privilege_name_name$function$;

-- [pg_catalog] has_database_privilege(oid, oid, text)
CREATE OR REPLACE FUNCTION pg_catalog.has_database_privilege(oid, oid, text)
 RETURNS boolean
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$has_database_privilege_id_id$function$;

-- [pg_catalog] has_database_privilege(oid, text)
CREATE OR REPLACE FUNCTION pg_catalog.has_database_privilege(oid, text)
 RETURNS boolean
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$has_database_privilege_id$function$;

-- [pg_catalog] has_database_privilege(oid, text, text)
CREATE OR REPLACE FUNCTION pg_catalog.has_database_privilege(oid, text, text)
 RETURNS boolean
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$has_database_privilege_id_name$function$;

-- [pg_catalog] has_database_privilege(text, text)
CREATE OR REPLACE FUNCTION pg_catalog.has_database_privilege(text, text)
 RETURNS boolean
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$has_database_privilege_name$function$;

-- [pg_catalog] has_foreign_data_wrapper_privilege(name, oid, text)
CREATE OR REPLACE FUNCTION pg_catalog.has_foreign_data_wrapper_privilege(name, oid, text)
 RETURNS boolean
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$has_foreign_data_wrapper_privilege_name_id$function$;

-- [pg_catalog] has_foreign_data_wrapper_privilege(name, text, text)
CREATE OR REPLACE FUNCTION pg_catalog.has_foreign_data_wrapper_privilege(name, text, text)
 RETURNS boolean
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$has_foreign_data_wrapper_privilege_name_name$function$;

-- [pg_catalog] has_foreign_data_wrapper_privilege(oid, oid, text)
CREATE OR REPLACE FUNCTION pg_catalog.has_foreign_data_wrapper_privilege(oid, oid, text)
 RETURNS boolean
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$has_foreign_data_wrapper_privilege_id_id$function$;

-- [pg_catalog] has_foreign_data_wrapper_privilege(oid, text)
CREATE OR REPLACE FUNCTION pg_catalog.has_foreign_data_wrapper_privilege(oid, text)
 RETURNS boolean
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$has_foreign_data_wrapper_privilege_id$function$;

-- [pg_catalog] has_foreign_data_wrapper_privilege(oid, text, text)
CREATE OR REPLACE FUNCTION pg_catalog.has_foreign_data_wrapper_privilege(oid, text, text)
 RETURNS boolean
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$has_foreign_data_wrapper_privilege_id_name$function$;

-- [pg_catalog] has_foreign_data_wrapper_privilege(text, text)
CREATE OR REPLACE FUNCTION pg_catalog.has_foreign_data_wrapper_privilege(text, text)
 RETURNS boolean
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$has_foreign_data_wrapper_privilege_name$function$;

-- [pg_catalog] has_function_privilege(name, oid, text)
CREATE OR REPLACE FUNCTION pg_catalog.has_function_privilege(name, oid, text)
 RETURNS boolean
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$has_function_privilege_name_id$function$;

-- [pg_catalog] has_function_privilege(name, text, text)
CREATE OR REPLACE FUNCTION pg_catalog.has_function_privilege(name, text, text)
 RETURNS boolean
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$has_function_privilege_name_name$function$;

-- [pg_catalog] has_function_privilege(oid, oid, text)
CREATE OR REPLACE FUNCTION pg_catalog.has_function_privilege(oid, oid, text)
 RETURNS boolean
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$has_function_privilege_id_id$function$;

-- [pg_catalog] has_function_privilege(oid, text)
CREATE OR REPLACE FUNCTION pg_catalog.has_function_privilege(oid, text)
 RETURNS boolean
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$has_function_privilege_id$function$;

-- [pg_catalog] has_function_privilege(oid, text, text)
CREATE OR REPLACE FUNCTION pg_catalog.has_function_privilege(oid, text, text)
 RETURNS boolean
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$has_function_privilege_id_name$function$;

-- [pg_catalog] has_function_privilege(text, text)
CREATE OR REPLACE FUNCTION pg_catalog.has_function_privilege(text, text)
 RETURNS boolean
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$has_function_privilege_name$function$;

-- [pg_catalog] has_language_privilege(name, oid, text)
CREATE OR REPLACE FUNCTION pg_catalog.has_language_privilege(name, oid, text)
 RETURNS boolean
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$has_language_privilege_name_id$function$;

-- [pg_catalog] has_language_privilege(name, text, text)
CREATE OR REPLACE FUNCTION pg_catalog.has_language_privilege(name, text, text)
 RETURNS boolean
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$has_language_privilege_name_name$function$;

-- [pg_catalog] has_language_privilege(oid, oid, text)
CREATE OR REPLACE FUNCTION pg_catalog.has_language_privilege(oid, oid, text)
 RETURNS boolean
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$has_language_privilege_id_id$function$;

-- [pg_catalog] has_language_privilege(oid, text)
CREATE OR REPLACE FUNCTION pg_catalog.has_language_privilege(oid, text)
 RETURNS boolean
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$has_language_privilege_id$function$;

-- [pg_catalog] has_language_privilege(oid, text, text)
CREATE OR REPLACE FUNCTION pg_catalog.has_language_privilege(oid, text, text)
 RETURNS boolean
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$has_language_privilege_id_name$function$;

-- [pg_catalog] has_language_privilege(text, text)
CREATE OR REPLACE FUNCTION pg_catalog.has_language_privilege(text, text)
 RETURNS boolean
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$has_language_privilege_name$function$;

-- [pg_catalog] has_parameter_privilege(name, text, text)
CREATE OR REPLACE FUNCTION pg_catalog.has_parameter_privilege(name, text, text)
 RETURNS boolean
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$has_parameter_privilege_name_name$function$;

-- [pg_catalog] has_parameter_privilege(oid, text, text)
CREATE OR REPLACE FUNCTION pg_catalog.has_parameter_privilege(oid, text, text)
 RETURNS boolean
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$has_parameter_privilege_id_name$function$;

-- [pg_catalog] has_parameter_privilege(text, text)
CREATE OR REPLACE FUNCTION pg_catalog.has_parameter_privilege(text, text)
 RETURNS boolean
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$has_parameter_privilege_name$function$;

-- [pg_catalog] has_schema_privilege(name, oid, text)
CREATE OR REPLACE FUNCTION pg_catalog.has_schema_privilege(name, oid, text)
 RETURNS boolean
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$has_schema_privilege_name_id$function$;

-- [pg_catalog] has_schema_privilege(name, text, text)
CREATE OR REPLACE FUNCTION pg_catalog.has_schema_privilege(name, text, text)
 RETURNS boolean
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$has_schema_privilege_name_name$function$;

-- [pg_catalog] has_schema_privilege(oid, oid, text)
CREATE OR REPLACE FUNCTION pg_catalog.has_schema_privilege(oid, oid, text)
 RETURNS boolean
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$has_schema_privilege_id_id$function$;

-- [pg_catalog] has_schema_privilege(oid, text)
CREATE OR REPLACE FUNCTION pg_catalog.has_schema_privilege(oid, text)
 RETURNS boolean
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$has_schema_privilege_id$function$;

-- [pg_catalog] has_schema_privilege(oid, text, text)
CREATE OR REPLACE FUNCTION pg_catalog.has_schema_privilege(oid, text, text)
 RETURNS boolean
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$has_schema_privilege_id_name$function$;

-- [pg_catalog] has_schema_privilege(text, text)
CREATE OR REPLACE FUNCTION pg_catalog.has_schema_privilege(text, text)
 RETURNS boolean
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$has_schema_privilege_name$function$;

-- [pg_catalog] has_sequence_privilege(name, oid, text)
CREATE OR REPLACE FUNCTION pg_catalog.has_sequence_privilege(name, oid, text)
 RETURNS boolean
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$has_sequence_privilege_name_id$function$;

-- [pg_catalog] has_sequence_privilege(name, text, text)
CREATE OR REPLACE FUNCTION pg_catalog.has_sequence_privilege(name, text, text)
 RETURNS boolean
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$has_sequence_privilege_name_name$function$;

-- [pg_catalog] has_sequence_privilege(oid, oid, text)
CREATE OR REPLACE FUNCTION pg_catalog.has_sequence_privilege(oid, oid, text)
 RETURNS boolean
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$has_sequence_privilege_id_id$function$;

-- [pg_catalog] has_sequence_privilege(oid, text)
CREATE OR REPLACE FUNCTION pg_catalog.has_sequence_privilege(oid, text)
 RETURNS boolean
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$has_sequence_privilege_id$function$;

-- [pg_catalog] has_sequence_privilege(oid, text, text)
CREATE OR REPLACE FUNCTION pg_catalog.has_sequence_privilege(oid, text, text)
 RETURNS boolean
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$has_sequence_privilege_id_name$function$;

-- [pg_catalog] has_sequence_privilege(text, text)
CREATE OR REPLACE FUNCTION pg_catalog.has_sequence_privilege(text, text)
 RETURNS boolean
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$has_sequence_privilege_name$function$;

-- [pg_catalog] has_server_privilege(name, oid, text)
CREATE OR REPLACE FUNCTION pg_catalog.has_server_privilege(name, oid, text)
 RETURNS boolean
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$has_server_privilege_name_id$function$;
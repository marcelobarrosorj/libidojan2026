-- Funcoes de public
-- Gerado: 2026-11-04 13:30

-- email jwt role uid alter_job job_cache_invalidate schedule schedule schedule_in_database unschedule unschedule armor armor crypt dearmor decrypt decrypt_iv digest digest encrypt encrypt_iv gen_random_bytes gen_random_uuid gen_salt gen_salt grant_pg_cron_access grant_pg_graphql_access grant_pg_net_access hmac hmac pg_stat_statements pg_stat_statements_info pg_stat_statements_reset pgp_armor_headers pgp_key_id pgp_pub_decrypt pgp_pub_decrypt pgp_pub_decrypt pgp_pub_decrypt_bytea pgp_pub_decrypt_bytea pgp_pub_decrypt_bytea pgp_pub_encrypt pgp_pub_encrypt pgp_pub_encrypt_bytea pgp_pub_encrypt_bytea pgp_sym_decrypt pgp_sym_decrypt pgp_sym_decrypt_bytea pgp_sym_decrypt_bytea pgp_sym_encrypt pgp_sym_encrypt pgp_sym_encrypt_bytea pgp_sym_encrypt_bytea pgrst_ddl_watch pgrst_drop_watch set_graphql_placeholder uuid_generate_v1 uuid_generate_v1mc uuid_generate_v3 uuid_generate_v4 uuid_generate_v5 uuid_nil uuid_ns_dns uuid_ns_oid uuid_ns_url uuid_ns_x500 graphql _pg_char_max_length _pg_char_octet_length _pg_datetime_precision _pg_expandarray _pg_index_position _pg_interval_type _pg_numeric_precision _pg_numeric_precision_radix _pg_numeric_scale _pg_truetypid _pg_truetypmod _await_response _encode_url_with_params_array _http_collect_response _urlencode_string check_worker_is_up http_collect_response http_delete http_get http_post wait_until_running wake worker_restart RI_FKey_cascade_del RI_FKey_cascade_upd RI_FKey_check_ins RI_FKey_check_upd RI_FKey_noaction_del RI_FKey_noaction_upd RI_FKey_restrict_del RI_FKey_restrict_upd RI_FKey_setdefault_del RI_FKey_setdefault_upd RI_FKey_setnull_del RI_FKey_setnull_upd abbrev abbrev abs abs abs abs abs abs aclcontains acldefault aclexplode aclinsert aclitemeq aclitemin aclitemout aclremove acos acosd acosh age age age age age amvalidate any_in any_out any_value_transfn anyarray_in anyarray_out anyarray_recv anyarray_send anycompatible_in anycompatible_out anycompatiblearray_in anycompatiblearray_out anycompatiblearray_recv anycompatiblearray_send anycompatiblemultirange_in anycompatiblemultirange_out anycompatiblenonarray_in anycompatiblenonarray_out anycompatiblerange_in anycompatiblerange_out anyelement_in anyelement_out anyenum_in anyenum_out anymultirange_in anymultirange_out anynonarray_in anynonarray_out anyrange_in anyrange_out anytextcat area area area areajoinsel areasel array_agg_array_combine array_agg_array_deserialize array_agg_array_finalfn array_agg_array_serialize array_agg_array_transfn array_agg_combine array_agg_deserialize array_agg_finalfn array_agg_serialize array_agg_transfn array_append array_cat array_dims array_eq array_fill array_fill array_ge array_gt array_in array_larger array_le array_length array_lower array_lt array_ndims array_ne array_out array_position array_position array_positions array_prepend array_recv array_remove array_replace array_sample array_send array_shuffle array_smaller array_subscript_handler array_to_json array_to_json array_to_string array_to_string array_to_tsvector array_typanalyze array_unnest_support array_upper arraycontained arraycontains arraycontjoinsel arraycontsel arrayoverlap ascii asin asind asinh atan atan2 atan2d atand atanh bernoulli big5_to_euc_tw big5_to_mic big5_to_utf8 binary_upgrade_add_sub_rel_state binary_upgrade_create_empty_extension binary_upgrade_logical_slot_has_caught_up binary_upgrade_replorigin_advance binary_upgrade_set_missing_value binary_upgrade_set_next_array_pg_type_oid binary_upgrade_set_next_heap_pg_class_oid binary_upgrade_set_next_heap_relfilenode binary_upgrade_set_next_index_pg_class_oid binary_upgrade_set_next_index_relfilenode binary_upgrade_set_next_multirange_array_pg_type_oid binary_upgrade_set_next_multirange_pg_type_oid binary_upgrade_set_next_pg_authid_oid binary_upgrade_set_next_pg_enum_oid binary_upgrade_set_next_pg_tablespace_oid binary_upgrade_set_next_pg_type_oid binary_upgrade_set_next_toast_pg_class_oid binary_upgrade_set_next_toast_relfilenode binary_upgrade_set_record_init_privs bit bit bit bit_count bit_count bit_in bit_length bit_length bit_length bit_out bit_recv bit_send bitand bitcat bitcmp biteq bitge bitgt bitle bitlt bitne bitnot bitor bitshiftleft bitshiftright bittypmodin bittypmodout bitxor bool bool bool_accum bool_accum_inv bool_alltrue bool_anytrue booland_statefunc booleq boolge boolgt boolin boolle boollt boolne boolor_statefunc boolout boolrecv boolsend bound_box box box box box box_above box_above_eq box_add(    job_id bigint, schedule text, command text, database text, username text, active boolean  job_name text, schedule text, command text schedule text, command text job_name text, schedule text, command text, database text, username text, active boolean job_id bigint job_name text bytea bytea, text[], text[] text, text text bytea, bytea, text bytea, bytea, bytea, text bytea, text text, text bytea, bytea, text bytea, bytea, bytea, text integer  text text, integer    bytea, bytea, text text, text, text showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone OUT dealloc bigint, OUT stats_reset timestamp with time zone userid oid, dbid oid, queryid bigint, minmax_only boolean text, OUT key text, OUT value text bytea bytea, bytea bytea, bytea, text bytea, bytea, text, text bytea, bytea bytea, bytea, text bytea, bytea, text, text text, bytea text, bytea, text bytea, bytea bytea, bytea, text bytea, text bytea, text, text bytea, text bytea, text, text text, text text, text, text bytea, text bytea, text, text      namespace uuid, name text  namespace uuid, name text      "operationName" text, query text, variables jsonb, extensions jsonb typid oid, typmod integer typid oid, typmod integer typid oid, typmod integer anyarray, OUT x anyelement, OUT n integer oid, smallint typid oid, mod integer typid oid, typmod integer typid oid, typmod integer typid oid, typmod integer pg_attribute, pg_type pg_attribute, pg_type request_id bigint url text, params_array text[] request_id bigint, async boolean string character varying  request_id bigint, async boolean url text, params jsonb, headers jsonb, timeout_milliseconds integer, body jsonb url text, params jsonb, headers jsonb, timeout_milliseconds integer url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer                cidr inet bigint double precision integer numeric real smallint aclitem[], aclitem "char", oid acl aclitem[], OUT grantor oid, OUT grantee oid, OUT privilege_type text, OUT is_grantable boolean aclitem[], aclitem aclitem, aclitem cstring aclitem aclitem[], aclitem double precision double precision double precision timestamp with time zone timestamp with time zone, timestamp with time zone timestamp without time zone timestamp without time zone, timestamp without time zone xid oid cstring "any" anyelement, anyelement cstring anyarray internal anyarray cstring anycompatible cstring anycompatiblearray internal anycompatiblearray cstring, oid, integer anycompatiblemultirange cstring anycompatiblenonarray cstring, oid, integer anycompatiblerange cstring anyelement cstring anyenum cstring, oid, integer anymultirange cstring anynonarray cstring, oid, integer anyrange anynonarray, text box circle path internal, oid, internal, smallint, internal internal, oid, internal, integer internal, internal bytea, internal internal, anyarray internal internal, anyarray internal, internal bytea, internal internal, anynonarray internal internal, anynonarray anycompatiblearray, anycompatible anycompatiblearray, anycompatiblearray anyarray anyarray, anyarray anyelement, integer[] anyelement, integer[], integer[] anyarray, anyarray anyarray, anyarray cstring, oid, integer anyarray, anyarray anyarray, anyarray anyarray, integer anyarray, integer anyarray, anyarray anyarray anyarray, anyarray anyarray anycompatiblearray, anycompatible anycompatiblearray, anycompatible, integer anycompatiblearray, anycompatible anycompatible, anycompatiblearray internal, oid, integer anycompatiblearray, anycompatible anycompatiblearray, anycompatible, anycompatible anyarray, integer anyarray anyarray anyarray, anyarray internal anyarray anyarray, boolean anyarray, text anyarray, text, text text[] internal internal anyarray, integer anyarray, anyarray anyarray, anyarray internal, oid, internal, smallint, internal internal, oid, internal, integer anyarray, anyarray text double precision double precision double precision double precision double precision, double precision double precision, double precision double precision double precision internal integer, integer, cstring, internal, integer, boolean integer, integer, cstring, internal, integer, boolean integer, integer, cstring, internal, integer, boolean text, oid, "char", pg_lsn text, text, boolean, text, oid[], text[], text[] name text, pg_lsn oid, text, text oid oid oid oid oid oid oid oid oid oid oid oid oid boolean bigint, integer bit, integer, boolean integer, integer bit bytea cstring, oid, integer bit bytea text bit internal, oid, integer bit bit, bit bit varying, bit varying bit, bit bit, bit bit, bit bit, bit bit, bit bit, bit bit, bit bit bit, bit bit, integer bit, integer cstring[] integer bit, bit integer jsonb internal, boolean internal, boolean internal internal boolean, boolean boolean, boolean boolean, boolean boolean, boolean cstring boolean, boolean boolean, boolean boolean, boolean boolean, boolean boolean internal boolean box, box circle point point, point polygon box, box box, box box, point)
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
$function$ CREATE OR REPLACE FUNCTION auth.jwt()
 RETURNS jsonb
 LANGUAGE sql
 STABLE
AS $function$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$function$ CREATE OR REPLACE FUNCTION auth.role()
 RETURNS text
 LANGUAGE sql
 STABLE
AS $function$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$function$ CREATE OR REPLACE FUNCTION auth.uid()
 RETURNS uuid
 LANGUAGE sql
 STABLE
AS $function$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$function$ CREATE OR REPLACE FUNCTION cron.alter_job(job_id bigint, schedule text DEFAULT NULL::text, command text DEFAULT NULL::text, database text DEFAULT NULL::text, username text DEFAULT NULL::text, active boolean DEFAULT NULL::boolean)
 RETURNS void
 LANGUAGE c
AS '$libdir/pg_cron', $function$cron_alter_job$function$ CREATE OR REPLACE FUNCTION cron.job_cache_invalidate()
 RETURNS trigger
 LANGUAGE c
AS '$libdir/pg_cron', $function$cron_job_cache_invalidate$function$ CREATE OR REPLACE FUNCTION cron.schedule(job_name text, schedule text, command text)
 RETURNS bigint
 LANGUAGE c
AS '$libdir/pg_cron', $function$cron_schedule_named$function$ CREATE OR REPLACE FUNCTION cron.schedule(schedule text, command text)
 RETURNS bigint
 LANGUAGE c
 STRICT
AS '$libdir/pg_cron', $function$cron_schedule$function$ CREATE OR REPLACE FUNCTION cron.schedule_in_database(job_name text, schedule text, command text, database text, username text DEFAULT NULL::text, active boolean DEFAULT true)
 RETURNS bigint
 LANGUAGE c
AS '$libdir/pg_cron', $function$cron_schedule_named$function$ CREATE OR REPLACE FUNCTION cron.unschedule(job_id bigint)
 RETURNS boolean
 LANGUAGE c
 STRICT
AS '$libdir/pg_cron', $function$cron_unschedule$function$ CREATE OR REPLACE FUNCTION cron.unschedule(job_name text)
 RETURNS boolean
 LANGUAGE c
 STRICT
AS '$libdir/pg_cron', $function$cron_unschedule_named$function$ CREATE OR REPLACE FUNCTION extensions.armor(bytea)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_armor$function$ CREATE OR REPLACE FUNCTION extensions.armor(bytea, text[], text[])
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_armor$function$ CREATE OR REPLACE FUNCTION extensions.crypt(text, text)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_crypt$function$ CREATE OR REPLACE FUNCTION extensions.dearmor(text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_dearmor$function$ CREATE OR REPLACE FUNCTION extensions.decrypt(bytea, bytea, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_decrypt$function$ CREATE OR REPLACE FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_decrypt_iv$function$ CREATE OR REPLACE FUNCTION extensions.digest(bytea, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_digest$function$ CREATE OR REPLACE FUNCTION extensions.digest(text, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_digest$function$ CREATE OR REPLACE FUNCTION extensions.encrypt(bytea, bytea, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_encrypt$function$ CREATE OR REPLACE FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_encrypt_iv$function$ CREATE OR REPLACE FUNCTION extensions.gen_random_bytes(integer)
 RETURNS bytea
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_random_bytes$function$ CREATE OR REPLACE FUNCTION extensions.gen_random_uuid()
 RETURNS uuid
 LANGUAGE c
 PARALLEL SAFE
AS '$libdir/pgcrypto', $function$pg_random_uuid$function$ CREATE OR REPLACE FUNCTION extensions.gen_salt(text)
 RETURNS text
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_gen_salt$function$ CREATE OR REPLACE FUNCTION extensions.gen_salt(text, integer)
 RETURNS text
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_gen_salt_rounds$function$ CREATE OR REPLACE FUNCTION extensions.grant_pg_cron_access()
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
$function$ CREATE OR REPLACE FUNCTION extensions.grant_pg_graphql_access()
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
$function$ CREATE OR REPLACE FUNCTION extensions.grant_pg_net_access()
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
$function$ CREATE OR REPLACE FUNCTION extensions.hmac(bytea, bytea, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_hmac$function$ CREATE OR REPLACE FUNCTION extensions.hmac(text, text, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_hmac$function$ CREATE OR REPLACE FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone)
 RETURNS SETOF record
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pg_stat_statements', $function$pg_stat_statements_1_11$function$ CREATE OR REPLACE FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone)
 RETURNS record
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pg_stat_statements', $function$pg_stat_statements_info$function$ CREATE OR REPLACE FUNCTION extensions.pg_stat_statements_reset(userid oid DEFAULT 0, dbid oid DEFAULT 0, queryid bigint DEFAULT 0, minmax_only boolean DEFAULT false)
 RETURNS timestamp with time zone
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pg_stat_statements', $function$pg_stat_statements_reset_1_11$function$ CREATE OR REPLACE FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text)
 RETURNS SETOF record
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_armor_headers$function$ CREATE OR REPLACE FUNCTION extensions.pgp_key_id(bytea)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_key_id_w$function$ CREATE OR REPLACE FUNCTION extensions.pgp_pub_decrypt(bytea, bytea)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_pub_decrypt_text$function$ CREATE OR REPLACE FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_pub_decrypt_text$function$ CREATE OR REPLACE FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_pub_decrypt_text$function$ CREATE OR REPLACE FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_pub_decrypt_bytea$function$ CREATE OR REPLACE FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_pub_decrypt_bytea$function$ CREATE OR REPLACE FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_pub_decrypt_bytea$function$ CREATE OR REPLACE FUNCTION extensions.pgp_pub_encrypt(text, bytea)
 RETURNS bytea
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_pub_encrypt_text$function$ CREATE OR REPLACE FUNCTION extensions.pgp_pub_encrypt(text, bytea, text)
 RETURNS bytea
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_pub_encrypt_text$function$ CREATE OR REPLACE FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea)
 RETURNS bytea
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_pub_encrypt_bytea$function$ CREATE OR REPLACE FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text)
 RETURNS bytea
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_pub_encrypt_bytea$function$ CREATE OR REPLACE FUNCTION extensions.pgp_sym_decrypt(bytea, text)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_sym_decrypt_text$function$ CREATE OR REPLACE FUNCTION extensions.pgp_sym_decrypt(bytea, text, text)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_sym_decrypt_text$function$ CREATE OR REPLACE FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_sym_decrypt_bytea$function$ CREATE OR REPLACE FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_sym_decrypt_bytea$function$ CREATE OR REPLACE FUNCTION extensions.pgp_sym_encrypt(text, text)
 RETURNS bytea
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_sym_encrypt_text$function$ CREATE OR REPLACE FUNCTION extensions.pgp_sym_encrypt(text, text, text)
 RETURNS bytea
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_sym_encrypt_text$function$ CREATE OR REPLACE FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text)
 RETURNS bytea
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_sym_encrypt_bytea$function$ CREATE OR REPLACE FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text)
 RETURNS bytea
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_sym_encrypt_bytea$function$ CREATE OR REPLACE FUNCTION extensions.pgrst_ddl_watch()
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
END; $function$ CREATE OR REPLACE FUNCTION extensions.pgrst_drop_watch()
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
END; $function$ CREATE OR REPLACE FUNCTION extensions.set_graphql_placeholder()
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
$function$ CREATE OR REPLACE FUNCTION extensions.uuid_generate_v1()
 RETURNS uuid
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_generate_v1$function$ CREATE OR REPLACE FUNCTION extensions.uuid_generate_v1mc()
 RETURNS uuid
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_generate_v1mc$function$ CREATE OR REPLACE FUNCTION extensions.uuid_generate_v3(namespace uuid, name text)
 RETURNS uuid
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_generate_v3$function$ CREATE OR REPLACE FUNCTION extensions.uuid_generate_v4()
 RETURNS uuid
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_generate_v4$function$ CREATE OR REPLACE FUNCTION extensions.uuid_generate_v5(namespace uuid, name text)
 RETURNS uuid
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_generate_v5$function$ CREATE OR REPLACE FUNCTION extensions.uuid_nil()
 RETURNS uuid
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_nil$function$ CREATE OR REPLACE FUNCTION extensions.uuid_ns_dns()
 RETURNS uuid
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_ns_dns$function$ CREATE OR REPLACE FUNCTION extensions.uuid_ns_oid()
 RETURNS uuid
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_ns_oid$function$ CREATE OR REPLACE FUNCTION extensions.uuid_ns_url()
 RETURNS uuid
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_ns_url$function$ CREATE OR REPLACE FUNCTION extensions.uuid_ns_x500()
 RETURNS uuid
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_ns_x500$function$ CREATE OR REPLACE FUNCTION graphql_public.graphql("operationName" text DEFAULT NULL::text, query text DEFAULT NULL::text, variables jsonb DEFAULT NULL::jsonb, extensions jsonb DEFAULT NULL::jsonb)
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
        $function$ CREATE OR REPLACE FUNCTION information_schema._pg_char_max_length(typid oid, typmod integer)
 RETURNS integer
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT
RETURN CASE WHEN (typmod = '-1'::integer) THEN NULL::integer WHEN (typid = ANY (ARRAY[(1042)::oid, (1043)::oid])) THEN (typmod - 4) WHEN (typid = ANY (ARRAY[(1560)::oid, (1562)::oid])) THEN typmod ELSE NULL::integer END CREATE OR REPLACE FUNCTION information_schema._pg_char_octet_length(typid oid, typmod integer)
 RETURNS integer
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT
RETURN CASE WHEN (typid = ANY (ARRAY[(25)::oid, (1042)::oid, (1043)::oid])) THEN CASE WHEN (typmod = '-1'::integer) THEN (((2)::double precision ^ (30)::double precision))::integer ELSE (information_schema._pg_char_max_length(typid, typmod) * pg_encoding_max_length((SELECT pg_database.encoding FROM pg_database WHERE (pg_database.datname = current_database())))) END ELSE NULL::integer END CREATE OR REPLACE FUNCTION information_schema._pg_datetime_precision(typid oid, typmod integer)
 RETURNS integer
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT
RETURN CASE WHEN (typid = (1082)::oid) THEN 0 WHEN (typid = ANY (ARRAY[(1083)::oid, (1114)::oid, (1184)::oid, (1266)::oid])) THEN CASE WHEN (typmod < 0) THEN 6 ELSE typmod END WHEN (typid = (1186)::oid) THEN CASE WHEN ((typmod < 0) OR ((typmod & 65535) = 65535)) THEN 6 ELSE (typmod & 65535) END ELSE NULL::integer END CREATE OR REPLACE FUNCTION information_schema._pg_expandarray(anyarray, OUT x anyelement, OUT n integer)
 RETURNS SETOF record
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT ROWS 100 SUPPORT array_unnest_support
AS $function$SELECT * FROM pg_catalog.unnest($1) WITH ORDINALITY$function$ CREATE OR REPLACE FUNCTION information_schema._pg_index_position(oid, smallint)
 RETURNS integer
 LANGUAGE sql
 STABLE STRICT
BEGIN ATOMIC
 SELECT (ss.a).n AS n
    FROM ( SELECT information_schema._pg_expandarray(pg_index.indkey) AS a
            FROM pg_index
           WHERE (pg_index.indexrelid = $1)) ss
   WHERE ((ss.a).x = $2);
END CREATE OR REPLACE FUNCTION information_schema._pg_interval_type(typid oid, mod integer)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT
RETURN CASE WHEN (typid = (1186)::oid) THEN upper(SUBSTRING(format_type(typid, mod) SIMILAR 'interval[()0-9]* #"%#"'::text ESCAPE '#'::text)) ELSE NULL::text END CREATE OR REPLACE FUNCTION information_schema._pg_numeric_precision(typid oid, typmod integer)
 RETURNS integer
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT
RETURN CASE typid WHEN 21 THEN 16 WHEN 23 THEN 32 WHEN 20 THEN 64 WHEN 1700 THEN CASE WHEN (typmod = '-1'::integer) THEN NULL::integer ELSE (((typmod - 4) >> 16) & 65535) END WHEN 700 THEN 24 WHEN 701 THEN 53 ELSE NULL::integer END CREATE OR REPLACE FUNCTION information_schema._pg_numeric_precision_radix(typid oid, typmod integer)
 RETURNS integer
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT
RETURN CASE WHEN (typid = ANY (ARRAY[(21)::oid, (23)::oid, (20)::oid, (700)::oid, (701)::oid])) THEN 2 WHEN (typid = (1700)::oid) THEN 10 ELSE NULL::integer END CREATE OR REPLACE FUNCTION information_schema._pg_numeric_scale(typid oid, typmod integer)
 RETURNS integer
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT
RETURN CASE WHEN (typid = ANY (ARRAY[(21)::oid, (23)::oid, (20)::oid])) THEN 0 WHEN (typid = (1700)::oid) THEN CASE WHEN (typmod = '-1'::integer) THEN NULL::integer ELSE ((typmod - 4) & 65535) END ELSE NULL::integer END CREATE OR REPLACE FUNCTION information_schema._pg_truetypid(pg_attribute, pg_type)
 RETURNS oid
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT
RETURN CASE WHEN (($2).typtype = 'd'::"char") THEN ($2).typbasetype ELSE ($1).atttypid END CREATE OR REPLACE FUNCTION information_schema._pg_truetypmod(pg_attribute, pg_type)
 RETURNS integer
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT
RETURN CASE WHEN (($2).typtype = 'd'::"char") THEN ($2).typtypmod ELSE ($1).atttypmod END CREATE OR REPLACE FUNCTION net._await_response(request_id bigint)
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
$function$ CREATE OR REPLACE FUNCTION net._encode_url_with_params_array(url text, params_array text[])
 RETURNS text
 LANGUAGE c
 IMMUTABLE
AS 'pg_net', $function$_encode_url_with_params_array$function$ CREATE OR REPLACE FUNCTION net._http_collect_response(request_id bigint, async boolean DEFAULT true)
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
$function$ CREATE OR REPLACE FUNCTION net._urlencode_string(string character varying)
 RETURNS text
 LANGUAGE c
 IMMUTABLE
AS 'pg_net', $function$_urlencode_string$function$ CREATE OR REPLACE FUNCTION net.check_worker_is_up()
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
$function$ CREATE OR REPLACE FUNCTION net.http_collect_response(request_id bigint, async boolean DEFAULT true)
 RETURNS net.http_response_result
 LANGUAGE plpgsql
AS $function$
begin
  raise notice 'The net.http_collect_response function is deprecated.';
  select net._http_collect_response(request_id, async);
end;
$function$ CREATE OR REPLACE FUNCTION net.http_delete(url text, params jsonb DEFAULT '{}'::jsonb, headers jsonb DEFAULT '{}'::jsonb, timeout_milliseconds integer DEFAULT 5000, body jsonb DEFAULT NULL::jsonb)
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
$function$ CREATE OR REPLACE FUNCTION net.http_get(url text, params jsonb DEFAULT '{}'::jsonb, headers jsonb DEFAULT '{}'::jsonb, timeout_milliseconds integer DEFAULT 5000)
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
$function$ CREATE OR REPLACE FUNCTION net.http_post(url text, body jsonb DEFAULT '{}'::jsonb, params jsonb DEFAULT '{}'::jsonb, headers jsonb DEFAULT '{"Content-Type": "application/json"}'::jsonb, timeout_milliseconds integer DEFAULT 5000)
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
$function$ CREATE OR REPLACE FUNCTION net.wait_until_running()
 RETURNS void
 LANGUAGE c
AS 'pg_net', $function$wait_until_running$function$ CREATE OR REPLACE FUNCTION net.wake()
 RETURNS void
 LANGUAGE c
AS 'pg_net', $function$wake$function$ CREATE OR REPLACE FUNCTION net.worker_restart()
 RETURNS boolean
 LANGUAGE c
AS 'pg_net', $function$worker_restart$function$ CREATE OR REPLACE FUNCTION pg_catalog."RI_FKey_cascade_del"()
 RETURNS trigger
 LANGUAGE internal
 PARALLEL SAFE STRICT
AS $function$RI_FKey_cascade_del$function$ CREATE OR REPLACE FUNCTION pg_catalog."RI_FKey_cascade_upd"()
 RETURNS trigger
 LANGUAGE internal
 PARALLEL SAFE STRICT
AS $function$RI_FKey_cascade_upd$function$ CREATE OR REPLACE FUNCTION pg_catalog."RI_FKey_check_ins"()
 RETURNS trigger
 LANGUAGE internal
 PARALLEL SAFE STRICT
AS $function$RI_FKey_check_ins$function$ CREATE OR REPLACE FUNCTION pg_catalog."RI_FKey_check_upd"()
 RETURNS trigger
 LANGUAGE internal
 PARALLEL SAFE STRICT
AS $function$RI_FKey_check_upd$function$ CREATE OR REPLACE FUNCTION pg_catalog."RI_FKey_noaction_del"()
 RETURNS trigger
 LANGUAGE internal
 PARALLEL SAFE STRICT
AS $function$RI_FKey_noaction_del$function$ CREATE OR REPLACE FUNCTION pg_catalog."RI_FKey_noaction_upd"()
 RETURNS trigger
 LANGUAGE internal
 PARALLEL SAFE STRICT
AS $function$RI_FKey_noaction_upd$function$ CREATE OR REPLACE FUNCTION pg_catalog."RI_FKey_restrict_del"()
 RETURNS trigger
 LANGUAGE internal
 PARALLEL SAFE STRICT
AS $function$RI_FKey_restrict_del$function$ CREATE OR REPLACE FUNCTION pg_catalog."RI_FKey_restrict_upd"()
 RETURNS trigger
 LANGUAGE internal
 PARALLEL SAFE STRICT
AS $function$RI_FKey_restrict_upd$function$ CREATE OR REPLACE FUNCTION pg_catalog."RI_FKey_setdefault_del"()
 RETURNS trigger
 LANGUAGE internal
 PARALLEL SAFE STRICT
AS $function$RI_FKey_setdefault_del$function$ CREATE OR REPLACE FUNCTION pg_catalog."RI_FKey_setdefault_upd"()
 RETURNS trigger
 LANGUAGE internal
 PARALLEL SAFE STRICT
AS $function$RI_FKey_setdefault_upd$function$ CREATE OR REPLACE FUNCTION pg_catalog."RI_FKey_setnull_del"()
 RETURNS trigger
 LANGUAGE internal
 PARALLEL SAFE STRICT
AS $function$RI_FKey_setnull_del$function$ CREATE OR REPLACE FUNCTION pg_catalog."RI_FKey_setnull_upd"()
 RETURNS trigger
 LANGUAGE internal
 PARALLEL SAFE STRICT
AS $function$RI_FKey_setnull_upd$function$ CREATE OR REPLACE FUNCTION pg_catalog.abbrev(cidr)
 RETURNS text
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$cidr_abbrev$function$ CREATE OR REPLACE FUNCTION pg_catalog.abbrev(inet)
 RETURNS text
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$inet_abbrev$function$ CREATE OR REPLACE FUNCTION pg_catalog.abs(bigint)
 RETURNS bigint
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$int8abs$function$ CREATE OR REPLACE FUNCTION pg_catalog.abs(double precision)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$float8abs$function$ CREATE OR REPLACE FUNCTION pg_catalog.abs(integer)
 RETURNS integer
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$int4abs$function$ CREATE OR REPLACE FUNCTION pg_catalog.abs(numeric)
 RETURNS numeric
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$numeric_abs$function$ CREATE OR REPLACE FUNCTION pg_catalog.abs(real)
 RETURNS real
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$float4abs$function$ CREATE OR REPLACE FUNCTION pg_catalog.abs(smallint)
 RETURNS smallint
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$int2abs$function$ CREATE OR REPLACE FUNCTION pg_catalog.aclcontains(aclitem[], aclitem)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$aclcontains$function$ CREATE OR REPLACE FUNCTION pg_catalog.acldefault("char", oid)
 RETURNS aclitem[]
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$acldefault_sql$function$ CREATE OR REPLACE FUNCTION pg_catalog.aclexplode(acl aclitem[], OUT grantor oid, OUT grantee oid, OUT privilege_type text, OUT is_grantable boolean)
 RETURNS SETOF record
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT ROWS 10
AS $function$aclexplode$function$ CREATE OR REPLACE FUNCTION pg_catalog.aclinsert(aclitem[], aclitem)
 RETURNS aclitem[]
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$aclinsert$function$ CREATE OR REPLACE FUNCTION pg_catalog.aclitemeq(aclitem, aclitem)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$aclitem_eq$function$ CREATE OR REPLACE FUNCTION pg_catalog.aclitemin(cstring)
 RETURNS aclitem
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$aclitemin$function$ CREATE OR REPLACE FUNCTION pg_catalog.aclitemout(aclitem)
 RETURNS cstring
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$aclitemout$function$ CREATE OR REPLACE FUNCTION pg_catalog.aclremove(aclitem[], aclitem)
 RETURNS aclitem[]
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$aclremove$function$ CREATE OR REPLACE FUNCTION pg_catalog.acos(double precision)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$dacos$function$ CREATE OR REPLACE FUNCTION pg_catalog.acosd(double precision)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$dacosd$function$ CREATE OR REPLACE FUNCTION pg_catalog.acosh(double precision)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$dacosh$function$ CREATE OR REPLACE FUNCTION pg_catalog.age(timestamp with time zone)
 RETURNS interval
 LANGUAGE sql
 STABLE PARALLEL SAFE STRICT COST 1
RETURN age((CURRENT_DATE)::timestamp with time zone, $1) CREATE OR REPLACE FUNCTION pg_catalog.age(timestamp with time zone, timestamp with time zone)
 RETURNS interval
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$timestamptz_age$function$ CREATE OR REPLACE FUNCTION pg_catalog.age(timestamp without time zone)
 RETURNS interval
 LANGUAGE sql
 STABLE PARALLEL SAFE STRICT COST 1
RETURN age((CURRENT_DATE)::timestamp without time zone, $1) CREATE OR REPLACE FUNCTION pg_catalog.age(timestamp without time zone, timestamp without time zone)
 RETURNS interval
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$timestamp_age$function$ CREATE OR REPLACE FUNCTION pg_catalog.age(xid)
 RETURNS integer
 LANGUAGE internal
 STABLE PARALLEL RESTRICTED STRICT
AS $function$xid_age$function$ CREATE OR REPLACE FUNCTION pg_catalog.amvalidate(oid)
 RETURNS boolean
 LANGUAGE internal
 PARALLEL SAFE STRICT
AS $function$amvalidate$function$ CREATE OR REPLACE FUNCTION pg_catalog.any_in(cstring)
 RETURNS "any"
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$any_in$function$ CREATE OR REPLACE FUNCTION pg_catalog.any_out("any")
 RETURNS cstring
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$any_out$function$ CREATE OR REPLACE FUNCTION pg_catalog.any_value_transfn(anyelement, anyelement)
 RETURNS anyelement
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$any_value_transfn$function$ CREATE OR REPLACE FUNCTION pg_catalog.anyarray_in(cstring)
 RETURNS anyarray
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$anyarray_in$function$ CREATE OR REPLACE FUNCTION pg_catalog.anyarray_out(anyarray)
 RETURNS cstring
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$anyarray_out$function$ CREATE OR REPLACE FUNCTION pg_catalog.anyarray_recv(internal)
 RETURNS anyarray
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$anyarray_recv$function$ CREATE OR REPLACE FUNCTION pg_catalog.anyarray_send(anyarray)
 RETURNS bytea
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$anyarray_send$function$ CREATE OR REPLACE FUNCTION pg_catalog.anycompatible_in(cstring)
 RETURNS anycompatible
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$anycompatible_in$function$ CREATE OR REPLACE FUNCTION pg_catalog.anycompatible_out(anycompatible)
 RETURNS cstring
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$anycompatible_out$function$ CREATE OR REPLACE FUNCTION pg_catalog.anycompatiblearray_in(cstring)
 RETURNS anycompatiblearray
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$anycompatiblearray_in$function$ CREATE OR REPLACE FUNCTION pg_catalog.anycompatiblearray_out(anycompatiblearray)
 RETURNS cstring
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$anycompatiblearray_out$function$ CREATE OR REPLACE FUNCTION pg_catalog.anycompatiblearray_recv(internal)
 RETURNS anycompatiblearray
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$anycompatiblearray_recv$function$ CREATE OR REPLACE FUNCTION pg_catalog.anycompatiblearray_send(anycompatiblearray)
 RETURNS bytea
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$anycompatiblearray_send$function$ CREATE OR REPLACE FUNCTION pg_catalog.anycompatiblemultirange_in(cstring, oid, integer)
 RETURNS anycompatiblemultirange
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$anycompatiblemultirange_in$function$ CREATE OR REPLACE FUNCTION pg_catalog.anycompatiblemultirange_out(anycompatiblemultirange)
 RETURNS cstring
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$anycompatiblemultirange_out$function$ CREATE OR REPLACE FUNCTION pg_catalog.anycompatiblenonarray_in(cstring)
 RETURNS anycompatiblenonarray
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$anycompatiblenonarray_in$function$ CREATE OR REPLACE FUNCTION pg_catalog.anycompatiblenonarray_out(anycompatiblenonarray)
 RETURNS cstring
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$anycompatiblenonarray_out$function$ CREATE OR REPLACE FUNCTION pg_catalog.anycompatiblerange_in(cstring, oid, integer)
 RETURNS anycompatiblerange
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$anycompatiblerange_in$function$ CREATE OR REPLACE FUNCTION pg_catalog.anycompatiblerange_out(anycompatiblerange)
 RETURNS cstring
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$anycompatiblerange_out$function$ CREATE OR REPLACE FUNCTION pg_catalog.anyelement_in(cstring)
 RETURNS anyelement
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$anyelement_in$function$ CREATE OR REPLACE FUNCTION pg_catalog.anyelement_out(anyelement)
 RETURNS cstring
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$anyelement_out$function$ CREATE OR REPLACE FUNCTION pg_catalog.anyenum_in(cstring)
 RETURNS anyenum
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$anyenum_in$function$ CREATE OR REPLACE FUNCTION pg_catalog.anyenum_out(anyenum)
 RETURNS cstring
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$anyenum_out$function$ CREATE OR REPLACE FUNCTION pg_catalog.anymultirange_in(cstring, oid, integer)
 RETURNS anymultirange
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$anymultirange_in$function$ CREATE OR REPLACE FUNCTION pg_catalog.anymultirange_out(anymultirange)
 RETURNS cstring
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$anymultirange_out$function$ CREATE OR REPLACE FUNCTION pg_catalog.anynonarray_in(cstring)
 RETURNS anynonarray
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$anynonarray_in$function$ CREATE OR REPLACE FUNCTION pg_catalog.anynonarray_out(anynonarray)
 RETURNS cstring
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$anynonarray_out$function$ CREATE OR REPLACE FUNCTION pg_catalog.anyrange_in(cstring, oid, integer)
 RETURNS anyrange
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$anyrange_in$function$ CREATE OR REPLACE FUNCTION pg_catalog.anyrange_out(anyrange)
 RETURNS cstring
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$anyrange_out$function$ CREATE OR REPLACE FUNCTION pg_catalog.anytextcat(anynonarray, text)
 RETURNS text
 LANGUAGE sql
 STABLE PARALLEL SAFE STRICT COST 1
AS $function$select $1::pg_catalog.text operator(pg_catalog.||) $2$function$ CREATE OR REPLACE FUNCTION pg_catalog.area(box)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$box_area$function$ CREATE OR REPLACE FUNCTION pg_catalog.area(circle)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$circle_area$function$ CREATE OR REPLACE FUNCTION pg_catalog.area(path)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$path_area$function$ CREATE OR REPLACE FUNCTION pg_catalog.areajoinsel(internal, oid, internal, smallint, internal)
 RETURNS double precision
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$areajoinsel$function$ CREATE OR REPLACE FUNCTION pg_catalog.areasel(internal, oid, internal, integer)
 RETURNS double precision
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$areasel$function$ CREATE OR REPLACE FUNCTION pg_catalog.array_agg_array_combine(internal, internal)
 RETURNS internal
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE
AS $function$array_agg_array_combine$function$ CREATE OR REPLACE FUNCTION pg_catalog.array_agg_array_deserialize(bytea, internal)
 RETURNS internal
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$array_agg_array_deserialize$function$ CREATE OR REPLACE FUNCTION pg_catalog.array_agg_array_finalfn(internal, anyarray)
 RETURNS anyarray
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE
AS $function$array_agg_array_finalfn$function$ CREATE OR REPLACE FUNCTION pg_catalog.array_agg_array_serialize(internal)
 RETURNS bytea
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$array_agg_array_serialize$function$ CREATE OR REPLACE FUNCTION pg_catalog.array_agg_array_transfn(internal, anyarray)
 RETURNS internal
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE
AS $function$array_agg_array_transfn$function$ CREATE OR REPLACE FUNCTION pg_catalog.array_agg_combine(internal, internal)
 RETURNS internal
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE
AS $function$array_agg_combine$function$ CREATE OR REPLACE FUNCTION pg_catalog.array_agg_deserialize(bytea, internal)
 RETURNS internal
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$array_agg_deserialize$function$ CREATE OR REPLACE FUNCTION pg_catalog.array_agg_finalfn(internal, anynonarray)
 RETURNS anyarray
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE
AS $function$array_agg_finalfn$function$ CREATE OR REPLACE FUNCTION pg_catalog.array_agg_serialize(internal)
 RETURNS bytea
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$array_agg_serialize$function$ CREATE OR REPLACE FUNCTION pg_catalog.array_agg_transfn(internal, anynonarray)
 RETURNS internal
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE
AS $function$array_agg_transfn$function$ CREATE OR REPLACE FUNCTION pg_catalog.array_append(anycompatiblearray, anycompatible)
 RETURNS anycompatiblearray
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE
AS $function$array_append$function$ CREATE OR REPLACE FUNCTION pg_catalog.array_cat(anycompatiblearray, anycompatiblearray)
 RETURNS anycompatiblearray
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE
AS $function$array_cat$function$ CREATE OR REPLACE FUNCTION pg_catalog.array_dims(anyarray)
 RETURNS text
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$array_dims$function$ CREATE OR REPLACE FUNCTION pg_catalog.array_eq(anyarray, anyarray)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$array_eq$function$ CREATE OR REPLACE FUNCTION pg_catalog.array_fill(anyelement, integer[])
 RETURNS anyarray
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE
AS $function$array_fill$function$ CREATE OR REPLACE FUNCTION pg_catalog.array_fill(anyelement, integer[], integer[])
 RETURNS anyarray
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE
AS $function$array_fill_with_lower_bounds$function$ CREATE OR REPLACE FUNCTION pg_catalog.array_ge(anyarray, anyarray)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$array_ge$function$ CREATE OR REPLACE FUNCTION pg_catalog.array_gt(anyarray, anyarray)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$array_gt$function$ CREATE OR REPLACE FUNCTION pg_catalog.array_in(cstring, oid, integer)
 RETURNS anyarray
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$array_in$function$ CREATE OR REPLACE FUNCTION pg_catalog.array_larger(anyarray, anyarray)
 RETURNS anyarray
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$array_larger$function$ CREATE OR REPLACE FUNCTION pg_catalog.array_le(anyarray, anyarray)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$array_le$function$ CREATE OR REPLACE FUNCTION pg_catalog.array_length(anyarray, integer)
 RETURNS integer
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$array_length$function$ CREATE OR REPLACE FUNCTION pg_catalog.array_lower(anyarray, integer)
 RETURNS integer
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$array_lower$function$ CREATE OR REPLACE FUNCTION pg_catalog.array_lt(anyarray, anyarray)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$array_lt$function$ CREATE OR REPLACE FUNCTION pg_catalog.array_ndims(anyarray)
 RETURNS integer
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$array_ndims$function$ CREATE OR REPLACE FUNCTION pg_catalog.array_ne(anyarray, anyarray)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$array_ne$function$ CREATE OR REPLACE FUNCTION pg_catalog.array_out(anyarray)
 RETURNS cstring
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$array_out$function$ CREATE OR REPLACE FUNCTION pg_catalog.array_position(anycompatiblearray, anycompatible)
 RETURNS integer
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE
AS $function$array_position$function$ CREATE OR REPLACE FUNCTION pg_catalog.array_position(anycompatiblearray, anycompatible, integer)
 RETURNS integer
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE
AS $function$array_position_start$function$ CREATE OR REPLACE FUNCTION pg_catalog.array_positions(anycompatiblearray, anycompatible)
 RETURNS integer[]
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE
AS $function$array_positions$function$ CREATE OR REPLACE FUNCTION pg_catalog.array_prepend(anycompatible, anycompatiblearray)
 RETURNS anycompatiblearray
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE
AS $function$array_prepend$function$ CREATE OR REPLACE FUNCTION pg_catalog.array_recv(internal, oid, integer)
 RETURNS anyarray
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$array_recv$function$ CREATE OR REPLACE FUNCTION pg_catalog.array_remove(anycompatiblearray, anycompatible)
 RETURNS anycompatiblearray
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE
AS $function$array_remove$function$ CREATE OR REPLACE FUNCTION pg_catalog.array_replace(anycompatiblearray, anycompatible, anycompatible)
 RETURNS anycompatiblearray
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE
AS $function$array_replace$function$ CREATE OR REPLACE FUNCTION pg_catalog.array_sample(anyarray, integer)
 RETURNS anyarray
 LANGUAGE internal
 PARALLEL SAFE STRICT
AS $function$array_sample$function$ CREATE OR REPLACE FUNCTION pg_catalog.array_send(anyarray)
 RETURNS bytea
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$array_send$function$ CREATE OR REPLACE FUNCTION pg_catalog.array_shuffle(anyarray)
 RETURNS anyarray
 LANGUAGE internal
 PARALLEL SAFE STRICT
AS $function$array_shuffle$function$ CREATE OR REPLACE FUNCTION pg_catalog.array_smaller(anyarray, anyarray)
 RETURNS anyarray
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$array_smaller$function$ CREATE OR REPLACE FUNCTION pg_catalog.array_subscript_handler(internal)
 RETURNS internal
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$array_subscript_handler$function$ CREATE OR REPLACE FUNCTION pg_catalog.array_to_json(anyarray)
 RETURNS json
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$array_to_json$function$ CREATE OR REPLACE FUNCTION pg_catalog.array_to_json(anyarray, boolean)
 RETURNS json
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$array_to_json_pretty$function$ CREATE OR REPLACE FUNCTION pg_catalog.array_to_string(anyarray, text)
 RETURNS text
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$array_to_text$function$ CREATE OR REPLACE FUNCTION pg_catalog.array_to_string(anyarray, text, text)
 RETURNS text
 LANGUAGE internal
 STABLE PARALLEL SAFE
AS $function$array_to_text_null$function$ CREATE OR REPLACE FUNCTION pg_catalog.array_to_tsvector(text[])
 RETURNS tsvector
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$array_to_tsvector$function$ CREATE OR REPLACE FUNCTION pg_catalog.array_typanalyze(internal)
 RETURNS boolean
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$array_typanalyze$function$ CREATE OR REPLACE FUNCTION pg_catalog.array_unnest_support(internal)
 RETURNS internal
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$array_unnest_support$function$ CREATE OR REPLACE FUNCTION pg_catalog.array_upper(anyarray, integer)
 RETURNS integer
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$array_upper$function$ CREATE OR REPLACE FUNCTION pg_catalog.arraycontained(anyarray, anyarray)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$arraycontained$function$ CREATE OR REPLACE FUNCTION pg_catalog.arraycontains(anyarray, anyarray)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$arraycontains$function$ CREATE OR REPLACE FUNCTION pg_catalog.arraycontjoinsel(internal, oid, internal, smallint, internal)
 RETURNS double precision
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$arraycontjoinsel$function$ CREATE OR REPLACE FUNCTION pg_catalog.arraycontsel(internal, oid, internal, integer)
 RETURNS double precision
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$arraycontsel$function$ CREATE OR REPLACE FUNCTION pg_catalog.arrayoverlap(anyarray, anyarray)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$arrayoverlap$function$ CREATE OR REPLACE FUNCTION pg_catalog.ascii(text)
 RETURNS integer
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$ascii$function$ CREATE OR REPLACE FUNCTION pg_catalog.asin(double precision)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$dasin$function$ CREATE OR REPLACE FUNCTION pg_catalog.asind(double precision)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$dasind$function$ CREATE OR REPLACE FUNCTION pg_catalog.asinh(double precision)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$dasinh$function$ CREATE OR REPLACE FUNCTION pg_catalog.atan(double precision)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$datan$function$ CREATE OR REPLACE FUNCTION pg_catalog.atan2(double precision, double precision)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$datan2$function$ CREATE OR REPLACE FUNCTION pg_catalog.atan2d(double precision, double precision)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$datan2d$function$ CREATE OR REPLACE FUNCTION pg_catalog.atand(double precision)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$datand$function$ CREATE OR REPLACE FUNCTION pg_catalog.atanh(double precision)
 RETURNS double precision
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$datanh$function$ CREATE OR REPLACE FUNCTION pg_catalog.bernoulli(internal)
 RETURNS tsm_handler
 LANGUAGE internal
 PARALLEL SAFE STRICT
AS $function$tsm_bernoulli_handler$function$ CREATE OR REPLACE FUNCTION pg_catalog.big5_to_euc_tw(integer, integer, cstring, internal, integer, boolean)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/euc_tw_and_big5', $function$big5_to_euc_tw$function$ CREATE OR REPLACE FUNCTION pg_catalog.big5_to_mic(integer, integer, cstring, internal, integer, boolean)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/euc_tw_and_big5', $function$big5_to_mic$function$ CREATE OR REPLACE FUNCTION pg_catalog.big5_to_utf8(integer, integer, cstring, internal, integer, boolean)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/utf8_and_big5', $function$big5_to_utf8$function$ CREATE OR REPLACE FUNCTION pg_catalog.binary_upgrade_add_sub_rel_state(text, oid, "char", pg_lsn)
 RETURNS void
 LANGUAGE internal
AS $function$binary_upgrade_add_sub_rel_state$function$ CREATE OR REPLACE FUNCTION pg_catalog.binary_upgrade_create_empty_extension(text, text, boolean, text, oid[], text[], text[])
 RETURNS void
 LANGUAGE internal
AS $function$binary_upgrade_create_empty_extension$function$ CREATE OR REPLACE FUNCTION pg_catalog.binary_upgrade_logical_slot_has_caught_up(name)
 RETURNS boolean
 LANGUAGE internal
 STRICT
AS $function$binary_upgrade_logical_slot_has_caught_up$function$ CREATE OR REPLACE FUNCTION pg_catalog.binary_upgrade_replorigin_advance(text, pg_lsn)
 RETURNS void
 LANGUAGE internal
AS $function$binary_upgrade_replorigin_advance$function$ CREATE OR REPLACE FUNCTION pg_catalog.binary_upgrade_set_missing_value(oid, text, text)
 RETURNS void
 LANGUAGE internal
 STRICT
AS $function$binary_upgrade_set_missing_value$function$ CREATE OR REPLACE FUNCTION pg_catalog.binary_upgrade_set_next_array_pg_type_oid(oid)
 RETURNS void
 LANGUAGE internal
 PARALLEL RESTRICTED STRICT
AS $function$binary_upgrade_set_next_array_pg_type_oid$function$ CREATE OR REPLACE FUNCTION pg_catalog.binary_upgrade_set_next_heap_pg_class_oid(oid)
 RETURNS void
 LANGUAGE internal
 PARALLEL RESTRICTED STRICT
AS $function$binary_upgrade_set_next_heap_pg_class_oid$function$ CREATE OR REPLACE FUNCTION pg_catalog.binary_upgrade_set_next_heap_relfilenode(oid)
 RETURNS void
 LANGUAGE internal
 STRICT
AS $function$binary_upgrade_set_next_heap_relfilenode$function$ CREATE OR REPLACE FUNCTION pg_catalog.binary_upgrade_set_next_index_pg_class_oid(oid)
 RETURNS void
 LANGUAGE internal
 PARALLEL RESTRICTED STRICT
AS $function$binary_upgrade_set_next_index_pg_class_oid$function$ CREATE OR REPLACE FUNCTION pg_catalog.binary_upgrade_set_next_index_relfilenode(oid)
 RETURNS void
 LANGUAGE internal
 STRICT
AS $function$binary_upgrade_set_next_index_relfilenode$function$ CREATE OR REPLACE FUNCTION pg_catalog.binary_upgrade_set_next_multirange_array_pg_type_oid(oid)
 RETURNS void
 LANGUAGE internal
 PARALLEL RESTRICTED STRICT
AS $function$binary_upgrade_set_next_multirange_array_pg_type_oid$function$ CREATE OR REPLACE FUNCTION pg_catalog.binary_upgrade_set_next_multirange_pg_type_oid(oid)
 RETURNS void
 LANGUAGE internal
 PARALLEL RESTRICTED STRICT
AS $function$binary_upgrade_set_next_multirange_pg_type_oid$function$ CREATE OR REPLACE FUNCTION pg_catalog.binary_upgrade_set_next_pg_authid_oid(oid)
 RETURNS void
 LANGUAGE internal
 PARALLEL RESTRICTED STRICT
AS $function$binary_upgrade_set_next_pg_authid_oid$function$ CREATE OR REPLACE FUNCTION pg_catalog.binary_upgrade_set_next_pg_enum_oid(oid)
 RETURNS void
 LANGUAGE internal
 PARALLEL RESTRICTED STRICT
AS $function$binary_upgrade_set_next_pg_enum_oid$function$ CREATE OR REPLACE FUNCTION pg_catalog.binary_upgrade_set_next_pg_tablespace_oid(oid)
 RETURNS void
 LANGUAGE internal
 STRICT
AS $function$binary_upgrade_set_next_pg_tablespace_oid$function$ CREATE OR REPLACE FUNCTION pg_catalog.binary_upgrade_set_next_pg_type_oid(oid)
 RETURNS void
 LANGUAGE internal
 PARALLEL RESTRICTED STRICT
AS $function$binary_upgrade_set_next_pg_type_oid$function$ CREATE OR REPLACE FUNCTION pg_catalog.binary_upgrade_set_next_toast_pg_class_oid(oid)
 RETURNS void
 LANGUAGE internal
 PARALLEL RESTRICTED STRICT
AS $function$binary_upgrade_set_next_toast_pg_class_oid$function$ CREATE OR REPLACE FUNCTION pg_catalog.binary_upgrade_set_next_toast_relfilenode(oid)
 RETURNS void
 LANGUAGE internal
 STRICT
AS $function$binary_upgrade_set_next_toast_relfilenode$function$ CREATE OR REPLACE FUNCTION pg_catalog.binary_upgrade_set_record_init_privs(boolean)
 RETURNS void
 LANGUAGE internal
 PARALLEL RESTRICTED STRICT
AS $function$binary_upgrade_set_record_init_privs$function$ CREATE OR REPLACE FUNCTION pg_catalog."bit"(bigint, integer)
 RETURNS bit
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$bitfromint8$function$ CREATE OR REPLACE FUNCTION pg_catalog."bit"(bit, integer, boolean)
 RETURNS bit
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$bit$function$ CREATE OR REPLACE FUNCTION pg_catalog."bit"(integer, integer)
 RETURNS bit
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$bitfromint4$function$ CREATE OR REPLACE FUNCTION pg_catalog.bit_count(bit)
 RETURNS bigint
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$bit_bit_count$function$ CREATE OR REPLACE FUNCTION pg_catalog.bit_count(bytea)
 RETURNS bigint
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$bytea_bit_count$function$ CREATE OR REPLACE FUNCTION pg_catalog.bit_in(cstring, oid, integer)
 RETURNS bit
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$bit_in$function$ CREATE OR REPLACE FUNCTION pg_catalog.bit_length(bit)
 RETURNS integer
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 1
RETURN length($1) CREATE OR REPLACE FUNCTION pg_catalog.bit_length(bytea)
 RETURNS integer
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 1
RETURN (octet_length($1) * 8) CREATE OR REPLACE FUNCTION pg_catalog.bit_length(text)
 RETURNS integer
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 1
RETURN (octet_length($1) * 8) CREATE OR REPLACE FUNCTION pg_catalog.bit_out(bit)
 RETURNS cstring
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$bit_out$function$ CREATE OR REPLACE FUNCTION pg_catalog.bit_recv(internal, oid, integer)
 RETURNS bit
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$bit_recv$function$ CREATE OR REPLACE FUNCTION pg_catalog.bit_send(bit)
 RETURNS bytea
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$bit_send$function$ CREATE OR REPLACE FUNCTION pg_catalog.bitand(bit, bit)
 RETURNS bit
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$bit_and$function$ CREATE OR REPLACE FUNCTION pg_catalog.bitcat(bit varying, bit varying)
 RETURNS bit varying
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$bitcat$function$ CREATE OR REPLACE FUNCTION pg_catalog.bitcmp(bit, bit)
 RETURNS integer
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$bitcmp$function$ CREATE OR REPLACE FUNCTION pg_catalog.biteq(bit, bit)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$biteq$function$ CREATE OR REPLACE FUNCTION pg_catalog.bitge(bit, bit)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$bitge$function$ CREATE OR REPLACE FUNCTION pg_catalog.bitgt(bit, bit)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$bitgt$function$ CREATE OR REPLACE FUNCTION pg_catalog.bitle(bit, bit)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$bitle$function$ CREATE OR REPLACE FUNCTION pg_catalog.bitlt(bit, bit)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$bitlt$function$ CREATE OR REPLACE FUNCTION pg_catalog.bitne(bit, bit)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$bitne$function$ CREATE OR REPLACE FUNCTION pg_catalog.bitnot(bit)
 RETURNS bit
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$bitnot$function$ CREATE OR REPLACE FUNCTION pg_catalog.bitor(bit, bit)
 RETURNS bit
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$bit_or$function$ CREATE OR REPLACE FUNCTION pg_catalog.bitshiftleft(bit, integer)
 RETURNS bit
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$bitshiftleft$function$ CREATE OR REPLACE FUNCTION pg_catalog.bitshiftright(bit, integer)
 RETURNS bit
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$bitshiftright$function$ CREATE OR REPLACE FUNCTION pg_catalog.bittypmodin(cstring[])
 RETURNS integer
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$bittypmodin$function$ CREATE OR REPLACE FUNCTION pg_catalog.bittypmodout(integer)
 RETURNS cstring
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$bittypmodout$function$ CREATE OR REPLACE FUNCTION pg_catalog.bitxor(bit, bit)
 RETURNS bit
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$bitxor$function$ CREATE OR REPLACE FUNCTION pg_catalog.bool(integer)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$int4_bool$function$ CREATE OR REPLACE FUNCTION pg_catalog.bool(jsonb)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$jsonb_bool$function$ CREATE OR REPLACE FUNCTION pg_catalog.bool_accum(internal, boolean)
 RETURNS internal
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE
AS $function$bool_accum$function$ CREATE OR REPLACE FUNCTION pg_catalog.bool_accum_inv(internal, boolean)
 RETURNS internal
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE
AS $function$bool_accum_inv$function$ CREATE OR REPLACE FUNCTION pg_catalog.bool_alltrue(internal)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$bool_alltrue$function$ CREATE OR REPLACE FUNCTION pg_catalog.bool_anytrue(internal)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$bool_anytrue$function$ CREATE OR REPLACE FUNCTION pg_catalog.booland_statefunc(boolean, boolean)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$booland_statefunc$function$ CREATE OR REPLACE FUNCTION pg_catalog.booleq(boolean, boolean)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$booleq$function$ CREATE OR REPLACE FUNCTION pg_catalog.boolge(boolean, boolean)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$boolge$function$ CREATE OR REPLACE FUNCTION pg_catalog.boolgt(boolean, boolean)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$boolgt$function$ CREATE OR REPLACE FUNCTION pg_catalog.boolin(cstring)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$boolin$function$ CREATE OR REPLACE FUNCTION pg_catalog.boolle(boolean, boolean)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$boolle$function$ CREATE OR REPLACE FUNCTION pg_catalog.boollt(boolean, boolean)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$boollt$function$ CREATE OR REPLACE FUNCTION pg_catalog.boolne(boolean, boolean)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT LEAKPROOF
AS $function$boolne$function$ CREATE OR REPLACE FUNCTION pg_catalog.boolor_statefunc(boolean, boolean)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$boolor_statefunc$function$ CREATE OR REPLACE FUNCTION pg_catalog.boolout(boolean)
 RETURNS cstring
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$boolout$function$ CREATE OR REPLACE FUNCTION pg_catalog.boolrecv(internal)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$boolrecv$function$ CREATE OR REPLACE FUNCTION pg_catalog.boolsend(boolean)
 RETURNS bytea
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$boolsend$function$ CREATE OR REPLACE FUNCTION pg_catalog.bound_box(box, box)
 RETURNS box
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$boxes_bound_box$function$ CREATE OR REPLACE FUNCTION pg_catalog.box(circle)
 RETURNS box
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$circle_box$function$ CREATE OR REPLACE FUNCTION pg_catalog.box(point)
 RETURNS box
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$point_box$function$ CREATE OR REPLACE FUNCTION pg_catalog.box(point, point)
 RETURNS box
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$points_box$function$ CREATE OR REPLACE FUNCTION pg_catalog.box(polygon)
 RETURNS box
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$poly_box$function$ CREATE OR REPLACE FUNCTION pg_catalog.box_above(box, box)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$box_above$function$ CREATE OR REPLACE FUNCTION pg_catalog.box_above_eq(box, box)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$box_above_eq$function$ CREATE OR REPLACE FUNCTION pg_catalog.box_add(box, point)
 RETURNS box
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$box_add$function$;
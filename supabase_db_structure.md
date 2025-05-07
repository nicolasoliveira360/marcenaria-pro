# Supabase Database Structure

_Generated on 2025-05-07 00:10:07_

## Overview

| Schema | Tables |
|---|---|
| **auth** | 16 |
| **public** | 16 |
| **realtime** | 3 |
| **storage** | 5 |
| **vault** | 2 |


## Schema: `auth`

### Table: `audit_log_entries`

| # | Column | Type | Nullable | Default | Constraints | Comment |
|---|---|---|---|---|---|---|
| 1 | `instance_id` | uuid | YES | &nbsp; | &nbsp; | &nbsp; |
| 2 | `id` | uuid | NO | &nbsp; | PRIMARY KEY | &nbsp; |
| 3 | `payload` | json | YES | &nbsp; | &nbsp; | &nbsp; |
| 4 | `created_at` | timestamp with time zone | YES | &nbsp; | &nbsp; | &nbsp; |
| 5 | `ip_address` | character varying(64) | NO | ''::character varying | &nbsp; | &nbsp; |

### Table: `flow_state`

| # | Column | Type | Nullable | Default | Constraints | Comment |
|---|---|---|---|---|---|---|
| 1 | `id` | uuid | NO | &nbsp; | PRIMARY KEY | &nbsp; |
| 2 | `user_id` | uuid | YES | &nbsp; | &nbsp; | &nbsp; |
| 3 | `auth_code` | text | NO | &nbsp; | &nbsp; | &nbsp; |
| 4 | `code_challenge_method` | USER-DEFINED | NO | &nbsp; | &nbsp; | &nbsp; |
| 5 | `code_challenge` | text | NO | &nbsp; | &nbsp; | &nbsp; |
| 6 | `provider_type` | text | NO | &nbsp; | &nbsp; | &nbsp; |
| 7 | `provider_access_token` | text | YES | &nbsp; | &nbsp; | &nbsp; |
| 8 | `provider_refresh_token` | text | YES | &nbsp; | &nbsp; | &nbsp; |
| 9 | `created_at` | timestamp with time zone | YES | &nbsp; | &nbsp; | &nbsp; |
| 10 | `updated_at` | timestamp with time zone | YES | &nbsp; | &nbsp; | &nbsp; |
| 11 | `authentication_method` | text | NO | &nbsp; | &nbsp; | &nbsp; |
| 12 | `auth_code_issued_at` | timestamp with time zone | YES | &nbsp; | &nbsp; | &nbsp; |

### Table: `identities`

| # | Column | Type | Nullable | Default | Constraints | Comment |
|---|---|---|---|---|---|---|
| 1 | `provider_id` | text | NO | &nbsp; | UNIQUE | &nbsp; |
| 2 | `user_id` | uuid | NO | &nbsp; | FOREIGN KEY | &nbsp; |
| 3 | `identity_data` | jsonb | NO | &nbsp; | &nbsp; | &nbsp; |
| 4 | `provider` | text | NO | &nbsp; | UNIQUE | &nbsp; |
| 5 | `last_sign_in_at` | timestamp with time zone | YES | &nbsp; | &nbsp; | &nbsp; |
| 6 | `created_at` | timestamp with time zone | YES | &nbsp; | &nbsp; | &nbsp; |
| 7 | `updated_at` | timestamp with time zone | YES | &nbsp; | &nbsp; | &nbsp; |
| 8 | `email` | text | YES | &nbsp; | &nbsp; | Auth: Email is a generated column that references the optional email property in the identity_data |
| 9 | `id` | uuid | NO | gen_random_uuid() | PRIMARY KEY | &nbsp; |

### Table: `instances`

| # | Column | Type | Nullable | Default | Constraints | Comment |
|---|---|---|---|---|---|---|
| 1 | `id` | uuid | NO | &nbsp; | PRIMARY KEY | &nbsp; |
| 2 | `uuid` | uuid | YES | &nbsp; | &nbsp; | &nbsp; |
| 3 | `raw_base_config` | text | YES | &nbsp; | &nbsp; | &nbsp; |
| 4 | `created_at` | timestamp with time zone | YES | &nbsp; | &nbsp; | &nbsp; |
| 5 | `updated_at` | timestamp with time zone | YES | &nbsp; | &nbsp; | &nbsp; |

### Table: `mfa_amr_claims`

| # | Column | Type | Nullable | Default | Constraints | Comment |
|---|---|---|---|---|---|---|
| 1 | `session_id` | uuid | NO | &nbsp; | FOREIGN KEY, UNIQUE | &nbsp; |
| 2 | `created_at` | timestamp with time zone | NO | &nbsp; | &nbsp; | &nbsp; |
| 3 | `updated_at` | timestamp with time zone | NO | &nbsp; | &nbsp; | &nbsp; |
| 4 | `authentication_method` | text | NO | &nbsp; | UNIQUE | &nbsp; |
| 5 | `id` | uuid | NO | &nbsp; | PRIMARY KEY | &nbsp; |

### Table: `mfa_challenges`

| # | Column | Type | Nullable | Default | Constraints | Comment |
|---|---|---|---|---|---|---|
| 1 | `id` | uuid | NO | &nbsp; | PRIMARY KEY | &nbsp; |
| 2 | `factor_id` | uuid | NO | &nbsp; | FOREIGN KEY | &nbsp; |
| 3 | `created_at` | timestamp with time zone | NO | &nbsp; | &nbsp; | &nbsp; |
| 4 | `verified_at` | timestamp with time zone | YES | &nbsp; | &nbsp; | &nbsp; |
| 5 | `ip_address` | inet | NO | &nbsp; | &nbsp; | &nbsp; |
| 6 | `otp_code` | text | YES | &nbsp; | &nbsp; | &nbsp; |
| 7 | `web_authn_session_data` | jsonb | YES | &nbsp; | &nbsp; | &nbsp; |

### Table: `mfa_factors`

| # | Column | Type | Nullable | Default | Constraints | Comment |
|---|---|---|---|---|---|---|
| 1 | `id` | uuid | NO | &nbsp; | PRIMARY KEY | &nbsp; |
| 2 | `user_id` | uuid | NO | &nbsp; | FOREIGN KEY | &nbsp; |
| 3 | `friendly_name` | text | YES | &nbsp; | &nbsp; | &nbsp; |
| 4 | `factor_type` | USER-DEFINED | NO | &nbsp; | &nbsp; | &nbsp; |
| 5 | `status` | USER-DEFINED | NO | &nbsp; | &nbsp; | &nbsp; |
| 6 | `created_at` | timestamp with time zone | NO | &nbsp; | &nbsp; | &nbsp; |
| 7 | `updated_at` | timestamp with time zone | NO | &nbsp; | &nbsp; | &nbsp; |
| 8 | `secret` | text | YES | &nbsp; | &nbsp; | &nbsp; |
| 9 | `phone` | text | YES | &nbsp; | &nbsp; | &nbsp; |
| 10 | `last_challenged_at` | timestamp with time zone | YES | &nbsp; | UNIQUE | &nbsp; |
| 11 | `web_authn_credential` | jsonb | YES | &nbsp; | &nbsp; | &nbsp; |
| 12 | `web_authn_aaguid` | uuid | YES | &nbsp; | &nbsp; | &nbsp; |

### Table: `one_time_tokens`

| # | Column | Type | Nullable | Default | Constraints | Comment |
|---|---|---|---|---|---|---|
| 1 | `id` | uuid | NO | &nbsp; | PRIMARY KEY | &nbsp; |
| 2 | `user_id` | uuid | NO | &nbsp; | FOREIGN KEY | &nbsp; |
| 3 | `token_type` | USER-DEFINED | NO | &nbsp; | &nbsp; | &nbsp; |
| 4 | `token_hash` | text | NO | &nbsp; | &nbsp; | &nbsp; |
| 5 | `relates_to` | text | NO | &nbsp; | &nbsp; | &nbsp; |
| 6 | `created_at` | timestamp without time zone | NO | now() | &nbsp; | &nbsp; |
| 7 | `updated_at` | timestamp without time zone | NO | now() | &nbsp; | &nbsp; |

### Table: `refresh_tokens`

| # | Column | Type | Nullable | Default | Constraints | Comment |
|---|---|---|---|---|---|---|
| 1 | `instance_id` | uuid | YES | &nbsp; | &nbsp; | &nbsp; |
| 2 | `id` | bigint | NO | nextval('auth.refresh_tokens_id_seq'::regclass) | PRIMARY KEY | &nbsp; |
| 3 | `token` | character varying(255) | YES | &nbsp; | UNIQUE | &nbsp; |
| 4 | `user_id` | character varying(255) | YES | &nbsp; | &nbsp; | &nbsp; |
| 5 | `revoked` | boolean | YES | &nbsp; | &nbsp; | &nbsp; |
| 6 | `created_at` | timestamp with time zone | YES | &nbsp; | &nbsp; | &nbsp; |
| 7 | `updated_at` | timestamp with time zone | YES | &nbsp; | &nbsp; | &nbsp; |
| 8 | `parent` | character varying(255) | YES | &nbsp; | &nbsp; | &nbsp; |
| 9 | `session_id` | uuid | YES | &nbsp; | FOREIGN KEY | &nbsp; |

### Table: `saml_providers`

| # | Column | Type | Nullable | Default | Constraints | Comment |
|---|---|---|---|---|---|---|
| 1 | `id` | uuid | NO | &nbsp; | PRIMARY KEY | &nbsp; |
| 2 | `sso_provider_id` | uuid | NO | &nbsp; | FOREIGN KEY | &nbsp; |
| 3 | `entity_id` | text | NO | &nbsp; | UNIQUE | &nbsp; |
| 4 | `metadata_xml` | text | NO | &nbsp; | &nbsp; | &nbsp; |
| 5 | `metadata_url` | text | YES | &nbsp; | &nbsp; | &nbsp; |
| 6 | `attribute_mapping` | jsonb | YES | &nbsp; | &nbsp; | &nbsp; |
| 7 | `created_at` | timestamp with time zone | YES | &nbsp; | &nbsp; | &nbsp; |
| 8 | `updated_at` | timestamp with time zone | YES | &nbsp; | &nbsp; | &nbsp; |
| 9 | `name_id_format` | text | YES | &nbsp; | &nbsp; | &nbsp; |

### Table: `saml_relay_states`

| # | Column | Type | Nullable | Default | Constraints | Comment |
|---|---|---|---|---|---|---|
| 1 | `id` | uuid | NO | &nbsp; | PRIMARY KEY | &nbsp; |
| 2 | `sso_provider_id` | uuid | NO | &nbsp; | FOREIGN KEY | &nbsp; |
| 3 | `request_id` | text | NO | &nbsp; | &nbsp; | &nbsp; |
| 4 | `for_email` | text | YES | &nbsp; | &nbsp; | &nbsp; |
| 5 | `redirect_to` | text | YES | &nbsp; | &nbsp; | &nbsp; |
| 7 | `created_at` | timestamp with time zone | YES | &nbsp; | &nbsp; | &nbsp; |
| 8 | `updated_at` | timestamp with time zone | YES | &nbsp; | &nbsp; | &nbsp; |
| 9 | `flow_state_id` | uuid | YES | &nbsp; | FOREIGN KEY | &nbsp; |

### Table: `schema_migrations`

| # | Column | Type | Nullable | Default | Constraints | Comment |
|---|---|---|---|---|---|---|
| 1 | `version` | character varying(255) | NO | &nbsp; | PRIMARY KEY | &nbsp; |

### Table: `sessions`

| # | Column | Type | Nullable | Default | Constraints | Comment |
|---|---|---|---|---|---|---|
| 1 | `id` | uuid | NO | &nbsp; | PRIMARY KEY | &nbsp; |
| 2 | `user_id` | uuid | NO | &nbsp; | FOREIGN KEY | &nbsp; |
| 3 | `created_at` | timestamp with time zone | YES | &nbsp; | &nbsp; | &nbsp; |
| 4 | `updated_at` | timestamp with time zone | YES | &nbsp; | &nbsp; | &nbsp; |
| 5 | `factor_id` | uuid | YES | &nbsp; | &nbsp; | &nbsp; |
| 6 | `aal` | USER-DEFINED | YES | &nbsp; | &nbsp; | &nbsp; |
| 7 | `not_after` | timestamp with time zone | YES | &nbsp; | &nbsp; | Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired. |
| 8 | `refreshed_at` | timestamp without time zone | YES | &nbsp; | &nbsp; | &nbsp; |
| 9 | `user_agent` | text | YES | &nbsp; | &nbsp; | &nbsp; |
| 10 | `ip` | inet | YES | &nbsp; | &nbsp; | &nbsp; |
| 11 | `tag` | text | YES | &nbsp; | &nbsp; | &nbsp; |

### Table: `sso_domains`

| # | Column | Type | Nullable | Default | Constraints | Comment |
|---|---|---|---|---|---|---|
| 1 | `id` | uuid | NO | &nbsp; | PRIMARY KEY | &nbsp; |
| 2 | `sso_provider_id` | uuid | NO | &nbsp; | FOREIGN KEY | &nbsp; |
| 3 | `domain` | text | NO | &nbsp; | &nbsp; | &nbsp; |
| 4 | `created_at` | timestamp with time zone | YES | &nbsp; | &nbsp; | &nbsp; |
| 5 | `updated_at` | timestamp with time zone | YES | &nbsp; | &nbsp; | &nbsp; |

### Table: `sso_providers`

| # | Column | Type | Nullable | Default | Constraints | Comment |
|---|---|---|---|---|---|---|
| 1 | `id` | uuid | NO | &nbsp; | PRIMARY KEY | &nbsp; |
| 2 | `resource_id` | text | YES | &nbsp; | &nbsp; | Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code. |
| 3 | `created_at` | timestamp with time zone | YES | &nbsp; | &nbsp; | &nbsp; |
| 4 | `updated_at` | timestamp with time zone | YES | &nbsp; | &nbsp; | &nbsp; |

### Table: `users`

| # | Column | Type | Nullable | Default | Constraints | Comment |
|---|---|---|---|---|---|---|
| 1 | `instance_id` | uuid | YES | &nbsp; | &nbsp; | &nbsp; |
| 2 | `id` | uuid | NO | &nbsp; | PRIMARY KEY | &nbsp; |
| 3 | `aud` | character varying(255) | YES | &nbsp; | &nbsp; | &nbsp; |
| 4 | `role` | character varying(255) | YES | &nbsp; | &nbsp; | &nbsp; |
| 5 | `email` | character varying(255) | YES | &nbsp; | &nbsp; | &nbsp; |
| 6 | `encrypted_password` | character varying(255) | YES | &nbsp; | &nbsp; | &nbsp; |
| 7 | `email_confirmed_at` | timestamp with time zone | YES | &nbsp; | &nbsp; | &nbsp; |
| 8 | `invited_at` | timestamp with time zone | YES | &nbsp; | &nbsp; | &nbsp; |
| 9 | `confirmation_token` | character varying(255) | YES | &nbsp; | &nbsp; | &nbsp; |
| 10 | `confirmation_sent_at` | timestamp with time zone | YES | &nbsp; | &nbsp; | &nbsp; |
| 11 | `recovery_token` | character varying(255) | YES | &nbsp; | &nbsp; | &nbsp; |
| 12 | `recovery_sent_at` | timestamp with time zone | YES | &nbsp; | &nbsp; | &nbsp; |
| 13 | `email_change_token_new` | character varying(255) | YES | &nbsp; | &nbsp; | &nbsp; |
| 14 | `email_change` | character varying(255) | YES | &nbsp; | &nbsp; | &nbsp; |
| 15 | `email_change_sent_at` | timestamp with time zone | YES | &nbsp; | &nbsp; | &nbsp; |
| 16 | `last_sign_in_at` | timestamp with time zone | YES | &nbsp; | &nbsp; | &nbsp; |
| 17 | `raw_app_meta_data` | jsonb | YES | &nbsp; | &nbsp; | &nbsp; |
| 18 | `raw_user_meta_data` | jsonb | YES | &nbsp; | &nbsp; | &nbsp; |
| 19 | `is_super_admin` | boolean | YES | &nbsp; | &nbsp; | &nbsp; |
| 20 | `created_at` | timestamp with time zone | YES | &nbsp; | &nbsp; | &nbsp; |
| 21 | `updated_at` | timestamp with time zone | YES | &nbsp; | &nbsp; | &nbsp; |
| 22 | `phone` | text | YES | NULL::character varying | UNIQUE | &nbsp; |
| 23 | `phone_confirmed_at` | timestamp with time zone | YES | &nbsp; | &nbsp; | &nbsp; |
| 24 | `phone_change` | text | YES | ''::character varying | &nbsp; | &nbsp; |
| 25 | `phone_change_token` | character varying(255) | YES | ''::character varying | &nbsp; | &nbsp; |
| 26 | `phone_change_sent_at` | timestamp with time zone | YES | &nbsp; | &nbsp; | &nbsp; |
| 27 | `confirmed_at` | timestamp with time zone | YES | &nbsp; | &nbsp; | &nbsp; |
| 28 | `email_change_token_current` | character varying(255) | YES | ''::character varying | &nbsp; | &nbsp; |
| 29 | `email_change_confirm_status` | smallint | YES | 0 | &nbsp; | &nbsp; |
| 30 | `banned_until` | timestamp with time zone | YES | &nbsp; | &nbsp; | &nbsp; |
| 31 | `reauthentication_token` | character varying(255) | YES | ''::character varying | &nbsp; | &nbsp; |
| 32 | `reauthentication_sent_at` | timestamp with time zone | YES | &nbsp; | &nbsp; | &nbsp; |
| 33 | `is_sso_user` | boolean | NO | false | &nbsp; | Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails. |
| 34 | `deleted_at` | timestamp with time zone | YES | &nbsp; | &nbsp; | &nbsp; |
| 35 | `is_anonymous` | boolean | NO | false | &nbsp; | &nbsp; |


## Schema: `public`

### Table: `clients`

| # | Column | Type | Nullable | Default | Constraints | Comment |
|---|---|---|---|---|---|---|
| 1 | `id` | uuid | NO | gen_random_uuid() | PRIMARY KEY | &nbsp; |
| 2 | `company_id` | uuid | NO | &nbsp; | FOREIGN KEY | &nbsp; |
| 3 | `name` | text | NO | &nbsp; | &nbsp; | &nbsp; |
| 4 | `email` | text | YES | &nbsp; | &nbsp; | &nbsp; |
| 5 | `phone` | text | YES | &nbsp; | &nbsp; | &nbsp; |
| 6 | `address_street` | text | YES | &nbsp; | &nbsp; | &nbsp; |
| 7 | `address_neigh` | text | YES | &nbsp; | &nbsp; | &nbsp; |
| 8 | `address_city` | text | YES | &nbsp; | &nbsp; | &nbsp; |
| 9 | `address_state` | text | YES | &nbsp; | &nbsp; | &nbsp; |
| 10 | `address_zip` | text | YES | &nbsp; | &nbsp; | &nbsp; |
| 11 | `created_at` | timestamp with time zone | YES | now() | &nbsp; | &nbsp; |

### Table: `companies`

| # | Column | Type | Nullable | Default | Constraints | Comment |
|---|---|---|---|---|---|---|
| 1 | `id` | uuid | NO | gen_random_uuid() | PRIMARY KEY | &nbsp; |
| 2 | `name` | text | NO | &nbsp; | &nbsp; | &nbsp; |
| 3 | `tax_id` | text | NO | &nbsp; | UNIQUE | &nbsp; |
| 4 | `email` | text | NO | &nbsp; | UNIQUE | &nbsp; |
| 5 | `phone` | text | YES | &nbsp; | &nbsp; | &nbsp; |
| 6 | `address_street` | text | YES | &nbsp; | &nbsp; | &nbsp; |
| 7 | `address_neigh` | text | YES | &nbsp; | &nbsp; | &nbsp; |
| 8 | `address_city` | text | YES | &nbsp; | &nbsp; | &nbsp; |
| 9 | `address_state` | text | YES | &nbsp; | &nbsp; | &nbsp; |
| 10 | `address_zip` | text | YES | &nbsp; | &nbsp; | &nbsp; |
| 11 | `logo_url` | text | YES | &nbsp; | &nbsp; | &nbsp; |
| 13 | `created_at` | timestamp with time zone | YES | now() | &nbsp; | &nbsp; |
| 14 | `updated_at` | timestamp with time zone | YES | now() | &nbsp; | &nbsp; |
| 20 | `plan` | USER-DEFINED | YES | 'free'::plan_enum | &nbsp; | &nbsp; |
| 21 | `billing_interval` | USER-DEFINED | YES | &nbsp; | &nbsp; | &nbsp; |
| 22 | `lastlink_status` | USER-DEFINED | YES | 'incomplete'::lastlink_status_enum | &nbsp; | &nbsp; |
| 23 | `lastlink_sub_id` | text | YES | &nbsp; | UNIQUE | &nbsp; |
| 24 | `current_period_end` | timestamp with time zone | YES | &nbsp; | &nbsp; | &nbsp; |

### Table: `company_invites`

| # | Column | Type | Nullable | Default | Constraints | Comment |
|---|---|---|---|---|---|---|
| 1 | `id` | uuid | NO | gen_random_uuid() | PRIMARY KEY | &nbsp; |
| 2 | `company_id` | uuid | NO | &nbsp; | UNIQUE, FOREIGN KEY | &nbsp; |
| 3 | `email` | text | NO | &nbsp; | UNIQUE | &nbsp; |
| 4 | `temp_password_hash` | text | NO | &nbsp; | &nbsp; | &nbsp; |
| 5 | `status` | USER-DEFINED | NO | 'pending'::invite_status_enum | &nbsp; | &nbsp; |
| 6 | `invited_by` | uuid | YES | &nbsp; | FOREIGN KEY | &nbsp; |
| 7 | `expires_at` | timestamp with time zone | YES | &nbsp; | &nbsp; | &nbsp; |
| 8 | `created_at` | timestamp with time zone | YES | now() | &nbsp; | &nbsp; |

### Table: `company_user_roles`

| # | Column | Type | Nullable | Default | Constraints | Comment |
|---|---|---|---|---|---|---|
| 1 | `id` | uuid | NO | gen_random_uuid() | PRIMARY KEY | &nbsp; |
| 2 | `company_id` | uuid | NO | &nbsp; | UNIQUE, FOREIGN KEY | &nbsp; |
| 3 | `user_id` | uuid | NO | &nbsp; | FOREIGN KEY, UNIQUE | &nbsp; |
| 4 | `role` | USER-DEFINED | NO | 'collaborator'::role_enum | &nbsp; | &nbsp; |
| 5 | `created_at` | timestamp with time zone | YES | now() | &nbsp; | &nbsp; |

### Table: `lastlink_events`

| # | Column | Type | Nullable | Default | Constraints | Comment |
|---|---|---|---|---|---|---|
| 1 | `id` | bigint | NO | nextval('lastlink_events_id_seq'::regclass) | PRIMARY KEY | &nbsp; |
| 2 | `company_id` | uuid | YES | &nbsp; | FOREIGN KEY | &nbsp; |
| 3 | `event_id` | text | YES | &nbsp; | UNIQUE | &nbsp; |
| 4 | `event_type` | text | YES | &nbsp; | &nbsp; | &nbsp; |
| 5 | `payload` | jsonb | YES | &nbsp; | &nbsp; | &nbsp; |
| 6 | `received_at` | timestamp with time zone | YES | now() | &nbsp; | &nbsp; |

### Table: `lastlink_products`

| # | Column | Type | Nullable | Default | Constraints | Comment |
|---|---|---|---|---|---|---|
| 1 | `product_id` | text | NO | &nbsp; | PRIMARY KEY | &nbsp; |
| 2 | `billing_interval` | USER-DEFINED | NO | &nbsp; | &nbsp; | &nbsp; |

### Table: `lastlink_subscriptions`

| # | Column | Type | Nullable | Default | Constraints | Comment |
|---|---|---|---|---|---|---|
| 1 | `id` | uuid | NO | gen_random_uuid() | PRIMARY KEY | &nbsp; |
| 2 | `company_id` | uuid | NO | &nbsp; | FOREIGN KEY | &nbsp; |
| 3 | `subscription_id` | text | NO | &nbsp; | UNIQUE | &nbsp; |
| 4 | `product_id` | text | NO | &nbsp; | &nbsp; | &nbsp; |
| 5 | `status` | USER-DEFINED | NO | &nbsp; | &nbsp; | &nbsp; |
| 6 | `current_period_end` | timestamp with time zone | YES | &nbsp; | &nbsp; | &nbsp; |
| 7 | `created_at` | timestamp with time zone | YES | now() | &nbsp; | &nbsp; |
| 8 | `updated_at` | timestamp with time zone | YES | now() | &nbsp; | &nbsp; |
| 9 | `billing_interval` | USER-DEFINED | YES | &nbsp; | &nbsp; | &nbsp; |

### Table: `macro_status`

| # | Column | Type | Nullable | Default | Constraints | Comment |
|---|---|---|---|---|---|---|
| 1 | `id` | uuid | NO | gen_random_uuid() | PRIMARY KEY | &nbsp; |
| 2 | `company_id` | uuid | NO | &nbsp; | UNIQUE, FOREIGN KEY | &nbsp; |
| 3 | `name` | text | NO | &nbsp; | UNIQUE | &nbsp; |
| 4 | `position` | integer | NO | &nbsp; | UNIQUE | &nbsp; |
| 5 | `created_at` | timestamp with time zone | YES | now() | &nbsp; | &nbsp; |

### Table: `macro_status_task`

| # | Column | Type | Nullable | Default | Constraints | Comment |
|---|---|---|---|---|---|---|
| 1 | `id` | uuid | NO | gen_random_uuid() | PRIMARY KEY | &nbsp; |
| 2 | `macro_status_id` | uuid | NO | &nbsp; | UNIQUE, FOREIGN KEY | &nbsp; |
| 3 | `name` | text | NO | &nbsp; | UNIQUE | &nbsp; |
| 4 | `position` | integer | NO | &nbsp; | UNIQUE | &nbsp; |
| 5 | `description` | text | YES | &nbsp; | &nbsp; | &nbsp; |
| 6 | `created_at` | timestamp with time zone | YES | now() | &nbsp; | &nbsp; |

### Table: `payments`

| # | Column | Type | Nullable | Default | Constraints | Comment |
|---|---|---|---|---|---|---|
| 1 | `id` | uuid | NO | gen_random_uuid() | PRIMARY KEY | &nbsp; |
| 2 | `project_id` | uuid | NO | &nbsp; | FOREIGN KEY | &nbsp; |
| 3 | `due_date` | date | NO | &nbsp; | &nbsp; | &nbsp; |
| 4 | `amount` | numeric | NO | &nbsp; | &nbsp; | &nbsp; |
| 5 | `status` | USER-DEFINED | NO | 'pendente'::payment_status_enum | &nbsp; | &nbsp; |
| 6 | `paid_at` | timestamp with time zone | YES | &nbsp; | &nbsp; | &nbsp; |

### Table: `plans`

| # | Column | Type | Nullable | Default | Constraints | Comment |
|---|---|---|---|---|---|---|
| 1 | `id` | uuid | NO | gen_random_uuid() | PRIMARY KEY | &nbsp; |
| 2 | `tier` | USER-DEFINED | YES | &nbsp; | UNIQUE | &nbsp; |
| 3 | `name` | text | YES | &nbsp; | &nbsp; | &nbsp; |
| 4 | `price_month` | numeric | YES | &nbsp; | &nbsp; | &nbsp; |
| 5 | `features` | jsonb | YES | &nbsp; | &nbsp; | &nbsp; |
| 6 | `is_active` | boolean | YES | true | &nbsp; | &nbsp; |

### Table: `project_files`

| # | Column | Type | Nullable | Default | Constraints | Comment |
|---|---|---|---|---|---|---|
| 1 | `id` | uuid | NO | gen_random_uuid() | PRIMARY KEY | &nbsp; |
| 2 | `project_id` | uuid | NO | &nbsp; | FOREIGN KEY | &nbsp; |
| 3 | `storage_path` | text | NO | &nbsp; | &nbsp; | &nbsp; |
| 4 | `mime_type` | text | YES | &nbsp; | &nbsp; | &nbsp; |
| 5 | `size_bytes` | integer | YES | &nbsp; | &nbsp; | &nbsp; |
| 6 | `uploaded_by` | uuid | YES | &nbsp; | FOREIGN KEY | &nbsp; |
| 7 | `created_at` | timestamp with time zone | YES | now() | &nbsp; | &nbsp; |
| 8 | `file_name` | text | NO | ''::text | &nbsp; | &nbsp; |

### Table: `project_status`

| # | Column | Type | Nullable | Default | Constraints | Comment |
|---|---|---|---|---|---|---|
| 1 | `id` | uuid | NO | gen_random_uuid() | PRIMARY KEY | &nbsp; |
| 2 | `project_id` | uuid | NO | &nbsp; | UNIQUE, FOREIGN KEY | &nbsp; |
| 3 | `name` | text | NO | &nbsp; | &nbsp; | &nbsp; |
| 4 | `position` | integer | NO | &nbsp; | UNIQUE | &nbsp; |
| 5 | `created_at` | timestamp with time zone | YES | now() | &nbsp; | &nbsp; |

### Table: `project_task`

| # | Column | Type | Nullable | Default | Constraints | Comment |
|---|---|---|---|---|---|---|
| 1 | `id` | uuid | NO | gen_random_uuid() | PRIMARY KEY | &nbsp; |
| 2 | `project_status_id` | uuid | NO | &nbsp; | FOREIGN KEY, UNIQUE | &nbsp; |
| 3 | `name` | text | NO | &nbsp; | &nbsp; | &nbsp; |
| 4 | `position` | integer | NO | &nbsp; | UNIQUE | &nbsp; |
| 5 | `is_done` | boolean | NO | false | &nbsp; | &nbsp; |
| 6 | `created_at` | timestamp with time zone | YES | now() | &nbsp; | &nbsp; |

### Table: `projects`

| # | Column | Type | Nullable | Default | Constraints | Comment |
|---|---|---|---|---|---|---|
| 1 | `id` | uuid | NO | gen_random_uuid() | PRIMARY KEY | &nbsp; |
| 2 | `company_id` | uuid | NO | &nbsp; | FOREIGN KEY | &nbsp; |
| 3 | `client_id` | uuid | YES | &nbsp; | FOREIGN KEY | &nbsp; |
| 4 | `name` | text | NO | &nbsp; | &nbsp; | &nbsp; |
| 5 | `description` | text | YES | &nbsp; | &nbsp; | &nbsp; |
| 6 | `total_value` | numeric | NO | 0 | &nbsp; | &nbsp; |
| 7 | `payment_status` | USER-DEFINED | NO | 'pendente'::payment_status_enum | &nbsp; | &nbsp; |
| 8 | `progress_status_id` | uuid | YES | &nbsp; | &nbsp; | &nbsp; |
| 9 | `slug` | text | YES | &nbsp; | UNIQUE | &nbsp; |
| 10 | `password_hash` | text | YES | &nbsp; | &nbsp; | &nbsp; |
| 11 | `created_at` | timestamp with time zone | YES | now() | &nbsp; | &nbsp; |
| 12 | `updated_at` | timestamp with time zone | YES | now() | &nbsp; | &nbsp; |

### Table: `users`

| # | Column | Type | Nullable | Default | Constraints | Comment |
|---|---|---|---|---|---|---|
| 1 | `id` | uuid | NO | &nbsp; | PRIMARY KEY | &nbsp; |
| 2 | `full_name` | text | NO | &nbsp; | &nbsp; | &nbsp; |
| 3 | `email` | text | NO | &nbsp; | UNIQUE | &nbsp; |
| 4 | `phone` | text | YES | &nbsp; | &nbsp; | &nbsp; |
| 5 | `password_hash` | text | YES | &nbsp; | &nbsp; | &nbsp; |
| 6 | `created_at` | timestamp with time zone | YES | now() | &nbsp; | &nbsp; |
| 7 | `updated_at` | timestamp with time zone | YES | now() | &nbsp; | &nbsp; |


## Schema: `realtime`

### Table: `messages`

| # | Column | Type | Nullable | Default | Constraints | Comment |
|---|---|---|---|---|---|---|
| 3 | `topic` | text | NO | &nbsp; | &nbsp; | &nbsp; |
| 4 | `extension` | text | NO | &nbsp; | &nbsp; | &nbsp; |
| 5 | `payload` | jsonb | YES | &nbsp; | &nbsp; | &nbsp; |
| 6 | `event` | text | YES | &nbsp; | &nbsp; | &nbsp; |
| 7 | `private` | boolean | YES | false | &nbsp; | &nbsp; |
| 8 | `updated_at` | timestamp without time zone | NO | now() | &nbsp; | &nbsp; |
| 9 | `inserted_at` | timestamp without time zone | NO | now() | PRIMARY KEY | &nbsp; |
| 10 | `id` | uuid | NO | gen_random_uuid() | PRIMARY KEY | &nbsp; |

### Table: `schema_migrations`

| # | Column | Type | Nullable | Default | Constraints | Comment |
|---|---|---|---|---|---|---|
| 1 | `version` | bigint | NO | &nbsp; | PRIMARY KEY | &nbsp; |
| 2 | `inserted_at` | timestamp without time zone | YES | &nbsp; | &nbsp; | &nbsp; |

### Table: `subscription`

| # | Column | Type | Nullable | Default | Constraints | Comment |
|---|---|---|---|---|---|---|
| 1 | `id` | bigint | NO | &nbsp; | PRIMARY KEY | &nbsp; |
| 2 | `subscription_id` | uuid | NO | &nbsp; | &nbsp; | &nbsp; |
| 4 | `entity` | regclass | NO | &nbsp; | &nbsp; | &nbsp; |
| 5 | `filters` | ARRAY | NO | '{}'::realtime.user_defined_filter[] | &nbsp; | &nbsp; |
| 7 | `claims` | jsonb | NO | &nbsp; | &nbsp; | &nbsp; |
| 8 | `claims_role` | regrole | NO | &nbsp; | &nbsp; | &nbsp; |
| 9 | `created_at` | timestamp without time zone | NO | timezone('utc'::text, now()) | &nbsp; | &nbsp; |


## Schema: `storage`

### Table: `buckets`

| # | Column | Type | Nullable | Default | Constraints | Comment |
|---|---|---|---|---|---|---|
| 1 | `id` | text | NO | &nbsp; | PRIMARY KEY | &nbsp; |
| 2 | `name` | text | NO | &nbsp; | &nbsp; | &nbsp; |
| 3 | `owner` | uuid | YES | &nbsp; | &nbsp; | Field is deprecated, use owner_id instead |
| 4 | `created_at` | timestamp with time zone | YES | now() | &nbsp; | &nbsp; |
| 5 | `updated_at` | timestamp with time zone | YES | now() | &nbsp; | &nbsp; |
| 6 | `public` | boolean | YES | false | &nbsp; | &nbsp; |
| 7 | `avif_autodetection` | boolean | YES | false | &nbsp; | &nbsp; |
| 8 | `file_size_limit` | bigint | YES | &nbsp; | &nbsp; | &nbsp; |
| 9 | `allowed_mime_types` | ARRAY | YES | &nbsp; | &nbsp; | &nbsp; |
| 10 | `owner_id` | text | YES | &nbsp; | &nbsp; | &nbsp; |

### Table: `migrations`

| # | Column | Type | Nullable | Default | Constraints | Comment |
|---|---|---|---|---|---|---|
| 1 | `id` | integer | NO | &nbsp; | PRIMARY KEY | &nbsp; |
| 2 | `name` | character varying(100) | NO | &nbsp; | UNIQUE | &nbsp; |
| 3 | `hash` | character varying(40) | NO | &nbsp; | &nbsp; | &nbsp; |
| 4 | `executed_at` | timestamp without time zone | YES | CURRENT_TIMESTAMP | &nbsp; | &nbsp; |

### Table: `objects`

| # | Column | Type | Nullable | Default | Constraints | Comment |
|---|---|---|---|---|---|---|
| 1 | `id` | uuid | NO | gen_random_uuid() | PRIMARY KEY | &nbsp; |
| 2 | `bucket_id` | text | YES | &nbsp; | FOREIGN KEY | &nbsp; |
| 3 | `name` | text | YES | &nbsp; | &nbsp; | &nbsp; |
| 4 | `owner` | uuid | YES | &nbsp; | &nbsp; | Field is deprecated, use owner_id instead |
| 5 | `created_at` | timestamp with time zone | YES | now() | &nbsp; | &nbsp; |
| 6 | `updated_at` | timestamp with time zone | YES | now() | &nbsp; | &nbsp; |
| 7 | `last_accessed_at` | timestamp with time zone | YES | now() | &nbsp; | &nbsp; |
| 8 | `metadata` | jsonb | YES | &nbsp; | &nbsp; | &nbsp; |
| 9 | `path_tokens` | ARRAY | YES | &nbsp; | &nbsp; | &nbsp; |
| 10 | `version` | text | YES | &nbsp; | &nbsp; | &nbsp; |
| 11 | `owner_id` | text | YES | &nbsp; | &nbsp; | &nbsp; |
| 12 | `user_metadata` | jsonb | YES | &nbsp; | &nbsp; | &nbsp; |

### Table: `s3_multipart_uploads`

| # | Column | Type | Nullable | Default | Constraints | Comment |
|---|---|---|---|---|---|---|
| 1 | `id` | text | NO | &nbsp; | PRIMARY KEY | &nbsp; |
| 2 | `in_progress_size` | bigint | NO | 0 | &nbsp; | &nbsp; |
| 3 | `upload_signature` | text | NO | &nbsp; | &nbsp; | &nbsp; |
| 4 | `bucket_id` | text | NO | &nbsp; | FOREIGN KEY | &nbsp; |
| 5 | `key` | text | NO | &nbsp; | &nbsp; | &nbsp; |
| 6 | `version` | text | NO | &nbsp; | &nbsp; | &nbsp; |
| 7 | `owner_id` | text | YES | &nbsp; | &nbsp; | &nbsp; |
| 8 | `created_at` | timestamp with time zone | NO | now() | &nbsp; | &nbsp; |
| 9 | `user_metadata` | jsonb | YES | &nbsp; | &nbsp; | &nbsp; |

### Table: `s3_multipart_uploads_parts`

| # | Column | Type | Nullable | Default | Constraints | Comment |
|---|---|---|---|---|---|---|
| 1 | `id` | uuid | NO | gen_random_uuid() | PRIMARY KEY | &nbsp; |
| 2 | `upload_id` | text | NO | &nbsp; | FOREIGN KEY | &nbsp; |
| 3 | `size` | bigint | NO | 0 | &nbsp; | &nbsp; |
| 4 | `part_number` | integer | NO | &nbsp; | &nbsp; | &nbsp; |
| 5 | `bucket_id` | text | NO | &nbsp; | FOREIGN KEY | &nbsp; |
| 6 | `key` | text | NO | &nbsp; | &nbsp; | &nbsp; |
| 7 | `etag` | text | NO | &nbsp; | &nbsp; | &nbsp; |
| 8 | `owner_id` | text | YES | &nbsp; | &nbsp; | &nbsp; |
| 9 | `version` | text | NO | &nbsp; | &nbsp; | &nbsp; |
| 10 | `created_at` | timestamp with time zone | NO | now() | &nbsp; | &nbsp; |


## Schema: `vault`

### Table: `decrypted_secrets`

| # | Column | Type | Nullable | Default | Constraints | Comment |
|---|---|---|---|---|---|---|
| 1 | `id` | uuid | YES | &nbsp; | &nbsp; | &nbsp; |
| 2 | `name` | text | YES | &nbsp; | &nbsp; | &nbsp; |
| 3 | `description` | text | YES | &nbsp; | &nbsp; | &nbsp; |
| 4 | `secret` | text | YES | &nbsp; | &nbsp; | &nbsp; |
| 5 | `decrypted_secret` | text | YES | &nbsp; | &nbsp; | &nbsp; |
| 6 | `key_id` | uuid | YES | &nbsp; | &nbsp; | &nbsp; |
| 7 | `nonce` | bytea | YES | &nbsp; | &nbsp; | &nbsp; |
| 8 | `created_at` | timestamp with time zone | YES | &nbsp; | &nbsp; | &nbsp; |
| 9 | `updated_at` | timestamp with time zone | YES | &nbsp; | &nbsp; | &nbsp; |

### Table: `secrets`

| # | Column | Type | Nullable | Default | Constraints | Comment |
|---|---|---|---|---|---|---|
| 1 | `id` | uuid | NO | gen_random_uuid() | PRIMARY KEY | &nbsp; |
| 2 | `name` | text | YES | &nbsp; | &nbsp; | &nbsp; |
| 3 | `description` | text | NO | ''::text | &nbsp; | &nbsp; |
| 4 | `secret` | text | NO | &nbsp; | &nbsp; | &nbsp; |
| 5 | `key_id` | uuid | YES | &nbsp; | &nbsp; | &nbsp; |
| 6 | `nonce` | bytea | YES | vault._crypto_aead_det_noncegen() | &nbsp; | &nbsp; |
| 7 | `created_at` | timestamp with time zone | NO | CURRENT_TIMESTAMP | &nbsp; | &nbsp; |
| 8 | `updated_at` | timestamp with time zone | NO | CURRENT_TIMESTAMP | &nbsp; | &nbsp; |


## Functions & Procedures

### Schema: `auth`

| Function | Returns |
|---|---|
| `email` | text |
| `jwt` | jsonb |
| `role` | text |
| `uid` | uuid |

### Schema: `extensions`

| Function | Returns |
|---|---|
| `algorithm_sign` | text |
| `armor` | text |
| `armor` | text |
| `crypt` | text |
| `dearmor` | bytea |
| `decrypt` | bytea |
| `decrypt_iv` | bytea |
| `digest` | bytea |
| `digest` | bytea |
| `encrypt` | bytea |
| `encrypt_iv` | bytea |
| `gen_random_bytes` | bytea |
| `gen_random_uuid` | uuid |
| `gen_salt` | text |
| `gen_salt` | text |
| `grant_pg_cron_access` | event_trigger |
| `grant_pg_graphql_access` | event_trigger |
| `grant_pg_net_access` | event_trigger |
| `hmac` | bytea |
| `hmac` | bytea |
| `pg_stat_statements` | record |
| `pg_stat_statements_info` | record |
| `pg_stat_statements_reset` | void |
| `pgp_armor_headers` | record |
| `pgp_key_id` | text |
| `pgp_pub_decrypt` | text |
| `pgp_pub_decrypt` | text |
| `pgp_pub_decrypt` | text |
| `pgp_pub_decrypt_bytea` | bytea |
| `pgp_pub_decrypt_bytea` | bytea |
| `pgp_pub_decrypt_bytea` | bytea |
| `pgp_pub_encrypt` | bytea |
| `pgp_pub_encrypt` | bytea |
| `pgp_pub_encrypt_bytea` | bytea |
| `pgp_pub_encrypt_bytea` | bytea |
| `pgp_sym_decrypt` | text |
| `pgp_sym_decrypt` | text |
| `pgp_sym_decrypt_bytea` | bytea |
| `pgp_sym_decrypt_bytea` | bytea |
| `pgp_sym_encrypt` | bytea |
| `pgp_sym_encrypt` | bytea |
| `pgp_sym_encrypt_bytea` | bytea |
| `pgp_sym_encrypt_bytea` | bytea |
| `pgrst_ddl_watch` | event_trigger |
| `pgrst_drop_watch` | event_trigger |
| `set_graphql_placeholder` | event_trigger |
| `sign` | text |
| `try_cast_double` | double precision |
| `url_decode` | bytea |
| `url_encode` | text |
| `uuid_generate_v1` | uuid |
| `uuid_generate_v1mc` | uuid |
| `uuid_generate_v3` | uuid |
| `uuid_generate_v4` | uuid |
| `uuid_generate_v5` | uuid |
| `uuid_nil` | uuid |
| `uuid_ns_dns` | uuid |
| `uuid_ns_oid` | uuid |
| `uuid_ns_url` | uuid |
| `uuid_ns_x500` | uuid |
| `verify` | record |

### Schema: `graphql`

| Function | Returns |
|---|---|
| `_internal_resolve` | jsonb |
| `comment_directive` | jsonb |
| `exception` | text |
| `get_schema_version` | integer |
| `increment_schema_version` | event_trigger |
| `resolve` | jsonb |

### Schema: `graphql_public`

| Function | Returns |
|---|---|
| `graphql` | jsonb |

### Schema: `pgbouncer`

| Function | Returns |
|---|---|
| `get_auth` | record |

### Schema: `public`

| Function | Returns |
|---|---|
| `first_path_segment` | text |
| `handle_lastlink_active` | jsonb |
| `handle_lastlink_canceled` | jsonb |
| `handle_lastlink_expired` | jsonb |
| `handle_lastlink_past_due` | jsonb |
| `set_current_company` | void |
| `touch_updated_at` | trigger |
| `update_updated_at_column` | trigger |

### Schema: `realtime`

| Function | Returns |
|---|---|
| `apply_rls` | USER-DEFINED |
| `broadcast_changes` | void |
| `build_prepared_statement_sql` | text |
| `cast` | jsonb |
| `check_equality_op` | boolean |
| `is_visible_through_filters` | boolean |
| `list_changes` | USER-DEFINED |
| `quote_wal2json` | text |
| `send` | void |
| `subscription_check_filters` | trigger |
| `to_regrole` | regrole |
| `topic` | text |

### Schema: `storage`

| Function | Returns |
|---|---|
| `can_insert_object` | void |
| `extension` | text |
| `filename` | text |
| `foldername` | ARRAY |
| `get_size_by_bucket` | record |
| `list_multipart_uploads_with_delimiter` | record |
| `list_objects_with_delimiter` | record |
| `operation` | text |
| `search` | record |
| `update_updated_at_column` | trigger |

### Schema: `vault`

| Function | Returns |
|---|---|
| `_crypto_aead_det_decrypt` | bytea |
| `create_secret` | uuid |
| `update_secret` | void |

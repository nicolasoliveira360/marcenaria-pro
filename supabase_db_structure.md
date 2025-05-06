# Schema: **public**

## Table: **clients**
| # | Column | Type | Nullable | Default | Constraint | Comment |
|---|--------|------|----------|---------|------------|---------|
| 1 | id | uuid | NO | gen_random_uuid() | PRIMARY KEY |  |
| 2 | company_id | uuid | NO |  | FOREIGN KEY |  |
| 3 | name | text | NO |  |  |  |
| 4 | email | text | YES |  |  |  |
| 5 | phone | text | YES |  |  |  |
| 6 | address_street | text | YES |  |  |  |
| 7 | address_neigh | text | YES |  |  |  |
| 8 | address_city | text | YES |  |  |  |
| 9 | address_state | text | YES |  |  |  |
| 10 | address_zip | text | YES |  |  |  |
| 11 | created_at | timestamp with time zone | YES | now() |  |  |

## Table: **companies**
| # | Column | Type | Nullable | Default | Constraint | Comment |
|---|--------|------|----------|---------|------------|---------|
| 1 | id | uuid | NO | gen_random_uuid() | PRIMARY KEY |  |
| 2 | name | text | NO |  |  |  |
| 3 | tax_id | text | NO |  | UNIQUE |  |
| 4 | email | text | NO |  | UNIQUE |  |
| 5 | phone | text | YES |  |  |  |
| 6 | address_street | text | YES |  |  |  |
| 7 | address_neigh | text | YES |  |  |  |
| 8 | address_city | text | YES |  |  |  |
| 9 | address_state | text | YES |  |  |  |
| 10 | address_zip | text | YES |  |  |  |
| 11 | logo_url | text | YES |  |  |  |
| 13 | created_at | timestamp with time zone | YES | now() |  |  |
| 14 | updated_at | timestamp with time zone | YES | now() |  |  |
| 20 | plan | USER-DEFINED | YES | 'free'::plan_enum |  |  |
| 21 | billing_interval | USER-DEFINED | YES |  |  |  |
| 22 | lastlink_status | USER-DEFINED | YES | 'incomplete'::lastlink_status_enum |  |  |
| 23 | lastlink_sub_id | text | YES |  | UNIQUE |  |
| 24 | current_period_end | timestamp with time zone | YES |  |  |  |

## Table: **company_invites**
| # | Column | Type | Nullable | Default | Constraint | Comment |
|---|--------|------|----------|---------|------------|---------|
| 1 | id | uuid | NO | gen_random_uuid() | PRIMARY KEY |  |
| 2 | company_id | uuid | NO |  | UNIQUE |  |
| 2 | company_id | uuid | NO |  | FOREIGN KEY |  |
| 3 | email | text | NO |  | UNIQUE |  |
| 4 | temp_password_hash | text | NO |  |  |  |
| 5 | status | USER-DEFINED | NO | 'pending'::invite_status_enum |  |  |
| 6 | invited_by | uuid | YES |  | FOREIGN KEY |  |
| 7 | expires_at | timestamp with time zone | YES |  |  |  |
| 8 | created_at | timestamp with time zone | YES | now() |  |  |

## Table: **company_user_roles**
| # | Column | Type | Nullable | Default | Constraint | Comment |
|---|--------|------|----------|---------|------------|---------|
| 1 | id | uuid | NO | gen_random_uuid() | PRIMARY KEY |  |
| 2 | company_id | uuid | NO |  | UNIQUE |  |
| 2 | company_id | uuid | NO |  | FOREIGN KEY |  |
| 3 | user_id | uuid | NO |  | FOREIGN KEY |  |
| 3 | user_id | uuid | NO |  | UNIQUE |  |
| 4 | role | USER-DEFINED | NO | 'collaborator'::role_enum |  |  |
| 5 | created_at | timestamp with time zone | YES | now() |  |  |

## Table: **lastlink_events**
| # | Column | Type | Nullable | Default | Constraint | Comment |
|---|--------|------|----------|---------|------------|---------|
| 1 | id | bigint | NO | nextval('lastlink_events_id_seq'::regclass) | PRIMARY KEY |  |
| 2 | company_id | uuid | YES |  | FOREIGN KEY |  |
| 3 | event_id | text | YES |  | UNIQUE |  |
| 4 | event_type | text | YES |  |  |  |
| 5 | payload | jsonb | YES |  |  |  |
| 6 | received_at | timestamp with time zone | YES | now() |  |  |

## Table: **lastlink_products**
| # | Column | Type | Nullable | Default | Constraint | Comment |
|---|--------|------|----------|---------|------------|---------|
| 1 | product_id | text | NO |  | PRIMARY KEY |  |
| 2 | billing_interval | USER-DEFINED | NO |  |  |  |

## Table: **lastlink_subscriptions**
| # | Column | Type | Nullable | Default | Constraint | Comment |
|---|--------|------|----------|---------|------------|---------|
| 1 | id | uuid | NO | gen_random_uuid() | PRIMARY KEY |  |
| 2 | company_id | uuid | NO |  | FOREIGN KEY |  |
| 3 | subscription_id | text | NO |  | UNIQUE |  |
| 4 | product_id | text | NO |  |  |  |
| 5 | status | USER-DEFINED | NO |  |  |  |
| 6 | current_period_end | timestamp with time zone | YES |  |  |  |
| 7 | created_at | timestamp with time zone | YES | now() |  |  |
| 8 | updated_at | timestamp with time zone | YES | now() |  |  |

| 9 | billing_interval | USER-DEFINED | YES |  |  |  |
## Table: **macro_status**
| # | Column | Type | Nullable | Default | Constraint | Comment |
|---|--------|------|----------|---------|------------|---------|
| 1 | id | uuid | NO | gen_random_uuid() | PRIMARY KEY |  |
| 2 | company_id | uuid | NO |  | UNIQUE |  |
| 2 | company_id | uuid | NO |  | UNIQUE |  |
| 2 | company_id | uuid | NO |  | FOREIGN KEY |  |
| 3 | name | text | NO |  | UNIQUE |  |
| 4 | position | integer | NO |  | UNIQUE |  |
| 5 | created_at | timestamp with time zone | YES | now() |  |  |

## Table: **macro_status_task**
| # | Column | Type | Nullable | Default | Constraint | Comment |
|---|--------|------|----------|---------|------------|---------|
| 1 | id | uuid | NO | gen_random_uuid() | PRIMARY KEY |  |
| 2 | macro_status_id | uuid | NO |  | UNIQUE |  |
| 2 | macro_status_id | uuid | NO |  | FOREIGN KEY |  |
| 2 | macro_status_id | uuid | NO |  | UNIQUE |  |
| 3 | name | text | NO |  | UNIQUE |  |
| 4 | position | integer | NO |  | UNIQUE |  |
| 5 | description | text | YES |  |  |  |
| 6 | created_at | timestamp with time zone | YES | now() |  |  |

## Table: **payments**
| # | Column | Type | Nullable | Default | Constraint | Comment |
|---|--------|------|----------|---------|------------|---------|
| 1 | id | uuid | NO | gen_random_uuid() | PRIMARY KEY |  |
| 2 | project_id | uuid | NO |  | FOREIGN KEY |  |
| 3 | due_date | date | NO |  |  |  |
| 4 | amount | numeric | NO |  |  |  |
| 5 | status | USER-DEFINED | NO | 'pendente'::payment_status_enum |  |  |
| 6 | paid_at | timestamp with time zone | YES |  |  |  |
| 7 | description | text |

## Table: **plans**
| # | Column | Type | Nullable | Default | Constraint | Comment |
|---|--------|------|----------|---------|------------|---------|
| 1 | id | uuid | NO | gen_random_uuid() | PRIMARY KEY |  |
| 2 | tier | USER-DEFINED | YES |  | UNIQUE |  |
| 3 | name | text | YES |  |  |  |
| 4 | price_month | numeric | YES |  |  |  |
| 5 | features | jsonb | YES |  |  |  |
| 6 | is_active | boolean | YES | true |  |  |

## Table: **project_files**
| # | Column | Type | Nullable | Default | Constraint | Comment |
|---|--------|------|----------|---------|------------|---------|
| 1 | id | uuid | NO | gen_random_uuid() | PRIMARY KEY |  |
| 2 | project_id | uuid | NO |  | FOREIGN KEY |  |
| 3 | storage_path | text | NO |  |  |  |
| 4 | mime_type | text | YES |  |  |  |
| 5 | size_bytes | integer | YES |  |  |  |
| 6 | uploaded_by | uuid | YES |  | FOREIGN KEY |  |
| 7 | created_at | timestamp with time zone | YES | now() |  |  |
| 8 | file_name | text | NO | ''::text |  |  |

## Table: **project_status**
| # | Column | Type | Nullable | Default | Constraint | Comment |
|---|--------|------|----------|---------|------------|---------|
| 1 | id | uuid | NO | gen_random_uuid() | PRIMARY KEY |  |
| 2 | project_id | uuid | NO |  | UNIQUE |  |
| 2 | project_id | uuid | NO |  | FOREIGN KEY |  |
| 3 | name | text | NO |  |  |  |
| 4 | position | integer | NO |  | UNIQUE |  |
| 5 | created_at | timestamp with time zone | YES | now() |  |  |

## Table: **project_task**
| # | Column | Type | Nullable | Default | Constraint | Comment |
|---|--------|------|----------|---------|------------|---------|
| 1 | id | uuid | NO | gen_random_uuid() | PRIMARY KEY |  |
| 2 | project_status_id | uuid | NO |  | FOREIGN KEY |  |
| 2 | project_status_id | uuid | NO |  | UNIQUE |  |
| 3 | name | text | NO |  |  |  |
| 4 | position | integer | NO |  | UNIQUE |  |
| 5 | is_done | boolean | NO | false |  |  |
| 6 | created_at | timestamp with time zone | YES | now() |  |  |

## Table: **projects**
| # | Column | Type | Nullable | Default | Constraint | Comment |
|---|--------|------|----------|---------|------------|---------|
| 1 | id | uuid | NO | gen_random_uuid() | PRIMARY KEY |  |
| 2 | company_id | uuid | NO |  | FOREIGN KEY |  |
| 3 | client_id | uuid | YES |  | FOREIGN KEY |  |
| 4 | name | text | NO |  |  |  |
| 5 | description | text | YES |  |  |  |
| 6 | total_value | numeric | NO | 0 |  |  |
| 7 | payment_status | USER-DEFINED | NO | 'pendente'::payment_status_enum |  |  |
| 8 | progress_status_id | uuid | YES |  |  |  |
| 9 | slug | text | YES |  | UNIQUE |  |
| 10 | password_hash | text | YES |  |  |  |
| 11 | created_at | timestamp with time zone | YES | now() |  |  |
| 12 | updated_at | timestamp with time zone | YES | now() |  |  |

## Table: **users**
| # | Column | Type | Nullable | Default | Constraint | Comment |
|---|--------|------|----------|---------|------------|---------|
| 1 | id | uuid | NO |  | PRIMARY KEY |  |
| 2 | full_name | text | NO |  |  |  |
| 3 | email | text | NO |  | UNIQUE |  |
| 4 | phone | text | YES |  |  |  |
| 5 | password_hash | text | YES |  |  |  |
| 6 | created_at | timestamp with time zone | YES | now() |  |  |
| 7 | updated_at | timestamp with time zone | YES | now() |  |  |

# Schema: **realtime**

## Table: **messages**
| # | Column | Type | Nullable | Default | Constraint | Comment |
|---|--------|------|----------|---------|------------|---------|
| 3 | topic | text | NO |  |  |  |
| 4 | extension | text | NO |  |  |  |
| 5 | payload | jsonb | YES |  |  |  |
| 6 | event | text | YES |  |  |  |
| 7 | private | boolean | YES | false |  |  |
| 8 | updated_at | timestamp without time zone | NO | now() |  |  |
| 9 | inserted_at | timestamp without time zone | NO | now() | PRIMARY KEY |  |
| 10 | id | uuid | NO | gen_random_uuid() | PRIMARY KEY |  |

## Table: **schema_migrations**
| # | Column | Type | Nullable | Default | Constraint | Comment |
|---|--------|------|----------|---------|------------|---------|
| 1 | version | bigint | NO |  | PRIMARY KEY |  |
| 2 | inserted_at | timestamp without time zone | YES |  |  |  |

## Table: **subscription**
| # | Column | Type | Nullable | Default | Constraint | Comment |
|---|--------|------|----------|---------|------------|---------|
| 1 | id | bigint | NO |  | PRIMARY KEY |  |
| 2 | subscription_id | uuid | NO |  |  |  |
| 4 | entity | regclass | NO |  |  |  |
| 5 | filters | ARRAY | NO | '{}'::realtime.user_defined_filter[] |  |  |
| 7 | claims | jsonb | NO |  |  |  |
| 8 | claims_role | regrole | NO |  |  |  |
| 9 | created_at | timestamp without time zone | NO | timezone('utc'::text, now()) |  |  |

# Schema: **storage**

## Table: **buckets**
| # | Column | Type | Nullable | Default | Constraint | Comment |
|---|--------|------|----------|---------|------------|---------|
| 1 | id | text | NO |  | PRIMARY KEY |  |
| 2 | name | text | NO |  |  |  |
| 3 | owner | uuid | YES |  |  | Field is deprecated, use owner_id instead |
| 4 | created_at | timestamp with time zone | YES | now() |  |  |
| 5 | updated_at | timestamp with time zone | YES | now() |  |  |
| 6 | public | boolean | YES | false |  |  |
| 7 | avif_autodetection | boolean | YES | false |  |  |
| 8 | file_size_limit | bigint | YES |  |  |  |
| 9 | allowed_mime_types | ARRAY | YES |  |  |  |
| 10 | owner_id | text | YES |  |  |  |

## Table: **migrations**
| # | Column | Type | Nullable | Default | Constraint | Comment |
|---|--------|------|----------|---------|------------|---------|
| 1 | id | integer | NO |  | PRIMARY KEY |  |
| 2 | name | character varying(100) | NO |  | UNIQUE |  |
| 3 | hash | character varying(40) | NO |  |  |  |
| 4 | executed_at | timestamp without time zone | YES | CURRENT_TIMESTAMP |  |  |

## Table: **objects**
| # | Column | Type | Nullable | Default | Constraint | Comment |
|---|--------|------|----------|---------|------------|---------|
| 1 | id | uuid | NO | gen_random_uuid() | PRIMARY KEY |  |
| 2 | bucket_id | text | YES |  | FOREIGN KEY |  |
| 3 | name | text | YES |  |  |  |
| 4 | owner | uuid | YES |  |  | Field is deprecated, use owner_id instead |
| 5 | created_at | timestamp with time zone | YES | now() |  |  |
| 6 | updated_at | timestamp with time zone | YES | now() |  |  |
| 7 | last_accessed_at | timestamp with time zone | YES | now() |  |  |
| 8 | metadata | jsonb | YES |  |  |  |
| 9 | path_tokens | ARRAY | YES |  |  |  |
| 10 | version | text | YES |  |  |  |
| 11 | owner_id | text | YES |  |  |  |
| 12 | user_metadata | jsonb | YES |  |  |  |

## Table: **s3_multipart_uploads**
| # | Column | Type | Nullable | Default | Constraint | Comment |
|---|--------|------|----------|---------|------------|---------|
| 1 | id | text | NO |  | PRIMARY KEY |  |
| 2 | in_progress_size | bigint | NO | 0 |  |  |
| 3 | upload_signature | text | NO |  |  |  |
| 4 | bucket_id | text | NO |  | FOREIGN KEY |  |
| 5 | key | text | NO |  |  |  |
| 6 | version | text | NO |  |  |  |
| 7 | owner_id | text | YES |  |  |  |
| 8 | created_at | timestamp with time zone | NO | now() |  |  |
| 9 | user_metadata | jsonb | YES |  |  |  |

## Table: **s3_multipart_uploads_parts**
| # | Column | Type | Nullable | Default | Constraint | Comment |
|---|--------|------|----------|---------|------------|---------|
| 1 | id | uuid | NO | gen_random_uuid() | PRIMARY KEY |  |
| 2 | upload_id | text | NO |  | FOREIGN KEY |  |
| 3 | size | bigint | NO | 0 |  |  |
| 4 | part_number | integer | NO |  |  |  |
| 5 | bucket_id | text | NO |  | FOREIGN KEY |  |
| 6 | key | text | NO |  |  |  |
| 7 | etag | text | NO |  |  |  |
| 8 | owner_id | text | YES |  |  |  |
| 9 | version | text | NO |  |  |  |
| 10 | created_at | timestamp with time zone | NO | now() |  |  |
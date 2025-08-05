--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

-- Started on 2025-08-05 18:02:40

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP DATABASE IF EXISTS phishnet;
--
-- TOC entry 5102 (class 1262 OID 41082)
-- Name: phishnet; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE phishnet WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en-US';


ALTER DATABASE phishnet OWNER TO postgres;

\connect phishnet

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 937 (class 1247 OID 82079)
-- Name: enum_Campaigns_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_Campaigns_type" AS ENUM (
    'Email',
    'SMS',
    'Voice'
);


ALTER TYPE public."enum_Campaigns_type" OWNER TO postgres;

--
-- TOC entry 949 (class 1247 OID 82123)
-- Name: enum_Contents_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_Contents_type" AS ENUM (
    'Video',
    'Quiz',
    'Certificate'
);


ALTER TYPE public."enum_Contents_type" OWNER TO postgres;

--
-- TOC entry 943 (class 1247 OID 82100)
-- Name: enum_Templates_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_Templates_type" AS ENUM (
    'Email',
    'SMS',
    'Voice'
);


ALTER TYPE public."enum_Templates_type" OWNER TO postgres;

--
-- TOC entry 931 (class 1247 OID 82055)
-- Name: enum_Users_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_Users_role" AS ENUM (
    'SuperAdmin',
    'OrgAdmin',
    'Employee'
);


ALTER TYPE public."enum_Users_role" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 249 (class 1259 OID 82086)
-- Name: Campaigns; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Campaigns" (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    type public."enum_Campaigns_type" NOT NULL,
    status character varying(255),
    "scheduledAt" timestamp with time zone,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "OrganizationId" integer
);


ALTER TABLE public."Campaigns" OWNER TO postgres;

--
-- TOC entry 248 (class 1259 OID 82085)
-- Name: Campaigns_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Campaigns_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Campaigns_id_seq" OWNER TO postgres;

--
-- TOC entry 5103 (class 0 OID 0)
-- Dependencies: 248
-- Name: Campaigns_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Campaigns_id_seq" OWNED BY public."Campaigns".id;


--
-- TOC entry 253 (class 1259 OID 82130)
-- Name: Contents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Contents" (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    type public."enum_Contents_type" NOT NULL,
    url character varying(255),
    language character varying(255) DEFAULT 'en'::character varying,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Contents" OWNER TO postgres;

--
-- TOC entry 252 (class 1259 OID 82129)
-- Name: Contents_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Contents_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Contents_id_seq" OWNER TO postgres;

--
-- TOC entry 5104 (class 0 OID 0)
-- Dependencies: 252
-- Name: Contents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Contents_id_seq" OWNED BY public."Contents".id;


--
-- TOC entry 257 (class 1259 OID 82164)
-- Name: Languages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Languages" (
    id integer NOT NULL,
    code character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Languages" OWNER TO postgres;

--
-- TOC entry 256 (class 1259 OID 82163)
-- Name: Languages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Languages_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Languages_id_seq" OWNER TO postgres;

--
-- TOC entry 5105 (class 0 OID 0)
-- Dependencies: 256
-- Name: Languages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Languages_id_seq" OWNED BY public."Languages".id;


--
-- TOC entry 245 (class 1259 OID 82046)
-- Name: Organizations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Organizations" (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    industry character varying(255),
    address character varying(255),
    "contactEmail" character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Organizations" OWNER TO postgres;

--
-- TOC entry 244 (class 1259 OID 82045)
-- Name: Organizations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Organizations_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Organizations_id_seq" OWNER TO postgres;

--
-- TOC entry 5106 (class 0 OID 0)
-- Dependencies: 244
-- Name: Organizations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Organizations_id_seq" OWNED BY public."Organizations".id;


--
-- TOC entry 255 (class 1259 OID 82140)
-- Name: Results; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Results" (
    id integer NOT NULL,
    status character varying(255),
    details jsonb,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "CampaignId" integer,
    "UserId" integer,
    "ContentId" integer
);


ALTER TABLE public."Results" OWNER TO postgres;

--
-- TOC entry 254 (class 1259 OID 82139)
-- Name: Results_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Results_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Results_id_seq" OWNER TO postgres;

--
-- TOC entry 5107 (class 0 OID 0)
-- Dependencies: 254
-- Name: Results_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Results_id_seq" OWNED BY public."Results".id;


--
-- TOC entry 251 (class 1259 OID 82108)
-- Name: Templates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Templates" (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    type public."enum_Templates_type" NOT NULL,
    content text,
    language character varying(255) DEFAULT 'en'::character varying,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "OrganizationId" integer
);


ALTER TABLE public."Templates" OWNER TO postgres;

--
-- TOC entry 250 (class 1259 OID 82107)
-- Name: Templates_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Templates_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Templates_id_seq" OWNER TO postgres;

--
-- TOC entry 5108 (class 0 OID 0)
-- Dependencies: 250
-- Name: Templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Templates_id_seq" OWNED BY public."Templates".id;


--
-- TOC entry 247 (class 1259 OID 82062)
-- Name: Users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Users" (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    name character varying(255),
    role public."enum_Users_role" NOT NULL,
    language character varying(255) DEFAULT 'en'::character varying,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "OrganizationId" integer
);


ALTER TABLE public."Users" OWNER TO postgres;

--
-- TOC entry 246 (class 1259 OID 82061)
-- Name: Users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Users_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Users_id_seq" OWNER TO postgres;

--
-- TOC entry 5109 (class 0 OID 0)
-- Dependencies: 246
-- Name: Users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Users_id_seq" OWNED BY public."Users".id;


--
-- TOC entry 218 (class 1259 OID 41084)
-- Name: campaign_results; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.campaign_results (
    id integer NOT NULL,
    campaign_id integer NOT NULL,
    target_id integer NOT NULL,
    sent boolean DEFAULT false NOT NULL,
    sent_at timestamp without time zone,
    opened boolean DEFAULT false NOT NULL,
    opened_at timestamp without time zone,
    clicked boolean DEFAULT false NOT NULL,
    clicked_at timestamp without time zone,
    submitted boolean DEFAULT false NOT NULL,
    submitted_at timestamp without time zone,
    submitted_data jsonb,
    organization_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL
);


ALTER TABLE public.campaign_results OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 41083)
-- Name: campaign_results_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.campaign_results_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.campaign_results_id_seq OWNER TO postgres;

--
-- TOC entry 5110 (class 0 OID 0)
-- Dependencies: 217
-- Name: campaign_results_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.campaign_results_id_seq OWNED BY public.campaign_results.id;


--
-- TOC entry 220 (class 1259 OID 41099)
-- Name: campaigns; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.campaigns (
    id integer NOT NULL,
    name text NOT NULL,
    status text DEFAULT 'Draft'::text NOT NULL,
    target_group_id integer NOT NULL,
    smtp_profile_id integer NOT NULL,
    email_template_id integer NOT NULL,
    landing_page_id integer NOT NULL,
    scheduled_at timestamp without time zone,
    end_date timestamp without time zone,
    created_by_id integer NOT NULL,
    organization_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.campaigns OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 41098)
-- Name: campaigns_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.campaigns_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.campaigns_id_seq OWNER TO postgres;

--
-- TOC entry 5111 (class 0 OID 0)
-- Dependencies: 219
-- Name: campaigns_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.campaigns_id_seq OWNED BY public.campaigns.id;


--
-- TOC entry 222 (class 1259 OID 41111)
-- Name: email_templates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.email_templates (
    id integer NOT NULL,
    name text NOT NULL,
    subject text NOT NULL,
    html_content text NOT NULL,
    text_content text,
    sender_name text NOT NULL,
    sender_email text NOT NULL,
    organization_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    created_by_id integer,
    type text DEFAULT 'phishing-business'::text,
    complexity text DEFAULT 'medium'::text,
    description text,
    category text
);


ALTER TABLE public.email_templates OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 41110)
-- Name: email_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.email_templates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.email_templates_id_seq OWNER TO postgres;

--
-- TOC entry 5112 (class 0 OID 0)
-- Dependencies: 221
-- Name: email_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.email_templates_id_seq OWNED BY public.email_templates.id;


--
-- TOC entry 224 (class 1259 OID 41122)
-- Name: groups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.groups (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    organization_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.groups OWNER TO postgres;

--
-- TOC entry 5113 (class 0 OID 0)
-- Dependencies: 224
-- Name: COLUMN groups.organization_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.groups.organization_id IS 'comment';


--
-- TOC entry 223 (class 1259 OID 41121)
-- Name: groups_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.groups_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.groups_id_seq OWNER TO postgres;

--
-- TOC entry 5114 (class 0 OID 0)
-- Dependencies: 223
-- Name: groups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.groups_id_seq OWNED BY public.groups.id;


--
-- TOC entry 226 (class 1259 OID 41133)
-- Name: landing_pages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.landing_pages (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    html_content text NOT NULL,
    redirect_url text,
    page_type text NOT NULL,
    thumbnail text,
    organization_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    created_by_id integer
);


ALTER TABLE public.landing_pages OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 41132)
-- Name: landing_pages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.landing_pages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.landing_pages_id_seq OWNER TO postgres;

--
-- TOC entry 5115 (class 0 OID 0)
-- Dependencies: 225
-- Name: landing_pages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.landing_pages_id_seq OWNED BY public.landing_pages.id;


--
-- TOC entry 241 (class 1259 OID 73845)
-- Name: notification_preferences; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notification_preferences (
    id integer NOT NULL,
    user_id integer,
    email_notifications boolean DEFAULT true,
    push_notifications boolean DEFAULT true,
    campaign_alerts boolean DEFAULT true,
    security_alerts boolean DEFAULT true,
    system_updates boolean DEFAULT true,
    weekly_reports boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.notification_preferences OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 73844)
-- Name: notification_preferences_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notification_preferences_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notification_preferences_id_seq OWNER TO postgres;

--
-- TOC entry 5116 (class 0 OID 0)
-- Dependencies: 240
-- Name: notification_preferences_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notification_preferences_id_seq OWNED BY public.notification_preferences.id;


--
-- TOC entry 239 (class 1259 OID 73822)
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    user_id integer,
    organization_id integer,
    type character varying(50) NOT NULL,
    title character varying(200) NOT NULL,
    message text NOT NULL,
    is_read boolean DEFAULT false,
    priority character varying(20) DEFAULT 'medium'::character varying,
    action_url character varying(500),
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp without time zone DEFAULT now(),
    read_at timestamp without time zone
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 73821)
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO postgres;

--
-- TOC entry 5117 (class 0 OID 0)
-- Dependencies: 238
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- TOC entry 243 (class 1259 OID 82016)
-- Name: organization_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.organization_settings (
    id integer NOT NULL,
    organization_id integer NOT NULL,
    logo_url text,
    theme jsonb,
    settings jsonb
);


ALTER TABLE public.organization_settings OWNER TO postgres;

--
-- TOC entry 242 (class 1259 OID 82015)
-- Name: organization_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.organization_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.organization_settings_id_seq OWNER TO postgres;

--
-- TOC entry 5118 (class 0 OID 0)
-- Dependencies: 242
-- Name: organization_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.organization_settings_id_seq OWNED BY public.organization_settings.id;


--
-- TOC entry 228 (class 1259 OID 41144)
-- Name: organizations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.organizations (
    id integer NOT NULL,
    name text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    industry text,
    address text,
    logo_url text,
    settings jsonb
);


ALTER TABLE public.organizations OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 41143)
-- Name: organizations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.organizations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.organizations_id_seq OWNER TO postgres;

--
-- TOC entry 5119 (class 0 OID 0)
-- Dependencies: 227
-- Name: organizations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.organizations_id_seq OWNED BY public.organizations.id;


--
-- TOC entry 230 (class 1259 OID 41155)
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.password_reset_tokens (
    id integer NOT NULL,
    user_id integer NOT NULL,
    token text NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    used boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.password_reset_tokens OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 41154)
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.password_reset_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.password_reset_tokens_id_seq OWNER TO postgres;

--
-- TOC entry 5120 (class 0 OID 0)
-- Dependencies: 229
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.password_reset_tokens_id_seq OWNED BY public.password_reset_tokens.id;


--
-- TOC entry 237 (class 1259 OID 41892)
-- Name: session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.session OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 41166)
-- Name: smtp_profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.smtp_profiles (
    id integer NOT NULL,
    name text NOT NULL,
    host text NOT NULL,
    port integer NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    from_name text NOT NULL,
    from_email text NOT NULL,
    organization_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.smtp_profiles OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 41165)
-- Name: smtp_profiles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.smtp_profiles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.smtp_profiles_id_seq OWNER TO postgres;

--
-- TOC entry 5121 (class 0 OID 0)
-- Dependencies: 231
-- Name: smtp_profiles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.smtp_profiles_id_seq OWNED BY public.smtp_profiles.id;


--
-- TOC entry 234 (class 1259 OID 41177)
-- Name: targets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.targets (
    id integer NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text NOT NULL,
    "position" text,
    group_id integer NOT NULL,
    organization_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    department text
);


ALTER TABLE public.targets OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 41176)
-- Name: targets_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.targets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.targets_id_seq OWNER TO postgres;

--
-- TOC entry 5122 (class 0 OID 0)
-- Dependencies: 233
-- Name: targets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.targets_id_seq OWNED BY public.targets.id;


--
-- TOC entry 236 (class 1259 OID 41188)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    profile_picture text,
    "position" text,
    bio text,
    failed_login_attempts integer DEFAULT 0 NOT NULL,
    last_failed_login timestamp without time zone,
    account_locked boolean DEFAULT false NOT NULL,
    account_locked_until timestamp without time zone,
    is_admin boolean DEFAULT false NOT NULL,
    organization_id integer NOT NULL,
    organization_name text DEFAULT 'None'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    last_login timestamp without time zone
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 41187)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 5123 (class 0 OID 0)
-- Dependencies: 235
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 4812 (class 2604 OID 82089)
-- Name: Campaigns id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Campaigns" ALTER COLUMN id SET DEFAULT nextval('public."Campaigns_id_seq"'::regclass);


--
-- TOC entry 4815 (class 2604 OID 82133)
-- Name: Contents id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Contents" ALTER COLUMN id SET DEFAULT nextval('public."Contents_id_seq"'::regclass);


--
-- TOC entry 4818 (class 2604 OID 82167)
-- Name: Languages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Languages" ALTER COLUMN id SET DEFAULT nextval('public."Languages_id_seq"'::regclass);


--
-- TOC entry 4809 (class 2604 OID 82049)
-- Name: Organizations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Organizations" ALTER COLUMN id SET DEFAULT nextval('public."Organizations_id_seq"'::regclass);


--
-- TOC entry 4817 (class 2604 OID 82143)
-- Name: Results id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Results" ALTER COLUMN id SET DEFAULT nextval('public."Results_id_seq"'::regclass);


--
-- TOC entry 4813 (class 2604 OID 82111)
-- Name: Templates id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Templates" ALTER COLUMN id SET DEFAULT nextval('public."Templates_id_seq"'::regclass);


--
-- TOC entry 4810 (class 2604 OID 82065)
-- Name: Users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users" ALTER COLUMN id SET DEFAULT nextval('public."Users_id_seq"'::regclass);


--
-- TOC entry 4752 (class 2604 OID 82030)
-- Name: campaign_results id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaign_results ALTER COLUMN id SET DEFAULT nextval('public.campaign_results_id_seq'::regclass);


--
-- TOC entry 4760 (class 2604 OID 82031)
-- Name: campaigns id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaigns ALTER COLUMN id SET DEFAULT nextval('public.campaigns_id_seq'::regclass);


--
-- TOC entry 4764 (class 2604 OID 82032)
-- Name: email_templates id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_templates ALTER COLUMN id SET DEFAULT nextval('public.email_templates_id_seq'::regclass);


--
-- TOC entry 4769 (class 2604 OID 82033)
-- Name: groups id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.groups ALTER COLUMN id SET DEFAULT nextval('public.groups_id_seq'::regclass);


--
-- TOC entry 4772 (class 2604 OID 82034)
-- Name: landing_pages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.landing_pages ALTER COLUMN id SET DEFAULT nextval('public.landing_pages_id_seq'::regclass);


--
-- TOC entry 4799 (class 2604 OID 82035)
-- Name: notification_preferences id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_preferences ALTER COLUMN id SET DEFAULT nextval('public.notification_preferences_id_seq'::regclass);


--
-- TOC entry 4794 (class 2604 OID 82036)
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- TOC entry 4808 (class 2604 OID 82037)
-- Name: organization_settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organization_settings ALTER COLUMN id SET DEFAULT nextval('public.organization_settings_id_seq'::regclass);


--
-- TOC entry 4775 (class 2604 OID 82038)
-- Name: organizations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizations ALTER COLUMN id SET DEFAULT nextval('public.organizations_id_seq'::regclass);


--
-- TOC entry 4778 (class 2604 OID 82039)
-- Name: password_reset_tokens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens ALTER COLUMN id SET DEFAULT nextval('public.password_reset_tokens_id_seq'::regclass);


--
-- TOC entry 4781 (class 2604 OID 82040)
-- Name: smtp_profiles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.smtp_profiles ALTER COLUMN id SET DEFAULT nextval('public.smtp_profiles_id_seq'::regclass);


--
-- TOC entry 4784 (class 2604 OID 82041)
-- Name: targets id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.targets ALTER COLUMN id SET DEFAULT nextval('public.targets_id_seq'::regclass);


--
-- TOC entry 4787 (class 2604 OID 82042)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 5088 (class 0 OID 82086)
-- Dependencies: 249
-- Data for Name: Campaigns; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5092 (class 0 OID 82130)
-- Dependencies: 253
-- Data for Name: Contents; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."Contents" VALUES (1, 'Phishing Awareness Video', 'Video', '#', 'en', '2025-07-23 17:04:23.772+05', '2025-07-23 17:04:23.772+05');
INSERT INTO public."Contents" VALUES (2, 'Quiz: Spot the Phish', 'Quiz', '#', 'en', '2025-07-23 17:04:23.788+05', '2025-07-23 17:04:23.788+05');


--
-- TOC entry 5096 (class 0 OID 82164)
-- Dependencies: 257
-- Data for Name: Languages; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5084 (class 0 OID 82046)
-- Dependencies: 245
-- Data for Name: Organizations; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5094 (class 0 OID 82140)
-- Dependencies: 255
-- Data for Name: Results; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5090 (class 0 OID 82108)
-- Dependencies: 251
-- Data for Name: Templates; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5086 (class 0 OID 82062)
-- Dependencies: 247
-- Data for Name: Users; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5057 (class 0 OID 41084)
-- Dependencies: 218
-- Data for Name: campaign_results; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5059 (class 0 OID 41099)
-- Dependencies: 220
-- Data for Name: campaigns; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5061 (class 0 OID 41111)
-- Dependencies: 222
-- Data for Name: email_templates; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.email_templates VALUES (4, 'PhishNet1', 'mhgjhgvhjg', '<p>&nbsp;</p><div class="se-component se-image-container __se__float-"><figure style="width: 120px;"><img alt="" src="https://www.underconsideration.com/brandnew/archives/dropbox_2017_logo.png" data-proportion="true" data-align="" data-file-name="dropbox_2017_logo.png" data-file-size="0" data-origin="120px,27px" data-size="120px,27px" style="width: 120px; height: 27px;"></figure></div><p>&nbsp;</p><p>Hi {{.FirstName}},</p><p>You have a new document/s shared to you via dropbox sharing.</p><p><a href="{{.URL}}">VIEW HERE</a></p><p>&nbsp;</p><p>&nbsp;</p><p>{{.Tracker}}</p>', NULL, 'PhishNet Team', 'phishing@example.com', 1, '2025-05-04 12:34:32.076', '2025-05-04 12:34:32.076', 1, 'phishing-business', 'medium', 'Standard phishing template', 'business');
INSERT INTO public.email_templates VALUES (13, 'PhishNet', 'Important Bulletin Alert', '<h3>WebMail Account</h3><h1>Your mailbox has been compromised</h1><p>Your webmail account has been compromised.</p><p>We have blocked your account for your own safety.</p><p>Please follow these steps below to sign in and keep your account safe:</p><ol><li><a href="{{.URL}}">Protect your account</a></li><li>Learn how to <a href="{{.URL}}">make your account more secure</a></li></ol><p>To opt out or change where you receive security notifications, <a href="{{.URL}}">click here</a></p><p>Thanks,</p><p>Webmail account team</p>', NULL, 'PhishNet Team', 'phishing@example.com', 2, '2025-06-24 16:13:10.045986', '2025-07-01 19:27:30.333', 11, 'phishing-business', 'medium', 'Standard phishing template', 'business');
INSERT INTO public.email_templates VALUES (5, 'medium', 'mhgjhgvhjg', '<p style="margin-left:13.5pt">Hi {{.FirstName}},<br><br>Your package arrived at the post office. Here is your Shipping Document/Invoice and copy of DHL receipt for your tracking which includes the bill of lading and DHL tracking number, the new Import/Export policy supplied by DHL Express. Please kindly check the attached to confirm accordingly if your address is correct, before we submit to our outlet office for dispatch to your destination.</p><p style="margin-left:13.5pt"><strong>Label Number: E727D5151D<br>Class: Package Services<br>Service(s): Delivery Confirmation<br>Status: eNotification sent</strong></p><p><a href="{{.URL}}">View or download here</a> for the full statement information and a full description of package.</p><p style="margin-left:13.5pt">Your item will arrive from 2-5 days time.<br>We would like to thank you for using the services of DHL Express.<br>&nbsp;</p><p style="margin-left:13.7pt">{{.Tracker}}</p>', NULL, 'PhishNet Team', 'phishing@example.com', 1, '2025-05-04 13:20:31.354', '2025-05-04 13:20:31.354', 1, 'phishing-business', 'medium', 'Standard phishing template', 'business');
INSERT INTO public.email_templates VALUES (6, 'test', 'mhgjhgvhjg', '<p style="margin-left:13.5pt">Dear FDIC Customer,<br><br>The Federal Deposit Insurance Corporation Online department kindly asks you to take part in our quick and easy 5 questions survey.<br><br>In return we will credit $50.00 to your account - Just for your time!<br><br>With the information collected we can decide to direct a number of changes to improve and expand our services. The information you provide us is all non-sensitive and anonymous - No part of it is handed down to any third party.<br><br>It will be stored in our secure database for maximum 7 days while we process the results of this nationwide survey.<br><br>We kindly ask you to spare two minutes of your time and take part in our online survey.<br><br>To continue please click on the following link :</p><p style="margin-left:13.5pt">&nbsp;</p><p style="margin-left:13.5pt"><a href="{{.URL}}">http://important.fdic-survey.net/survey/fdic/login.html</a></p><p style="margin-left:13.5pt">&nbsp;</p><p style="margin-left:13.7pt">{{.Tracker}}</p><p style="margin-left:13.5pt">&nbsp;</p>', NULL, 'PhishNet Team', 'phishing@example.com', 1, '2025-05-06 01:38:31.158', '2025-05-06 01:38:31.158', 1, 'phishing-business', 'medium', 'Standard phishing template', 'business');


--
-- TOC entry 5063 (class 0 OID 41122)
-- Dependencies: 224
-- Data for Name: groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.groups VALUES (1, 'testrt', 'test', 1, '2025-04-30 02:44:59.253', '2025-05-01 02:09:25.906');
INSERT INTO public.groups VALUES (2, 'test2', 'test', 1, '2025-04-30 02:57:03.932', '2025-04-30 02:57:03.932');
INSERT INTO public.groups VALUES (8, 'PhishNet', '', 2, '2025-07-06 17:11:35.405646', '2025-07-06 17:11:35.405646');


--
-- TOC entry 5065 (class 0 OID 41133)
-- Dependencies: 226
-- Data for Name: landing_pages; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.landing_pages VALUES (1, 'test', 'jkhekf', '<div></div>', '', 'login', NULL, 2, '2025-06-24 11:43:20.810054', '2025-06-24 11:43:20.810054', 11);
INSERT INTO public.landing_pages VALUES (2, 'Riphah International University: Log in to the site', 'sda', '<!DOCTYPE html>

<html  dir="ltr" lang="en" xml:lang="en">
<head>
    <title>Riphah International University: Log in to the site</title>
    <link rel="shortcut icon" href="https://moellim.riphah.edu.pk/theme/image.php/classic/theme/1746215662/favicon" />
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta name="keywords" content="moodle, Riphah International University: Log in to the site" />
<link rel="stylesheet" type="text/css" href="https://moellim.riphah.edu.pk/theme/yui_combo.php?rollup/3.17.2/yui-moodlesimple-min.css" /><script id="firstthemesheet" type="text/css">/** Required in order to fix style inclusion problems in IE with YUI **/</script><link rel="stylesheet" type="text/css" href="https://moellim.riphah.edu.pk/theme/styles.php/classic/1746215662_1/all" />
<script type="text/javascript">
//<![CDATA[
var M = {}; M.yui = {};
M.pageloadstarttime = new Date();
M.cfg = {"wwwroot":"https:\/\/moellim.riphah.edu.pk","sesskey":"ITdb5hXJeA","sessiontimeout":"1800","themerev":"1746215662","slasharguments":1,"theme":"classic","iconsystemmodule":"core\/icon_system_fontawesome","jsrev":"1745292882","admin":"admin","svgicons":true,"usertimezone":"Asia\/Karachi","contextid":1,"langrev":1745292882,"templaterev":"1745292882"};var yui1ConfigFn = function(me) {if(/-skin|reset|fonts|grids|base/.test(me.name)){me.type=''css'';me.path=me.path.replace(/\.js/,''.css'');me.path=me.path.replace(/\/yui2-skin/,''/assets/skins/sam/yui2-skin'')}};
var yui2ConfigFn = function(me) {var parts=me.name.replace(/^moodle-/,'''').split(''-''),component=parts.shift(),module=parts[0],min=''-min'';if(/-(skin|core)$/.test(me.name)){parts.pop();me.type=''css'';min=''''}
if(module){var filename=parts.join(''-'');me.path=component+''/''+module+''/''+filename+min+''.''+me.type}else{me.path=component+''/''+component+''.''+me.type}};
YUI_config = {"debug":false,"base":"https:\/\/moellim.riphah.edu.pk\/lib\/yuilib\/3.17.2\/","comboBase":"https:\/\/moellim.riphah.edu.pk\/theme\/yui_combo.php?","combine":true,"filter":null,"insertBefore":"firstthemesheet","groups":{"yui2":{"base":"https:\/\/moellim.riphah.edu.pk\/lib\/yuilib\/2in3\/2.9.0\/build\/","comboBase":"https:\/\/moellim.riphah.edu.pk\/theme\/yui_combo.php?","combine":true,"ext":false,"root":"2in3\/2.9.0\/build\/","patterns":{"yui2-":{"group":"yui2","configFn":yui1ConfigFn}}},"moodle":{"name":"moodle","base":"https:\/\/moellim.riphah.edu.pk\/theme\/yui_combo.php?m\/1745292882\/","combine":true,"comboBase":"https:\/\/moellim.riphah.edu.pk\/theme\/yui_combo.php?","ext":false,"root":"m\/1745292882\/","patterns":{"moodle-":{"group":"moodle","configFn":yui2ConfigFn}},"filter":null,"modules":{"moodle-core-actionmenu":{"requires":["base","event","node-event-simulate"]},"moodle-core-dragdrop":{"requires":["base","node","io","dom","dd","event-key","event-focus","moodle-core-notification"]},"moodle-core-popuphelp":{"requires":["moodle-core-tooltip"]},"moodle-core-notification":{"requires":["moodle-core-notification-dialogue","moodle-core-notification-alert","moodle-core-notification-confirm","moodle-core-notification-exception","moodle-core-notification-ajaxexception"]},"moodle-core-notification-dialogue":{"requires":["base","node","panel","escape","event-key","dd-plugin","moodle-core-widget-focusafterclose","moodle-core-lockscroll"]},"moodle-core-notification-alert":{"requires":["moodle-core-notification-dialogue"]},"moodle-core-notification-confirm":{"requires":["moodle-core-notification-dialogue"]},"moodle-core-notification-exception":{"requires":["moodle-core-notification-dialogue"]},"moodle-core-notification-ajaxexception":{"requires":["moodle-core-notification-dialogue"]},"moodle-core-languninstallconfirm":{"requires":["base","node","moodle-core-notification-confirm","moodle-core-notification-alert"]},"moodle-core-tooltip":{"requires":["base","node","io-base","moodle-core-notification-dialogue","json-parse","widget-position","widget-position-align","event-outside","cache-base"]},"moodle-core-maintenancemodetimer":{"requires":["base","node"]},"moodle-core-event":{"requires":["event-custom"]},"moodle-core-handlebars":{"condition":{"trigger":"handlebars","when":"after"}},"moodle-core-lockscroll":{"requires":["plugin","base-build"]},"moodle-core-formchangechecker":{"requires":["base","event-focus","moodle-core-event"]},"moodle-core-blocks":{"requires":["base","node","io","dom","dd","dd-scroll","moodle-core-dragdrop","moodle-core-notification"]},"moodle-core-chooserdialogue":{"requires":["base","panel","moodle-core-notification"]},"moodle-core_availability-form":{"requires":["base","node","event","event-delegate","panel","moodle-core-notification-dialogue","json"]},"moodle-backup-confirmcancel":{"requires":["node","node-event-simulate","moodle-core-notification-confirm"]},"moodle-backup-backupselectall":{"requires":["node","event","node-event-simulate","anim"]},"moodle-course-formatchooser":{"requires":["base","node","node-event-simulate"]},"moodle-course-dragdrop":{"requires":["base","node","io","dom","dd","dd-scroll","moodle-core-dragdrop","moodle-core-notification","moodle-course-coursebase","moodle-course-util"]},"moodle-course-categoryexpander":{"requires":["node","event-key"]},"moodle-course-modchooser":{"requires":["moodle-core-chooserdialogue","moodle-course-coursebase"]},"moodle-course-management":{"requires":["base","node","io-base","moodle-core-notification-exception","json-parse","dd-constrain","dd-proxy","dd-drop","dd-delegate","node-event-delegate"]},"moodle-course-util":{"requires":["node"],"use":["moodle-course-util-base"],"submodules":{"moodle-course-util-base":{},"moodle-course-util-section":{"requires":["node","moodle-course-util-base"]},"moodle-course-util-cm":{"requires":["node","moodle-course-util-base"]}}},"moodle-form-shortforms":{"requires":["node","base","selector-css3","moodle-core-event"]},"moodle-form-dateselector":{"requires":["base","node","overlay","calendar"]},"moodle-form-passwordunmask":{"requires":[]},"moodle-question-chooser":{"requires":["moodle-core-chooserdialogue"]},"moodle-question-preview":{"requires":["base","dom","event-delegate","event-key","core_question_engine"]},"moodle-question-searchform":{"requires":["base","node"]},"moodle-availability_completion-form":{"requires":["base","node","event","moodle-core_availability-form"]},"moodle-availability_date-form":{"requires":["base","node","event","io","moodle-core_availability-form"]},"moodle-availability_grade-form":{"requires":["base","node","event","moodle-core_availability-form"]},"moodle-availability_group-form":{"requires":["base","node","event","moodle-core_availability-form"]},"moodle-availability_grouping-form":{"requires":["base","node","event","moodle-core_availability-form"]},"moodle-availability_profile-form":{"requires":["base","node","event","moodle-core_availability-form"]},"moodle-mod_assign-history":{"requires":["node","transition"]},"moodle-mod_attendance-groupfilter":{"requires":["base","node"]},"moodle-mod_bigbluebuttonbn-rooms":{"requires":["base","node","datasource-get","datasource-jsonschema","datasource-polling","moodle-core-notification"]},"moodle-mod_bigbluebuttonbn-imports":{"requires":["base","node"]},"moodle-mod_bigbluebuttonbn-modform":{"requires":["base","node"]},"moodle-mod_bigbluebuttonbn-broker":{"requires":["base","node","datasource-get","datasource-jsonschema","datasource-polling","moodle-core-notification"]},"moodle-mod_bigbluebuttonbn-recordings":{"requires":["base","node","datasource-get","datasource-jsonschema","datasource-polling","moodle-core-notification"]},"moodle-mod_quiz-dragdrop":{"requires":["base","node","io","dom","dd","dd-scroll","moodle-core-dragdrop","moodle-core-notification","moodle-mod_quiz-quizbase","moodle-mod_quiz-util-base","moodle-mod_quiz-util-page","moodle-mod_quiz-util-slot","moodle-course-util"]},"moodle-mod_quiz-autosave":{"requires":["base","node","event","event-valuechange","node-event-delegate","io-form"]},"moodle-mod_quiz-util":{"requires":["node","moodle-core-actionmenu"],"use":["moodle-mod_quiz-util-base"],"submodules":{"moodle-mod_quiz-util-base":{},"moodle-mod_quiz-util-slot":{"requires":["node","moodle-mod_quiz-util-base"]},"moodle-mod_quiz-util-page":{"requires":["node","moodle-mod_quiz-util-base"]}}},"moodle-mod_quiz-quizbase":{"requires":["base","node"]},"moodle-mod_quiz-modform":{"requires":["base","node","event"]},"moodle-mod_quiz-toolboxes":{"requires":["base","node","event","event-key","io","moodle-mod_quiz-quizbase","moodle-mod_quiz-util-slot","moodle-core-notification-ajaxexception"]},"moodle-mod_quiz-questionchooser":{"requires":["moodle-core-chooserdialogue","moodle-mod_quiz-util","querystring-parse"]},"moodle-message_airnotifier-toolboxes":{"requires":["base","node","io"]},"moodle-filter_glossary-autolinker":{"requires":["base","node","io-base","json-parse","event-delegate","overlay","moodle-core-event","moodle-core-notification-alert","moodle-core-notification-exception","moodle-core-notification-ajaxexception"]},"moodle-filter_mathjaxloader-loader":{"requires":["moodle-core-event"]},"moodle-editor_atto-editor":{"requires":["node","transition","io","overlay","escape","event","event-simulate","event-custom","node-event-html5","node-event-simulate","yui-throttle","moodle-core-notification-dialogue","moodle-core-notification-confirm","moodle-editor_atto-rangy","handlebars","timers","querystring-stringify"]},"moodle-editor_atto-plugin":{"requires":["node","base","escape","event","event-outside","handlebars","event-custom","timers","moodle-editor_atto-menu"]},"moodle-editor_atto-menu":{"requires":["moodle-core-notification-dialogue","node","event","event-custom"]},"moodle-editor_atto-rangy":{"requires":[]},"moodle-report_eventlist-eventfilter":{"requires":["base","event","node","node-event-delegate","datatable","autocomplete","autocomplete-filters"]},"moodle-report_loglive-fetchlogs":{"requires":["base","event","node","io","node-event-delegate"]},"moodle-gradereport_grader-gradereporttable":{"requires":["base","node","event","handlebars","overlay","event-hover"]},"moodle-gradereport_history-userselector":{"requires":["escape","event-delegate","event-key","handlebars","io-base","json-parse","moodle-core-notification-dialogue"]},"moodle-tool_capability-search":{"requires":["base","node"]},"moodle-tool_lp-dragdrop-reorder":{"requires":["moodle-core-dragdrop"]},"moodle-tool_monitor-dropdown":{"requires":["base","event","node"]},"moodle-assignfeedback_editpdf-editor":{"requires":["base","event","node","io","graphics","json","event-move","event-resize","transition","querystring-stringify-simple","moodle-core-notification-dialog","moodle-core-notification-alert","moodle-core-notification-warning","moodle-core-notification-exception","moodle-core-notification-ajaxexception"]},"moodle-atto_accessibilitychecker-button":{"requires":["color-base","moodle-editor_atto-plugin"]},"moodle-atto_accessibilityhelper-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_align-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_bold-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_charmap-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_clear-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_collapse-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_emojipicker-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_emoticon-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_equation-button":{"requires":["moodle-editor_atto-plugin","moodle-core-event","io","event-valuechange","tabview","array-extras"]},"moodle-atto_h5p-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_html-codemirror":{"requires":["moodle-atto_html-codemirror-skin"]},"moodle-atto_html-beautify":{},"moodle-atto_html-button":{"requires":["promise","moodle-editor_atto-plugin","moodle-atto_html-beautify","moodle-atto_html-codemirror","event-valuechange"]},"moodle-atto_image-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_indent-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_italic-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_link-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_managefiles-usedfiles":{"requires":["node","escape"]},"moodle-atto_managefiles-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_media-button":{"requires":["moodle-editor_atto-plugin","moodle-form-shortforms"]},"moodle-atto_noautolink-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_orderedlist-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_recordrtc-recording":{"requires":["moodle-atto_recordrtc-button"]},"moodle-atto_recordrtc-button":{"requires":["moodle-editor_atto-plugin","moodle-atto_recordrtc-recording"]},"moodle-atto_rtl-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_snippet-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_strike-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_subscript-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_superscript-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_table-button":{"requires":["moodle-editor_atto-plugin","moodle-editor_atto-menu","event","event-valuechange"]},"moodle-atto_title-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_underline-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_undo-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_unorderedlist-button":{"requires":["moodle-editor_atto-plugin"]}}},"gallery":{"name":"gallery","base":"https:\/\/moellim.riphah.edu.pk\/lib\/yuilib\/gallery\/","combine":true,"comboBase":"https:\/\/moellim.riphah.edu.pk\/theme\/yui_combo.php?","ext":false,"root":"gallery\/1745292882\/","patterns":{"gallery-":{"group":"gallery"}}}},"modules":{"core_filepicker":{"name":"core_filepicker","fullpath":"https:\/\/moellim.riphah.edu.pk\/lib\/javascript.php\/1745292882\/repository\/filepicker.js","requires":["base","node","node-event-simulate","json","async-queue","io-base","io-upload-iframe","io-form","yui2-treeview","panel","cookie","datatable","datatable-sort","resize-plugin","dd-plugin","escape","moodle-core_filepicker","moodle-core-notification-dialogue"]},"core_comment":{"name":"core_comment","fullpath":"https:\/\/moellim.riphah.edu.pk\/lib\/javascript.php\/1745292882\/comment\/comment.js","requires":["base","io-base","node","json","yui2-animation","overlay","escape"]},"mathjax":{"name":"mathjax","fullpath":"https:\/\/cdnjs.cloudflare.com\/ajax\/libs\/mathjax\/2.7.2\/MathJax.js?delayStartupUntil=configured"}}};
M.yui.loader = {modules: {}};

//]]>
</script>

<!-- Global site tag (gtag.js) - Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-N3MDL6BKSN"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag(''js'', new Date());

  gtag(''config'', ''G-N3MDL6BKSN'');
</script><meta name="robots" content="noindex" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body  id="page-login-index" class="format-site  path-login chrome dir-ltr lang-en yui-skin-sam yui3-skin-sam moellim-riphah-edu-pk pagelayout-login course-1 context-1 notloggedin ">
<div class="toast-wrapper mx-auto py-3 fixed-top" role="status" aria-live="polite"></div>

<div id="page-wrapper">

    <div>
    <a class="sr-only sr-only-focusable" href="#maincontent">Skip to main content</a>
</div><script type="text/javascript" src="https://moellim.riphah.edu.pk/lib/javascript.php/1745292882/lib/babel-polyfill/polyfill.min.js"></script>
<script type="text/javascript" src="https://moellim.riphah.edu.pk/lib/javascript.php/1745292882/lib/mdn-polyfills/polyfill.js"></script>
<script type="text/javascript" src="https://moellim.riphah.edu.pk/theme/yui_combo.php?rollup/3.17.2/yui-moodlesimple-min.js"></script><script type="text/javascript" src="https://moellim.riphah.edu.pk/lib/javascript.php/1745292882/lib/javascript-static.js"></script>
<script type="text/javascript">
//<![CDATA[
document.body.className += '' jsenabled'';
//]]>
</script>



    <div id="page" class="container-fluid mt-0">
        <div id="page-content" class="row">
            <div id="region-main-box" class="col-12">
                <section id="region-main" class="col-12" aria-label="Content">
                    <span class="notifications" id="user-notifications"></span>
                    <div role="main"><span id="maincontent"></span><div class="my-1 my-sm-5"></div>
<div class="row justify-content-center">
<div class="col-xl-6 col-sm-8 ">
<div class="card">
    <div class="card-block">
            <h2 class="card-header text-center" ><img src="https://moellim.riphah.edu.pk/pluginfile.php/1/core_admin/logo/0x200/1746215662/logo%20%281%29.png" class="img-fluid" title="Riphah International University" alt="Riphah International University"/></h2>
        <div class="card-body">


            <div class="row justify-content-md-center">
                <div class="col-md-5">
                    <form class="mt-3" action="https://moellim.riphah.edu.pk/login/index.php" method="post" id="login">
                        <input id="anchor" type="hidden" name="anchor" value="">
                        <script>document.getElementById(''anchor'').value = location.hash;</script>
                        <input type="hidden" name="logintoken" value="vo3UJeotPlVZLL0bJ9Vb8nYF9owjbYIc">
                        <div class="form-group">
                            <label for="username" class="sr-only">
                                    Username
                            </label>
                            <input type="text" name="username" id="username"
                                class="form-control"
                                value=""
                                placeholder="Username"
                                autocomplete="username">
                        </div>
                        <div class="form-group">
                            <label for="password" class="sr-only">Password</label>
                            <input type="password" name="password" id="password" value=""
                                class="form-control"
                                placeholder="Password"
                                autocomplete="current-password">
                        </div>
                            <div class="rememberpass mt-3">
                                <input type="checkbox" name="rememberusername" id="rememberusername" value="1"  />
                                <label for="rememberusername">Remember username</label>
                            </div>

                        <button type="submit" class="btn btn-primary btn-block mt-3" id="loginbtn">Log in</button>
                    </form>
                </div>

                <div class="col-md-5">
                    <div class="forgetpass mt-3">
                        <p><a href="https://moellim.riphah.edu.pk/login/forgot_password.php">Forgotten your username or password?</a></p>
                    </div>

                    <div class="mt-3">
                        Cookies must be enabled in your browser
                        <a class="btn btn-link p-0" role="button"
    data-container="body" data-toggle="popover"
    data-placement="right" data-content="&lt;div class=&quot;no-overflow&quot;&gt;&lt;p&gt;Two cookies are used on this site:&lt;/p&gt;

&lt;p&gt;The essential one is the session cookie, usually called MoodleSession. You must allow this cookie in your browser to provide continuity and to remain logged in when browsing the site. When you log out or close the browser, this cookie is destroyed (in your browser and on the server).&lt;/p&gt;

&lt;p&gt;The other cookie is purely for convenience, usually called MOODLEID or similar. It just remembers your username in the browser. This means that when you return to this site, the username field on the login page is already filled in for you. It is safe to refuse this cookie - you will just have to retype your username each time you log in.&lt;/p&gt;
&lt;/div&gt; "
    data-html="true" tabindex="0" data-trigger="focus">
  <i class="icon fa fa-question-circle text-info fa-fw "  title="Help with Cookies must be enabled in your browser" aria-label="Help with Cookies must be enabled in your browser"></i>
</a>
                    </div>

                </div>
            </div>
        </div>
    </div>
</div>
</div>
</div></div>
                    
                </section>
            </div>
        </div>
    </div>
    <footer id="page-footer" class="py-3 bg-dark text-light">
        <div class="container">
            <div id="course-footer"></div>


            <div class="logininfo">You are not logged in.</div>
            <div class="homelink"><a href="https://moellim.riphah.edu.pk/">Home</a></div>
            
            <script type="text/javascript">
//<![CDATA[
var require = {
    baseUrl : ''https://moellim.riphah.edu.pk/lib/requirejs.php/1745292882/'',
    // We only support AMD modules with an explicit define() statement.
    enforceDefine: true,
    skipDataMain: true,
    waitSeconds : 0,

    paths: {
        jquery: ''https://moellim.riphah.edu.pk/lib/javascript.php/1745292882/lib/jquery/jquery-3.4.1.min'',
        jqueryui: ''https://moellim.riphah.edu.pk/lib/javascript.php/1745292882/lib/jquery/ui-1.12.1/jquery-ui.min'',
        jqueryprivate: ''https://moellim.riphah.edu.pk/lib/javascript.php/1745292882/lib/requirejs/jquery-private''
    },

    // Custom jquery config map.
    map: {
      // ''*'' means all modules will get ''jqueryprivate''
      // for their ''jquery'' dependency.
      ''*'': { jquery: ''jqueryprivate'' },
      // Stub module for ''process''. This is a workaround for a bug in MathJax (see MDL-60458).
      ''*'': { process: ''core/first'' },

      // ''jquery-private'' wants the real jQuery module
      // though. If this line was not here, there would
      // be an unresolvable cyclic dependency.
      jqueryprivate: { jquery: ''jquery'' }
    }
};

//]]>
</script>
<script type="text/javascript" src="https://moellim.riphah.edu.pk/lib/javascript.php/1745292882/lib/requirejs/require.min.js"></script>
<script type="text/javascript">
//<![CDATA[
M.util.js_pending("core/first");require([''core/first''], function() {
;
require(["media_videojs/loader"], function(loader) {
    loader.setUp(function(videojs) {
        videojs.options.flash.swf = "https://moellim.riphah.edu.pk/media/player/videojs/videojs/video-js.swf";
videojs.addLanguage(''en'', {
  "Audio Player": "Audio Player",
  "Video Player": "Video Player",
  "Play": "Play",
  "Pause": "Pause",
  "Replay": "Replay",
  "Current Time": "Current Time",
  "Duration": "Duration",
  "Remaining Time": "Remaining Time",
  "Stream Type": "Stream Type",
  "LIVE": "LIVE",
  "Seek to live, currently behind live": "Seek to live, currently behind live",
  "Seek to live, currently playing live": "Seek to live, currently playing live",
  "Loaded": "Loaded",
  "Progress": "Progress",
  "Progress Bar": "Progress Bar",
  "progress bar timing: currentTime={1} duration={2}": "{1} of {2}",
  "Fullscreen": "Fullscreen",
  "Non-Fullscreen": "Non-Fullscreen",
  "Mute": "Mute",
  "Unmute": "Unmute",
  "Playback Rate": "Playback Rate",
  "Subtitles": "Subtitles",
  "subtitles off": "subtitles off",
  "Captions": "Captions",
  "captions off": "captions off",
  "Chapters": "Chapters",
  "Descriptions": "Descriptions",
  "descriptions off": "descriptions off",
  "Audio Track": "Audio Track",
  "Volume Level": "Volume Level",
  "You aborted the media playback": "You aborted the media playback",
  "A network error caused the media download to fail part-way.": "A network error caused the media download to fail part-way.",
  "The media could not be loaded, either because the server or network failed or because the format is not supported.": "The media could not be loaded, either because the server or network failed or because the format is not supported.",
  "The media playback was aborted due to a corruption problem or because the media used features your browser did not support.": "The media playback was aborted due to a corruption problem or because the media used features your browser did not support.",
  "No compatible source was found for this media.": "No compatible source was found for this media.",
  "The media is encrypted and we do not have the keys to decrypt it.": "The media is encrypted and we do not have the keys to decrypt it.",
  "Play Video": "Play Video",
  "Close": "Close",
  "Close Modal Dialog": "Close Modal Dialog",
  "Modal Window": "Modal Window",
  "This is a modal window": "This is a modal window",
  "This modal can be closed by pressing the Escape key or activating the close button.": "This modal can be closed by pressing the Escape key or activating the close button.",
  ", opens captions settings dialog": ", opens captions settings dialog",
  ", opens subtitles settings dialog": ", opens subtitles settings dialog",
  ", opens descriptions settings dialog": ", opens descriptions settings dialog",
  ", selected": ", selected",
  "captions settings": "captions settings",
  "subtitles settings": "subititles settings",
  "descriptions settings": "descriptions settings",
  "Text": "Text",
  "White": "White",
  "Black": "Black",
  "Red": "Red",
  "Green": "Green",
  "Blue": "Blue",
  "Yellow": "Yellow",
  "Magenta": "Magenta",
  "Cyan": "Cyan",
  "Background": "Background",
  "Window": "Window",
  "Transparent": "Transparent",
  "Semi-Transparent": "Semi-Transparent",
  "Opaque": "Opaque",
  "Font Size": "Font Size",
  "Text Edge Style": "Text Edge Style",
  "None": "None",
  "Raised": "Raised",
  "Depressed": "Depressed",
  "Uniform": "Uniform",
  "Dropshadow": "Dropshadow",
  "Font Family": "Font Family",
  "Proportional Sans-Serif": "Proportional Sans-Serif",
  "Monospace Sans-Serif": "Monospace Sans-Serif",
  "Proportional Serif": "Proportional Serif",
  "Monospace Serif": "Monospace Serif",
  "Casual": "Casual",
  "Script": "Script",
  "Small Caps": "Small Caps",
  "Reset": "Reset",
  "restore all settings to the default values": "restore all settings to the default values",
  "Done": "Done",
  "Caption Settings Dialog": "Caption Settings Dialog",
  "Beginning of dialog window. Escape will cancel and close the window.": "Beginning of dialog window. Escape will cancel and close the window.",
  "End of dialog window.": "End of dialog window.",
  "{1} is loading.": "{1} is loading."
});

    });
});;

M.util.js_pending(''theme_boost/loader'');
require([''theme_boost/loader''], function() {
  M.util.js_complete(''theme_boost/loader'');
});
;

;
M.util.js_pending(''core/notification''); require([''core/notification''], function(amd) {amd.init(1, []); M.util.js_complete(''core/notification'');});;
M.util.js_pending(''core/log''); require([''core/log''], function(amd) {amd.setConfig({"level":"warn"}); M.util.js_complete(''core/log'');});;
M.util.js_pending(''core/page_global''); require([''core/page_global''], function(amd) {amd.init(); M.util.js_complete(''core/page_global'');});M.util.js_complete("core/first");
});
//]]>
</script>
<script type="text/javascript">
//<![CDATA[
M.str = {"moodle":{"lastmodified":"Last modified","name":"Name","error":"Error","info":"Information","yes":"Yes","no":"No","cancel":"Cancel","confirm":"Confirm","areyousure":"Are you sure?","closebuttontitle":"Close","unknownerror":"Unknown error","file":"File","url":"URL"},"repository":{"type":"Type","size":"Size","invalidjson":"Invalid JSON string","nofilesattached":"No files attached","filepicker":"File picker","logout":"Logout","nofilesavailable":"No files available","norepositoriesavailable":"Sorry, none of your current repositories can return files in the required format.","fileexistsdialogheader":"File exists","fileexistsdialog_editor":"A file with that name has already been attached to the text you are editing.","fileexistsdialog_filemanager":"A file with that name has already been attached","renameto":"Rename to \"{$a}\"","referencesexist":"There are {$a} alias\/shortcut files that use this file as their source","select":"Select"},"admin":{"confirmdeletecomments":"You are about to delete comments, are you sure?","confirmation":"Confirmation"},"debug":{"debuginfo":"Debug info","line":"Line","stacktrace":"Stack trace"},"langconfig":{"labelsep":": "}};
//]]>
</script>
<script type="text/javascript">
//<![CDATA[
(function() {Y.use("moodle-filter_mathjaxloader-loader",function() {M.filter_mathjaxloader.configure({"mathjaxconfig":"\nMathJax.Hub.Config({\n    config: [\"Accessible.js\", \"Safe.js\"],\n    errorSettings: { message: [\"!\"] },\n    skipStartupTypeset: true,\n    messageStyle: \"none\"\n});\n","lang":"en"});
});
M.util.help_popups.setup(Y);
 M.util.js_pending(''random685a5eddb1e792''); Y.on(''domready'', function() { M.util.js_complete("init");  M.util.js_complete(''random685a5eddb1e792''); });
})();
//]]>
</script>

        </div>
    </footer>
</div>

</body>
</html>', '', 'login', NULL, 2, '2025-06-24 13:18:19.28046', '2025-06-24 13:18:19.28046', 11);
INSERT INTO public.landing_pages VALUES (3, 'riphah', 'sda', '<!DOCTYPE html>

<html  dir="ltr" lang="en" xml:lang="en">
<head>
    <title>Riphah International University: Log in to the site</title>
    <link rel="shortcut icon" href="https://moellim.riphah.edu.pk/theme/image.php/classic/theme/1746215662/favicon" />
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta name="keywords" content="moodle, Riphah International University: Log in to the site" />
<link rel="stylesheet" type="text/css" href="https://moellim.riphah.edu.pk/theme/yui_combo.php?rollup/3.17.2/yui-moodlesimple-min.css" /><script id="firstthemesheet" type="text/css">/** Required in order to fix style inclusion problems in IE with YUI **/</script><link rel="stylesheet" type="text/css" href="https://moellim.riphah.edu.pk/theme/styles.php/classic/1746215662_1/all" />
<script type="text/javascript">
//<![CDATA[
var M = {}; M.yui = {};
M.pageloadstarttime = new Date();
M.cfg = {"wwwroot":"https:\/\/moellim.riphah.edu.pk","sesskey":"HXfvMK7xZU","sessiontimeout":"1800","themerev":"1746215662","slasharguments":1,"theme":"classic","iconsystemmodule":"core\/icon_system_fontawesome","jsrev":"1745292882","admin":"admin","svgicons":true,"usertimezone":"Asia\/Karachi","contextid":1,"langrev":1745292882,"templaterev":"1745292882"};var yui1ConfigFn = function(me) {if(/-skin|reset|fonts|grids|base/.test(me.name)){me.type=''css'';me.path=me.path.replace(/\.js/,''.css'');me.path=me.path.replace(/\/yui2-skin/,''/assets/skins/sam/yui2-skin'')}};
var yui2ConfigFn = function(me) {var parts=me.name.replace(/^moodle-/,'''').split(''-''),component=parts.shift(),module=parts[0],min=''-min'';if(/-(skin|core)$/.test(me.name)){parts.pop();me.type=''css'';min=''''}
if(module){var filename=parts.join(''-'');me.path=component+''/''+module+''/''+filename+min+''.''+me.type}else{me.path=component+''/''+component+''.''+me.type}};
YUI_config = {"debug":false,"base":"https:\/\/moellim.riphah.edu.pk\/lib\/yuilib\/3.17.2\/","comboBase":"https:\/\/moellim.riphah.edu.pk\/theme\/yui_combo.php?","combine":true,"filter":null,"insertBefore":"firstthemesheet","groups":{"yui2":{"base":"https:\/\/moellim.riphah.edu.pk\/lib\/yuilib\/2in3\/2.9.0\/build\/","comboBase":"https:\/\/moellim.riphah.edu.pk\/theme\/yui_combo.php?","combine":true,"ext":false,"root":"2in3\/2.9.0\/build\/","patterns":{"yui2-":{"group":"yui2","configFn":yui1ConfigFn}}},"moodle":{"name":"moodle","base":"https:\/\/moellim.riphah.edu.pk\/theme\/yui_combo.php?m\/1745292882\/","combine":true,"comboBase":"https:\/\/moellim.riphah.edu.pk\/theme\/yui_combo.php?","ext":false,"root":"m\/1745292882\/","patterns":{"moodle-":{"group":"moodle","configFn":yui2ConfigFn}},"filter":null,"modules":{"moodle-core-actionmenu":{"requires":["base","event","node-event-simulate"]},"moodle-core-dragdrop":{"requires":["base","node","io","dom","dd","event-key","event-focus","moodle-core-notification"]},"moodle-core-popuphelp":{"requires":["moodle-core-tooltip"]},"moodle-core-notification":{"requires":["moodle-core-notification-dialogue","moodle-core-notification-alert","moodle-core-notification-confirm","moodle-core-notification-exception","moodle-core-notification-ajaxexception"]},"moodle-core-notification-dialogue":{"requires":["base","node","panel","escape","event-key","dd-plugin","moodle-core-widget-focusafterclose","moodle-core-lockscroll"]},"moodle-core-notification-alert":{"requires":["moodle-core-notification-dialogue"]},"moodle-core-notification-confirm":{"requires":["moodle-core-notification-dialogue"]},"moodle-core-notification-exception":{"requires":["moodle-core-notification-dialogue"]},"moodle-core-notification-ajaxexception":{"requires":["moodle-core-notification-dialogue"]},"moodle-core-languninstallconfirm":{"requires":["base","node","moodle-core-notification-confirm","moodle-core-notification-alert"]},"moodle-core-tooltip":{"requires":["base","node","io-base","moodle-core-notification-dialogue","json-parse","widget-position","widget-position-align","event-outside","cache-base"]},"moodle-core-maintenancemodetimer":{"requires":["base","node"]},"moodle-core-event":{"requires":["event-custom"]},"moodle-core-handlebars":{"condition":{"trigger":"handlebars","when":"after"}},"moodle-core-lockscroll":{"requires":["plugin","base-build"]},"moodle-core-formchangechecker":{"requires":["base","event-focus","moodle-core-event"]},"moodle-core-blocks":{"requires":["base","node","io","dom","dd","dd-scroll","moodle-core-dragdrop","moodle-core-notification"]},"moodle-core-chooserdialogue":{"requires":["base","panel","moodle-core-notification"]},"moodle-core_availability-form":{"requires":["base","node","event","event-delegate","panel","moodle-core-notification-dialogue","json"]},"moodle-backup-confirmcancel":{"requires":["node","node-event-simulate","moodle-core-notification-confirm"]},"moodle-backup-backupselectall":{"requires":["node","event","node-event-simulate","anim"]},"moodle-course-formatchooser":{"requires":["base","node","node-event-simulate"]},"moodle-course-dragdrop":{"requires":["base","node","io","dom","dd","dd-scroll","moodle-core-dragdrop","moodle-core-notification","moodle-course-coursebase","moodle-course-util"]},"moodle-course-categoryexpander":{"requires":["node","event-key"]},"moodle-course-modchooser":{"requires":["moodle-core-chooserdialogue","moodle-course-coursebase"]},"moodle-course-management":{"requires":["base","node","io-base","moodle-core-notification-exception","json-parse","dd-constrain","dd-proxy","dd-drop","dd-delegate","node-event-delegate"]},"moodle-course-util":{"requires":["node"],"use":["moodle-course-util-base"],"submodules":{"moodle-course-util-base":{},"moodle-course-util-section":{"requires":["node","moodle-course-util-base"]},"moodle-course-util-cm":{"requires":["node","moodle-course-util-base"]}}},"moodle-form-shortforms":{"requires":["node","base","selector-css3","moodle-core-event"]},"moodle-form-dateselector":{"requires":["base","node","overlay","calendar"]},"moodle-form-passwordunmask":{"requires":[]},"moodle-question-chooser":{"requires":["moodle-core-chooserdialogue"]},"moodle-question-preview":{"requires":["base","dom","event-delegate","event-key","core_question_engine"]},"moodle-question-searchform":{"requires":["base","node"]},"moodle-availability_completion-form":{"requires":["base","node","event","moodle-core_availability-form"]},"moodle-availability_date-form":{"requires":["base","node","event","io","moodle-core_availability-form"]},"moodle-availability_grade-form":{"requires":["base","node","event","moodle-core_availability-form"]},"moodle-availability_group-form":{"requires":["base","node","event","moodle-core_availability-form"]},"moodle-availability_grouping-form":{"requires":["base","node","event","moodle-core_availability-form"]},"moodle-availability_profile-form":{"requires":["base","node","event","moodle-core_availability-form"]},"moodle-mod_assign-history":{"requires":["node","transition"]},"moodle-mod_attendance-groupfilter":{"requires":["base","node"]},"moodle-mod_bigbluebuttonbn-rooms":{"requires":["base","node","datasource-get","datasource-jsonschema","datasource-polling","moodle-core-notification"]},"moodle-mod_bigbluebuttonbn-imports":{"requires":["base","node"]},"moodle-mod_bigbluebuttonbn-modform":{"requires":["base","node"]},"moodle-mod_bigbluebuttonbn-broker":{"requires":["base","node","datasource-get","datasource-jsonschema","datasource-polling","moodle-core-notification"]},"moodle-mod_bigbluebuttonbn-recordings":{"requires":["base","node","datasource-get","datasource-jsonschema","datasource-polling","moodle-core-notification"]},"moodle-mod_quiz-dragdrop":{"requires":["base","node","io","dom","dd","dd-scroll","moodle-core-dragdrop","moodle-core-notification","moodle-mod_quiz-quizbase","moodle-mod_quiz-util-base","moodle-mod_quiz-util-page","moodle-mod_quiz-util-slot","moodle-course-util"]},"moodle-mod_quiz-autosave":{"requires":["base","node","event","event-valuechange","node-event-delegate","io-form"]},"moodle-mod_quiz-util":{"requires":["node","moodle-core-actionmenu"],"use":["moodle-mod_quiz-util-base"],"submodules":{"moodle-mod_quiz-util-base":{},"moodle-mod_quiz-util-slot":{"requires":["node","moodle-mod_quiz-util-base"]},"moodle-mod_quiz-util-page":{"requires":["node","moodle-mod_quiz-util-base"]}}},"moodle-mod_quiz-quizbase":{"requires":["base","node"]},"moodle-mod_quiz-modform":{"requires":["base","node","event"]},"moodle-mod_quiz-toolboxes":{"requires":["base","node","event","event-key","io","moodle-mod_quiz-quizbase","moodle-mod_quiz-util-slot","moodle-core-notification-ajaxexception"]},"moodle-mod_quiz-questionchooser":{"requires":["moodle-core-chooserdialogue","moodle-mod_quiz-util","querystring-parse"]},"moodle-message_airnotifier-toolboxes":{"requires":["base","node","io"]},"moodle-filter_glossary-autolinker":{"requires":["base","node","io-base","json-parse","event-delegate","overlay","moodle-core-event","moodle-core-notification-alert","moodle-core-notification-exception","moodle-core-notification-ajaxexception"]},"moodle-filter_mathjaxloader-loader":{"requires":["moodle-core-event"]},"moodle-editor_atto-editor":{"requires":["node","transition","io","overlay","escape","event","event-simulate","event-custom","node-event-html5","node-event-simulate","yui-throttle","moodle-core-notification-dialogue","moodle-core-notification-confirm","moodle-editor_atto-rangy","handlebars","timers","querystring-stringify"]},"moodle-editor_atto-plugin":{"requires":["node","base","escape","event","event-outside","handlebars","event-custom","timers","moodle-editor_atto-menu"]},"moodle-editor_atto-menu":{"requires":["moodle-core-notification-dialogue","node","event","event-custom"]},"moodle-editor_atto-rangy":{"requires":[]},"moodle-report_eventlist-eventfilter":{"requires":["base","event","node","node-event-delegate","datatable","autocomplete","autocomplete-filters"]},"moodle-report_loglive-fetchlogs":{"requires":["base","event","node","io","node-event-delegate"]},"moodle-gradereport_grader-gradereporttable":{"requires":["base","node","event","handlebars","overlay","event-hover"]},"moodle-gradereport_history-userselector":{"requires":["escape","event-delegate","event-key","handlebars","io-base","json-parse","moodle-core-notification-dialogue"]},"moodle-tool_capability-search":{"requires":["base","node"]},"moodle-tool_lp-dragdrop-reorder":{"requires":["moodle-core-dragdrop"]},"moodle-tool_monitor-dropdown":{"requires":["base","event","node"]},"moodle-assignfeedback_editpdf-editor":{"requires":["base","event","node","io","graphics","json","event-move","event-resize","transition","querystring-stringify-simple","moodle-core-notification-dialog","moodle-core-notification-alert","moodle-core-notification-warning","moodle-core-notification-exception","moodle-core-notification-ajaxexception"]},"moodle-atto_accessibilitychecker-button":{"requires":["color-base","moodle-editor_atto-plugin"]},"moodle-atto_accessibilityhelper-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_align-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_bold-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_charmap-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_clear-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_collapse-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_emojipicker-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_emoticon-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_equation-button":{"requires":["moodle-editor_atto-plugin","moodle-core-event","io","event-valuechange","tabview","array-extras"]},"moodle-atto_h5p-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_html-codemirror":{"requires":["moodle-atto_html-codemirror-skin"]},"moodle-atto_html-beautify":{},"moodle-atto_html-button":{"requires":["promise","moodle-editor_atto-plugin","moodle-atto_html-beautify","moodle-atto_html-codemirror","event-valuechange"]},"moodle-atto_image-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_indent-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_italic-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_link-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_managefiles-usedfiles":{"requires":["node","escape"]},"moodle-atto_managefiles-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_media-button":{"requires":["moodle-editor_atto-plugin","moodle-form-shortforms"]},"moodle-atto_noautolink-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_orderedlist-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_recordrtc-recording":{"requires":["moodle-atto_recordrtc-button"]},"moodle-atto_recordrtc-button":{"requires":["moodle-editor_atto-plugin","moodle-atto_recordrtc-recording"]},"moodle-atto_rtl-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_snippet-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_strike-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_subscript-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_superscript-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_table-button":{"requires":["moodle-editor_atto-plugin","moodle-editor_atto-menu","event","event-valuechange"]},"moodle-atto_title-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_underline-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_undo-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_unorderedlist-button":{"requires":["moodle-editor_atto-plugin"]}}},"gallery":{"name":"gallery","base":"https:\/\/moellim.riphah.edu.pk\/lib\/yuilib\/gallery\/","combine":true,"comboBase":"https:\/\/moellim.riphah.edu.pk\/theme\/yui_combo.php?","ext":false,"root":"gallery\/1745292882\/","patterns":{"gallery-":{"group":"gallery"}}}},"modules":{"core_filepicker":{"name":"core_filepicker","fullpath":"https:\/\/moellim.riphah.edu.pk\/lib\/javascript.php\/1745292882\/repository\/filepicker.js","requires":["base","node","node-event-simulate","json","async-queue","io-base","io-upload-iframe","io-form","yui2-treeview","panel","cookie","datatable","datatable-sort","resize-plugin","dd-plugin","escape","moodle-core_filepicker","moodle-core-notification-dialogue"]},"core_comment":{"name":"core_comment","fullpath":"https:\/\/moellim.riphah.edu.pk\/lib\/javascript.php\/1745292882\/comment\/comment.js","requires":["base","io-base","node","json","yui2-animation","overlay","escape"]},"mathjax":{"name":"mathjax","fullpath":"https:\/\/cdnjs.cloudflare.com\/ajax\/libs\/mathjax\/2.7.2\/MathJax.js?delayStartupUntil=configured"}}};
M.yui.loader = {modules: {}};

//]]>
</script>

<!-- Global site tag (gtag.js) - Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-N3MDL6BKSN"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag(''js'', new Date());

  gtag(''config'', ''G-N3MDL6BKSN'');
</script><meta name="robots" content="noindex" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body  id="page-login-index" class="format-site  path-login chrome dir-ltr lang-en yui-skin-sam yui3-skin-sam moellim-riphah-edu-pk pagelayout-login course-1 context-1 notloggedin ">
<div class="toast-wrapper mx-auto py-3 fixed-top" role="status" aria-live="polite"></div>

<div id="page-wrapper">

    <div>
    <a class="sr-only sr-only-focusable" href="#maincontent">Skip to main content</a>
</div><script type="text/javascript" src="https://moellim.riphah.edu.pk/lib/javascript.php/1745292882/lib/babel-polyfill/polyfill.min.js"></script>
<script type="text/javascript" src="https://moellim.riphah.edu.pk/lib/javascript.php/1745292882/lib/mdn-polyfills/polyfill.js"></script>
<script type="text/javascript" src="https://moellim.riphah.edu.pk/theme/yui_combo.php?rollup/3.17.2/yui-moodlesimple-min.js"></script><script type="text/javascript" src="https://moellim.riphah.edu.pk/lib/javascript.php/1745292882/lib/javascript-static.js"></script>
<script type="text/javascript">
//<![CDATA[
document.body.className += '' jsenabled'';
//]]>
</script>



    <div id="page" class="container-fluid mt-0">
        <div id="page-content" class="row">
            <div id="region-main-box" class="col-12">
                <section id="region-main" class="col-12" aria-label="Content">
                    <span class="notifications" id="user-notifications"></span>
                    <div role="main"><span id="maincontent"></span><div class="my-1 my-sm-5"></div>
<div class="row justify-content-center">
<div class="col-xl-6 col-sm-8 ">
<div class="card">
    <div class="card-block">
            <h2 class="card-header text-center" ><img src="https://moellim.riphah.edu.pk/pluginfile.php/1/core_admin/logo/0x200/1746215662/logo%20%281%29.png" class="img-fluid" title="Riphah International University" alt="Riphah International University"/></h2>
        <div class="card-body">


            <div class="row justify-content-md-center">
                <div class="col-md-5">
                    <form class="mt-3" action="https://moellim.riphah.edu.pk/login/index.php" method="post" id="login">
                        <input id="anchor" type="hidden" name="anchor" value="">
                        <script>document.getElementById(''anchor'').value = location.hash;</script>
                        <input type="hidden" name="logintoken" value="HTNWIqRrbREguvqmzeYEq6uWLpyiPUBD">
                        <div class="form-group">
                            <label for="username" class="sr-only">
                                    Username
                            </label>
                            <input type="text" name="username" id="username"
                                class="form-control"
                                value=""
                                placeholder="Username"
                                autocomplete="username">
                        </div>
                        <div class="form-group">
                            <label for="password" class="sr-only">Password</label>
                            <input type="password" name="password" id="password" value=""
                                class="form-control"
                                placeholder="Password"
                                autocomplete="current-password">
                        </div>
                            <div class="rememberpass mt-3">
                                <input type="checkbox" name="rememberusername" id="rememberusername" value="1"  />
                                <label for="rememberusername">Remember username</label>
                            </div>

                        <button type="submit" class="btn btn-primary btn-block mt-3" id="loginbtn">Log in</button>
                    </form>
                </div>

                <div class="col-md-5">
                    <div class="forgetpass mt-3">
                        <p><a href="https://moellim.riphah.edu.pk/login/forgot_password.php">Forgotten your username or password?</a></p>
                    </div>

                    <div class="mt-3">
                        Cookies must be enabled in your browser
                        <a class="btn btn-link p-0" role="button"
    data-container="body" data-toggle="popover"
    data-placement="right" data-content="&lt;div class=&quot;no-overflow&quot;&gt;&lt;p&gt;Two cookies are used on this site:&lt;/p&gt;

&lt;p&gt;The essential one is the session cookie, usually called MoodleSession. You must allow this cookie in your browser to provide continuity and to remain logged in when browsing the site. When you log out or close the browser, this cookie is destroyed (in your browser and on the server).&lt;/p&gt;

&lt;p&gt;The other cookie is purely for convenience, usually called MOODLEID or similar. It just remembers your username in the browser. This means that when you return to this site, the username field on the login page is already filled in for you. It is safe to refuse this cookie - you will just have to retype your username each time you log in.&lt;/p&gt;
&lt;/div&gt; "
    data-html="true" tabindex="0" data-trigger="focus">
  <i class="icon fa fa-question-circle text-info fa-fw "  title="Help with Cookies must be enabled in your browser" aria-label="Help with Cookies must be enabled in your browser"></i>
</a>
                    </div>

                </div>
            </div>
        </div>
    </div>
</div>
</div>
</div></div>
                    
                </section>
            </div>
        </div>
    </div>
    <footer id="page-footer" class="py-3 bg-dark text-light">
        <div class="container">
            <div id="course-footer"></div>


            <div class="logininfo">You are not logged in.</div>
            <div class="homelink"><a href="https://moellim.riphah.edu.pk/">Home</a></div>
            
            <script type="text/javascript">
//<![CDATA[
var require = {
    baseUrl : ''https://moellim.riphah.edu.pk/lib/requirejs.php/1745292882/'',
    // We only support AMD modules with an explicit define() statement.
    enforceDefine: true,
    skipDataMain: true,
    waitSeconds : 0,

    paths: {
        jquery: ''https://moellim.riphah.edu.pk/lib/javascript.php/1745292882/lib/jquery/jquery-3.4.1.min'',
        jqueryui: ''https://moellim.riphah.edu.pk/lib/javascript.php/1745292882/lib/jquery/ui-1.12.1/jquery-ui.min'',
        jqueryprivate: ''https://moellim.riphah.edu.pk/lib/javascript.php/1745292882/lib/requirejs/jquery-private''
    },

    // Custom jquery config map.
    map: {
      // ''*'' means all modules will get ''jqueryprivate''
      // for their ''jquery'' dependency.
      ''*'': { jquery: ''jqueryprivate'' },
      // Stub module for ''process''. This is a workaround for a bug in MathJax (see MDL-60458).
      ''*'': { process: ''core/first'' },

      // ''jquery-private'' wants the real jQuery module
      // though. If this line was not here, there would
      // be an unresolvable cyclic dependency.
      jqueryprivate: { jquery: ''jquery'' }
    }
};

//]]>
</script>
<script type="text/javascript" src="https://moellim.riphah.edu.pk/lib/javascript.php/1745292882/lib/requirejs/require.min.js"></script>
<script type="text/javascript">
//<![CDATA[
M.util.js_pending("core/first");require([''core/first''], function() {
;
require(["media_videojs/loader"], function(loader) {
    loader.setUp(function(videojs) {
        videojs.options.flash.swf = "https://moellim.riphah.edu.pk/media/player/videojs/videojs/video-js.swf";
videojs.addLanguage(''en'', {
  "Audio Player": "Audio Player",
  "Video Player": "Video Player",
  "Play": "Play",
  "Pause": "Pause",
  "Replay": "Replay",
  "Current Time": "Current Time",
  "Duration": "Duration",
  "Remaining Time": "Remaining Time",
  "Stream Type": "Stream Type",
  "LIVE": "LIVE",
  "Seek to live, currently behind live": "Seek to live, currently behind live",
  "Seek to live, currently playing live": "Seek to live, currently playing live",
  "Loaded": "Loaded",
  "Progress": "Progress",
  "Progress Bar": "Progress Bar",
  "progress bar timing: currentTime={1} duration={2}": "{1} of {2}",
  "Fullscreen": "Fullscreen",
  "Non-Fullscreen": "Non-Fullscreen",
  "Mute": "Mute",
  "Unmute": "Unmute",
  "Playback Rate": "Playback Rate",
  "Subtitles": "Subtitles",
  "subtitles off": "subtitles off",
  "Captions": "Captions",
  "captions off": "captions off",
  "Chapters": "Chapters",
  "Descriptions": "Descriptions",
  "descriptions off": "descriptions off",
  "Audio Track": "Audio Track",
  "Volume Level": "Volume Level",
  "You aborted the media playback": "You aborted the media playback",
  "A network error caused the media download to fail part-way.": "A network error caused the media download to fail part-way.",
  "The media could not be loaded, either because the server or network failed or because the format is not supported.": "The media could not be loaded, either because the server or network failed or because the format is not supported.",
  "The media playback was aborted due to a corruption problem or because the media used features your browser did not support.": "The media playback was aborted due to a corruption problem or because the media used features your browser did not support.",
  "No compatible source was found for this media.": "No compatible source was found for this media.",
  "The media is encrypted and we do not have the keys to decrypt it.": "The media is encrypted and we do not have the keys to decrypt it.",
  "Play Video": "Play Video",
  "Close": "Close",
  "Close Modal Dialog": "Close Modal Dialog",
  "Modal Window": "Modal Window",
  "This is a modal window": "This is a modal window",
  "This modal can be closed by pressing the Escape key or activating the close button.": "This modal can be closed by pressing the Escape key or activating the close button.",
  ", opens captions settings dialog": ", opens captions settings dialog",
  ", opens subtitles settings dialog": ", opens subtitles settings dialog",
  ", opens descriptions settings dialog": ", opens descriptions settings dialog",
  ", selected": ", selected",
  "captions settings": "captions settings",
  "subtitles settings": "subititles settings",
  "descriptions settings": "descriptions settings",
  "Text": "Text",
  "White": "White",
  "Black": "Black",
  "Red": "Red",
  "Green": "Green",
  "Blue": "Blue",
  "Yellow": "Yellow",
  "Magenta": "Magenta",
  "Cyan": "Cyan",
  "Background": "Background",
  "Window": "Window",
  "Transparent": "Transparent",
  "Semi-Transparent": "Semi-Transparent",
  "Opaque": "Opaque",
  "Font Size": "Font Size",
  "Text Edge Style": "Text Edge Style",
  "None": "None",
  "Raised": "Raised",
  "Depressed": "Depressed",
  "Uniform": "Uniform",
  "Dropshadow": "Dropshadow",
  "Font Family": "Font Family",
  "Proportional Sans-Serif": "Proportional Sans-Serif",
  "Monospace Sans-Serif": "Monospace Sans-Serif",
  "Proportional Serif": "Proportional Serif",
  "Monospace Serif": "Monospace Serif",
  "Casual": "Casual",
  "Script": "Script",
  "Small Caps": "Small Caps",
  "Reset": "Reset",
  "restore all settings to the default values": "restore all settings to the default values",
  "Done": "Done",
  "Caption Settings Dialog": "Caption Settings Dialog",
  "Beginning of dialog window. Escape will cancel and close the window.": "Beginning of dialog window. Escape will cancel and close the window.",
  "End of dialog window.": "End of dialog window.",
  "{1} is loading.": "{1} is loading."
});

    });
});;

M.util.js_pending(''theme_boost/loader'');
require([''theme_boost/loader''], function() {
  M.util.js_complete(''theme_boost/loader'');
});
;

;
M.util.js_pending(''core/notification''); require([''core/notification''], function(amd) {amd.init(1, []); M.util.js_complete(''core/notification'');});;
M.util.js_pending(''core/log''); require([''core/log''], function(amd) {amd.setConfig({"level":"warn"}); M.util.js_complete(''core/log'');});;
M.util.js_pending(''core/page_global''); require([''core/page_global''], function(amd) {amd.init(); M.util.js_complete(''core/page_global'');});M.util.js_complete("core/first");
});
//]]>
</script>
<script type="text/javascript">
//<![CDATA[
M.str = {"moodle":{"lastmodified":"Last modified","name":"Name","error":"Error","info":"Information","yes":"Yes","no":"No","cancel":"Cancel","confirm":"Confirm","areyousure":"Are you sure?","closebuttontitle":"Close","unknownerror":"Unknown error","file":"File","url":"URL"},"repository":{"type":"Type","size":"Size","invalidjson":"Invalid JSON string","nofilesattached":"No files attached","filepicker":"File picker","logout":"Logout","nofilesavailable":"No files available","norepositoriesavailable":"Sorry, none of your current repositories can return files in the required format.","fileexistsdialogheader":"File exists","fileexistsdialog_editor":"A file with that name has already been attached to the text you are editing.","fileexistsdialog_filemanager":"A file with that name has already been attached","renameto":"Rename to \"{$a}\"","referencesexist":"There are {$a} alias\/shortcut files that use this file as their source","select":"Select"},"admin":{"confirmdeletecomments":"You are about to delete comments, are you sure?","confirmation":"Confirmation"},"debug":{"debuginfo":"Debug info","line":"Line","stacktrace":"Stack trace"},"langconfig":{"labelsep":": "}};
//]]>
</script>
<script type="text/javascript">
//<![CDATA[
(function() {Y.use("moodle-filter_mathjaxloader-loader",function() {M.filter_mathjaxloader.configure({"mathjaxconfig":"\nMathJax.Hub.Config({\n    config: [\"Accessible.js\", \"Safe.js\"],\n    errorSettings: { message: [\"!\"] },\n    skipStartupTypeset: true,\n    messageStyle: \"none\"\n});\n","lang":"en"});
});
M.util.help_popups.setup(Y);
 M.util.js_pending(''random685a880ab0e7f2''); Y.on(''domready'', function() { M.util.js_complete("init");  M.util.js_complete(''random685a880ab0e7f2''); });
})();
//]]>
</script>

        </div>
    </footer>
</div>

</body>
</html>', 'https://moellim.riphah.edu.pk/login/index.php', 'login', 'https://moellim.riphah.edu.pk/pluginfile.php/1/core_admin/logo/0x200/1746215662/logo%20%281%29.png', 2, '2025-06-24 16:15:36.603998', '2025-06-24 16:15:36.603998', 11);


--
-- TOC entry 5080 (class 0 OID 73845)
-- Dependencies: 241
-- Data for Name: notification_preferences; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5078 (class 0 OID 73822)
-- Dependencies: 239
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5082 (class 0 OID 82016)
-- Dependencies: 243
-- Data for Name: organization_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5067 (class 0 OID 41144)
-- Dependencies: 228
-- Data for Name: organizations; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.organizations VALUES (1, 'Test Organization', '2025-04-30 02:37:00.242', '2025-04-30 02:37:00.242', NULL, NULL, NULL, NULL);
INSERT INTO public.organizations VALUES (2, 'Riphah International University', '2025-05-06 03:17:07.962', '2025-05-06 03:17:07.962', NULL, NULL, NULL, NULL);
INSERT INTO public.organizations VALUES (3, 'None', '2025-05-06 08:39:33.943', '2025-05-06 08:39:33.943', NULL, NULL, NULL, NULL);


--
-- TOC entry 5069 (class 0 OID 41155)
-- Dependencies: 230
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.password_reset_tokens VALUES (1, 6, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjYsImVtYWlsIjoidW1hcndhcWFyMzkwQG1haWwuY29tIiwicHVycG9zZSI6InBhc3N3b3JkLXJlc2V0IiwiaWF0IjoxNzQ2NTM1ODIwLCJleHAiOjE3NDY1Mzk0MjB9.kZd_w5-2v6whY5E97e4MDPQ_HUmp4hYvh4_C0Kv8HDk', '2025-05-06 08:50:20.957', true, '2025-05-06 07:50:20.947');
INSERT INTO public.password_reset_tokens VALUES (2, 6, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjYsImVtYWlsIjoidW1hcndhcWFyMzkwQG1haWwuY29tIiwicHVycG9zZSI6InBhc3N3b3JkLXJlc2V0IiwiaWF0IjoxNzQ2NTM2MDIzLCJleHAiOjE3NDY1Mzk2MjN9.5BDTbZb-9nZ4t-ne1vZHbLe-f1XwM0Jt8ZD3LIwiKQ4', '2025-05-06 08:53:43.558', true, '2025-05-06 07:53:43.578');


--
-- TOC entry 5076 (class 0 OID 41892)
-- Dependencies: 237
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.session VALUES ('ZadSnmdKi5H2SQuNpQnPOqLivLTk9XdC', '{"cookie":{"originalMaxAge":1800000,"expires":"2025-07-26T12:11:16.864Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}', '2025-07-26 17:11:17');
INSERT INTO public.session VALUES ('Cwr7LkbqmS7OJNL0b3HvrCaV1fwW1AAO', '{"cookie":{"originalMaxAge":1800000,"expires":"2025-07-26T12:11:17.735Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":14}}', '2025-07-26 17:11:18');
INSERT INTO public.session VALUES ('dz9Bp7X_wxPO6RxqenkazV2prjvnVkH0', '{"cookie":{"originalMaxAge":1800000,"expires":"2025-07-26T12:11:18.894Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":14}}', '2025-07-26 17:11:33');
INSERT INTO public.session VALUES ('DEgOR3FQ-OdLr6E3jCShhCIo9UcgOCeV', '{"cookie":{"originalMaxAge":1800000,"expires":"2025-07-26T13:21:10.533Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}', '2025-07-26 18:21:11');
INSERT INTO public.session VALUES ('FCr6rPFPA_dKj9KLE7sKyBT4u-sKzPWR', '{"cookie":{"originalMaxAge":1800000,"expires":"2025-07-26T13:24:30.248Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":11}}', '2025-07-26 18:24:34');


--
-- TOC entry 5071 (class 0 OID 41166)
-- Dependencies: 232
-- Data for Name: smtp_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.smtp_profiles VALUES (1, 'test', 'test@example.com', 587, 'test@example.com', 'password123', 'TEST', 'test@example.com', 1, '2025-05-01 02:06:18.055', '2025-05-01 02:06:18.055');
INSERT INTO public.smtp_profiles VALUES (2, 'test', 'test@example.com', 587, 'test00user@mail.com', 'Uma212295@w', 'it', 'phsihing@mail.com', 2, '2025-06-24 10:58:57.804124', '2025-06-24 10:58:57.804124');
INSERT INTO public.smtp_profiles VALUES (3, 'PhishNet', 'test@example.com', 587, 'test00user@mail.com', 'Uma212295@w', 'TEST', 'test00user@mail.com', 2, '2025-06-24 16:16:24.040027', '2025-06-24 16:16:24.040027');


--
-- TOC entry 5073 (class 0 OID 41177)
-- Dependencies: 234
-- Data for Name: targets; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.targets VALUES (1, 'fdg', 'sdfds', 'test@example.com', 'test', 2, 1, '2025-05-01 02:09:48.632', '2025-05-01 02:09:48.632', 'General');
INSERT INTO public.targets VALUES (5, 'ali', 'smit', 'admin@example.com', 'it manager', 8, 2, '2025-07-06 17:11:54.220394', '2025-07-06 17:11:54.220394', 'General');


--
-- TOC entry 5075 (class 0 OID 41188)
-- Dependencies: 236
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.users VALUES (1, 'test@example.com', '35e8924a082500ae91d88d47889995831ba27836bec8cb5b12e913ae73a0ae9d6be21f79c810949b668732c0137b0a1dc78281a9a1f7c1b805eec98d32dc66e3.3d364ab1cd94cb0564df901d98270529', 'Test', 'User', NULL, NULL, NULL, 1, '2025-05-06 11:30:21.383', false, NULL, true, 1, 'Test Organization', '2025-04-30 02:37:00.345', '2025-05-06 06:30:21.383', NULL);
INSERT INTO public.users VALUES (2, 'test3@example.com', 'eed2801626e0cbe16d9c59f8d77c4201b0ad977092dd58be799583c455fcdfb30bcd403b9868f457361e77cbc245622853deddcf0d69466caa035def5165656f.eb667181af196cd5d16f9f6136a7f597', 'Test3', 'User', NULL, NULL, NULL, 0, NULL, false, NULL, false, 1, 'Test Organization', '2025-05-01 02:26:07.082', '2025-05-01 02:26:07.082', NULL);
INSERT INTO public.users VALUES (3, 'test1@example.com', '22a5d7916c9bc4db945b19ed1122de7484e988c546f035732590f4c0600fa64e8854d3a2aec92bb9cd69a03097e725a5b102d81e852cfb7f3c33f9e424cc5568.cba891deb3245b48e882f3c969ed6fa8', 'Test1', 'User', '/uploads/profile-1746518412193-598425798.jpg', '', '', 0, NULL, false, NULL, true, 1, 'Test Organization', '2025-05-06 02:46:16.43', '2025-05-06 03:00:20.931', NULL);
INSERT INTO public.users VALUES (4, 'test2@example.com', '75e8154b4a3f79bf6a396b49905414b37de102f4d969c2d50af1ed628cae3f544c3893a6caa3e2596df19b439d9cfd752f73d4527e91dfba9fea5dbd688d96cb.df299b3e5a7dd538d15452a99a3efe001addbf19bfa8bc5d0256ae9e2868a290', 'Test1', 'User', '/uploads/profile-1746531084681-182423878.png', '', '', 0, NULL, false, NULL, true, 2, 'Riphah International University', '2025-05-06 03:17:08.045', '2025-05-06 06:41:22.592', NULL);
INSERT INTO public.users VALUES (5, 'shahanhabib890@gmail.com', '2bcb1133381ee07528ce83ea7508931b8395e8f5a147cd5301336c7e9670f1ab3aa70f70b78db4ad2cadaed07eb53995d342a0a3144ec8f3153e92c2bfd46aa2.d6687002c1eeba4c8837148139ade3340068dd8ba0330cfd33f094fd72f36dfe', 'shahan', 'habib', NULL, NULL, NULL, 0, NULL, false, NULL, true, 2, 'Riphah International University', '2025-05-06 07:21:56.902', '2025-05-06 07:21:56.902', NULL);
INSERT INTO public.users VALUES (6, 'umarwaqar390@mail.com', '3452ce1ac096ed406f69c09f290835633aeadf53027311197736d1542bbff67d2f51a0e72a4f75131151b04aee52ad63dee4b4e6c853264fad1397325e832d80.9aff30daeeeda09a07d9610109252119714ea1e8a8c08db948447ba96e101ed4', 'shahan', 'habib', NULL, NULL, NULL, 0, NULL, false, NULL, true, 2, 'Riphah International University', '2025-05-06 07:24:08.887', '2025-06-23 02:31:20.075', NULL);
INSERT INTO public.users VALUES (9, 'test4@example.com', '3ca81d645b5942da70a7717db8dca7262da9f48276127450ff5002db3800bc33fe7e9765b2d8cec83e12667efa7f7907dc5527050b421feda9b46bf9ed983808.caf177d102ddf69335365a30ec7df0495800747a8e123f356f511e753b20abc8', 'test4', 'user', NULL, NULL, NULL, 0, NULL, false, NULL, false, 3, 'None', '2025-05-06 08:39:34.077', '2025-05-06 08:39:46.529', NULL);
INSERT INTO public.users VALUES (12, 'umarwaqar@mail.com', '85ef23f7f09516515938f0411b5baab12fc27015641a493909ba904e12364699680bec1349a4b98be5c17dfff20f257fb7d0f450c741fc437b40463e3cf38a52.84b04880eb136688e8f35f31481620cd526802ed420dd119f2f57e6aa57fb911', 'umar', 'waqar', NULL, NULL, NULL, 0, NULL, false, NULL, false, 2, 'Riphah International University', '2025-06-24 16:10:37.538702', '2025-06-24 16:10:37.538702', NULL);
INSERT INTO public.users VALUES (11, 'test00user@mail.com', 'a22a343b71a92ed060072c89fb3edadd75a8866198e32c60c495600911f1e96c783104dfd9780ebf6575ad6b71a425f5c595e130e4ee9f2bc6acb62a44b719d0.ed3b036556bb874ad3ccc5d4f1aba9ad421fad58ab68b4d30a5286ca985b07a8', 'test3', 'user', '/uploads/profile-1751377754244-933966634.jpg', 'it', '', 0, NULL, false, NULL, false, 2, 'Riphah International University', '2025-06-24 10:53:39.510025', '2025-07-26 12:54:30.238', NULL);
INSERT INTO public.users VALUES (13, 'umarwaqar0@mail.com', '53f5463bc6837922dae2ff671c7be513cd1b90e4e55f47715aa029f014fd7a4321f69263f113c48a7d4523690488f47271778964827d74ad421ae6960bbdd2a3.2c3b3d8d3f26e3e12c0514cbcab2abc66f0c0bd43b88dee845deee687b77027b', 'test3', 'user', NULL, NULL, NULL, 0, NULL, false, NULL, false, 2, 'Riphah International University', '2025-06-24 16:17:33.581331', '2025-06-24 16:17:33.581331', NULL);
INSERT INTO public.users VALUES (10, 'test0user@mail.com', 'f6938ef14879aabe37c34dff1306a0d1907641b0cbf29f91c26c883be33a937e69521b5c6cb305f5033fde92a7c85fe9f5e4d49ab5b3ba6209b327092b622563.86c1a478adff2f07df2e3c3fde8b2744820427e212b4fc9061560a8df8094ea4', 'test0', 'user', NULL, NULL, NULL, 0, NULL, false, NULL, false, 3, 'None', '2025-06-23 21:03:38.063127', '2025-06-24 06:59:32.795', NULL);
INSERT INTO public.users VALUES (14, 'admin@example.com', 'bee37e61318bfa558e9213c9312b9c54bf89011fe05766a02c8b52eff3aec2b9d8d137c6564d0ef0c18ef3401e5d6ba0ed0db67d4bdcabc7642294521de1313e.408bc71f09587febd02f2e7ca10eb39ab5cbaee68c98f397a02c78997a57907f', 'admin', 'admin', NULL, NULL, NULL, 0, NULL, false, NULL, false, 3, 'None', '2025-07-16 17:51:24.606098', '2025-07-26 11:41:18.887', NULL);


--
-- TOC entry 5124 (class 0 OID 0)
-- Dependencies: 248
-- Name: Campaigns_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Campaigns_id_seq"', 1, false);


--
-- TOC entry 5125 (class 0 OID 0)
-- Dependencies: 252
-- Name: Contents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Contents_id_seq"', 2, true);


--
-- TOC entry 5126 (class 0 OID 0)
-- Dependencies: 256
-- Name: Languages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Languages_id_seq"', 1, false);


--
-- TOC entry 5127 (class 0 OID 0)
-- Dependencies: 244
-- Name: Organizations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Organizations_id_seq"', 1, false);


--
-- TOC entry 5128 (class 0 OID 0)
-- Dependencies: 254
-- Name: Results_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Results_id_seq"', 1, false);


--
-- TOC entry 5129 (class 0 OID 0)
-- Dependencies: 250
-- Name: Templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Templates_id_seq"', 1, false);


--
-- TOC entry 5130 (class 0 OID 0)
-- Dependencies: 246
-- Name: Users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Users_id_seq"', 1, false);


--
-- TOC entry 5131 (class 0 OID 0)
-- Dependencies: 217
-- Name: campaign_results_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.campaign_results_id_seq', 1, false);


--
-- TOC entry 5132 (class 0 OID 0)
-- Dependencies: 219
-- Name: campaigns_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.campaigns_id_seq', 6, true);


--
-- TOC entry 5133 (class 0 OID 0)
-- Dependencies: 221
-- Name: email_templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.email_templates_id_seq', 15, true);


--
-- TOC entry 5134 (class 0 OID 0)
-- Dependencies: 223
-- Name: groups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.groups_id_seq', 8, true);


--
-- TOC entry 5135 (class 0 OID 0)
-- Dependencies: 225
-- Name: landing_pages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.landing_pages_id_seq', 3, true);


--
-- TOC entry 5136 (class 0 OID 0)
-- Dependencies: 240
-- Name: notification_preferences_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notification_preferences_id_seq', 1, false);


--
-- TOC entry 5137 (class 0 OID 0)
-- Dependencies: 238
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notifications_id_seq', 1, false);


--
-- TOC entry 5138 (class 0 OID 0)
-- Dependencies: 242
-- Name: organization_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.organization_settings_id_seq', 1, false);


--
-- TOC entry 5139 (class 0 OID 0)
-- Dependencies: 227
-- Name: organizations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.organizations_id_seq', 3, true);


--
-- TOC entry 5140 (class 0 OID 0)
-- Dependencies: 229
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.password_reset_tokens_id_seq', 2, true);


--
-- TOC entry 5141 (class 0 OID 0)
-- Dependencies: 231
-- Name: smtp_profiles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.smtp_profiles_id_seq', 3, true);


--
-- TOC entry 5142 (class 0 OID 0)
-- Dependencies: 233
-- Name: targets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.targets_id_seq', 5, true);


--
-- TOC entry 5143 (class 0 OID 0)
-- Dependencies: 235
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 14, true);


--
-- TOC entry 4871 (class 2606 OID 82093)
-- Name: Campaigns Campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Campaigns"
    ADD CONSTRAINT "Campaigns_pkey" PRIMARY KEY (id);


--
-- TOC entry 4875 (class 2606 OID 82138)
-- Name: Contents Contents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Contents"
    ADD CONSTRAINT "Contents_pkey" PRIMARY KEY (id);


--
-- TOC entry 4879 (class 2606 OID 82173)
-- Name: Languages Languages_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Languages"
    ADD CONSTRAINT "Languages_code_key" UNIQUE (code);


--
-- TOC entry 4881 (class 2606 OID 82171)
-- Name: Languages Languages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Languages"
    ADD CONSTRAINT "Languages_pkey" PRIMARY KEY (id);


--
-- TOC entry 4865 (class 2606 OID 82053)
-- Name: Organizations Organizations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Organizations"
    ADD CONSTRAINT "Organizations_pkey" PRIMARY KEY (id);


--
-- TOC entry 4877 (class 2606 OID 82147)
-- Name: Results Results_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Results"
    ADD CONSTRAINT "Results_pkey" PRIMARY KEY (id);


--
-- TOC entry 4873 (class 2606 OID 82116)
-- Name: Templates Templates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Templates"
    ADD CONSTRAINT "Templates_pkey" PRIMARY KEY (id);


--
-- TOC entry 4867 (class 2606 OID 82072)
-- Name: Users Users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key" UNIQUE (email);


--
-- TOC entry 4869 (class 2606 OID 82070)
-- Name: Users Users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_pkey" PRIMARY KEY (id);


--
-- TOC entry 4820 (class 2606 OID 41097)
-- Name: campaign_results campaign_results_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaign_results
    ADD CONSTRAINT campaign_results_pkey PRIMARY KEY (id);


--
-- TOC entry 4826 (class 2606 OID 41109)
-- Name: campaigns campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_pkey PRIMARY KEY (id);


--
-- TOC entry 4828 (class 2606 OID 41120)
-- Name: email_templates email_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_templates
    ADD CONSTRAINT email_templates_pkey PRIMARY KEY (id);


--
-- TOC entry 4832 (class 2606 OID 41131)
-- Name: groups groups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_pkey PRIMARY KEY (id);


--
-- TOC entry 4834 (class 2606 OID 41142)
-- Name: landing_pages landing_pages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.landing_pages
    ADD CONSTRAINT landing_pages_pkey PRIMARY KEY (id);


--
-- TOC entry 4859 (class 2606 OID 73858)
-- Name: notification_preferences notification_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_preferences
    ADD CONSTRAINT notification_preferences_pkey PRIMARY KEY (id);


--
-- TOC entry 4861 (class 2606 OID 73860)
-- Name: notification_preferences notification_preferences_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_preferences
    ADD CONSTRAINT notification_preferences_user_id_key UNIQUE (user_id);


--
-- TOC entry 4857 (class 2606 OID 73833)
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- TOC entry 4863 (class 2606 OID 82023)
-- Name: organization_settings organization_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organization_settings
    ADD CONSTRAINT organization_settings_pkey PRIMARY KEY (id);


--
-- TOC entry 4836 (class 2606 OID 41153)
-- Name: organizations organizations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_pkey PRIMARY KEY (id);


--
-- TOC entry 4838 (class 2606 OID 41164)
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 4851 (class 2606 OID 41898)
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- TOC entry 4840 (class 2606 OID 41175)
-- Name: smtp_profiles smtp_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.smtp_profiles
    ADD CONSTRAINT smtp_profiles_pkey PRIMARY KEY (id);


--
-- TOC entry 4844 (class 2606 OID 41186)
-- Name: targets targets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.targets
    ADD CONSTRAINT targets_pkey PRIMARY KEY (id);


--
-- TOC entry 4846 (class 2606 OID 41203)
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- TOC entry 4848 (class 2606 OID 41201)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4849 (class 1259 OID 41899)
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_session_expire" ON public.session USING btree (expire);


--
-- TOC entry 4821 (class 1259 OID 57432)
-- Name: idx_campaign_results_clicked; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_campaign_results_clicked ON public.campaign_results USING btree (clicked);


--
-- TOC entry 4822 (class 1259 OID 57431)
-- Name: idx_campaign_results_opened; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_campaign_results_opened ON public.campaign_results USING btree (opened);


--
-- TOC entry 4823 (class 1259 OID 57430)
-- Name: idx_campaign_results_sent; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_campaign_results_sent ON public.campaign_results USING btree (sent);


--
-- TOC entry 4824 (class 1259 OID 73872)
-- Name: idx_campaign_results_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_campaign_results_status ON public.campaign_results USING btree (status);


--
-- TOC entry 4829 (class 1259 OID 57433)
-- Name: idx_email_templates_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_email_templates_name ON public.email_templates USING btree (name);


--
-- TOC entry 4830 (class 1259 OID 73873)
-- Name: idx_email_templates_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_email_templates_type ON public.email_templates USING btree (type);


--
-- TOC entry 4852 (class 1259 OID 73869)
-- Name: idx_notifications_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_created_at ON public.notifications USING btree (created_at);


--
-- TOC entry 4853 (class 1259 OID 73868)
-- Name: idx_notifications_is_read; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_is_read ON public.notifications USING btree (is_read);


--
-- TOC entry 4854 (class 1259 OID 73867)
-- Name: idx_notifications_organization_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_organization_id ON public.notifications USING btree (organization_id);


--
-- TOC entry 4855 (class 1259 OID 73866)
-- Name: idx_notifications_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_user_id ON public.notifications USING btree (user_id);


--
-- TOC entry 4841 (class 1259 OID 73874)
-- Name: idx_targets_department; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_targets_department ON public.targets USING btree (department);


--
-- TOC entry 4842 (class 1259 OID 57434)
-- Name: idx_targets_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_targets_email ON public.targets USING btree (email);


--
-- TOC entry 4906 (class 2606 OID 82094)
-- Name: Campaigns Campaigns_OrganizationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Campaigns"
    ADD CONSTRAINT "Campaigns_OrganizationId_fkey" FOREIGN KEY ("OrganizationId") REFERENCES public."Organizations"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4908 (class 2606 OID 82148)
-- Name: Results Results_CampaignId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Results"
    ADD CONSTRAINT "Results_CampaignId_fkey" FOREIGN KEY ("CampaignId") REFERENCES public."Campaigns"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4909 (class 2606 OID 82158)
-- Name: Results Results_ContentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Results"
    ADD CONSTRAINT "Results_ContentId_fkey" FOREIGN KEY ("ContentId") REFERENCES public."Contents"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4910 (class 2606 OID 82153)
-- Name: Results Results_UserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Results"
    ADD CONSTRAINT "Results_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4907 (class 2606 OID 82117)
-- Name: Templates Templates_OrganizationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Templates"
    ADD CONSTRAINT "Templates_OrganizationId_fkey" FOREIGN KEY ("OrganizationId") REFERENCES public."Organizations"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4905 (class 2606 OID 82073)
-- Name: Users Users_OrganizationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_OrganizationId_fkey" FOREIGN KEY ("OrganizationId") REFERENCES public."Organizations"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4882 (class 2606 OID 41204)
-- Name: campaign_results campaign_results_campaign_id_campaigns_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaign_results
    ADD CONSTRAINT campaign_results_campaign_id_campaigns_id_fk FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE CASCADE;


--
-- TOC entry 4883 (class 2606 OID 41214)
-- Name: campaign_results campaign_results_organization_id_organizations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaign_results
    ADD CONSTRAINT campaign_results_organization_id_organizations_id_fk FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- TOC entry 4884 (class 2606 OID 41209)
-- Name: campaign_results campaign_results_target_id_targets_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaign_results
    ADD CONSTRAINT campaign_results_target_id_targets_id_fk FOREIGN KEY (target_id) REFERENCES public.targets(id) ON DELETE CASCADE;


--
-- TOC entry 4885 (class 2606 OID 41239)
-- Name: campaigns campaigns_created_by_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_created_by_id_users_id_fk FOREIGN KEY (created_by_id) REFERENCES public.users(id);


--
-- TOC entry 4886 (class 2606 OID 41229)
-- Name: campaigns campaigns_email_template_id_email_templates_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_email_template_id_email_templates_id_fk FOREIGN KEY (email_template_id) REFERENCES public.email_templates(id) ON DELETE RESTRICT;


--
-- TOC entry 4887 (class 2606 OID 41234)
-- Name: campaigns campaigns_landing_page_id_landing_pages_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_landing_page_id_landing_pages_id_fk FOREIGN KEY (landing_page_id) REFERENCES public.landing_pages(id) ON DELETE RESTRICT;


--
-- TOC entry 4888 (class 2606 OID 41244)
-- Name: campaigns campaigns_organization_id_organizations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_organization_id_organizations_id_fk FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- TOC entry 4889 (class 2606 OID 41224)
-- Name: campaigns campaigns_smtp_profile_id_smtp_profiles_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_smtp_profile_id_smtp_profiles_id_fk FOREIGN KEY (smtp_profile_id) REFERENCES public.smtp_profiles(id) ON DELETE RESTRICT;


--
-- TOC entry 4890 (class 2606 OID 41219)
-- Name: campaigns campaigns_target_group_id_groups_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_target_group_id_groups_id_fk FOREIGN KEY (target_group_id) REFERENCES public.groups(id) ON DELETE RESTRICT;


--
-- TOC entry 4891 (class 2606 OID 41254)
-- Name: email_templates email_templates_created_by_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_templates
    ADD CONSTRAINT email_templates_created_by_id_users_id_fk FOREIGN KEY (created_by_id) REFERENCES public.users(id);


--
-- TOC entry 4892 (class 2606 OID 41249)
-- Name: email_templates email_templates_organization_id_organizations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_templates
    ADD CONSTRAINT email_templates_organization_id_organizations_id_fk FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- TOC entry 4893 (class 2606 OID 41259)
-- Name: groups groups_organization_id_organizations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_organization_id_organizations_id_fk FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- TOC entry 4894 (class 2606 OID 41269)
-- Name: landing_pages landing_pages_created_by_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.landing_pages
    ADD CONSTRAINT landing_pages_created_by_id_users_id_fk FOREIGN KEY (created_by_id) REFERENCES public.users(id);


--
-- TOC entry 4895 (class 2606 OID 41264)
-- Name: landing_pages landing_pages_organization_id_organizations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.landing_pages
    ADD CONSTRAINT landing_pages_organization_id_organizations_id_fk FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- TOC entry 4903 (class 2606 OID 73861)
-- Name: notification_preferences notification_preferences_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_preferences
    ADD CONSTRAINT notification_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4901 (class 2606 OID 73839)
-- Name: notifications notifications_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- TOC entry 4902 (class 2606 OID 73834)
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4904 (class 2606 OID 82024)
-- Name: organization_settings organization_settings_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organization_settings
    ADD CONSTRAINT organization_settings_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- TOC entry 4896 (class 2606 OID 41274)
-- Name: password_reset_tokens password_reset_tokens_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4897 (class 2606 OID 41279)
-- Name: smtp_profiles smtp_profiles_organization_id_organizations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.smtp_profiles
    ADD CONSTRAINT smtp_profiles_organization_id_organizations_id_fk FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- TOC entry 4898 (class 2606 OID 41284)
-- Name: targets targets_group_id_groups_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.targets
    ADD CONSTRAINT targets_group_id_groups_id_fk FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE;


--
-- TOC entry 4899 (class 2606 OID 41289)
-- Name: targets targets_organization_id_organizations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.targets
    ADD CONSTRAINT targets_organization_id_organizations_id_fk FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- TOC entry 4900 (class 2606 OID 41294)
-- Name: users users_organization_id_organizations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_organization_id_organizations_id_fk FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


-- Completed on 2025-08-05 18:02:41

--
-- PostgreSQL database dump complete
--


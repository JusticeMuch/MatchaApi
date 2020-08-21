
DROP SCHEMA IF EXISTS public CASCADE;

CREATE SCHEMA IF NOT EXISTS public AUTHORIZATION frkkqttefrkerj;

CREATE SEQUENCE IF NOT EXISTS public.block_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 99999999
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.like_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 99999999
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.token_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 99999999
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.report_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 99999999
    CACHE 1;


ALTER TABLE public.report_seq OWNER TO frkkqttefrkerj;

ALTER TABLE public.block_seq OWNER TO frkkqttefrkerj;

ALTER TABLE public.like_seq OWNER TO frkkqttefrkerj;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: Report; Type: TABLE; Schema: public; Owner: frkkqttefrkerj
--

CREATE TABLE IF NOT EXISTS public."Report" (
    id integer DEFAULT nextval('public.report_seq') NOT NULL,
    reporting_user integer NOT NULL,
    reported_user integer NOT NULL,
    reason text NOT NULL,
    date timestamp without time zone NOT NULL,
    suspended boolean DEFAULT false NOT NULL,
    UNIQUE (reporting_user, reported_user)
);


ALTER TABLE public."Report" OWNER TO frkkqttefrkerj;

CREATE TABLE IF NOT EXISTS public."Like" (
    id integer DEFAULT nextval('public.like_seq') NOT NULL,
    liked_user integer NOT NULL,
    liking_user integer NOT NULL,
    date timestamp without time zone NOT NULL,
    UNIQUE (liked_user, liking_user)
);


ALTER TABLE public."Like" OWNER TO frkkqttefrkerj;

CREATE TABLE IF NOT EXISTS public."Block" (
    id integer DEFAULT nextval('public.block_seq') NOT NULL,
    blocking_user integer NOT NULL,
    blocked_user integer NOT NULL,
    date timestamp without time zone NOT NULL,
    UNIQUE (blocking_user, blocked_user)
);


ALTER TABLE public."Block" OWNER TO frkkqttefrkerj;

--
-- Name: match_seq; Type: SEQUENCE; Schema: public; Owner: frkkqttefrkerj
--

CREATE SEQUENCE IF NOT EXISTS public.match_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 99999999
    CACHE 1;


ALTER TABLE public.match_seq OWNER TO frkkqttefrkerj;

--
-- Name: Match; Type: TABLE; Schema: public; Owner: frkkqttefrkerj
--

CREATE TABLE IF NOT EXISTS public."Match" (
    id integer DEFAULT nextval('public.match_seq') NOT NULL,
    user1 integer NOT NULL,
    user2 integer NOT NULL,
    date timestamp without time zone NOT NULL,
    UNIQUE (user1, user2)
);


ALTER TABLE public."Match" OWNER TO frkkqttefrkerj;

--
-- Name: message_seq; Type: SEQUENCE; Schema: public; Owner: frkkqttefrkerj
--

CREATE SEQUENCE IF NOT EXISTS public.message_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 99999999
    CACHE 1;


ALTER TABLE public.message_seq OWNER TO frkkqttefrkerj;

--
-- Name: Message; Type: TABLE; Schema: public; Owner: frkkqttefrkerj
--

CREATE TABLE IF NOT EXISTS public."Message" (
    id integer DEFAULT nextval('public.message_seq') NOT NULL,
    match_id integer NOT NULL,
    author integer NOT NULL,
    content character varying NOT NULL,
    date timestamp without time zone NOT NULL,
    read boolean DEFAULT false NOT NULL
);


ALTER TABLE public."Message" OWNER TO frkkqttefrkerj;


--
-- Name: profile_seq; Type: SEQUENCE; Schema: public; Owner: frkkqttefrkerj
--

CREATE SEQUENCE IF NOT EXISTS public.profile_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 99999999
    CACHE 1;


ALTER TABLE public.profile_seq OWNER TO frkkqttefrkerj;

--
-- Name: Profile; Type: TABLE; Schema: public; Owner: frkkqttefrkerj
--

CREATE TABLE IF NOT EXISTS public."Profile" (
    id integer DEFAULT nextval('public.profile_seq') NOT NULL,
    firstname character varying(30) NOT NULL,
    lastname character varying(40) NOT NULL,
    username character varying(20) UNIQUE NOT NULL,
    password character varying(100) NOT NULL,
    email character varying(80) UNIQUE NOT NULL,
    authenticated boolean DEFAULT false,
    suspended boolean DEFAULT false,
    gender text,
    sexual_orientation text,
    sexual_preference text,
    description text,
    interests text[],
    images text[],
    profile_picture text,
    location numeric[],
    last_visit timestamp without time zone,
    popularity double precision,
    birthDate date
);


ALTER TABLE public."Profile" OWNER TO frkkqttefrkerj;


-- Name: visit_seq; Type: SEQUENCE; Schema: public; Owner: frkkqttefrkerj
--

CREATE SEQUENCE IF NOT EXISTS public.visit_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 99999999
    CACHE 1;


ALTER TABLE public.visit_seq OWNER TO frkkqttefrkerj;

--
-- Name: Visit; Type: TABLE; Schema: public; Owner: frkkqttefrkerj
--

CREATE TABLE IF NOT EXISTS public."Visit" (
    id integer DEFAULT nextval('public.visit_seq') NOT NULL,
    visitor integer NOT NULL,
    visited integer NOT NULL,
    date timestamp without time zone NOT NULL
);


ALTER TABLE public."Visit" OWNER TO frkkqttefrkerj;


ALTER TABLE ONLY public."Report"
    ADD CONSTRAINT "pk_Report" PRIMARY KEY (id);

--
-- Name: Like pk_Like; Type: CONSTRAINT; Schema: public; Owner: frkkqttefrkerj
--

ALTER TABLE ONLY public."Like"
    ADD CONSTRAINT "pk_Like" PRIMARY KEY (id);

ALTER TABLE ONLY public."Block"
    ADD CONSTRAINT "pk_Block" PRIMARY KEY (id);

--
-- Name: Match pk_Match; Type: CONSTRAINT; Schema: public; Owner: frkkqttefrkerj
--

ALTER TABLE ONLY public."Match"
    ADD CONSTRAINT "pk_Match" PRIMARY KEY (id);


--
-- Name: Message pk_Message; Type: CONSTRAINT; Schema: public; Owner: frkkqttefrkerj
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "pk_Message" PRIMARY KEY (id);

--
-- Name: Profile pk_Profile; Type: CONSTRAINT; Schema: public; Owner: frkkqttefrkerj
--

ALTER TABLE ONLY public."Profile"
    ADD CONSTRAINT "pk_Profile" PRIMARY KEY (id);


ALTER TABLE ONLY public."Visit"
    ADD CONSTRAINT "pk_Visit" PRIMARY KEY (id);


--
-- Name: Report fk_Report_reported_user; Type: FK CONSTRAINT; Schema: public; Owner: frkkqttefrkerj
--

ALTER TABLE ONLY public."Report"
    ADD CONSTRAINT "fk_Report_reported_user" FOREIGN KEY ("reported_user") REFERENCES public."Profile"(id);


--
-- Name: Report fk_Report_reporting_user; Type: FK CONSTRAINT; Schema: public; Owner: frkkqttefrkerj
--

ALTER TABLE ONLY public."Report"
    ADD CONSTRAINT "fk_Report_reporting_user" FOREIGN KEY ("reporting_user") REFERENCES public."Profile"(id);


--
-- Name: Like fk_Like_liked_user; Type: FK CONSTRAINT; Schema: public; Owner: frkkqttefrkerj
--

ALTER TABLE ONLY public."Like"
    ADD CONSTRAINT "fk_Like_liked_user" FOREIGN KEY ("liked_user") REFERENCES public."Profile"(id);


--
-- Name: Like fk_Like_liking_user; Type: FK CONSTRAINT; Schema: public; Owner: frkkqttefrkerj
--

ALTER TABLE ONLY public."Like"
    ADD CONSTRAINT "fk_Like_liking_user" FOREIGN KEY ("liking_user") REFERENCES public."Profile"(id);


ALTER TABLE ONLY public."Block"
    ADD CONSTRAINT "fk_Block_blocked_user" FOREIGN KEY ("blocked_user") REFERENCES public."Profile"(id);


ALTER TABLE ONLY public."Block"
    ADD CONSTRAINT "fk_Block_blocking_user" FOREIGN KEY ("blocking_user") REFERENCES public."Profile"(id);

--
-- Name: Match fk_Match_user1; Type: FK CONSTRAINT; Schema: public; Owner: frkkqttefrkerj
--

ALTER TABLE ONLY public."Match"
    ADD CONSTRAINT "fk_Match_user1" FOREIGN KEY (user1) REFERENCES public."Profile"(id);


--
-- Name: Match fk_Match_user2; Type: FK CONSTRAINT; Schema: public; Owner: frkkqttefrkerj
--

ALTER TABLE ONLY public."Match"
    ADD CONSTRAINT "fk_Match_user2" FOREIGN KEY (user2) REFERENCES public."Profile"(id);


--
-- Name: Message fk_Message_author; Type: FK CONSTRAINT; Schema: public; Owner: frkkqttefrkerj
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "fk_Message_author" FOREIGN KEY (author) REFERENCES public."Profile"(id);


--
-- Name: Message fk_Message_match; Type: FK CONSTRAINT; Schema: public; Owner: frkkqttefrkerj
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "fk_Message_match_id" FOREIGN KEY (match_id) REFERENCES public."Match"(id);



ALTER TABLE ONLY public."Visit"
    ADD CONSTRAINT "fk_Visit_visited" FOREIGN KEY (visited) REFERENCES public."Profile"(id);


ALTER TABLE ONLY public."Visit"
    ADD CONSTRAINT "fk_Visit_visitor" FOREIGN KEY (visitor) REFERENCES public."Profile"(id);

CREATE TABLE IF NOT EXISTS public."Admin" (
    id integer PRIMARY KEY NOT NULL,
    username text NOT NULL,
    password text NOT NULL);
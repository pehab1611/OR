PGDMP         "    	             |            new_OR_Labos    15.2    15.2                0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false                       0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false                       0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false                       1262    41882    new_OR_Labos    DATABASE     z   CREATE DATABASE "new_OR_Labos" WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'hr_HR.UTF-8';
    DROP DATABASE "new_OR_Labos";
                postgres    false            �            1259    41895    driverinteam    TABLE     Q   CREATE TABLE public.driverinteam (
    team_id integer,
    driver_id integer
);
     DROP TABLE public.driverinteam;
       public         heap    postgres    false            �            1259    41890    drivers    TABLE     �   CREATE TABLE public.drivers (
    drivernum integer NOT NULL,
    drivername character varying(50),
    driverlast character varying(50),
    nationality character varying(20)
);
    DROP TABLE public.drivers;
       public         heap    postgres    false            �            1259    41884    teams    TABLE     �  CREATE TABLE public.teams (
    team_id integer NOT NULL,
    teamname character varying(50),
    teambase character varying(100),
    teamchief character varying(50),
    chassis character varying(10),
    powerunit character varying(20),
    firstentry integer,
    teamchampionships integer,
    driverchampionships integer,
    highestracefinish integer,
    poleposition integer,
    fastestlaps integer,
    points integer
);
    DROP TABLE public.teams;
       public         heap    postgres    false            �            1259    41883    formula1_teams_team_id_seq    SEQUENCE     �   CREATE SEQUENCE public.formula1_teams_team_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 1   DROP SEQUENCE public.formula1_teams_team_id_seq;
       public          postgres    false    215                       0    0    formula1_teams_team_id_seq    SEQUENCE OWNED BY     P   ALTER SEQUENCE public.formula1_teams_team_id_seq OWNED BY public.teams.team_id;
          public          postgres    false    214            w           2604    41887    teams team_id    DEFAULT     w   ALTER TABLE ONLY public.teams ALTER COLUMN team_id SET DEFAULT nextval('public.formula1_teams_team_id_seq'::regclass);
 <   ALTER TABLE public.teams ALTER COLUMN team_id DROP DEFAULT;
       public          postgres    false    215    214    215                      0    41895    driverinteam 
   TABLE DATA           :   COPY public.driverinteam (team_id, driver_id) FROM stdin;
    public          postgres    false    217   p                 0    41890    drivers 
   TABLE DATA           Q   COPY public.drivers (drivernum, drivername, driverlast, nationality) FROM stdin;
    public          postgres    false    216   �                 0    41884    teams 
   TABLE DATA           �   COPY public.teams (team_id, teamname, teambase, teamchief, chassis, powerunit, firstentry, teamchampionships, driverchampionships, highestracefinish, poleposition, fastestlaps, points) FROM stdin;
    public          postgres    false    215   4                  0    0    formula1_teams_team_id_seq    SEQUENCE SET     I   SELECT pg_catalog.setval('public.formula1_teams_team_id_seq', 10, true);
          public          postgres    false    214            {           2606    41894    drivers formula1_drivers_pkey 
   CONSTRAINT     b   ALTER TABLE ONLY public.drivers
    ADD CONSTRAINT formula1_drivers_pkey PRIMARY KEY (drivernum);
 G   ALTER TABLE ONLY public.drivers DROP CONSTRAINT formula1_drivers_pkey;
       public            postgres    false    216            y           2606    41889    teams formula1_teams_pkey 
   CONSTRAINT     \   ALTER TABLE ONLY public.teams
    ADD CONSTRAINT formula1_teams_pkey PRIMARY KEY (team_id);
 C   ALTER TABLE ONLY public.teams DROP CONSTRAINT formula1_teams_pkey;
       public            postgres    false    215            |           2606    41903 2   driverinteam driver_team_assignment_driver_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.driverinteam
    ADD CONSTRAINT driver_team_assignment_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.drivers(drivernum);
 \   ALTER TABLE ONLY public.driverinteam DROP CONSTRAINT driver_team_assignment_driver_id_fkey;
       public          postgres    false    216    217    3451            }           2606    41898 0   driverinteam driver_team_assignment_team_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.driverinteam
    ADD CONSTRAINT driver_team_assignment_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(team_id);
 Z   ALTER TABLE ONLY public.driverinteam DROP CONSTRAINT driver_team_assignment_team_id_fkey;
       public          postgres    false    3449    217    215               E   x����0��=L/t��?G�!	

jt&�U�/��Ä3��FĔ���^꠵����l�         _  x�M�AO#1��o~"Ӂrv[- ��X��M�iD�'�¯_O���9����l�a�*$��˘$',�$!�w��g,��qMB�@ҸS<VeL)�/L�ů����\xI����ݎL�w��j��:�>I8s�b�zX��LRp�a�L�c�P,��U*�2&A���֩bZI�*��� 5�}�	75��,Y{LY7&՞�?�`N��̂_�Ѿ����} vPsQ�f�⵾<�*iE���!�3�^Xs��v���@���\C�#+cλ=I�aƟ!�6!��P��ELF���3ێ�wn\�������1O�=����ٙCcʶ� ��/v��=���#���c�}R�,G��'M��ʙ�         F  x�m�Mn�0�ףS� I!���R6"�u��o�H��0E����QΑ�ud4r�H �ޛ�%d]o�(��ʈ�a[[��OF��"��"la��+��*]�_F�Ԉ�2O�m�P{����B(���P�/������bW�L�(C�������Ɗ[e �Y�$���A��>,��1H��B�)���(�f	X9�z��[�ă}�1�E�9�LgsHa6�� ��ċ ӏ(Jے��,�=�	�ʼ)}%�o�?��h�L]���1J,�*XF!��:�Fi8�a����������l�|�Zu�$��s��@�&���8<���ك�''�h��y	l�!�pl�+�^�d�x%����;4GQٮ���#X[����j�O�Cf����{�$JN���$_(=�Ն�����Nu�B#�֍�˅L�:�3HN=0�4���x��X�������m'P�q5.�*�[����v2�Ҷc�c�)�1�Q�gH�$�u�!����{���T-��hp���^�1cJN�	A4� N!O�PԷ�Ȉܺv�(����=���"�k�P,o��	��'��C�1�%��Q����y�pI      
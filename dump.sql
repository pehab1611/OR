PGDMP     .    /            
    {            OR_Labos    15.2    15.2                0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false                       0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false                       0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false                       1262    25852    OR_Labos    DATABASE     v   CREATE DATABASE "OR_Labos" WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'hr_HR.UTF-8';
    DROP DATABASE "OR_Labos";
                postgres    false            �            1259    25904    driverinteam    TABLE     `   CREATE TABLE public.driverinteam (
    teamname character varying(50),
    drivernum integer
);
     DROP TABLE public.driverinteam;
       public         heap    postgres    false            �            1259    25881    drivers    TABLE     �   CREATE TABLE public.drivers (
    drivername character varying(50),
    driverlast character varying(50),
    nationality character varying(20),
    drivernum integer NOT NULL
);
    DROP TABLE public.drivers;
       public         heap    postgres    false            �            1259    25899    teams    TABLE     �  CREATE TABLE public.teams (
    teamname character varying(50) NOT NULL,
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
       public         heap    postgres    false            �            1259    25917 	   temptable    TABLE     2  CREATE TABLE public.temptable (
    teamname character varying(50) NOT NULL,
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
    points integer,
    drivername character varying(50),
    driverlast character varying(50),
    nationality character varying(20),
    drivernum integer NOT NULL
);
    DROP TABLE public.temptable;
       public         heap    postgres    false            �            1259    25922 
   temptable1    TABLE     !  CREATE TABLE public.temptable1 (
    drivernum integer,
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
    points integer,
    drivername character varying(50),
    driverlast character varying(50),
    nationality character varying(20)
);
    DROP TABLE public.temptable1;
       public         heap    postgres    false                      0    25904    driverinteam 
   TABLE DATA           ;   COPY public.driverinteam (teamname, drivernum) FROM stdin;
    public          postgres    false    216   C                 0    25881    drivers 
   TABLE DATA           Q   COPY public.drivers (drivername, driverlast, nationality, drivernum) FROM stdin;
    public          postgres    false    214   <                 0    25899    teams 
   TABLE DATA           �   COPY public.teams (teamname, teambase, teamchief, chassis, powerunit, firstentry, teamchampionships, driverchampionships, highestracefinish, poleposition, fastestlaps, points) FROM stdin;
    public          postgres    false    215   �                 0    25917 	   temptable 
   TABLE DATA           �   COPY public.temptable (teamname, teambase, teamchief, chassis, powerunit, firstentry, teamchampionships, driverchampionships, highestracefinish, poleposition, fastestlaps, points, drivername, driverlast, nationality, drivernum) FROM stdin;
    public          postgres    false    217   �                 0    25922 
   temptable1 
   TABLE DATA           �   COPY public.temptable1 (drivernum, teamname, teambase, teamchief, chassis, powerunit, firstentry, teamchampionships, driverchampionships, highestracefinish, poleposition, fastestlaps, points, drivername, driverlast, nationality) FROM stdin;
    public          postgres    false    218                     2606    25885    drivers drivers_pkey 
   CONSTRAINT     Y   ALTER TABLE ONLY public.drivers
    ADD CONSTRAINT drivers_pkey PRIMARY KEY (drivernum);
 >   ALTER TABLE ONLY public.drivers DROP CONSTRAINT drivers_pkey;
       public            postgres    false    214            �           2606    25903    teams teams_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_pkey PRIMARY KEY (teamname);
 :   ALTER TABLE ONLY public.teams DROP CONSTRAINT teams_pkey;
       public            postgres    false    215            �           2606    25921    temptable temptable_pkey 
   CONSTRAINT     g   ALTER TABLE ONLY public.temptable
    ADD CONSTRAINT temptable_pkey PRIMARY KEY (teamname, drivernum);
 B   ALTER TABLE ONLY public.temptable DROP CONSTRAINT temptable_pkey;
       public            postgres    false    217    217            �           2606    25912 (   driverinteam driverinteam_drivernum_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.driverinteam
    ADD CONSTRAINT driverinteam_drivernum_fkey FOREIGN KEY (drivernum) REFERENCES public.drivers(drivernum);
 R   ALTER TABLE ONLY public.driverinteam DROP CONSTRAINT driverinteam_drivernum_fkey;
       public          postgres    false    216    214    3455            �           2606    25907 '   driverinteam driverinteam_teamname_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.driverinteam
    ADD CONSTRAINT driverinteam_teamname_fkey FOREIGN KEY (teamname) REFERENCES public.teams(teamname);
 Q   ALTER TABLE ONLY public.driverinteam DROP CONSTRAINT driverinteam_teamname_fkey;
       public          postgres    false    215    3457    216               �   x����N�0 �ٯ�(����E�EI�^������9���"т�Fp����~�+J��y�6���0`)�e�P��7����E��l�:�Fs;�%�cMƆ}&�Kڽ��s<�b3�+gE1���*~�K�?��Ť�CcƎ�����4&��W���Mdc��G�N�bR�8�j�Owm�}��9@�?��ZJN��!by���%X��GG�}a%���� �'���         a  x�E�AOA������M \Ch�h��@�8kc1��~}����X����oEGx`˅V��%�����k6��%�B���MI�	�1iN�H%��1��b�Б��w��g;p�%��`��{�/��9���`-��	L�?ŗ�7�6cXP��07�!�	.ICW,�3R�����/oC�/���i�gf���ܓ��rfhG�@��o�H�P����ܓ	�HHpU�3��i��m�����}����t�g���.UXT��
��|����_EaE��<0�D��%�wǎ�g�ӽ'@�8h8� d��dF��7�pE{���0)��x<�q�M2s�w�|�՜١}�F��"�Tb�         8  x�m�Kn�0�ףS� I����dDv�)d5�t3�&	a�(*�}��#��H�.�� �|3��[��Eil?*�h{ؚ�ԏWⷖ�:���������#���m�CE����4�9!$)iaz���Z'��-�������F���U������b���������|>��Q��F��Yj:i����v�F��Kyº5i��*�B�����@���V*%�D�-�Қ�K��� �ͫ�x�6N�4�C�)jȠ"�z�z@Q���g^�;��ԯR]�ͫt�
u9��aw�����"aGP��h%�dщ	��^���K&/V��	���g��pj�Ύ�.G���4iiᾼ�L==:� .�mڱ#+q"���|�D����=��A4fp�7~+�;�]�j&��)pĬ�;��"Qs�bT�x%մJk�k.�/���D-V�N��"Ⱦ�d3H���P��g6ӹΫ��u��w?��	Q1-����Yc�[�`�_f��4�i�d	Dq|��I�_j~D����{���84Z�|ad	J����ja�A�ޟo����{            x������ � �         �  x��V�r�8}n�B����l�]p�j���c:�B�X��?���YȤ2�J/v���>}�i�	t]m�(��R��Ū4�o�ZQ�b�9a3�����t#�Ҳ��K�^�

�%1�Xn�[L�
�%��A�x����j�+]e�30ۡ�n��W�d��$���(}Ը��[a ��\t�Nj����_�l��`%5tS���F��"^�Š)�A ��%�SX�����w�jzD���g<>��JI���b���К�PbEN,�^1}�e��������TF���J/�Y���Ȁs�{��}�Ĭ��fh���nEV���v�kxB15�3�bV�`$�^�1���HVqɾt���nD��=���I�k�J� �/
�:2X��z�������(������A}h����<��`���1Bt=�Qk�%݅t.�fb��zC�߉o��|�ހ�7�	8��b��N�F�ڒ~$˭$[1嬺���3���ni��5:b���N��������>���Ɠ�P��8V�<H`d�[�{�{�nc6��^R0�e)���j\mQ�|����k��0wl��v��	�sL��2_�F��u
�|L����>X�����\��)����=~ކ�d$�T�@;Ș�X�P�����Ԝ�UK������tdۿ�|�$���-���v>����.����Wt�P���F,�zz�e��ˑ |���!O!f�	���Ǫ�0Nߵ�������p���q�x��Y���=�ӑ���y���o���8���|ca��Ea�>0�L�(iC������>h'�=��ɾkt�6�J��Ef`�8��>^~ :!�yJ���U�P����l��w92	}v(�P�'Y�3�Y�D�~ �)������]��1���ϾN��>9���������Z��D��~     
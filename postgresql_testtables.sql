drop table bus_test_cases;

CREATE TABLE bus_test_cases
(
   c_test_case_id varchar(50),
   c_test_case_name varchar(100),
   c_group_name varchar(50),
   c_message_type varchar(50),
   c_format varchar(50),
   c_loading_queue varchar(100),
   c_test_message text,
   c_test_status varchar(50),
   c_rhf2_header text,
   c_comment varchar(2000),
   c_expected_resulttrace text,
   c_test_run_resulttrace text,
   c_last_editor varchar(100),
   d_test_time timestamp,
   n_diff_count int,
   n_autotest int,
   n_runtime_in_sec int,
   n_completes_in_ipc int,
   n_delayed int,
   c_mqmd_useridentifier varchar(12),
   c_linebreak varchar(10),
   c_ipclink varchar(250),
   c_department_code varchar(20),
   c_testid_prefix varchar(8),
   c_jira_url varchar(250)
);

drop table bus_test_runs;

CREATE TABLE bus_test_runs
(
   c_run_id varchar(36),
   fk_test_case_id varchar(50),
   c_reference varchar(20),
   c_groupreference varchar(20),
   c_session_nr varchar(20),
   c_sequence_nr varchar(20),
   d_run_timestamp timestamp,
   c_result text,
   c_runstate varchar(50),
   c_ipc_link varchar(400),
   c_ipc_message_id varchar(50),
   d_test_start timestamp,
   n_extract_active_msg int
);

--alter table bus_test_cases add c_mqmd_useridentifier varchar(12);
--alter table bus_test_cases add c_linebreak varchar(10);
--alter table bus_test_cases add c_ipclink varchar(250);
--alter table bus_test_runs add c_groupreference varchar(250);
--alter table bus_test_cases add c_department_code varchar(20);
--alter table bus_test_cases add column n_delayed int;

--update bus_test_cases set c_linebreak = 'CRLF';
--update bus_test_cases set c_department_code = 'dev';
--update bus_test_cases set n_delayed = 0;
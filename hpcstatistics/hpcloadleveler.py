# coding=utf-8
import paramiko
import re
import string


def get_llq_by_ssh(ssh_connection, query_user=None):
    bin_path = 'llq'
    if query_user is not None:
        bin_param = '-u ' + query_user
    else:
        bin_param = ''
    ssh_command = bin_path + ' ' + bin_param
    ssh_stdin, ssh_stdout, ssh_stderr = ssh_connection.exec_command(ssh_command)
    result_lines = ssh_stdout.read().split("\n")

    llq_result = dict()
    llq_jobs = list()
    llq_total = None
    llq_result['jobs'] = llq_jobs
    llq_result['total'] = llq_total

    if result_lines[0].startswith('llq: There is currently no job status to report.'):
        # 没有作业
        return llq_result

    for a_line in result_lines[2:-3]:
        records = a_line.split()
        a_job = dict()
        a_job['id'] = records[0]
        a_job['owner'] = records[1]
        a_job['submitted'] = records[2]+' '+records[3]
        a_job['st'] = records[4]
        a_job['pri'] = records[5]
        a_job['class'] = records[6]
        a_job['running_on'] = records[7] if len(records)>=8 else ""
        llq_jobs.append(a_job)
        #print a_job
    llq_result['jobs'] = llq_jobs

    if query_user is None:
        total_pattern = u"^(\d+) job step\(s\) in queue, (\d+) waiting, (\d+) pending, (\d+) running, (\d+) held, (\d+) preempted"
    else:
        total_pattern = u"^(\d+) job step\(s\) in query, (\d+) waiting, (\d+) pending, (\d+) running, (\d+) held, (\d+) preempted"
    total_prog = re.compile(total_pattern)
    total_prog_result = total_prog.match(result_lines[-2])
    llq_summary = dict()
    llq_summary['in_queue'] = total_prog_result.group(1)
    llq_summary['waiting'] = total_prog_result.group(2)
    llq_summary['pending'] = total_prog_result.group(3)
    llq_summary['running'] = total_prog_result.group(4)
    llq_summary['held'] = total_prog_result.group(6)
    llq_summary['preempted'] = total_prog_result.group(5)
    llq_result['total'] = llq_summary

    return llq_result


def get_llq(hostname, port, username, password, query_user=None):
    try:
        ssh_connection = paramiko.SSHClient()
        ssh_connection.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh_connection.connect(hostname, port, username, password)
    except paramiko.SSHException, e:
        print e
        return {
            'error': 'ssh-connection-error'
        }
    return get_llq_by_ssh(ssh_connection, query_user)


def get_job_detail_info_by_ssh(ssh_connection, query_user=None):

    llq_result = get_llq(ssh_connection, query_user)

    for job_item in llq_result['jobs']:
        print 'get information for', job_item['id']
        bin_path = 'llq'
        bin_param = '-l {id}'.format(id=job_item['id'])
        ssh_command = bin_path + ' ' + bin_param
        ssh_stdin, ssh_stdout, ssh_stderr = ssh_connection.exec_command(ssh_command)
        result_stdin_lines = ssh_stdout.read().split("\n")
        result_stdin_lines = [i.strip() for i in result_stdin_lines]

        if result_stdin_lines[0].startswith('llq: There is currently no job status to report.'):
            # 没有该作业
            job_item['detail'] = None
            continue
        else:
            job_item['detail'] = dict()

        status = None
        cmd = None
        executable = None

        for line in result_stdin_lines:
            # 查找需要的信息
            if line.startswith('Status'):
                status = line[8:]
            if line.startswith('Cmd'):
                cmd = line[5:]
            if line.startswith('Executable'):
                executable = line[15:]
        job_item['detail']['Status'] = status
        job_item['detail']['Cmd'] = cmd
        job_item['detail']['Executable'] = executable
    return llq_result


def get_job_detail_info(hostname, port, username, password, query_user=None):
    try:
        ssh_connection = paramiko.SSHClient()
        ssh_connection.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh_connection.connect(hostname, port, username, password)
    except paramiko.SSHException, e:
        print e
        return {
            'error': 'ssh-connection-error'
        }
    return get_job_detail_info_by_ssh(ssh_connection, query_user)


if __name__ == "__main__":
    hostname = '10.20.49.124'
    port = 22
    username = 'wangdp'
    password = 'perilla'

    try:
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(hostname, port, username, password)
        llq_info = get_job_detail_info_by_ssh(ssh, 'nwp_qu')
        print llq_info
    except paramiko.SSHException, e:
        print e
import paramiko
import re
import string


def get_llq(hostname, port, username, password):
    bin_path = 'llq'
    bin_param = ''
    try:
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(hostname, port, username, password)
        ssh_command = bin_path + ' ' + bin_param
        ssh_stdin, ssh_stdout, ssh_stderr = ssh.exec_command(ssh_command)
    except paramiko.SSHException, e:
        print e
        return "{'error':'error'}"

    result_lines = ssh_stdout.read().split("\n")
    ssh.close()

    llq_result = dict()
    llq_jobs = list()
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
    llq_result['host'] = hostname
    llq_result['user'] = username
    llq_result['port'] = port

    total_pattern = "^(\d+) job step\(s\) in queue, (\d+) waiting, (\d+) pending, (\d+) running, (\d+) held, (\d+) preempted"
    total_prog = re.compile(total_pattern)
    total_prog_result = total_prog.match(result_lines[-2]);
    llq_summary = dict()
    llq_summary['in_queue'] = total_prog_result.group(1)
    llq_summary['waiting'] = total_prog_result.group(2)
    llq_summary['pending'] = total_prog_result.group(3)
    llq_summary['running'] = total_prog_result.group(4)
    llq_summary['held'] = total_prog_result.group(6)
    llq_summary['preempted'] = total_prog_result.group(5)
    llq_result['total'] = llq_summary

    import json
    dump = json.dumps(llq_result)
    return dump

if __name__ == "__main__":
    hostname = '10.20.49.124'
    port = 22
    username = 'wangdp'
    password = 'perilla'

    print get_llq(hostname,port,username,password)

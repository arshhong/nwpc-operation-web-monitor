import paramiko
import re
import string


def get_cmquota_by_user(hostname,port,username,password):
    bin_path = '/cma/u/app/sys_bin/cmquota'
    bin_param = username
    try:
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(hostname, port, username, password)
        ssh_command = bin_path + ' ' + bin_param
        stdin, stdout, stderr = ssh.exec_command(ssh_command)
    except paramiko.SSHException, e:
        print e

    result_lines = stdout.read().split("\n")
    ssh.close()

    a_pattern = r'^(\w+) +(\w+) +(\d+) +(\d+) +(\d+) +(\d+) +.*'
    prog = re.compile(a_pattern)
    for a_line in result_lines:
        re_result = prog.match(a_line)
        if re_result:
            file_system = re_result.group(1)
            type = re_result.group(2)
            current_usage = re_result.group(3)
            if current_usage.isdigit():
                current_usage = string.atol(current_usage)
            soft_limit = re_result.group(4)
            if soft_limit.isdigit():
                soft_limit = string.atol(soft_limit)
            hard_limit = re_result.group(5)
            if hard_limit.isdigit():
                hard_limit = string.atol(hard_limit)
            print "%.2f%%,%.2f%%" % (float(current_usage)/soft_limit*100,
                                     float(current_usage)/hard_limit*100)
    import json
    dump = json.dumps(result_lines)
    return dump

if __name__ == "__main__":
    hostname = '10.20.49.124'
    port = 22
    username = 'wangdp'
    password = 'perilla'

    get_cmquota_by_user(hostname,port,username,password)

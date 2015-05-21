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
        return {
            'error': 'error',
            'error_msg': str(e)
        }

    result_lines = stdout.read().split("\n")
    ssh.close()

    detail_pattern = r'^(\w+) +(\w+) +(\d+) +(\d+) +(\d+) +(\d+) +.*'
    detail_prog = re.compile(detail_pattern)
    quota_result = dict()
    file_system_list = list()
    for a_line in result_lines:
        detail_re_result = detail_prog.match(a_line)
        if detail_re_result:
            file_system = detail_re_result.group(1)
            quota_type = detail_re_result.group(2)
            current_usage = detail_re_result.group(3)
            if current_usage.isdigit():
                current_usage = string.atol(current_usage)
            soft_limit = detail_re_result.group(4)
            if soft_limit.isdigit():
                soft_limit = string.atol(soft_limit)
            hard_limit = detail_re_result.group(5)
            if hard_limit.isdigit():
                hard_limit = string.atol(hard_limit)
            #print "%s : %.2f%%,%.2f%%" % (file_system,
            #                              float(current_usage)/soft_limit*100,
            #                              float(current_usage)/hard_limit*100)

            current_file_system = dict()
            current_file_system['file_system'] = file_system
            current_file_system['quota_type'] = quota_type
            current_file_system['current_usage'] = current_usage
            current_file_system['soft_limit'] = soft_limit
            current_file_system['hard_limit'] = hard_limit

            current_file_system['node_type'] = 'detail'

            current_file_system['raw_line'] = a_line
            file_system_list.append(current_file_system)

    quota_result['file_systems'] = file_system_list
    quota_result['user_name'] = username
    quota_result['host'] = hostname
    quota_result['port'] = port
    return quota_result

if __name__ == "__main__":
    hostname = '10.20.49.124'
    port = 22
    username = 'wangdp'
    password = 'perilla'

    print get_cmquota_by_user(hostname,port,username,password)

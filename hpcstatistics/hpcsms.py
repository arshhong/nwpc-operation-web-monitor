# coding=utf-8
import paramiko
import re
import string


def ping_sms_server(sms_server, ssh_connection):
    """
    :param sms_server:
        {
            sms_prog: sms prog number,
            sms_host: sms host
        }
    :param ssh_connection:
    :return:
    """
    ssh_command = "export SMS_PROG={sms_prog};/cma/u/app/sms/bin/smsping {sms_host}".format(
        sms_prog=sms_server['sms_prog'],
        sms_host=sms_server['sms_host']
    )
    # print ssh_command
    ssh_stdin, ssh_stdout, ssh_stderr = ssh_connection.exec_command(ssh_command)
    result_stdout_lines = ssh_stdout.read().strip().split("\n")
    result_stderr_lines = ssh_stderr.read().strip().split("\n")
    # print result_stdout_lines
    # print result_stderr_lines

    if result_stderr_lines[0] != '':
        result = {
            'error': 'ping_sms_server_error',
            'error_msg': '\n'.join(result_stderr_lines)
        }
        return result

    result = {
        'data': {
            'status': 'ok'
        }
    }
    return result


def ping_sms_server_by_list(sms_server_list, ssh_connection):
    ping_sms_result_list = []
    for sms_server in sms_server_list:
        ping_result = ping_sms_server(sms_server, ssh_connection)
        current_result = {
            'sms_server': sms_server,
            'ping_result': ping_result
        }
        ping_sms_result_list.append(current_result)
    return ping_sms_result_list


def main():
    hostname = '10.20.49.124'
    port = 22
    username = 'wangdp'
    password = 'perilla'

    try:
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(hostname, port, username, password)
    except paramiko.SSHException, e:
        print e
        return

    sms_server_list = [
        {
            'sms_name': 'nwpc_op',
            'sms_prog': '310066',
            'sms_host': 'cma20n03'
        },
        {
            'sms_name': 'nwpc_qu',
            'sms_prog': '310067',
            'sms_host': 'cma20n03'
        },
        {
            'sms_name': 'nwpc_sp',
            'sms_prog': '310068',
            'sms_host': 'cma20n03'
        },
        {
            'sms_name': 'nwpc_ex',
            'sms_prog': '310069',
            'sms_host': 'cma20n03'
        },
        {
            'sms_name': 'nwpc_xp',
            'sms_prog': '310070',
            'sms_host': 'cma20n03'
        },
        {
            'sms_name': 'eps_nwpc_qu',
            'sms_prog': '310067',
            'sms_host': 'cma18n03'
        },
        {
            'sms_name': 'draw_ncl',
            'sms_prog': '310080',
            'sms_host': '10.20.49.91'
        }
    ]
    print ping_sms_server_by_list(sms_server_list, ssh)
    ssh.close()

    return


if __name__ == "__main__":
    main()
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

    sms_server = {
        'sms_prog': '310066',
        'sms_host': 'cma20n03'
    }

    print ping_sms_server(sms_server, ssh)
    return


if __name__ == "__main__":
    main()
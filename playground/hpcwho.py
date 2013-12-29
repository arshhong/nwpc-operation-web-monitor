import paramiko
import re


class HpcUser:
    def __init__(self, user_name, user_line, user_time, user_hostname):
        self.name = user_name
        self.line = user_line
        self.time = user_time
        self.hostname = user_hostname

    def to_dict(self):
        d = {}
        d['__class__']=self.__class__.__name__
        d.update(self.__dict__)
        return d


def get_who_list(hostname,port,username,password):
    try:
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(hostname, port, username, password)
        stdin, stdout, stderr = ssh.exec_command('who')
    except paramiko.SSHException, e:
        print e

    who_list = stdout.read().split("\n")
    user_dict_list=[]
    for a_line in who_list:
        #print "+++++"+a_line+"+++++"
        a_user_list = re.split("  +",a_line.strip())
        #print a_user_list
        if len(a_user_list)==4:
            a_user = HpcUser(a_user_list[0],a_user_list[1],a_user_list[2],a_user_list[3])
            user_dict_list.append(a_user.to_dict())

    #print user_dict_list
    import json
    dump = json.dumps(user_dict_list)
    return dump



if __name__ == "__main__":
    hostname = '10.20.49.115'
    port = 22
    username = 'wangdp'
    password = 'perilla'

    json_who_list = get_who_list(hostname,port,username,password)
    print json_who_list
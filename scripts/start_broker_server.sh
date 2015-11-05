#!/usr/bin/env bash

base_dir=$(cd "`dirname "$0"`"/..; pwd)
export NWPC_OPERATION_WEB_MONITOR_BASE=${base_dir}

python ${NWPC_OPERATION_WEB_MONITOR_BASE}/nwpc_operation_monitor_broker/run_broker_server.py
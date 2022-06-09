#!/bin/bash
# Move to directory so relative references all work.
cd $(dirname $(readlink -f $0))

# Check the user is going to be able to execute mysql to the server.
if ! `mysql >/dev/null 2>&1 <<EOF
exit
EOF`;
then
    echo Need to operate as user who can connect to the DB, e.g. sudo this script.
    exit 1
fi

read -n 1 -p "Do you wish to deploy the database schema and create users (y/Y): " continue
echo ""
if [[ $continue =~ [yY] ]]; then
    #Deploy the database
    mysql < ../sql/deploySchema.sql
    if [[ $? == 0 ]]; then
        echo "Schema deployed successfully"
    else
        echo "There may have been a problem deploying the schema"
    fi

    return

    #Create users
    ## Creates users with appropriate privileges based on ./sql/users.sql
    mysql < ../sql/users.sql
    if [[ $? == 0 ]]; then
        echo "Note that you may need to add a 'bind-address' entry to '/etc/mysql/mysql.conf.d/mysqld.cnf' and create an appropriate MySQL user if you intend to remotely administer this database."
    else
        echo "Creating mysql users may have failed. Check above."
    fi
fi

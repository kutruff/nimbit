# $1: path to .env file

if [ -f $1 ]; then
  export $(echo $(cat $1 | sed 's/#.*//g'| xargs) | envsubst)
fi

psql -tc "SELECT 1 FROM pg_database WHERE datname = '$PGDBNAME'" | grep -q 1 || psql -c "CREATE DATABASE $PGDBNAME"
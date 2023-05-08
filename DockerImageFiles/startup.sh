#Create new METEOR_SETTINGS variable
TEMPPASSWORD=$(echo $POSTGRES_DB_PASSWORD | sed 's/[\"]/\\&/g')
export METEOR_SETTINGS='{"public":{"environmentName":"'$ENVNAME'","postgresInfo":{"host":"'$POSTGRES_DB_HOST'","database":"'$POSTGRES_DB_NAME'","port":'$POSTGRES_DB_PORT'}},"private":{"postgres":{"user":"'$POSTGRES_DB_USER'","password":"'$TEMPPASSWORD'"},"MAIL_URL":""}}'
echo $METEOR_SETTINGS

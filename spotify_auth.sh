#!/bin/bash

# We clear the old pipe if
# it's still there.
rm res_pipe 2> /dev/null || :;

# This function checks whether a program
# is installed using the coreutils `command`
# program, if the program execution exits
# with any code that's not 0, the function
# will assume you have not installed the
# specified program.
#
# usage:
# ensure_isntalled {command} [alt name]
ensure_installed() {
	command -v "$1" >/dev/null 2>&1 || {
		echo "
${2:-$1} is not installed, but it is required
for this to work, please install it manually.
		";
		exit 1;
	}
}

# We ensure netcat is installed to create a socket
# that lets us listen to the spotify OAuth response.
ensure_installed nc netcat

# We ensure jq is installed for json manipulation,
# used to parse the refresh_key response and obtain
# the actual key.
ensure_installed jq

# We ensure curl is installed to send an additional
# request to ask for the refresh_key to the spotify
# api.
ensure_installed curl

# We ensure xclip is installed to copy the variable
# if the user chooses to not store it into a file.
ensure_installed xclip

# We initialize some values that define
# program behaviour from the arguments.
accept_alert=false
save_path=""

# We iterate over all the options.
while getopts "ys:" opt;
do
	case $opt
	in
		# Taking y as accept the alert and ignore it.
		y) accept_alert=true;;
		# Taking s as where to save the variable.
		s) save_path="$OPTARG";;
		# If there is an invalid option display the usage.
		*) echo -e "Invalid argument.\nUsage: $0 [-y] [-s path]"; exit 1;;
	esac
done

# We clear the screen
# so it isn't cluttered.
clear;

# We print the program requirements before
# doing anything else. That is only
# if the user accepted the alert from the
# command line arguments.
! $accept_alert && echo "
This script obtains a Spotify API renew token,
this token may be used by scripts polling the API
to obtain an actual authentication token, renew
it and so on.

This application assumes you already have a spotify
API application that is able to authenticate
with the spotify API, if you don't please read this

https://developer.spotify.com/documentation/web-api

You will be asked an URL, this URL MUST comply
two things.

- 1. The URL must be added to your spotify application.
- 2. The URL must also reach this computer.

You will also be asked the spotify application id and
the spotify application secret. When you introduce
these variables you won't be able to see what you
introduced.

This script is not obfuscated, you can read the source
and it's well documented.

If you don't trust this script please answer N to the
following question.
"

# We enter a loop that asks the
# user if they agree with the program
# requirements until the input is valid.
! $accept_alert && while true;
do
	# We read the user preference and store it in `req_accepted`.
	read -r -p "Do you agree to the requirements (Y - yes, N - No)? " req_accepted

	# We clear the screen
	# before giving any feedback.
	clear;

	# We check whether the value is explicitly Y to continue
	# the program, otherwise we stop or ask again.
	case "$req_accepted"
	in
		[Yy]) break ;;
		[Nn]) echo "Ok, the program will stop now."; exit 0; break;;
		*) echo "Please enter Y for Yes or N for No." ;;
	esac
done

# We enter a loop that asks the
# user the redirect url until the
# input is valid.
while true;
do
	# We read the URL input by the user and store it in `listen_url`.
	read -p "Please introduce an URL that complies with the terms: " listen_url;
	
	# We clear the screen before
	# giving any feedback.
	clear;

	# If the URL is valid we break the loop.
	if [[ $listen_url =~ ^https?://[a-zA-Z0-9._-]+(:[0-9]+)?(/.*)?$ ]]; then
		break
	fi

	# If the loop was not broken, it means the input was invalid
	# we notify the user and loop again.
	echo "The URL must be a complete URL without a path, example: http://localhost:8080/";
done

# We store an URL encoded version of the URL.
e_listen_url=$(echo -n $listen_url | jq -sRr @uri);

# We ask for the application ID, the input can't be seen by the user.
read -sp "Please introduce your application ID (you won't see the input): " client_id;
# then print a newline.
echo "";
# We ask for the application secret, the input can't be seen by the user.
read -sp "Please introduce your application secret (you won't see the input): " client_secret;

# Before submitting the input we clear
# the screen again.
clear;

echo -e "Thanks for your input, now opening the browser.\nIf the URL is invalid you can expect errors.";

# We obtain the port from the URL and trim it.
port=$(echo $listen_url | sed -n 's#.*:\([0-9]\{1,5\}\)/.*#\1#p' | xargs);
# We coalesce it with the default value which is always 80
# since we don't support ssl encryption for this case.
#
# Https might be allowed behind a proxy that reaches
# this computer so we don't disallow it but always listen to
# 80 anyways.
port=${port:-80};

# We create a temporary pipe that
# will manage the server request and
# response
mkfifo res_pipe;
# We create a temporary file that
# will store the request.
request_tmp=$(mktemp)

# We start a non blocking http server
# that writes it's data to the temporary
# file.
nc -l -c -p $port < res_pipe | tee $request_tmp > /dev/null &
# We store the server
# pid.
nc_pid=$!;

# We create a response body and store it in a variable for proper editing.
response="The code was received.\nYou can now close this page...";
# We send the response with 200 OK to the pipe netcat will
# send it after it receives a request.
echo -e "HTTP/1.1 200 OK\r\n\r\n$response" > res_pipe;

# We give time to netcat
# for it to start.
sleep 3;

echo "
Expecting browser response...
If you closed the browser window or an error occurred, use \"ctrl+c\" to exit the program.
";

# We open the browser on the Spotify OAuth page.
# !!! THIS WAS TESTED ON X11 ONLY !!!
xdg-open "https://accounts.spotify.com/authorize?response_type=code&client_id=$client_id&redirect_uri=$e_listen_url";

# We wait for the `request` variable to
# have content.
while [ -z "$request" ]
do
	sleep 1;
	# We load the file into the variable
	# until its full, also removing carriage
	# returns to avoid bad formatting.
	request=$(cat "$request_tmp" | tr -d '\r');
done

# We remove the temporary
# file and kill the server.
rm $request_tmp;
rm res_pipe;

if kill -0 $nc_pid 2>/dev/null;
then
	kill $nc_pid 2>/dev/null;
fi

# Before requesting anything
# else we clear the screen again.
clear;

# Prior request parsing to obtain the code query parameter,
# the parameter we obtain is pre encoded, since we don't need
# it in any other way.
code=$(echo "$request" | sed -n 's/.*code=\([^& ]*\).*/\1/p');

# And then we obtain the actual refresh token.
token_response=$(curl -s "https://accounts.spotify.com/api/token" \
	-d "code=$code&redirect_uri=$e_listen_url&grant_type=authorization_code" \
	-H "Content-Type: application/x-www-form-urlencoded" \
	-H "Authorization: Basic $(echo -n "$client_id:$client_secret" | base64 -w 0 )");

# We take the refresh token from the JSON using jq.
refresh_token=$(echo $token_response | jq -r ".refresh_token");

# If the token is null it means the request errored,
# notify the user and exit with 1.
if [[ $refresh_token == 'null' ]];
then
	echo "
There was an error on the credentials you introduced.
Couldn't obtain the refresh token.
	";
	exit 1;
fi

# Notify the user that the refresh token could
# be obtained.
echo "refresh_token obtained.";

# This function manages the flow for storing a variable into an environment file.
store_variable() {
    # We store the parameters into actually readable names
    local var_name="$1";
    local save_path="$2";
    local value="$3";

    # Loop until the variable is processed
    while true; do
        # Check if the variable exists in the file and that the variable name is not empty
        if [ -n "$var_name" ] && grep -q "^$var_name=" "$save_path"; then
            # If it exists, notify the user
            echo "$var_name already exists in $save_path.";
            # Ask for what action to take
            read -p "Would you like to replace it? (D - do not store, Y - yes, A - yes but with another name): " replace_variable;

            # Handle the user's response
            case "$replace_variable" in
                [Dd])
                    # If the user doesn't want to store the variable, display its value
                    echo -e "Variable will not be stored.\nThe value for $var_name is: $value";
                    # Exit the loop after displaying.
                    break;
                    ;;
                [Yy])
                    # If the user wants to replace the variable, use sed to update it
                    sed -i "s|^$var_name=.*|$var_name=\"$value\"|" "$save_path";
                    echo "$var_name updated.";
                    # Exit the loop after replacing.
                    break;
                    ;;
                [Aa])
                    # If the user wants to choose a different name, clear the last name and loop again
                    var_name="";
                    continue;
                    ;;
                *)
                    # If the user enters an invalid option, ask again
                    echo "Invalid option. Please choose D, Y, or A.";
                    ;;
            esac
        else
            # If the variable doesn't exist in the file, store it
            echo "$var_name=\"$value\"" >> "$save_path";
            echo "$var_name stored in the file.";
            # Exit the loop after storing the variable.
            break;
        fi

        # Ask the user for the variable name if we need it for the next iteration.
        read -p "Please introduce a variable name to store in the file: " var_name;
		
        # Clear the screen before continuing.
        clear;
    done
}

# If the save path exists it means
# the user wants to save the variables.
if [ -n "$save_path" ]; then
    # If the file doesn't exist, create it.
    if [ ! -f "$save_path" ]; then
        touch "$save_path"
    fi

	echo "You choose to store the variables to $save_path.";
	read -p "Introduce a variable name for the refresh token: " refresh_token_name;

    # We call the above function to store or update the refresh_token.
    store_variable "$refresh_token_name" "$save_path" "$refresh_token";

	read -p "Introduce a variable name for the client ID: " client_id_name;

    # And then to store or update the client_id.
    store_variable "$client_id_name" "$save_path" "$client_id";

    exit 0;
fi

# If the variable was not choosen to
# be saved to a file we ask if we should
# display the variable or copy it to
# the clipboard.
while true;
do
	# We read the user preference and store it in token_action.
	read -p "Do you wish to (C - copy the variable to clipboard, D - display the variable): " token_action;

	# We clear the screen before displaying anything else.
	clear;

    case "$token_action" in
		# If the user preference is to copy the variable we copy it.
		# !!! THIS WAS ONLY TESTED ON X11 !!!
        [Cc]) echo -n "$refresh_token" | xclip -selection clipboard && echo "Copied to clipboard."; break ;;
		# If the user wants to display it we simply display it.
        [Dd]) echo "The token value is: $refresh_token"; break ;;
        *) echo "Invalid option. Please choose C or D." ;;
    esac
done

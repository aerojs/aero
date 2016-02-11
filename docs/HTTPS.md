# HTTPS

## Add an SSL certificate

Simply drop the key and the certificate into your `security` directory.

## HTTP/2

Aero fully supports HTTP/2 but doesn't have automatically generated `response.push` calls yet. In the future styles and scripts will automatically be served via the push mechanism if the performance proves to be faster than inlining (a recent test has shown that this is not the case yet).
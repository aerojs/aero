# HTTP/2

Aero fully supports HTTP/2 but doesn't have automatically generated `response.push` calls yet. In the future styles and scripts will automatically be served via the push mechanism if the performance proves to be faster than inlining (a recent test has shown that this is not the case yet).

## How to enable HTTP/2?

Aero will automatically start in HTTP/2 mode if it finds a certificate in your `security` directory.

## How to get an SSL certificate

I recommend [Let's Encrypt](https://letsencrypt.org/), it's a fantastic service.

## Use the SSL certificate

Simply drop the key and the certificate into your `security` directory.
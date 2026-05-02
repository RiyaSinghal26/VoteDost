# Use a lightweight Nginx image
FROM nginx:alpine

# Copy the static files to the Nginx html directory
COPY . /usr/share/nginx/html

# Copy custom Nginx config for security headers
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

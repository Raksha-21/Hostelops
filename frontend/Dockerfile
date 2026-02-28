FROM nginx:alpine
COPY index.html /usr/share/nginx/html/index.html
COPY nginx-spa.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

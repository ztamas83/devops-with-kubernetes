# log_output

Generates a random UUID on startup and prints it with a timestamp every 5 seconds.

## Run locally

```bash
npm start
```

## Build the image

```bash
docker build -t log-output:1.1 .
```

## Deploy to k3d

Import the image into the cluster (no registry needed):

```bash
k3d image import log-output:1.1
```

Create the deployment:

```bash
kubectl create deployment log-output --image=log-output:1.1
```

Check the output:

```bash
kubectl logs -f deployment/log-output
```

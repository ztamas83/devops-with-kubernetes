# todo_app

Express server. Prints `Server started in port NNNN` on startup.

## Configuration

| Variable | Default | Description |
| -------- | ------- | ----------- |
| `PORT`   | `3000`  | Port the server listens on |

## Run locally

```bash
npm install
npm start
```

With a custom port:

```bash
PORT=8080 npm start
```

## Build the image

```bash
docker build -t todo-app:1.2 .
```

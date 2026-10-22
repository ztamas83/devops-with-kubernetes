# random_todo

Bash script that creates a todo in [todo_backend](../todo_backend) with the URL of a random Wikipedia article.

It requests https://en.wikipedia.org/wiki/Special:Random, takes the `location` header of the redirect (`//en.wikipedia.org/wiki/...`), turns it into `https://en.wikipedia.org/wiki/...` and sends it to `POST /todos` of the backend as `{ "text": "Read <url>" }`. It exits with a non-zero code if either request fails.

It logs the Wikipedia `location` header, the backend base URL, the request body, and the whole `POST` request and response (verbose curl output, on stderr).

## Configuration

| Variable           | Required | Description                                                |
| ------------------ | -------- | ---------------------------------------------------------- |
| `TODO_BACKEND_URL` | yes      | Host and port of the backend, e.g. `localhost:3001`. The script calls `http://$TODO_BACKEND_URL/todos` |

## Run locally

Requires bash and curl 7.84+. With [todo_backend](../todo_backend) running on port 3001:

```bash
TODO_BACKEND_URL=localhost:3001 ./create_todo.sh
```

## Build the image

```bash
docker build -t ztamas/random-todo .
```

```bash
docker run --rm --network host -e TODO_BACKEND_URL=localhost:3001 ztamas/random-todo
```

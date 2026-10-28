const { execFile } = require("child_process");
const { mkdtemp, rm } = require("fs/promises");
const os = require("os");
const path = require("path");
const { promisify } = require("util");
const { Storage } = require("@google-cloud/storage");

const execFileAsync = promisify(execFile);

const REQUIRED_ENV = [
  "POSTGRES_HOST",
  "POSTGRES_DB",
  "POSTGRES_USER",
  "POSTGRES_PASSWORD",
  "GCS_BUCKET",
];
const missingEnv = REQUIRED_ENV.filter((name) => !process.env[name]);
if (missingEnv.length > 0) {
  console.error(
    `Missing required environment variables: ${missingEnv.join(", ")}`,
  );
  process.exit(1);
}

const database = process.env.POSTGRES_DB;
const bucketName = process.env.GCS_BUCKET;

// pg_dump reads the connection from libpq environment variables, which keeps
// the password off the command line
const pgEnv = {
  ...process.env,
  PGHOST: process.env.POSTGRES_HOST,
  PGPORT: process.env.POSTGRES_PORT || "5432",
  PGDATABASE: database,
  PGUSER: process.env.POSTGRES_USER,
  PGPASSWORD: process.env.POSTGRES_PASSWORD,
};

// The dump is written to a local file first, so a failing pg_dump never
// leaves a partial dump in the bucket
async function backup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const fileName = `${database}-${timestamp}.dump`;
  const tmpDir = await mkdtemp(path.join(os.tmpdir(), "todo-backup-"));
  const dumpPath = path.join(tmpDir, fileName);

  try {
    console.log(`Dumping database ${database}`);
    await execFileAsync("pg_dump", ["--format=custom", `--file=${dumpPath}`], {
      env: pgEnv,
    });

    const destination = `${database}/${fileName}`;
    console.log(`Uploading to gs://${bucketName}/${destination}`);
    await new Storage().bucket(bucketName).upload(dumpPath, { destination });
    console.log("Backup done");
  } finally {
    await rm(tmpDir, { recursive: true, force: true });
  }
}

backup().catch((err) => {
  // A failed pg_dump carries its own error output in stderr
  console.error(`Backup failed: ${err.stderr?.trim() || err.message}`);
  process.exit(1);
});

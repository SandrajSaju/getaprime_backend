Video Demonstration Link: https://www.loom.com/share/931eb0a82a74405cbfd11ebbfea9235c

1. Clone the Repository

```bash
git clone https://github.com/SandrajSaju/getaprime_backend
cd getaprime_backend
```

2. Install Dependencies
```bash
 npm install
```
 
3. Configure Environment Variables

Create a .env file in the root of the project with the following content:

```bash
PORT=4000
JWT_ACCESS_SECRET=jwtaccesspassword
JWT_REFRESH_SECRET=jwtrefreshpassword
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=root
DB_NAME=getaprime_db
```
Change values if needed (especially DB_USER, DB_PASSWORD, and DB_NAME) according to your PostgreSQL setup.

4. Set Up Database

Open PostgreSQL (via pgAdmin or CLI).

Create a new database:

CREATE DATABASE getaprime_db;


(Optional) If your PostgreSQL username or password is different from default (postgres / root), update them in the .env file.

Tables will be auto-created by TypeORM when you run the server (synchronize: true is enabled).

▶️ 5. Run the Server

npm start

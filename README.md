<pre align="center">
 _/_/_/    _/_/_/    _/_/_/    _/_/_/  _/      _/    _/_/    
_/    _/  _/    _/    _/    _/        _/_/  _/_/  _/    _/   
_/_/_/    _/_/_/      _/      _/_/    _/  _/  _/  _/    _/    
_/        _/    _/    _/          _/  _/      _/  _/    _/     
_/        _/    _/  _/_/_/  _/_/_/    _/      _/    _/_/        
</pre>


<h1 align="center">Prismo CLI 🚀</h1>

<p align="center">
A Prisma-powered schema generator CLI<br/>
Generate models, fields, migrations just like Rails — but for Prisma 🎯
</p>

<p align="center">
<a href="https://www.npmjs.com/package/prismo-cli">
<img src="https://img.shields.io/npm/v/prismo-cli?color=blue&label=npm%20version">
</a>
<a href="https://www.npmjs.com/package/prismo-cli">
<img src="https://img.shields.io/npm/dw/prismo-cli?color=green&label=Downloads">
</a>
<a href="https://github.com/ErManoj-Sharma/prismo-cli">
<img src="https://img.shields.io/badge/GitHub-Repository-black?logo=github">
</a>
<img src="https://img.shields.io/badge/Prisma-ORM-blue">
<img src="https://img.shields.io/badge/license-MIT-purple">
</p>

---

## ✨ Features

✔ Generate & destroy models  
✔ Add & remove fields with relation auto-handling  
✔ Supported relations:  
➡ `1to1`, `1toM`, `Mto1`, `MtoM`  
✔ Cascade delete support (`--cascade`)  
✔ Migration automation (`--migrate`)  
✔ DB drop/reset with safety confirmation 🔐  
✔ Intelligent CLI suggestions for typos  
✔ Fully styled `--help` menu 🎨  
✔ Zero manual schema editing! 😎  

---

## 📦 Installation

```sh
npm install -g prismo-cli
```
## Verify installation:
```
prismo --help
```
```bash
$ prismo --help
┌────────────────────────────────────────────────────────────┐
│                     Prismo CLI Help                         
└────────────────────────────────────────────────────────────┘
Usage:
  prismo <command> [options]

Commands:
  Generate
  prismo g model <ModelName> <field:type>...       Create a new model
  prismo g field <ModelName> <field:type>...       Add fields to a model
  prismo g relation <RelationType> <ModelName> <TargetModel> [--options]

  Destroy
  prismo d model <ModelName>                       Remove a model
  prismo d field <ModelName> <Field>               Remove a field

  Database
  prismo db:migrate <name>                         Create & apply migration
  prismo db:reset                                  Reset DB & reapply migrations
  prismo db:drop                                   Drop database
  prismo db:seed                                   Run Prisma seed script
  prismo list models                               List all models in schema
  prismo studio                                    Launch Prisma Studio UI

Options:
  -h, --help                                       Show help
  -v, --version                                    Show version
  -m , --migrate                                  Automatically run migration
  --cascade                                        Enable cascade delete

Relation Types:
  1to1, 1toM, Mto1, MtoM                            Specify relation type

Examples:
  prismo g model User name:string email:string
  prismo g field Post title:string
  prismo d model Order
  prismo db:migrate "add_users_table"
  prismo studio
```
# 🧱 Usage Examples 
## Generate a model
```sh
prismo g model User name:string age:int -m
```
### Result
```
📌 Creating Model
✔ Schema formatted
✔ Model "User" created successfully!
→ Run migration: prismo db:migrate "add_User"
```
```prisma
model User {
    id    Int     @id @default(autoincrement())
    name String
    age   Int
}
```
## Add a  field
```sh       
prismo g field User bio:string --migrate

```
### Result
```📌 Adding Field
✔ Schema formatted
✔ Fields added to User
→ Run: prismo db:migrate "update_User"
```
```prisma
model User {
    id        Int       @id @default(autoincrement())
    name     String
    age       Int
    bio       String?}
```
## Destroy a model safely
```
prismo d model Post
```
### Result
```
✔ Model "Post" removed successfully!
→ Run migration: prismo db:migrate "remove_post"
```
### If dependencies exist:
```
✖ Cannot destroy model "Post" 🚫
ℹ Other models reference it:
⚠ - Comment
→ Destroy those models first.
```
## List all models
```
prismo list models
```
### Result
```
📌 Database Models

✔ 📦 Model: Post
ℹ - id        String   @id @default(uuid())
ℹ - title     String
ℹ - age       Int
ℹ - createdAt DateTime @default(now())

→ All models listed.
```
## DB Commands
| Command             | Description               |
| ------------------- | ------------------------- |
| `prismo db:migrate ` | Apply migrations          |
| `prismo db:drop`    | Drop DB instantly + delete migrations files as well (Use Carefully)         |
| `prismo db:reset`   | Drop + reapply migrations |

## RelationShip Examples
1. **1to1 Relation**  
   Create the following models
   ```
   prismo g model User name:string age:int gender:string --migrate
   prismo g model Profile title:string --migrate
   ```
   ```sh
   # One User has One Profile
   prismo g relation 1to1 User Profile  --migrate
   ```
   ```js
   model User {
     id        String   @id @default(uuid())
     name      String
     age       Int
     gender    String
     createdAt DateTime @default(now())
     updatedAt DateTime @updatedAt
   
     profile Profile?
   }
   
   model Profile {
     id        String   @id @default(uuid())
     title     String
     createdAt DateTime @default(now())
     updatedAt DateTime @updatedAt
   
     user   User   @relation(fields: [userId], references: [id])
     userId String @unique
   }
   ```
2. **1toM Relation**  
   Create the following models
   ```
   prismo g model User name:string age:int --migrate
   prismo g model Post title:string content:string --migrate
   ```
    ```sh
    # One User can have Many Posts
    prismo g relation 1toM User Post --migrate --cascade
    ```
   ```js
   model User {
     id        String   @id @default(uuid())
     name      String
     age       Int
     createdAt DateTime @default(now())
     updatedAt DateTime @updatedAt  
      posts     Post[]
    }

    model Post {
      id        String   @id @default(uuid())
      title     String
      content   String
      createdAt DateTime @default(now())
      updatedAt DateTime @updatedAt

      user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
      userId String
    }
   ```
3. **Mto1 Relation**
    Create the following models
    ```
    prismo g model Category name:string  --migrate
    prismo g model Product name:string --migrate
    ```
    ```bash
    # Many Products belong to One Category
    prismo g relation Mto1 Product Category --migrate
    ```
    ```js
    model Category {
      id        String   @id @default(uuid())
      name      String
      createdAt DateTime @default(now())
      updatedAt DateTime @updatedAt

      products Product[]
    }
   
    model Product {
      id        String   @id @default(uuid())
      name      String
      createdAt DateTime @default(now())
      updatedAt DateTime @updatedAt
      category Category @relation(fields: [categoryId], references: [id])
      categoryId String
    }
    ```
4. **MtoM Relation**
    Create the following models
    ```
    prismo g model Author name:string --migrate
    prismo g model Book title:string --migrate
    ```
    ```bash
    # Many Authors can write Many Books
    prismo g relation MtoM Author Book --migrate
    ```
    ```js
    model Author {
      id        String   @id @default(uuid()) 
      name      String
      createdAt DateTime @default(now())
      updatedAt DateTime @updatedAt
      books     Book[] @relation("AuthorBooks")
    } 
      
    model Book {
      id        String   @id @default(uuid())
      title     String
      createdAt DateTime @default(now())
      updatedAt DateTime @updatedAt
      authors   Author[] @relation("AuthorBooks")
    }
    ```
 
# 🧑‍💻 Contributing

1. Fork the project
2. Create a feature branch
3. Submit a PR
Before submitting, run:
```sh
# to link your local changes for testing.
npm link
```
```bash
# test commads locally
prismo list models
```

# 🧩 Issue Templates
## Bug report template:
```
**Command executed:**
prismo [...]

**Expected behavior:**

**Actual behavior:**

**Prisma schema preview:**
```
# 👨‍💻 Author

Made with ❤️ by Manoj Sharma
Follow the project ⭐ and contribute!

# 📜 License
MIT License — Free for commercial & personal usage.

### 📢 If this tool saves you time, please star ⭐ the repo — it really helps!

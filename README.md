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

✔ Generate & destroy Prisma models  
✔ Add & remove fields with relations  
✔ Format & validate Prisma schema  
✔ Drop / reset database instantly  
✔ Safe-breaking detection for relations  
✔ Auto log styling with chalk  
✔ Zero manual schema editing required  

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
Prismo CLI Commands:
  prismo g model <Name> field:type...
  prismo g field <Model> field:type...
  prismo d model <Name>
  prismo d field <Model> <FieldName>
  prismo db:migrate <Migration Name>
```
# 🧱 Usage Examples 
## Generate a model
```sh
prismo g model Post title:String age:Int
```
### Result
```
📌 Creating Model
✔ Schema formatted
✔ Model "Post" created successfully!
→ Run migration: prismo db:migrate "add_post"
```
```prisma
model Post {
    id    Int     @id @default(autoincrement())
    title String
    age   Int
}
```
## Add a relational field
```sh       
prismo g field Post comments:references
```
### Result
```📌 Adding Field
✔ Schema formatted
✔ Fields added to Post
→ Run: prismo db:migrate "update_post"
```
```prisma
model Post {
    id        Int       @id @default(autoincrement())
    title     String
    age       Int
    comments  Comment[] @relation("PostComments")
}
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
| `prismo db:drop`    | Drop DB instantly         |
| `prismo db:reset`   | Drop + reapply migrations |

# 🧑‍💻 Contributing

## Contributions welcome! 🙌
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
# qa

A content repository to allow QA testing from a user perspective, using the platform.

## Run tests on platform

### Set up VM

1. Set up a piscine
  For example, duplicate the go piscine and put Quest2 "on top"
  (put the tester user in the piscine)  
  Set the `language` (type `STRING`) in the `Children Attributes` as `goqa`  

2. Mirror the `qa` repo from github in the root gitea  
  Create a `New Migration`from the Github repo `https://github.com/01-edu/qa`  
  Tick the `Migration Options`: `This repository will be a mirror`  
  Untick the `Visibility` option

3. Set up a new "dummy exercise"
  The name of the exercise must match one of the exercises available in the
  repository `https://github.com/01-edu/qa`  
  Add the following `Object Attributes`  
    * `language` (type `STRING`): `goqa`
    * `subject` (type `STRING`): `/markdown/root/qa/go/subjects/<name>/README.md`
    * `expectedFiles` (type `ARRAY`):
      * `Add a new index in array` with the expected files, most likely
      `<name>/main.go` if the exercise is a program or `<name>.go` if a function

## Run tests locally

### Example for the `piscine-go`

1. Create a directory to place the solution to be tested, for example `mkdir piscine-go` or `git clone <your-repo>` in the `qa` directory
2. run the following commands in the following location `./qa/piscine-go/`:
```bash
go mod init piscine
go mod tidy
```
2. Update all the required files for the selected exercise(s)
3. Run `./go/test_all.sh` or `./go/test_one.sh <exercise_name>`

## Importan notes

The following repositories aims to provide a close to production testing environment. To ensure this, check that the followings are in line with the respositories used for the current platform:

* **For GO exercises:** the organization of the `tests` and `solutions` directories combined with the `lib` functions used to run the tests are the same as the one used for the working platform
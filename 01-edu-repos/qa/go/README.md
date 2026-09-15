# go-tests-training

This repository is for training purposes of the 01 content team.
It allows the running of tests locally without the need of integrating them on the platform. Hence a faster process for writing go tests.

It is based on the go-training repository. Except that it starts empty of tests for clarity training purposes.

# go-tests

To run the tests make sure the two repositories are right next to each other:

- https://github.com/01-edu/piscine-go
- https://github.com/01-edu/go-tests-training

This repository is to simulate the solutions of a student.

- https://github.com/01-edu/piscine-go

This repository contains the go tests which challenge the solutions of the student repository

- https://github.com/01-edu/go-tests-training

To test an exercise, run this command in the `go-tests` folder:

```
./test_one.sh isnegative
```

To run all the exercises, run this command in the `go-tests` folder:

```
./test_all.sh
```

#!/bin/bash
# File: 

N_FILES=10

TEST_DIR='tests'
SUBJECT_DIR='subjects'
SOLUTIONS_DIR='solutions'

TEST_TEMPLTATE='test-template.go'
SUBJECT_TEMPLATE='README-template.md'
SOLUTIONS_TEMPLATE='solution-template.go'

mkdir -p $TEST_DIR
mkdir -p $SUBJECT_DIR
mkdir -p $SOLUTIONS_DIR

fill_subjects() {
	TEMPLATE=$1
	OUTDIR=$2
	for N in $(seq 1 $N_FILES)
	do
		DIR="dummy$N"
		mkdir -p $OUTDIR/$DIR
		cat $TEMPLATE | sed "s|\${N}|$N|g" > "./$OUTDIR/$DIR/README.md"
	done
}

fill_solutions() {
	TEMPLATE=$1
	OUTDIR=$2
	for N in $(seq 1 $N_FILES)
	do
		DIR="dummy$N"
		mkdir -p $OUTDIR/$DIR
		cat $TEMPLATE | sed "s|\${N}|$N|g" > "./$OUTDIR/$DIR/main.go"
	done
}

fill_test() {
	TEMPLATE=$1
	OUTDIR=$2
	for N in $(seq 1 $N_FILES)
	do
		DIR="dummy$N""_test"
		mkdir -p $OUTDIR/$DIR
		cat $TEMPLATE | sed "s|\${N}|$N|g" > "./$OUTDIR/$DIR/main.go"
	done
}

fill_test $TEST_TEMPLTATE $TEST_DIR
fill_subjects $SUBJECT_TEMPLATE $SUBJECT_DIR
fill_solutions $SOLUTIONS_TEMPLATE $SOLUTIONS_DIR
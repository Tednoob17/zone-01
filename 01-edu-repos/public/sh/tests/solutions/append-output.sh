# added this here to make the test cleaner
cat <<EOF >results.txt
"In the End" - Linkin Park
"Crawling" - Linkin Park
"Elevation" - U2
"Get the Party Started" - Pink
"Lady Marmalade" - Christina Aguilera, Lil' Kim, Mya, Pink
EOF
cat songs.txt | grep "\- J" >>results.txt

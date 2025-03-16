import os

directory = os.path.join(os.getcwd(),"client/src")
output_file = "names.txt"

with open(output_file, "w", encoding="utf-8") as outfile:
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith(".js") or file.endswith(".jsx"):
                with open(os.path.join(root, file), "r", encoding="utf-8") as infile:
                    outfile.write(f"\n// --- {file} ---\n")
                    outfile.write(infile.read())
                    outfile.write("\n\n")

print("All React files copied successfully!")

import csv

input_file = 'book_data.csv'
output_file = 'output.csv'

with open(input_file, 'r', encoding='utf-8-sig') as fin, open(output_file, 'w', encoding='utf-8', newline='') as fout:
    reader = csv.DictReader(fin)
    print(reader.fieldnames)  # Debug tên cột
    fieldnames = ['title', 'author', 'category','price','publicationYear','description','imageUrl']
    writer = csv.DictWriter(fout, fieldnames=fieldnames)
    writer.writeheader()
    for row in reader:
        writer.writerow({
            'title': row.get('title', ''),
            'author': row.get('author', 'Yu Sato'),
            'category': row.get('category', ''),
            'price': row.get('price', ''),
            'publicationYear': '2000',
            'description': row.get('description', ''),
            'imageUrl': row.get('imageUrl',''),
        })
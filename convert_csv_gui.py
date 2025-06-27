import csv
import tkinter as tk
from tkinter import filedialog, messagebox


def select_input_file():
    return filedialog.askopenfilename(
        title="変換元CSVを選択",
        filetypes=[("CSV files", "*.csv"), ("All files", "*.*")]
    )


def select_output_file(title):
    return filedialog.asksaveasfilename(
        title=title,
        defaultextension=".csv",
        filetypes=[("CSV files", "*.csv"), ("All files", "*.*")]
    )


def main():
    root = tk.Tk()
    root.withdraw()

    input_path = select_input_file()
    if not input_path:
        messagebox.showerror("エラー", "入力ファイルが選択されていません")
        return

    output_path = select_output_file("CSVを保存")
    if not output_path:
        messagebox.showerror("エラー", "出力ファイルが選択されていません")
        return

    with open(input_path, newline='', encoding='utf-8') as fin, \
         open(output_path, 'w', newline='', encoding='utf-8') as fout:

        reader = csv.DictReader(fin)
        fields = [
            "name",
            "age",
            "party",
            "recommendation",
            "district",
            "proportional_rank",
            "relation",
            "reference",
            "secret_money",
        ]
        writer = csv.DictWriter(fout, fieldnames=fields)
        writer.writeheader()

        for row in reader:
            relation = row.get('tubonaiyou', '') if row.get('tubohantei') else ''
            reference = row.get('tuboURL', '') if relation else ''
            secret = row.get('uraganenaiyou', '') if row.get('uraganehantei') else ''

            writer.writerow({
                'name': row.get('title', ''),
                'age': row.get('age', ''),
                'party': row.get('seitou', ''),
                'recommendation': '',
                'district': row.get('senkyoku', ''),
                'proportional_rank': '',
                'relation': relation,
                'reference': reference,
                'secret_money': secret,
            })

    messagebox.showinfo("完了", "変換が完了しました")


if __name__ == "__main__":
    main()

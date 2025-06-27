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

    output_path = select_output_file("選挙区CSVを保存")
    if not output_path:
        messagebox.showerror("エラー", "出力ファイルが選択されていません")
        return

    pr_output_path = select_output_file("比例区CSVを保存")
    if not pr_output_path:
        messagebox.showerror("エラー", "比例区の出力ファイルが選択されていません")
        return

    with open(input_path, newline='', encoding='utf-8') as fin, \
         open(output_path, 'w', newline='', encoding='utf-8') as fout, \
         open(pr_output_path, 'w', newline='', encoding='utf-8') as fpr:

        reader = csv.DictReader(fin)
        list_fields = [
            "氏名",
            "年齢",
            "所属政党",
            "推薦",
            "選挙区",
            "統一教会との関わり",
            "出展",
            "裏金不記載額",
        ]
        list_writer = csv.DictWriter(fout, fieldnames=list_fields)
        list_writer.writeheader()

        pr_fields = ["政党", "氏名", "順位"]
        pr_writer = csv.DictWriter(fpr, fieldnames=pr_fields)
        pr_writer.writeheader()

        for row in reader:
            if row.get('senkyoku') and '比例' in row['senkyoku']:
                pr_writer.writerow({
                    '政党': row.get('seitou', ''),
                    '氏名': row.get('title', ''),
                    '順位': '',
                })
                continue

            relation = row.get('tubonaiyou', '') if row.get('tubohantei') else ''
            reference = row.get('tuboURL', '') if relation else ''
            secret = row.get('uraganenaiyou', '') if row.get('uraganehantei') else ''

            list_writer.writerow({
                '氏名': row.get('title', ''),
                '年齢': row.get('age', ''),
                '所属政党': row.get('seitou', ''),
                '推薦': '',
                '選挙区': row.get('senkyoku', ''),
                '統一教会との関わり': relation,
                '出展': reference,
                '裏金不記載額': secret,
            })

    messagebox.showinfo("完了", "変換が完了しました")


if __name__ == "__main__":
    main()

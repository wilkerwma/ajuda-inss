"""
Script para gerar um JSON completo do CID-10 (DATASUS - Brasil)

INSTRUÇÕES:
1. Baixe a tabela oficial do CID-10 no DATASUS (geralmente CSV ou XLS).
   Exemplo comum: 'CID10.csv'
2. Ajuste o caminho do arquivo abaixo.
3. Execute:
   python generate_cid10_json.py
"""

import csv
import json

INPUT_FILE = "CID10.csv"   # ajuste para o nome do arquivo oficial
OUTPUT_FILE = "cid10_completo.json"

result = []

with open(INPUT_FILE, newline='', encoding='utf-8') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        # Ajuste os nomes das colunas conforme o arquivo oficial
        cid_code = row.get("CID") or row.get("codigo") or row.get("cod_cid")
        description = row.get("DESCRICAO") or row.get("descricao") or row.get("nome")

        if cid_code and description:
            result.append({
                "cid_code": cid_code.strip(),
                "description": description.strip()
            })

with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

print(f"Arquivo gerado com sucesso: {OUTPUT_FILE}")
